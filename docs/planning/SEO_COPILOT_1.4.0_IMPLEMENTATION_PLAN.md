# SEO Copilot 1.4.0 正式实施计划（待审核）

**目标版本：**1.4.0
**状态：**最终实施范围已确认，实施计划待审核；获批前不启动正式开发
**计划日期：**2026-11-12
**证据层级：**最新已通过的 Popup Page Inspector 与 Side Panel Audit 原型决定界面；历史产品架构、19 款竞品研究和产品规划解释决策；2026-11-12 开发前只读审核及其核查的当前工作区源码决定实现基线。当前工作区含未提交修改，不等于已发布版本。

## 1. 目标、边界与交付

产品方向保持 **Quick Metadata + Full SEO Audit + Page Analysis Tools + AI SEO Fix**。1.4.0 的用户旅程为：打开 Popup，立即查看 Metadata，并在同一 Popup 的六个工具入口中查看当前已具备的页面事实；需要处理优先问题时，点击底部 Open SEO Audit 进入 Side Panel，直接看到或自动取得本页审计；修改页面后通过 Rescan 更新审计。Popup 不显示 SEO Score，Side Panel 不重复展示 Word Count、Headings 与 Copy Headings。

| 层级 | 本计划的处理方式 |
|---|---|
| 已通过的界面设计 | Popup 以 [Page Inspector 原型](../prototypes/seo-copilot-1.4.0-popup-tools.html) 为唯一依据；Side Panel 以 [Audit 原型](../prototypes/seo-copilot-1.4.0-p1a.html) 为唯一依据。原型样例数据不是正式代码已实现的证据。 |
| 本次已确认的开发范围 | P1-A：Popup 六入口、完整 Content、已有 Canonical／Schema 基础数据／Images 明细及复制；Side Panel 只保留 Audit；统一数据与状态；修复首次安装自动打开 Welcome。保留现有 Metadata、Score、规则、AI Fix、权限和 Rescan 行为。 |
| 明确暂缓 | P1-B 完整 Schema Details 与外部验证；P1-C Images Filter、独立 Refresh、CSV Export；P2/P3 的其他采集、网络状态与高权限工具。Social、Links 在 1.4.0 只保留 Coming soon。 |
| 不得改变 | 现有 SEO Score 计算、六类评分权重、20 条规则、Rule Category、Issue ID/Severity、Metadata 长度阈值和颜色规则、AI Fix 实际覆盖范围。 |

### 本轮确认的范围与四项统一口径

这些是对历史路线图与原型差异的正式收敛。仅改变 1.4.0 的实施范围和必要展示文案；两份已通过的 HTML 原型保持原样，布局、分组与交互仍以原型为唯一依据。

1. **Popup 已有数据视图纳入 1.4.0。**Indexability 展示／复制 live DOM Canonical；Structured Data 展示／复制已有 Schema 类型与解析状态；Images 展示图片 URL、Alt、自然尺寸并逐项复制。仅接入已采集字段，不由此批准 P1-B 完整详情／外部验证或 P1-C Filter／Refresh／CSV。
2. **Word Count 文案与规则一致。**现有 CONTENT_001 在低于 300 字时产生 Warning 并影响 Score；1.4.0 不改变该规则。正式 UI 的说明采用“Visible page text estimate. Low word count may trigger an audit issue; this number is not a target by itself.”，替代原型中可能被理解为完全不参与 Score 的一句话。这是本轮明确授权的文案口径修正，不改变原型布局。
3. **Images 统计分母分开。**Popup 的 Image count、无 Alt 属性数与空 Alt 数基于已采集的全部 page.images（最多 1000 张），标为“已采集图片”；达到上限时不声称这是整页真实总数。Audit 的 IMAGE_001/002 仅按 auditable 图片计算缺 Alt 和覆盖率。空串 Alt 不计入“无 Alt 属性”；自然尺寸为 0 不等于 HTTP Broken。
4. **Schema 类型、JSON-LD 块及刷新。**Schema Types 的展示数量只称去重后的非空“类型条目数”，不能拿 schemas.length 当脚本块数。1.4.0 允许扫描器只补一个 jsonLdBlockCount 标量（匹配的 JSON-LD script 数），用于准确区分“没有块”“有块但类型未知”和“解析失败”；invalidSchemaCount 仍按解析失败的块数计。此补采不保存原始 JSON、嵌套详情或改变 TECH 规则。同 URL 页面进入 loading 时，旧页面快照与 Side Panel Report 立即失效；完成加载后 Popup 重读 Metadata／页面数据，Side Panel 回到待扫描态，不自动显示旧 Score。URL 不变的普通 DOM 变动仍需用户主动重扫。

**Welcome：**1.4.0 移除 background.ts 首次安装时自动创建 Welcome Tab 的逻辑；welcome.html 文件保留，用户主动帮助入口仍可访问。安装时间记录与其他后台消息逻辑不因该修复改变。

## 2. Popup 六模块实施矩阵

下表的“1.4.0 实施”均为本轮已确认范围；“暂缓”不进入本次开发。六个导航项在 Popup 内切换，切换本身不重跑全页审计、不打开 Side Panel。右侧固定工具标题与页面状态，底部固定 Open SEO Audit；默认 Content。520px 为主设计基准，另验 400px、340px。保留项目现有 Logo、左上角帮助问号及原型规定的 View guide 交互。

| 模块 | 1.4.0 实施／复用 | 明确暂缓 |
|---|---|---|
| **Content** | 保留已实现的 Title、Meta Description、URL 原文、字符数绿／黄、复制和 Open SEO Audit；复用 wordCount 与 H1–H3 DOM 原顺序，默认展示前 8 条并支持 Show more / Show fewer；从完整数组复制纯文本 TSV（H级别、真实 Tab、完整文本），保留重复和顺序，明确成功／失败反馈。复用当前 Side Panel 已有的 ContentAnalysis 与 TSV 逻辑，不重写第二套。Word Count 采用第 1 节修正后的准确说明。 | Published/Modified、Raw/Rendered、H4–H6、新字数算法。 |
| **Indexability** | 按原型保留 Canonical、Robots、Sitemaps、Hreflangs 四组；从 PageData.canonical 展示 live DOM 值、找到／缺失提示和复制反馈。无扫描数据时写 Not available，不推断 Raw HTML 或实际索引状态。 | Robots Meta、robots.txt、Sitemap、Hreflang、X-Robots-Tag、Raw Canonical 逐项 Not checked／Coming soon；不发新网络请求。 |
| **Structured Data** | 按原型保留 JSON-LD detection、Schema types、Deeper validation 分组；以 jsonLdBlockCount 判断块是否存在，以 invalidSchemaCount 表示解析失败块数，以去重后的非空类型值展示／复制 Schema Types；无类型或解析失败给准确状态，不把解析成功写成富结果验证通过。 | 完整嵌套 Schema Details、Google Rich Results Test、Schema Markup Validator 均 Coming soon；P1-B 暂不实施。 |
| **Images** | 按原型保留 Image count、Image details、Image tools；展示已采集图片的 URL、Alt Text、自然尺寸并逐项复制 URL，区分无 Alt 属性与空 Alt。最多 1000 张，长 URL 换行且大量行可滚动；统计只称“已采集图片”，Audit 可审查图片另行标示。 | Alt Filter、独立 Refresh、CSV Export 均 Coming soon；P1-C 暂不实施。Thumbnail、OK/Broken 也不实现。 |
| **Social** | 保留 Open Graph 与 X (Twitter) Card 两组及字段名，全部明确 Not checked／Coming soon，不给虚构值或“缺失／通过”结论。 | OG/Twitter 采集、预览和诊断。 |
| **Links** | 保留 Internal/External、Dofollow/Nofollow、UGC/Sponsored 的入口与 Coming soon，不给虚构链接结果。 | 链接采集、搜索、过滤、导出、状态检测、Highlight。 |

**页面状态：**原型规定的正常、长度异常、问题提示、数据缺失、扫描中、失败和权限不足均要有对应真实状态；未知数据不得显示 0 或“检查通过”。帮助气泡再次点问号、点外部或 Esc 关闭；View guide 仅由用户点击打开固定官网页面。正式教程只介绍已经上线的功能。

## 3. Side Panel Audit 实施方案

1. 保留当前工作区已有的 ScoreCard、IssueList、四类 auditCategories 映射及筛选逻辑、AI Fix 和 Rescan。四张卡片只统计完整 issues[] 的实际数量；Severity 汇总和 Score 始终来自完整结果。
2. 从 Report 移除 Audit / Content Analysis 双 Tab 与 ContentAnalysis 的渲染入口、重复的 Word Count／Headings／Copy Headings、相关样式与状态切换。若 TSV 格式化函数供 Popup 复用，移到不依赖 Side Panel UI 的共享模块；不能因删除视图而丢失已验证的复制逻辑。
3. 保持 2×2 分类卡片、选中高亮、点击滚至过滤后的 Issue 列表、Show all issues、零问题类别和整页零问题空态；保留 Issue 的 Severity、Impact、Recommended Action、现有可用 AI Fix 及 Rescan。
4. 扫描中、权限不足、失败、受限页面都不显示过期报告。筛选只影响渲染数组，不修改 SeoResult.issues、Issue ID、顺序、score、grade、categoryScores 或 categoryWeights。
5. 当前 Report 已有分类 UI，因此本项主要是**保留／收口**，不是重新开发四类分类。

## 4. Popup Check 与 Audit Issue 的唯一映射

Popup 可以给出基础提示，但只有现有 evaluateRules 生成 SeoIssue；Popup 不创建新 Issue ID、Severity、impact 或分数。基础提示需区分“页面字段事实”“对应现有 Issue”“未检查”。

| Popup 字段／提示 | 现有 Audit Issue | 1.4.0 复用规则与边界 |
|---|---|---|
| Title 缺失／短／长 | TITLE_001 Critical；TITLE_002/003 Warning | 复用 metadataLength.ts 的 30–60 长度口径；原文与字符数不是新增 Issue。 |
| Meta Description 缺失／短／长 | META_001 Critical；META_002/003 Warning | 复用 70–160 口径；复制不产生 Issue。 |
| H1 缺失／多个／标题层级跳跃 | HEADING_001 Critical；HEADING_002/003 Warning | 按 scanner 的 H1–H3 顺序计算；缩进只表达级别，不推断父子关系。 |
| Word Count／文本比例 | CONTENT_001 Warning；CONTENT_002 Info | 既有低字数规则会扣分，低文本比例 impact=0；Popup 明确说明字数是可见文本估算、低字数可能触发 Audit Issue，但不是建议用户机械追逐的目标。 |
| Canonical 缺失 | TECH_001 Warning | 仅判断 live DOM 是否有值；找到值不证明 URL 正确、原始 HTML 一致或可索引。 |
| JSON-LD 无记录／解析失败 | TECH_002 Info；TECH_003 Warning | 规则仍按现有 schemas.length 和 invalidSchemaCount 判定，可能同时产生两个 Issue；Popup 的块存在性改读 jsonLdBlockCount，Schema Types 读去重后的非空类型值。新增标量不改变 TECH 规则。 |
| 图片 Alt 缺失／覆盖率／性能 | IMAGE_001/002 Warning；IMAGE_003 Info | Popup 的图片及无 Alt／空 Alt 数基于全部已采集 page.images；Audit 的缺 Alt 和覆盖率只用 auditable 子集。两个分母分别标示。空 alt 不等于没有 alt 属性；自然尺寸／传输量不等于 HTTP 状态。 |
| URL 长度／结构 | URL_001/002 Warning | 当前 Popup 主要展示 URL 原文，不因增加工具导航自动添加新的 URL 检查文案。 |
| Robots、Sitemap、Hreflang、Social、Links、图片／链接状态 | 无对应已实现 Issue | 一律 Not checked 或 Coming soon；不生成 Audit Issue，也不影响 SEO Score。 |

AI Fix 仅保留 TITLE_001–003 与 META_001–003 的既有真实调用。API Rate Limit、后端 Daily Quota、User Free Trial、Pro License 分开处理；后两者未实现，本次不新增支付、身份或许可证流程。

## 5. 统一数据结构与生命周期

### 5.1 唯一采集与计算链

当前内容脚本的单一路径保持为 **scanPage → analyzePage → evaluateRules → calculateScore → SeoResult**。QuickMetadata 的轻量读取仍先保证 Popup 打开即见 Title／Description／URL；详细工具数据从同一内容脚本的 PageData / PageMetrics / SeoIssue 取得。扫描器在 1.4.0 仅新增 jsonLdBlockCount 标量，含义为匹配到的 JSON-LD script 元素数；不保留脚本文本或嵌套详情，不改变规则输出。不要为 Popup 再写一套 headings、canonical、image、schema 扫描或评分引擎。Popup 只消费结果并生成非评分的说明文案。

**统计契约：**Schema Types 显示 metrics.schemaTypes 中按原字符串去重的非空 type 条目，数量只称“类型条目数”；当前扫描器会把数组形式的 @type 合并为一个字符串，也不展开 @graph，不能宣称精确的语义类型总数。schemas.length 是成功解析出的顶层值／数组项数，可能不等于类型条目数；jsonLdBlockCount 是脚本块数；invalidSchemaCount 是无法解析的脚本块数。同一块可以包含多个数组项或 @type 值，不能从 schemas.length + invalidSchemaCount 推回块数。Images 中 page.images.length 是“已采集图片数”（最多 1000），metrics.auditableImageCount 是 Audit 子集数，metrics.imagesWithoutAlt 只针对该子集。若图片数达到 1000，UI 不声称整页总数恰为 1000。

建议共享快照契约（字段名称在编码时可按现有类型收口）：

~~~text
PageSnapshot {
  tabId, url, generation, scannedAt,
  status: idle | reading | ready | error,
  result?: SeoResult,
  errorKind?: access-needed | restricted | read-failed | scan-failed
}
~~~

QuickMetadata 与 PageSnapshot 是同一 Tab、URL 的不同读取阶段；只在两者 URL 和代次匹配时合并显示。Popup 内切换工具不重复读取页面；Popup 转入 Side Panel 时优先读取有效共享结果，缺失或失效时才由同一采集链按需扫描。页面刷新使旧结果失效，随后获取的新扫描或用户主动 Rescan 才能产生新的当前结果。侧栏从 Popup 进入时继续自动取得首份 Audit Report，不要求第二次点击。

### 5.2 跨界面协调与失效

**P0 已选定的共享机制：**采用以 tabId + URL + generation 为键的有界 `chrome.storage.session` 快照协调层，在 Popup、Side Panel 与后台之间交换同一份 `SeoResult`；当前 Manifest 已有 `storage` 权限。独立 MV3 验证已证明 Popup 文档关闭后原生 Side Panel 可读取、同 URL 跨 Tab 隔离、刷新失效和旧代次写入拒绝，并测量了 1000 张合成图片的载荷／读写耗时（见[测试报告](../testing/SEO_COPILOT_1.4.0_P0_SESSION_STORAGE_POC.md)）。`storage.session` 在扩展加载期间驻留内存，浏览器重启或扩展停用／重载／更新后会清除，默认不向内容脚本开放（[Chrome 官方 Storage API 文档](https://developer.chrome.com/docs/extensions/reference/api/storage)）。只保存界面与 Audit 需要的限量结构，不保存 Raw HTML、页面正文全文、AI 请求内容或永久历史。快照缺失、失效或超限时，由同一内容脚本按需重扫，不建立第二套扫描引擎。正式接入仍需落实权限复查、容量／过期清理和真实 Chrome 扩展 Reload 复核；不能把后台 service worker 的普通内存 Map 当作可靠持久共享。

| 事件 | 预期状态规则 |
|---|---|
| Popup 打开 | 先显示轻量 Metadata；取得权限与页面所有者后异步读当前 Tab 的有效快照或发起一次受控扫描。默认 Content 不因连续点工具重复扫描。 |
| Popup 关闭／重开 | Popup 局部 UI 状态可丢失；若有有效会话快照则恢复同页数据，否则重读 Metadata 并按需扫描。不能显示另一 Tab 的快照。 |
| Tab 切换或 URL 变化 | 以 tabId、URL、代次隔离；异步旧结果不得覆盖新页。关闭 Tab 清理其快照。SPA URL 变化按现有 tabs.onUpdated 路径处理；URL 不变的普通 DOM 改动无法由此事件自动发现。 |
| 同 URL 页面刷新 | tabs.onUpdated 报告该 Tab 进入 loading 时，即使 URL 未变也递增代次、清除旧快照并使进行中请求作废；重复 loading 事件不得导致状态反复翻转。Popup 进入读取态，加载完成且仍有访问权时重新读取 Metadata 和所需页面数据，否则显示权限不足／读取失败；Side Panel 隐藏旧 Score／Issues 并回到待扫描态，不自动沿用旧 Report，也不因刷新自行发起 AI 请求。 |
| Popup → Side Panel | 保留现有 audit intent 的 tabId/windowId/URL 校验。若快照新鲜且已包含完整 SeoResult，可复用；否则 Side Panel 自动扫描一次。两条路径都须自动进入报告或明确错误。 |
| Side Panel Rescan | 生成新代次并更新共享快照；Popup 若仍存在则收到新状态或下次读取时发现旧代次失效。评分只由新 SeoResult 产生。 |
| Images 独立 Refresh | 1.4.0 不执行，入口保持 Coming soon；不得把全页 Rescan 假装为图片独立 Refresh。 |
| 权限、失败、超时 | 保留现有可选站点授权、重试和 30 秒 Side Panel 扫描超时。未经授权不能凭缓存跨站复用；错误状态不显示旧结果为新结果。 |

**需要重点验证：**Popup 当前在组件内持有 PerTabMetadataState，Side Panel 在组件内持有 PerTabScanState，两者尚未互通；Popup 关闭会卸载自身状态。跨界面交换必须限制对象大小和保留时间，并处理一次扫描返回最多 1000 张图片、大 URL、多个 Tab、刷新竞争和 MV3 后台生命周期。任何新网络请求与新 Chrome 权限不属于 P1-A 默认方案。

### 5.3 P0 小型技术验证：已完成独立验证

独立验证已在 Chrome for Testing 与 Edge 的 MV3 扩展中执行，细节与 Chrome 专属 Reload 限制见[测试报告](../testing/SEO_COPILOT_1.4.0_P0_SESSION_STORAGE_POC.md)。以下保留原定验证流程及正式接入门槛；测试扩展不视为已交付功能。验证流程：

1. 在 Tab A 打开页面 URL A；打开 Popup，读取页面并将同一份 `SeoResult` 的限量快照写入 `chrome.storage.session`，键包含 Tab ID、URL 和 generation。
2. 关闭 Popup，确认 Popup 实例已卸载；随后打开 Side Panel。
3. Side Panel 只在当前 Tab ID、URL、generation 均匹配且当前仍有页面访问权时读取快照；核对 Issue ID、Severity、Score 与原扫描一致，无需再次扫描即可显示有效结果。若不匹配则不展示缓存。
4. 在 Tab A **同 URL 刷新**，于 `tabs.onUpdated` 的首次 `loading` 事件立即递增 generation 并使旧快照与旧 Report 失效；加载中打开 Side Panel 不得读到旧结果。再模拟旧扫描／旧写入晚于失效事件返回，验证其不能复活旧结果。
5. 打开 Tab B（包括与 Tab A 相同 URL 的情形），切换后打开 Popup 和 Side Panel，确认不会读取 Tab A 的快照；关闭 Tab A 后清除其条目。
6. 关闭并重开 Popup、让 MV3 service worker 空闲后重新唤醒，验证有效快照仍可读取；扩展重载或浏览器重启后应无旧快照，页面需重新读取或扫描。

**PoC 结论与剩余门槛：**核心共享、隔离、刷新失效、旧结果拒绝、浏览器重启以及 Edge 扩展 Reload 均通过；Chrome for Testing 的命令行加载方式在 `runtime.reload()` 后未恢复扩展页面，Chrome 正式构建仍须补做 Reload 验收。合成 1000 图片的载荷与耗时已记录，生产 UI 首屏和真实扫描性能尚未测量。正式接入时只存本次展示／审计所需字段，不存 Raw HTML、全文、AI 输入或永久历史，未经当前站点授权不得展示快照；选定有界容量与过期时间；任何超限或读取失败都走按需重扫／明确错误，不截断 `SeoResult` 后继续声称报告完整。

## 6. P0、P1-A、P1-B、P1-C 依赖与批准门槛

| 批次 | 具体任务 | 依赖／退出条件 | 本计划的批准状态 |
|---|---|---|---|
| **P0** | 按本轮确认冻结六模块范围和四项统计／文案口径；独立会话快照验证已完成并选定 `chrome.storage.session`，缺失时按需重扫；正式实现同 URL loading 失效规则；移除首次安装自动打开 Welcome 的逻辑，同时保留 welcome.html | PoC 报告已记录读写耗时／体积、生命周期、隔离及限制；正式接入仍须复核权限、容量／过期清理、Chrome 扩展 Reload 与实际 UI 性能；不改 Score、权重、规则、Severity、AI Fix；Welcome 安装测试和刷新代次测试通过 | **PoC 已完成；其余 1.4.0 P0 开发待批准** |
| **P1-A** | Popup 六入口与完整 Content；Canonical 展示／复制；Schema 类型、块检测及解析状态展示／复制；Images URL／Alt／自然尺寸及逐项复制；Social、Links Coming soon；Side Panel 删除双视图并保留完整 Audit；完成跨界面状态同步 | P0 数据契约与刷新失效机制可用；按 340／400／520px 验收；仅 Schema 块数补一个扫描标量 | **1.4.0 必做，待计划审核后实施** |
| **P1-B** | 完整 Schema Details、Google Rich Results Test、Schema Markup Validator | 需要另审详情字段、限长／脱敏和外部 URL 传递；1.4.0 只做已确认的基础类型／解析状态 | **本次暂缓，不实施** |
| **P1-C** | Images Alt Filter、独立 Refresh、CSV Export；Thumbnail 另案 | 需要另审 Refresh 语义、CSV 安全和大列表性能；1.4.0 只做已确认的图片明细／复制 | **本次暂缓，不实施** |
| **P2/P3** | Robots/Sitemap/Hreflang、日期、Outgoing Links、Social；图片／链接状态、HTTP Headers、Raw/Rendered 等 | 数据采集、跨域、权限、隐私和请求成本另案评估 | **暂缓** |

1.4.0 的发布说明只纳入实际上线并验收的功能。原型与开发准备阶段不改版本；功能验收后再统一核对版本相关配置，不依据计划直接更新。

## 7. 预计修改文件与对应测试

以下是实施阶段的**预计触点**，并非本轮改动或要求全部编辑。优先复用当前工作区未提交的 P1-A 代码，先看差异再改，避免覆盖他人修改。

| 任务 | 预计生产文件 | 必要测试／验证 |
|---|---|---|
| Popup 六入口、布局、Help、状态和 Metadata 保留 | src/popup/PopupApp.tsx；src/components/QuickMetadataCard.tsx；src/styles.css；可能新增 Popup 模块组件 | PopupApp.test.tsx、App.metadata.test.tsx、QuickMetadataCard.test.tsx；真实 340/400/520px、长文本、无权限及打开 Audit |
| P0 会话存储验证及共享页面结果、按 Tab/URL/代次隔离与同 URL 刷新失效 | 独立验证脚本 tmp/p0-session-poc.mjs 与报告 docs/testing/SEO_COPILOT_1.4.0_P0_SESSION_STORAGE_POC.md 已形成；正式触点预计为 src/types/seo.ts、src/popup/perTabMetadataState.ts、src/popup/perTabScanState.ts、src/popup/scanActiveTab.ts、src/popup/App.tsx，以及会话协调共享模块／background.ts | PoC 已验证关闭 Popup 后原生 Side Panel 读取、同 URL 刷新、同 URL 不同 Tab、旧异步写入、浏览器重启及 1000 图片载荷；Edge 扩展 Reload 通过，Chrome 正式构建待复核。正式实现再测 perTabMetadataState.test.ts、perTabScanState.test.ts、scanActiveTab.test.ts、background.test.ts、权限、容量、过期清理、失败重试和 Rescan 同步 |
| Content 迁移与 TSV | src/report/ContentAnalysis.tsx 中的可复用逻辑迁至共享模块／Popup 组件；src/report/Report.tsx 移除内容视图；src/styles.css 收口样式 | Report.test.tsx 迁移断言，新增 Popup Content 测试：8 条折叠、完整 TSV、DOM 顺序、重复／长／空标题、复制成功失败 |
| 分类与规则一致性 | 主要复用 src/report/auditCategories.ts、src/components/IssueList.tsx、src/components/ScoreCard.tsx；**不计划改** src/rules/seoRules.ts 或 src/scoring/score.ts | Report.test.tsx、IssueList.test.tsx、score.test.ts、seoRules.test.ts：筛选不变分数／Severity／原始 Issues；AI 入口范围保持 |
| Canonical／Schema／Images 已有数据视图（1.4.0 必做） | Popup 各模块组件与共享纯展示选择器；src/analyzer/scanner.ts 和 src/types/seo.ts 仅补 jsonLdBlockCount 标量，不采嵌套详情 | Canonical 有／无／复制；Schema 0 块、有块无类型、数组、多块、无效块、去重类型及复制；图片 null／空 Alt、自然尺寸、1000 上限、逐项复制及全部／可审查分母；无网络请求或新 Issue |
| P1-B 暂缓任务 | 本次不修改完整 Schema Details、外部验证相关生产文件 | 本次不增加对应发布验收；若将来单独批准，再测试 @graph／超大 JSON、固定 HTTPS、URL 编码及外传提示 |
| P1-C 暂缓任务 | 本次不修改 Images Filter、独立 Refresh、CSV 相关生产文件 | 本次不增加对应发布验收；若将来单独批准，再测 Refresh 与 Score 隔离、CSV 转义和公式注入防护 |
| Welcome 1.4.0 修复 | src/background/background.ts；src/background/background.test.ts；welcome.html 保留 | 首次安装不自动创建 Welcome Tab；升级行为、审计意图消息和用户主动 Help 不受影响 |

若实施触及 Manifest 权限、后端 AI、评分规则或原型之外的新 UI，应暂停该子任务并重新审核范围；这些不是本计划默认触点。

## 8. 1.4.0 最终验收标准

| 验收面 | 必须达到的可观察结果 |
|---|---|
| Popup 信息架构 | 六个入口、左栏品牌／问号、右栏标题与状态、底部 Open SEO Audit 与已通过原型一致；工具切换只改变 Popup 内容，不能打开 Side Panel 或重复触发扫描。主宽 520px，340/400px 无不可读、横向溢出或按钮遮挡。 |
| Content 与 Metadata | Title／Meta 原文、字符数阈值和绿／黄规则与现有功能一致；Word Count 使用第 1 节确定的可见文本估算及低字数可能触发 Issue 的文案。H1–H3 保留 DOM 顺序与 Badge，前 8 条默认、Show more/fewer 可逆，长标题完整换行。Copy Headings 为全部标题的纯文本 TSV，使用真实 Tab，一标题一行，保留重复和完整文本，不受折叠影响；成功失败均有反馈。 |
| Indexability | Canonical 从 live DOM 结果展示／复制，缺失提示与 TECH_001 一致；Robots、Sitemaps、Hreflangs 仍 Not checked／Coming soon，不产生新 Issue。 |
| Structured Data | jsonLdBlockCount 准确区分 0 块与有块但无类型；invalidSchemaCount 是解析失败块数，metrics.schemaTypes 是去重的非空类型值，不把 schemas.length 或两者相加当块数；类型展示与复制成功／失败可用。完整详情与外部验证仍 Coming soon。 |
| Images | Popup 已采集图片的 URL、Alt、自然尺寸、逐项复制可用；null／空 Alt 分开，最多 1000 张的上限不冒充全页总数；Audit 的 auditable 子集数量与 Popup 全部已采集数量口径明确区分。Filter、独立 Refresh、CSV 仍 Coming soon。 |
| Social／Links | 六入口保留；Social 和 Links 均只显示 Not checked／Coming soon，不出现虚构值、通过状态或相关新 Issue。 |
| Side Panel | 无 Audit / Content Analysis 双 Tab 或重复内容；SEO Score、Grade、Critical/Warning/Info、2×2 四类分类、Issue Details、Impact、Recommended Actions、AI Fix、Rescan 均可用。零 Issue、零问题类别和 Show all issues 正常。 |
| 规则不变性 | 同一页面扫描前后，未修改的规则仍给出相同 Issue ID、Severity、impact、Score 和 Grade；四类过滤只改变可见列表，Severity 和 Score 总数不变。AI Fix 仅 Title/Meta 既有六种 Issue 可触发。 |
| 数据与生命周期 | P0 已记录第 5.3 节真实 Chrome 验证结果和最终共享方案；Popup/Side Panel 无两套扫描引擎；同 Tab／同 URL／有效代次可复用结果，Tab 切换、URL 变化、Popup 关闭重开、权限拒绝／允许、扫描中切页、失败重试和 Rescan 不串页。同 URL 进入 loading 立即作废旧快照与旧 Report，旧异步响应不能复活结果；Popup 加载完成重读，Side Panel 回到待扫描，不显示旧 Score／Issues。首入 Audit 自动呈现或自动取得结果。 |
| Welcome | 新安装不自动创建 Welcome Tab；welcome.html 文件保留；用户主动 Help／View guide 仍可使用。 |
| 权限、性能、隐私 | 不因 P1-A 默认新增 Chrome 权限或外部检查请求；大图集与长 URL 不阻塞主要交互；AI 仍只在主动点击后请求现有后端；会话快照不成为历史记录或永久页面内容存储。 |
| 质量门槛 | npm test 与 npm run build 通过；在真实 Chrome 加载当前构建验证 Popup→Audit、三种宽度、动态页面、跨域授权、多个 Tab、刷新和 AI Fix 的既有路径。原型 DOM 检查与历史截图不能代替真实扩展视觉／权限验收。 |

## 9. 开发执行顺序与停点

1. **计划审核：**本文件获批后，按第 1 节已确认范围实施；不再把 Canonical／Schema 基础视图／Images 明细当作未决可选项。
2. **P0 基线与数据契约：**独立会话快照 PoC 已完成，选定 `chrome.storage.session` 与按需重扫回退。正式开发前保护并核对现有未提交修改，记录 Score、Issue、Metadata、AI、权限和 Open SEO Audit 的行为；实现同一 Tab/URL/代次协调，确定容量与过期策略，补 jsonLdBlockCount 标量及对应测试，落实同 URL loading 失效规则；正式构建继续验收 Chrome Reload、权限与 UI 性能。
3. **P0 Welcome 修复：**取消新安装自动打开 Welcome 的代码和旧测试预期，保留 welcome.html；验证审计意图后台消息不受影响。
4. **P1-A Popup：**按已通过原型完成六入口壳与状态、完整 Content 与 TSV、Canonical、Schema 基础信息、Images 明细；Social／Links 只保留 Coming soon。逐模块核对扫描次数、空态、复制及宽度。
5. **P1-A Side Panel：**移除旧双视图，保留现有四类筛选、Score、Severity、Issue、AI Fix、Rescan；完成 Popup→Audit 与 Rescan 同步。
6. **端到端验收：**自动化测试、生产构建、真实 Chrome 权限／刷新／多 Tab 路径和 340／400／520px 视觉验收；实际功能通过后再按发布流程统一版本配置与发布说明。
7. **范围停点：**P1-B、P1-C 及 P2/P3 维持暂缓；即使 P1-A 完成，也不自动进入这些功能的代码开发。

**本计划完成后等待审核。**本轮未修改业务代码、原型、历史研究、版本号，也未提交、推送或部署。
