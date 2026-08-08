# SEO Copilot MVP 同步与差异分析

同步日期：2026-08-08

规范基线：`01_PROJECT_PLAN.md` 至 `06_CODEX_BUILD_PROMPT.md`。

## 当前项目结构

- `src/analyzer/`：DOM 扫描和扫描数据指标化。
- `src/rules/`：20 条声明式 SEO 规则及规则测试。
- `src/scoring/`：PRD 权重、分类得分、总分和等级。
- `src/content/`：内容脚本消息入口和容错。
- `src/popup/`：当前标签页验证、按需注入和 Popup 状态。
- `src/report/`、`src/components/`：评分、分类报告和 Issue 卡片。
- `src/types/`：统一 SEO 数据、规则、Issue、报告类型。
- `public/_locales/`：8 个 Chrome i18n 资源包。
- `src/background/`：Manifest V3 Service Worker 生命周期入口。

## 已完成功能

- Manifest V3 插件构建和 Chrome 加载产物。
- HTTP/HTTPS 当前页面按需扫描以及受限页面错误提示。
- Title、Meta、Heading、Image、URL、Technical、Content 共 20 条规则。
- JSON-LD 解析错误隔离，不因无效 Schema 导致插件崩溃。
- 100 分制、PRD 六分类权重、四档等级。
- Popup 总览、问题数量摘要、完整报告入口。
- Issue 严重度、影响说明、修复建议和扣分展示。
- 8 个 Chrome i18n 资源包及一致的消息键。
- 本地分析和最小权限（`activeTab`、`scripting`、`storage`）。
- Vitest 自动化测试和生产构建。

## 最新 PRD 差异

|需求|当前状态|缺失内容|优先级|
|---|---|---|---|
|Manifest V3 可安装扩展|已完成|需要在真实 Chrome 中执行最终人工加载验收|P0|
|当前页面扫描|已完成|需要补充超大 DOM 的专项性能基准|P1|
|20 条 SEO 规则|已完成|跨页面重复 Title 无历史数据时无法判断；V1 以同一文档多个 title 元素检测|P0|
|SEO Score 与等级|已完成|无|P0|
|分类得分|已完成|无|P0|
|Issue 严重度、影响和建议|已完成|无|P0|
|完整 Report|已完成|当前在 Popup 内展开，尚无独立大页面报告|P1|
|8 语言 Chrome i18n|部分完成|8 个资源包键已对齐；新增扩展说明在 de/es/fr/ja/ko/pt_BR 暂以英文回退，需完成母语润色|P1|
|错误处理|已完成|可增加错误原因细分和诊断日志|P1|
|2 秒扫描目标|部分完成|已限制文本与图片采集规模，仍需真实大型页面基准验证|P0|
|Chrome Storage 设置|部分完成|仅记录安装时间；语言偏好和 UI 偏好尚未提供|P1|
|扫描历史|未实现（可选）|URL、Score、Date 历史|P1|
|Soft Paywall / Pro 入口|未实现|属于商业完整性，不阻塞免费 MVP 核心验收|P1|
|PDF、批量分析、AI 建议|未实现|PRD 明确为 Pro/V2 未来能力|P2|
|用户系统、排名、外链、关键词库|不在 MVP 范围|按规范保持不开发|P2|

## 补全计划

### P0：MVP 验收

1. 在 Chrome 开发者模式加载 `dist`，人工验证普通页、旧标签页、受限页。
2. 在至少一个大型电商页和长文章页记录扫描耗时，确认普通页面不超过 2 秒。
3. 验证 English、中文、日本語浏览器语言下的核心流程和 Manifest 文案。

### P1：产品完整性

1. 完成 6 个非中英文资源包新增消息的母语翻译与审校。
2. 增加独立 Report 页面、扫描历史和 UI 偏好。
3. 增加性能基准、Scanner DOM fixture 测试和可访问性测试。
4. 增加 Soft Paywall 的非支付入口，用于验证 Pro 点击意愿。

### P2：未来功能

1. PDF 报告、批量 URL 分析和 AI SEO 建议。
2. 用户系统、Agency 能力和 SaaS 网站监控。

## 本轮模块记录

### SEO 数据与规则引擎

- 修改：`src/types/seo.ts`、`src/analyzer/scanner.ts`、`src/analyzer/pageAnalyzer.ts`、`src/rules/seoRules.ts`。
- 原因：对齐统一数据模型、Analyzer 和 20 条规则验收。
- 测试：规则总数、唯一 ID、正常页和各类异常页自动化测试。
- 剩余：真实大页面性能基准和跨页面重复标题能力。

### 评分与报告

- 修改：`src/scoring/score.ts`、`src/components/ScoreCard.tsx`、`src/components/IssueList.tsx`、`src/report/Report.tsx`、`src/popup/App.tsx`。
- 原因：补齐 PRD 分类权重、等级、问题摘要、影响说明和修复建议。
- 测试：评分权重、URL 到 Technical 映射、分类下限和等级边界自动化测试。
- 剩余：独立 Report 页面和 UI 自动化测试。

### 扩展运行与安全

- 修改：`manifest.json`、`public/manifest.json`、`src/content/content.ts`、`src/popup/scanActiveTab.ts`。
- 原因：使用最小权限，处理旧标签页、受限页、DOM/Schema 错误。
- 测试：内容脚本已存在、按需注入重试、受限协议三条自动化用例。
- 剩余：真实 Chrome 人工安装和页面兼容性验收。

### 国际化与交付

- 修改：`public/_locales/*/messages.json`、`README.md`。
- 原因：补齐所有 UI 和规则消息键、安装构建说明。
- 测试：8 个 JSON 资源包均可解析且与英文资源保持 82 个键一致。
- 剩余：6 个扩展语言的新增英文回退文本需母语润色。

### 内容脚本注入兼容性修复

- 修改：`src/types/seo.ts`、`src/scoring/score.ts`、`src/report/Report.tsx`、`scripts/verify-extension-build.mjs`、`package.json`。
- 原因：Vite 曾把内容脚本依赖拆成带顶层 `import` 的共享模块；Chrome 按普通脚本执行 `scripting.executeScript` 文件，导致目标页面注入失败。
- 测试：生产构建确认 `dist/content.js` 为自包含脚本，且构建校验器会拒绝包含 `import` 或 `export` 的内容脚本。
- 剩余：在 Chrome 中重新加载扩展并对真实目标网站执行人工扫描验收。
