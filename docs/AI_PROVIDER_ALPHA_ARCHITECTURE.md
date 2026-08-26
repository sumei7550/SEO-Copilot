# SEO Copilot v1.2 Real AI Provider Alpha 接入方案

## 1. 目标与原则

本方案为 SEO Copilot v1.2 设计真实 AI API Alpha 接入架构，保留现有 Mock Provider、AI Fix UI、AI Context Layer 和 `generateSeoFix()` 服务入口。

核心原则：

- Extension 只负责扫描、组装最小上下文和展示结果。
- API Key 只存在于 Backend，不进入 Extension。
- 只有用户主动点击 AI Fix 后才发送请求。
- 不发送完整 HTML、DOM 或页面源码。
- Real AI Provider 失败时不影响本地 SEO 扫描和评分。
- Alpha 优先支持 Title 和 Meta Description；H1 继续保留 Mock Provider。

## 2. 总体架构

```text
AI Fix UI
   ↓
generateSeoFix()
   ↓
Provider Interface
   ├── Mock Provider
   └── Real AI Provider
          ↓
      Backend API
          ↓
      AI Model Provider
```

职责划分：

- Extension：扫描页面、组装允许发送的最小上下文、展示建议。
- `generateSeoFix()`：前端唯一服务入口，负责选择 Provider。
- Mock Provider：本地开发、E2E、离线场景和 UI 回归测试。
- Real AI Provider：调用 Backend API，不直接调用模型供应商。
- Backend API：鉴权、参数校验、限流、超时、重试、模型调用、响应校验和日志脱敏。
- AI Model Provider：Alpha 阶段接入一个真实模型供应商。

生产环境不应在真实 API 失败时静默返回 Mock 内容，否则用户无法判断建议是否来自真实 AI。

## 3. Provider Interface 方案

Mock Provider 和 Real AI Provider 都实现相同的 Provider Interface：

- 输入统一的 `AiFixRequest`。
- 输出统一的 `AiFixResponse`。
- 统一转换网络错误、限流、超时和空结果。
- React 组件不直接依赖具体 Provider。

建议 Provider 模式：

| 环境 | Provider |
|---|---|
| 本地开发 | Mock Provider |
| 自动化测试 | Mock Provider |
| Alpha 用户 | Real AI Provider |
| 后端不可用 | 展示错误并允许重试，不冒充返回 Mock 结果 |

## 4. Alpha 功能范围

### 首批支持

- Title
- Meta Description

支持的问题类型：

- Title 缺失、过短、过长
- Meta Description 缺失、过短、过长

### 暂不接入真实 AI

- H1：继续使用 Mock Provider，待 Title 和 Meta 验证后接入。
- 重复 Title
- Canonical、Schema、图片 Alt 和其他技术结构问题
- 自动修改网页内容

Real AI Provider 收到不支持的类型时，返回 `UNSUPPORTED_ISSUE_TYPE`，不尝试生成结果。

## 5. Backend API

### Endpoint

```text
POST /api/v1/seo-fixes
```

建议请求头：

```text
Content-Type: application/json
Authorization: Bearer <extension-session-token>
X-Client-Version: 1.2.x
X-Request-Id: <client-generated-id>
```

### Request Schema

```text
{
  issueType: "title" | "meta-description",
  currentValue: string,
  title: string,
  meta: string,
  h1: string,
  url: string,
  pageContext: {
    language: string,
    pageType: string,
    brand: string | null,
    issueId: string,
    issueLabel: string,
    severity: "critical" | "warning" | "info",
    diagnostic: {
      messageKey: string,
      solutionKey: string
    }
  }
}
```

允许发送的字段只有：

- issue type
- current value
- title
- meta
- h1
- url
- page context

### 输入限制

建议在 Extension 和 Backend 两侧同时限制：

| 字段 | 建议限制 |
|---|---:|
| `currentValue` | 500 字符 |
| `title` | 300 字符 |
| `meta` | 500 字符 |
| `h1` | 500 字符 |
| `url` | 2,000 字符 |
| `pageContext` 总长度 | 3,000 字符 |
| 整体 JSON Body | 8 KB |

超出限制时，应截断或拒绝请求，不将超长输入直接交给模型。

### 明确禁止发送

- 完整 HTML
- DOM 树
- 页面源码
- JavaScript、CSS 和截图
- Cookie、Local Storage 和表单输入
- 用户账号、密码和其他 Token
- 未经筛选的页面正文或结构化数据原文

## 6. Response Schema

### 成功响应

```text
{
  requestId: string,
  type: "title" | "metaDescription",
  recommendations: [
    {
      id: string,
      content: string,
      rationale: string,
      highlights: string[]
    }
  ],
  model: string,
  provider: string,
  usage: {
    inputTokens?: number,
    outputTokens?: number
  }
}
```

建议默认返回 3 条候选，允许在异常或模型限制下返回 1–3 条。`content` 必须是可直接复制的纯文本，不返回 Markdown、HTML 或长篇教程。

### 统一错误响应

```text
{
  requestId: string,
  error: {
    code: string,
    message: string,
    retryable: boolean
  }
}
```

建议错误码：

| 错误码 | 含义 | 是否可重试 |
|---|---|---|
| `INVALID_REQUEST` | 请求格式或字段不合法 | 否 |
| `UNSUPPORTED_ISSUE_TYPE` | Alpha 暂不支持该类型 | 否 |
| `PAYLOAD_TOO_LARGE` | 输入超过限制 | 否 |
| `UNAUTHORIZED` | 客户端鉴权失败 | 否 |
| `RATE_LIMITED` | 达到用户或系统限流 | 稍后重试 |
| `AI_TIMEOUT` | 模型调用超时 | 是 |
| `AI_PROVIDER_ERROR` | 模型供应商错误 | 视情况 |
| `AI_INVALID_OUTPUT` | 模型输出无法解析 | 有限重试 |
| `EMPTY_RESULT` | 没有有效建议 | 有限重试 |
| `SERVICE_UNAVAILABLE` | 后端或模型暂不可用 | 是 |
| `INTERNAL_ERROR` | 未分类内部错误 | 否 |

## 7. AI 输出校验

Backend 不应直接信任模型原始输出，应要求结构化响应并进行服务端校验：

- 返回类型必须与 `issueType` 一致。
- 建议数量为 1–3 条。
- `content` 不得为空或包含 HTML 标签。
- Title 和 Meta Description 不得混用。
- 不得虚构页面上下文中不存在的事实。
- 生成内容应与页面语言一致。
- 去除 Markdown、代码块和多余引号。
- 去重相同或高度相似的候选。

目标长度仅作为生成指导，不作为绝对拒绝条件：

- Title：通常约 30–60 字符。
- Meta Description：通常约 120–160 字符。

## 8. Timeout、Retry 和 Rate Limit

### Timeout

| 层级 | 建议超时 |
|---|---:|
| Extension 请求 | 15 秒 |
| Backend 总请求 | 12 秒 |
| 单次模型调用 | 8–10 秒 |
| Backend 参数校验 | 1 秒以内 |

### Retry

仅对网络失败、HTTP 408、429、500、502、503、504 和模型超时进行有限重试：

- 最多 2 次重试。
- 使用约 300ms、900ms 的指数退避。
- 尊重 `Retry-After`。
- 不对参数错误、鉴权失败和不支持类型重试。
- 同一次用户操作只允许一条有限重试链。

### Rate Limit

建议同时设置用户级和系统级限流：

- 单用户：每分钟 5 次。
- 单用户：每日 Alpha 配额，例如 20 次。
- 单 IP：每分钟 30 次。
- 全局模型并发数：由 Backend 配置。
- 单次请求 Body：最大 8 KB。

达到限制时返回 HTTP 429 和 `RATE_LIMITED`。

## 9. Empty Response 和错误处理

以下情况视为无效响应：

- `recommendations` 不存在或为空。
- 所有候选的 `content` 为空。
- 模型响应解析失败。
- 只有泛泛解释，没有可复制文本。
- 候选与目标类型不匹配。

处理流程：

1. Backend 校验模型响应。
2. 必要时进行一次低成本重新请求。
3. 仍为空则返回 `EMPTY_RESULT`。
4. Extension 显示明确的空结果或错误状态，并提供重试。
5. 保留当前扫描结果和本地 SEO 功能。

Extension 至少区分以下状态：

- Loading
- Success
- Empty Result
- Retryable Error
- Quota Exhausted
- Unsupported

不向用户展示模型供应商原始错误、内部堆栈、API Key 或服务器内部信息。

## 10. 安全与隐私

### API Key

API Key 只能存储在 Backend 的环境变量或 Secret Manager 中，不得：

- 写入 Extension 源码。
- 写入 `manifest.json`。
- 写入前端构建变量。
- 通过 API 响应返回。
- 写入日志。

### Extension 鉴权

Alpha 可使用短期 Session Token：

- Backend 发放短期 Token。
- Token 设置过期时间。
- Backend 校验来源、版本和请求频率。
- 后续接入账户体系后切换为账户级配额。

客户端 Token 不能视为真正的秘密，不能依赖它保护模型 API Key。

### 用户隐私提示

首次点击 AI Fix 时展示：

> 仅在你主动使用 AI 修复时，我们会发送当前页面的 URL、Title、Meta Description、H1、问题类型和必要页面上下文，用于生成 SEO 建议。不会发送完整 HTML、DOM、页面源码或表单内容。

同时提供取消入口、隐私政策链接和 AI 请求开关。未使用 AI 时，本地扫描仍应正常工作。

### 日志脱敏

允许记录：

- `requestId`
- 时间和耗时
- HTTP 状态码
- 错误码
- 模型名称
- 输入输出 Token 数
- 匿名哈希标识

禁止记录：

- 完整 Title、Meta、H1 和页面上下文
- 页面正文、Prompt 和模型原始响应
- API Key 和 Authorization Header
- 包含敏感参数的完整 URL

如需记录 URL，应移除 query string 和 fragment，或只记录 hostname 的哈希值。Backend 默认不持久化页面上下文和生成内容。

## 11. 文件规划

以下为建议规划，不代表本次直接修改代码。

### Extension

```text
src/services/
  generateSeoFix.ts
  generateSeoFix.mock.ts
  generateSeoFix.real.ts
  aiProvider.ts
  aiApiClient.ts
  aiRequestMapper.ts
  aiResponseNormalizer.ts
  aiError.ts

src/types/
  aiFix.ts
  aiApi.ts
  aiProvider.ts

src/privacy/
  aiConsent.ts
  aiDataPolicy.ts

src/config/
  aiConfig.ts
```

### Backend

```text
server/
  routes/seoFixRoute
  controllers/seoFixController
  services/seoFixService
  services/promptBuilder
  services/responseValidator
  services/rateLimitService
  providers/aiProvider
  providers/modelProvider
  middleware/auth
  middleware/requestValidation
  middleware/requestId
  middleware/errorHandler
  observability/redactedLogger
  config/environment
```

### 文档与测试

```text
docs/AI_PROVIDER_ALPHA_ARCHITECTURE.md
docs/AI_PROVIDER_API_CONTRACT.md
docs/AI_PROVIDER_PRIVACY.md
docs/AI_PROVIDER_OPERATIONS.md

tests/real-provider-contract
tests/backend-error-cases
tests/payload-redaction
tests/rate-limit
tests/timeout-retry
```

## 12. 开发步骤

### 阶段 1：冻结接口契约

1. 确定 Provider Interface。
2. 确定 Request、Response 和错误码。
3. 确定内部 `AiFixRequest` 到 Backend Request 的映射。
4. 冻结 Title、Meta Description 的 Alpha 支持范围。

### 阶段 2：建立 Backend 骨架

1. 创建 `POST /api/v1/seo-fixes`。
2. 增加请求 Schema、长度和 Body 大小校验。
3. 增加统一错误响应和 Request ID。
4. 增加鉴权和限流中间件。

### 阶段 3：接入模型 Provider

1. 封装模型供应商客户端。
2. 通过 Secret Manager 或环境变量读取 API Key。
3. 加入模型调用超时和有限重试。
4. 要求模型返回结构化候选。
5. 增加响应清洗和服务端校验。

### 阶段 4：接入 Extension Real Provider

1. 保留现有 Mock Provider。
2. 新增 Real Provider 和 Backend HTTP Client。
3. 由 `generateSeoFix()` 统一选择 Provider。
4. 增加请求映射和错误归一化。
5. 确保 UI 不直接感知 Provider 实现。

### 阶段 5：隐私和运营控制

1. 加入首次使用确认。
2. 双端限制输入字段和长度。
3. 完成用户级、IP 级和系统级限流。
4. 完成日志脱敏。
5. 验证 API Key 不存在于构建产物和浏览器请求中。

### 阶段 6：测试和 Alpha 灰度

测试覆盖：

- Title 成功生成。
- Meta Description 成功生成。
- 网络断开、Backend 超时和模型超时。
- 429、5xx、空响应和非法模型输出。
- 输入超长和不支持 H1。
- 复制建议和重新扫描。
- AI 失败后本地扫描仍可用。
- Mock Provider 和 Chrome Extension E2E 不回归。

灰度顺序：内部环境 → 小规模 Alpha 用户 → 评估后扩大范围。

## 13. Alpha 验收标准

### 功能

- Title 和 Meta Description 可从现有 AI Fix UI 触发。
- Mock Provider 仍可独立运行。
- Real Provider 通过 Backend 调用模型。
- UI 可展示成功、空结果、超时、限流和服务错误。
- 用户可复制候选建议。
- AI 服务失败不影响本地扫描和评分。

### 安全

- Extension 中不存在 API Key。
- 请求中不包含完整 HTML、DOM 或页面源码。
- 日志不记录原始页面内容。
- 用户主动触发后才发送 AI 请求。
- 隐私提示和取消入口可用。

### 质量

- 默认返回 1–3 条可复制候选。
- 候选与页面语言和主题一致。
- 不虚构页面事实。
- 不输出长篇 SEO 教程。
- 不支持的类型明确返回，不产生误导性结果。
