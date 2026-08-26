# SEO Copilot SEO Rule Validation Report

## 已验证规则

### CONTENT_002

- 原问题：页面文本比例过低。当前规则在页面文本比例低于 0.1 时触发，主要用于提示页面可能存在大量模板、脚本或内联数据，导致可见正文占比偏低。
- 修复方式：将该问题作为信息级提示处理；用户应检查页面正文、模板噪声和内联数据，并在必要时减少非内容标记或补充有效正文。该规则不通过 AI Fix 自动生成文案修复。
- 验证结果：20-site regression 中该规则被真实页面触发 18 次；包括 CNN 在内的大 HTML 页面均完成解析且未抛出异常。`CONTENT_002` 当前影响分为 0，适合作为诊断信息保留。对于 SPA 或服务端返回壳页面的站点，仍应结合真实 Chrome DOM 结果判断。

### TITLE_004

- 原问题：页面中存在多个 `<title>` 标签，可能导致搜索引擎或浏览器无法稳定判断页面标题。
- 修复方式：保留一个与页面主题匹配的 `<title>`，并移除重复标题标签或示例代码中的误判来源。该问题属于结构性问题，不开放 AI Fix 自动处理。
- 验证结果：20-site regression 中该规则在 Bootstrap Docs、eBay 等真实页面触发，触发行为与页面实际标签数量一致。Bootstrap Docs 的示例代码会造成重复标题标签被统计，说明规则逻辑有效但仍存在噪声场景；当前为 Info 级别，暂不构成 V1 阻塞问题。

## 当前可信规则

基于当前规则单元测试、20-site regression 以及真实页面结果，以下规则可作为当前阶段可信规则：

- `CONTENT_002`：能够稳定识别低文本比例页面，并保持信息级提示与 0 分影响。
- `TITLE_004`：能够识别多个 `<title>` 标签；对文档站点示例代码造成的噪声已有明确记录。

## 待审查规则

以下图片规则已经在回归数据中被触发，但还需要进一步审查边界条件、真实 DOM 数据来源和误报情况：

- `IMAGE_001`
- `IMAGE_002`
- `IMAGE_003`

审查重点包括懒加载图片、装饰性图片、动态设置的 `alt`、图片传输大小是否可从真实浏览器性能数据稳定取得，以及大尺寸图片与实际 SEO 影响之间的关系。

## 回归测试说明

- 已完成 20 site regression，覆盖静态站点、CMS、Next.js、SPA、电商、新闻和大 DOM / 动态页面等场景。
- 已完成 Chrome extension validation，并使用真实 Chrome DOM 验证扩展扫描链路。
- 静态 HTML 回归主要用于验证规则稳定性、解析安全性和评分结果；对于客户端 hydration、反爬壳页面及运行时 DOM，应以 Chrome extension real DOM validation 结果为准。

## v1.2 最终 Chrome Extension QA（2026-08-26）

用户提供的 Chrome 扫描截图确认了真实 Popup 结果链路：页面加载后能够完成扫描，Popup 显示 Score、Grade、Issue 列表和 Report；AI Fix 能够在文案类问题上生成、选择和复制推荐内容。

| 页面 | Popup 结果 | Score | 主要结论 |
|---|---|---:|---|
| Amazon 首页 | ✅ Scan complete / Report / AI Fix | 87 | 3 issues：META_003、HEADING_001、TECH_002 |
| Apple iPhone 16 | ✅ Scan complete / Report | 97 | IMAGE_003 正常触发，显示图片性能优化建议 |
| Shopify 首页 | ✅ Scan complete / Report / AI Fix | 97 | TITLE_003 正常触发，AI Fix 生成 3 个标题推荐 |

注意：Amazon 截图 URL 为首页 `https://www.amazon.com/`，不是 Product Page；Amazon Product Schema 尚未由截图证据覆盖。

### 图片规则最终结论

- `IMAGE_001`：Amazon 产品 DOM 数据中，24 个可审查图片中 10 个缺少 alt，覆盖率 58%；规则触发合理。
- `IMAGE_002`：Amazon 覆盖率高于 50%，未触发；eBay、Shopify、Apple 的可审查图片 alt coverage 为 100%，未见误报。
- `IMAGE_003`：Apple iPhone 16 Popup 明确显示图片性能优化问题；规则能够在真实页面中触发。截图未显示具体 transfer size 数值，transfer-size 分支仍需单独性能采样确认。

### AI Fix 最终结论

- Amazon Meta Description：显示 3 个候选推荐，并支持选择/复制。
- Shopify Title：显示 3 个候选推荐，并支持选择/复制。
- `IMAGE_003`、标题结构、Schema 等结构性问题不会被当作文案自动修复目标。

### 发布阶段建议

Popup、Report 和 AI Fix MVP 已达到进入真实 AI API 阶段的条件，建议以受控 Alpha 方式推进。真实 API 接入前仍需补测 API 超时、错误、额度限制，以及 Amazon Product Page 的 Product Schema。
