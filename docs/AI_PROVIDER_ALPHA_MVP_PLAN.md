# SEO Copilot v1.2 DeepSeek Alpha MVP 接入计划

本文档是 SEO Copilot v1.2 Real AI Provider Alpha 的后续开发执行基线。

目标：用 DeepSeek 替换生产路径中的 Mock Provider，验证真实 AI SEO 建议质量，同时保留 Mock Provider、现有 AI Fix UI、AI Context Layer、Chrome Extension E2E 和 SEO Rules v1.2。

本阶段不修改本地 SEO 扫描和评分逻辑，不自动修改网页内容。

## 1. Alpha 范围

### 实现范围

- Title AI Fix
- Meta Description AI Fix
- DeepSeek 单一真实模型接入
- Backend Proxy
- Extension 与 Backend 的最小 API Contract
- Real Provider 与 Mock Provider 并存

### 暂不实现

- H1 Real AI
- 用户账号
- 登录鉴权
- 多模型切换
- 复杂权限系统
- 支付和计费
- 复杂配额系统
- 自动修改网页内容
- Canonical、Schema、图片 Alt 和技术结构类 AI 修复

H1 继续保留 Mock Provider，待 Title 和 Meta 的真实 AI 质量验证后再评估。

## 2. 最小架构

```text
AI Fix UI
   ↓
generateSeoFix()
   ↓
Provider Interface
   ├── Mock Provider
   └── DeepSeek Real Provider
          ↓
      Backend Proxy
          ↓
      DeepSeek Chat Completions API
```

### 组件职责

- Extension：扫描页面、组装允许发送的最小上下文、展示和复制建议。
- `generateSeoFix()`：保持现有唯一服务入口，负责调用 Provider。
- Mock Provider：用于本地开发、离线场景、自动化测试和 E2E 回归。
- DeepSeek Real Provider：只请求 Backend Proxy，不直接调用 DeepSeek。
- Backend Proxy：负责请求校验、调用 DeepSeek、响应校验和错误转换。
- DeepSeek：Alpha 阶段只使用一个固定模型，不实现模型选择。

生产环境中，Real Provider 失败时不应静默返回 Mock 内容，避免用户误判建议来源。

## 3. Provider 设计

Mock Provider 和 DeepSeek Real Provider 遵循相同的 Provider Interface：

- 输入统一的 `AiFixRequest`。
- 输出统一的 `AiFixResponse`。
- 统一转换 timeout、network error、empty response 和 Backend error。
- React 组件不直接依赖具体 Provider。

Provider 使用建议：

| 场景 | Provider |
|---|---|
| 本地开发 | Mock Provider |
| 自动化测试 | Mock Provider |
| Alpha 用户 | DeepSeek Real Provider |
| Backend 或 DeepSeek 不可用 | 显示错误并允许重试 |

## 4. Backend API 设计

### Endpoint

```text
POST /api/v1/seo-fixes
```

建议请求头：

```text
Content-Type: application/json
X-Client-Version: 1.2.x
X-Request-Id: <client-generated-id>
```

Alpha 暂不实现用户账号和复杂登录鉴权。Backend 仍应预留 Request ID、客户端版本和基础滥用控制能力。

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
    issueLabel: string
  }
}
```

只允许发送：

- issue type
- current value
- title
- meta
- h1
- url
- 必要 page context

### 禁止发送

- 完整 HTML
- DOM 树
- 页面源码
- 页面正文全文
- JavaScript、CSS 或截图
- Cookie、Local Storage 和表单内容
- 用户账号信息、密码和其他 Token
- 未经筛选的结构化数据原文

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

超出限制时截断或拒绝请求，不将超长输入直接交给模型。

### Success Response

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
  model: string
}
```

响应要求：

- 返回 1–3 条候选。
- `content` 为可直接复制的纯文本。
- 不返回 Markdown、HTML 或长篇 SEO 教程。
- `rationale` 保持简短。
- 内容应符合页面语言和主题。

### Error Response

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

Alpha 最小错误码：

| 错误码 | 含义 |
|---|---|
| `INVALID_REQUEST` | 请求格式或字段不合法 |
| `UNSUPPORTED_ISSUE_TYPE` | Alpha 暂不支持该类型 |
| `AI_TIMEOUT` | DeepSeek 调用超时 |
| `AI_PROVIDER_ERROR` | DeepSeek 返回供应商错误 |
| `AI_INVALID_OUTPUT` | 模型输出无法解析或不符合要求 |
| `EMPTY_RESULT` | 没有有效候选 |
| `SERVICE_UNAVAILABLE` | Backend 或 DeepSeek 暂不可用 |

## 5. DeepSeek 接入方案

DeepSeek 提供 OpenAI-compatible Chat Completions API。Alpha 使用固定模型和固定 Backend 配置，不在 Extension 中实现模型选择。

建议 Backend 配置：

```text
DEEPSEEK_API_KEY
DEEPSEEK_MODEL
DEEPSEEK_BASE_URL
```

默认 Base URL：

```text
https://api.deepseek.com
```

DeepSeek 官方文档说明可使用 `/chat/completions`，并支持 JSON Output。启用 JSON Output 时需要设置 `response_format` 为 JSON object，同时在 Prompt 中明确要求 JSON。官方也提示 JSON Output 偶尔可能返回空内容，因此 Backend 必须执行空响应校验。[DeepSeek API 文档](https://api-docs.deepseek.com/)、[JSON Output 文档](https://api-docs.deepseek.com/guides/json_mode/)

### 接入步骤

1. 冻结 Provider Interface、Request、Response 和错误码。
2. 创建 Backend Proxy Endpoint。
3. 在 Backend 中通过环境变量读取 `DEEPSEEK_API_KEY`。
4. 配置单一 DeepSeek 模型。
5. 设计只接收允许字段的固定 Prompt。
6. 要求模型返回 Title 或 Meta Description 的 1–3 条候选。
7. 启用 JSON Output 并校验 JSON 结构。
8. 清洗 Markdown、HTML、引号和重复候选。
9. 在 Extension 中增加 DeepSeek Real Provider。
10. 由 `generateSeoFix()` 统一选择 Mock 或 Real Provider。
11. 完成错误状态、超时和空结果处理。
12. 使用真实页面进行质量评估和小规模 Alpha 灰度。

### Prompt 约束

模型输出必须：

- 只生成当前目标类型。
- 保持页面语言。
- 保留页面主题和主要实体。
- 不虚构价格、功能、客户、数据或认证。
- 避免关键词堆砌和夸大承诺。
- 返回可直接复制的纯文本。
- 每条候选附带一句简短理由。

建议长度只作为指导，不作为绝对拒绝条件：

- Title：通常约 30–60 字符。
- Meta Description：通常约 120–160 字符。

## 6. 超时、重试和空响应

### Timeout

| 层级 | 建议超时 |
|---|---:|
| Extension 请求 | 15 秒 |
| Backend 总请求 | 12 秒 |
| 单次 DeepSeek 调用 | 8–10 秒 |

### Retry

仅对网络失败、HTTP 408、429、500、502、503、504 和模型超时进行有限重试：

- 最多 2 次重试。
- 使用约 300ms、900ms 的退避间隔。
- 尊重 `Retry-After`。
- 不对参数错误、不支持类型和配置错误重试。

### Empty Response

以下情况统一视为 `EMPTY_RESULT` 或 `AI_INVALID_OUTPUT`：

- `recommendations` 不存在或为空。
- 所有候选 `content` 为空。
- JSON 解析失败。
- 只有泛泛解释，没有可复制文本。
- 候选与目标类型不匹配。

Backend 可进行一次有限重试；仍无有效候选则返回错误。Extension 显示空结果状态并提供重试，不用 Mock 结果冒充真实响应。

## 7. 安全与隐私基线

### API Key

DeepSeek API Key 只能存在于 Backend 的环境变量或 Secret Manager 中，不得：

- 写入 Extension 源码。
- 写入 `manifest.json`。
- 写入前端构建变量。
- 通过 API 响应返回。
- 写入日志。

### 用户提示

首次点击 AI Fix 时展示：

> 仅在你主动使用 AI 修复时，我们会发送当前页面的 URL、Title、Meta Description、H1、问题类型和必要页面上下文，用于生成 SEO 建议。不会发送完整 HTML、DOM、页面源码或表单内容。

提供取消入口和隐私政策链接。未使用 AI 时，本地扫描仍正常工作。

### 日志脱敏

允许记录：

- `requestId`
- 请求时间和耗时
- HTTP 状态码
- 错误码
- 固定模型名称
- Token 使用量（如可获得）

禁止记录：

- 完整 Title、Meta、H1 和 page context
- 页面正文、Prompt 和模型原始响应
- API Key 和 Authorization Header
- 包含敏感查询参数的完整 URL

Backend 默认不持久化页面上下文和生成内容。

## 8. Extension 文件规划

以下为后续开发的建议文件范围，本次不执行修改。

### 保留并继续使用

```text
src/services/generateSeoFix.ts
src/services/generateSeoFix.mock.ts
src/types/aiFix.ts
src/services/buildAiFixContext.ts
```

### 建议新增

```text
src/services/aiProvider.ts
src/services/generateSeoFix.real.ts
src/services/aiApiClient.ts
src/services/aiRequestMapper.ts
src/services/aiResponseNormalizer.ts
src/services/aiError.ts
```

文件职责：

- `aiProvider.ts`：定义 Mock 和 Real Provider 的共同接口。
- `generateSeoFix.real.ts`：请求 Backend Proxy。
- `aiApiClient.ts`：处理 POST、timeout 和 HTTP 错误。
- `aiRequestMapper.ts`：从内部请求映射为最小 API 请求。
- `aiResponseNormalizer.ts`：映射为当前 UI 使用的 `AiFixResponse`。
- `aiError.ts`：统一错误类型和用户可见状态。

## 9. Backend 最小结构

```text
server/
  route/
    seoFixRoute
  service/
    seoFixService
    deepseekClient
    responseValidator
  middleware/
    requestValidation
    errorHandler
  config/
    environment
```

职责：

- `seoFixRoute`：暴露 `/api/v1/seo-fixes`。
- `seoFixService`：协调校验、模型调用和响应转换。
- `deepseekClient`：封装 DeepSeek Chat Completions 调用。
- `responseValidator`：校验和清洗模型响应。
- `requestValidation`：限制字段、长度和支持类型。
- `errorHandler`：输出统一错误格式。
- `environment`：读取 API Key、模型、Base URL 和超时配置。

## 10. 测试计划

### Provider 测试

- Mock Provider 不回归。
- Real Provider 请求映射正确。
- `generateSeoFix()` 仍是唯一入口。
- Title 和 Meta 类型映射正确。
- H1 不会调用 DeepSeek Real Provider。

### Backend Contract 测试

- 合法 Title 请求成功。
- 合法 Meta Description 请求成功。
- 缺失字段返回 `INVALID_REQUEST`。
- H1 请求返回 `UNSUPPORTED_ISSUE_TYPE`。
- 超长输入被拒绝或截断。
- 请求不包含完整 HTML、DOM 或页面源码。
- 响应可被 Extension 正确解析。

### DeepSeek 集成测试

- 正常返回 1–3 条候选。
- JSON Output 可解析。
- 空内容返回 `EMPTY_RESULT`。
- 非法 JSON 返回 `AI_INVALID_OUTPUT`。
- DeepSeek 超时返回 `AI_TIMEOUT`。
- DeepSeek 5xx 返回可重试错误。
- API Key 缺失时 Backend 明确失败。

### Extension E2E

- Title AI Fix 展开和加载状态正常。
- Meta Description AI Fix 展开和加载状态正常。
- 候选显示和复制正常。
- Backend 错误不影响扫描结果。
- Mock 模式继续通过现有 Chrome E2E。

### 质量评估

使用真实页面覆盖：企业首页、产品页、博客文章、定价页，以及 Title 或 Meta 缺失、过短、过长的场景。

人工评估：

- 页面主题相关性
- 搜索意图匹配度
- 是否虚构事实
- 语言一致性
- 可读性
- 可复制性
- 长度合理性

## 11. Alpha 验收标准

### 架构

- `generateSeoFix()` 入口保持不变。
- Mock Provider 保留并可独立运行。
- Real Provider 通过 Backend Proxy 调用 DeepSeek。
- Extension 不直接调用 DeepSeek。
- Extension 和构建产物中不存在 DeepSeek API Key。

### 功能

- Title AI Fix 可生成有效候选。
- Meta Description AI Fix 可生成有效候选。
- 默认返回 1–3 条可复制建议。
- 建议可以正常展示和复制。
- H1 Real AI 不会被误调用。
- AI 失败时本地扫描和评分仍正常。

### 安全

- API Key 只存在于 Backend 环境变量或 Secret Manager。
- 请求不包含完整 HTML、DOM 或页面源码。
- 日志不记录原始页面内容、Prompt 或 API Key。
- 只有用户主动点击 AI Fix 后才发送数据。

### 质量

- 至少 80% 的测试样本与页面主题相关。
- 不出现明显虚构事实。
- 不出现大规模关键词堆砌。
- 页面语言匹配达到可接受水平。
- 空响应、超时和错误都有明确 UI 状态。

### 范围控制

以下内容不属于 Alpha 完成条件：

- 用户登录和账号体系
- 多模型切换
- 支付和正式计费
- 复杂权限和配额系统
- H1 Real AI
- 自动修改网页
