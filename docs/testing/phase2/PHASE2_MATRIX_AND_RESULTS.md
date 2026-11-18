# Phase 2：针对性测试矩阵与证据

日期：2026-11-16。范围仅限 Phase 2；未修改业务规则、Severity、评分或 Popup / Side Panel 联动。

**审核状态：文档复核项已更正。Phase 2 批准按“完成、带证据限制”归档；Phase 3 仍为 Hold。Phase 3 仅可评估 Bing tracking URL 收录策略和图片 Status 刷新行为，规则实现须另有明确产品要求与针对性证据。**

## 被测版本与证据等级

- 本地仓库：`main`，扩展版本 `1.3.1`。`npm run build` 于 2026-11-16 通过；`dist/background.js` SHA-256 为 `C67B54F0A4259AE6E59F4F838FA11920A0D9C13DE15B0D0877D1438C3B89C5CE`。
- Chrome `sumei` 配置中，扩展详情显示解压版来源为 `E:\susm-program\SEO-Copilot\dist`；用户确认已重新加载，并提供 2026-11-16 的 Popup 截图和 HAR。HAR 本身不含产品版本号，以下本方实测按解压版用户材料归档，无法单凭 HAR 独立确认打包版本。
- 同一配置中还显示一个商店版 SEO Copilot `1.3.2`。后续实测必须核对打开的是解压版 `1.3.1`（ID `bpefilmcgplgmfnbllbkcmggebcploim`），否则结果不能归属本地构建。
- **F（Fixture）**：本轮可重复运行的代码路径结果。**L（本轮现场观察）**：2026-11-16 从测试 Chrome 的扩展弹窗可访问性树读取的当前页面结果。**U（本轮用户材料）**：用户提供并归档的 2026-11-16 截图、CSV 或 HAR；它们证明各自采样时的观察，不能单独证明竞品内部算法。**H（历史材料）**：用户提供的 2026-11-13 截图或 CSV，只证明当时观察。**B（待测）**：尚无足够证据的项目。竞品内部算法均未知。

## 测试网站矩阵

| ID | 页面 / Fixture | 对比目标 | 本轮 SEO Copilot 结果 | Ahrefs 结果与证据 | 状态 |
| --- | --- | --- | --- | --- | --- |
| P2-01 | `metadata-no-headings.html`；[Google 富媒体测试结果](https://search.google.com/test/rich-results/result/r%2Fsoftware-apps?id=VO3rzEBzju-1JYZ9H6Jr8w) | 缺 Description、无 Heading 时的 Popup 提示、Issue 数量 | F：`META_001` 与 `HEADING_001` 是两个独立 Audit Issue；当前 Popup 代码在零 Heading 时不把 `HEADING_001` 计入角标，因此显示 1。U：本方 Content badge=1、Images badge=1、Word count=111；Description 和 Headings 均 Missing | U：Ahrefs Content badge=1、Images badge=1、Social tags badge=1、Word count=85；Description 和 Headings 均 Missing | 可见的 Content/Images 计数和缺失提示一致；Social tags 差异来自本方模块尚未采集/不产生 badge；字数差异已确认，根因按用户要求暂缓 |
| P2-02 | `heading-order.html`；[Backlinko](https://backlinko.com/) | 首个 Heading 不是 H1，但后面有 H1 | F：Fixture 单独使用 H2→H1 序列，触发 `HEADING_004`，不触发 `HEADING_001`。U：真实页面截图显示前两个标题为 H3，随后为 H2、H1；本方显示 “The first heading is not H1” | U：Ahrefs 真实页面截图也显示前两个标题为 H3，随后为 H2、H1，并显示 “The first heading is not H1” | 两端真实页面截图均证明该提示可见，且显示顺序一致。该真实页面序列与 Fixture 分开记录，截图不证明现场输入是 Fixture 的 H2→H1。旧现场 DOM 记录与本次截图不一致，不作为同一状态证据。Title/Description 计数相同；字数差异暂缓；Ahrefs 显示 Dates、本方未展示 |
| P2-03 | `images-mixed.html`；[Similarweb](https://www.similarweb.com/)、[Thunderbit](https://thunderbit.com/)、[GPS](https://www.gps-phone.net/imei-tracker/) | DOM 图片、重复 URL、data URL、1×1 图片、追踪请求与 alt | F：4 个可报告图片、2 个被排除项（data URL、1×1）；重复 URL 保留；缺 alt 为 2；触发 `IMAGE_001` 与 `IMAGE_004`。U：2026-11-16 本方 CSV 清单及 Status 已逐行对比（见索引）；页面 DOM 数量会随加载变化 | U：同时间窗口 Ahrefs CSV 已逐行对比；Ahrefs 刷新 HAR 另见“图片刷新 HAR” | CSV 对比完成但采样时间相差约 1–3 分钟；确认每页本方多 1 条 `bat.bing.com/action/0`。429 截图和本方代码支持“同服务器余项未检查”，逐条空 Status 请求映射仍无法核验；不外推 Ahrefs 通用过滤算法 |
| P2-04 | `index-noindex.html`；[CMLabs](https://tools.cmlabs.co/en) | noindex 信号、Canonical、Robots、Sitemap、Hreflang | F：Fixture 中 `robots=noindex,nofollow`；按 1.4.0 明确范围不生成 Audit Issue。L：当前页面 `robots` 与 `googlebot` 均为 `noindex, nofollow` | U：同页截图中 Ahrefs 的 Robots 显示 “Noindex page”；Rendered Canonical=`https://tools-new.cmlabs.dev/en`（Non-canonical），Raw Canonical=`https://tools.cmlabs.co/en`（Self-canonical）；Sitemap URL=`https://tools.cmlabs.co/sitemap.xml`。Hreflang 为 `x-default/en → tools-new.../en`、`id → tools-new.../id` | Robots 标签和 hreflang 值一致；Canonical 值一致但分类呈现不同；Sitemap Ahrefs 显示 URL、本方显示 Not found。差异已确认，根因未知 |
| P2-05 | `structured-mixed.html`；[Backlinko](https://backlinko.com/) | JSON-LD `@graph`、无效块、Microdata、RDFa | F：2 个 JSON-LD 块，1 个解析错误；识别 WebPage、WebSite、Product、Organization；触发 `TECH_003` | L：当前 Backlinko 首页 Ahrefs 弹窗显示 JSON-LD 顶层 WebPage、ImageObject、WebSite、Organization；H：此前截图展开其属性。没有同一混合 Fixture 的竞品结果 | B：只确认当前首页的顶层列表，不验证混合 Fixture |
| P2-06 | `word-count-hidden.html`；Google 富媒体测试结果 | 隐藏 SPA 数据是否进入字数 | F：模拟浏览器 `innerText` 为 “Visible words only.”，结果 3 words。L：公开页面 DOM `body.innerText` 按本方算法得 111，`body.textContent` 同算法得 30,839；U：本方截图 Word count=111 | U：Ahrefs 截图 Word count=85；Title、Description Missing、Headings Missing 与本方截图一致 | 数值差异通过同页截图确认；具体算法原因按用户要求暂缓，不作为本轮继续追查项 |

## 证据索引

以下图片和 CSV 已复制到 `docs/testing/phase2/evidence/`，拉取仓库后可复核。CSV 命名规则：带下划线的 HTTPS 文件为 Ahrefs；连字符主机名文件为 SEO Copilot。HAR 含请求元数据，未复制进仓库；表内保留用户原件路径并注明可支持的结论。

| ID | 文件 | 用途 |
| --- | --- | --- |
| E01 | `evidence/codex-clipboard-7c49e1f7-42b1-4e06-b363-64239a672fe8.png` | Backlinko Ahrefs：标题长度、description、首个标题非 H1 提示、可见标题顺序、字数、Dates |
| E02 | `evidence/codex-clipboard-af3759ed-788c-4973-ba34-c8b2483f5ffb.png` | Backlinko SEO Copilot 同页对照：提示文案和可见标题顺序一致、字数不同、无 Dates |
| E03 | `evidence/codex-clipboard-69529193-4ff5-48e5-9fca-cd8b1ada19c2.png` | Google 富媒体测试页 Ahrefs：Content/Images/Social tags badges、缺失项、字数 |
| E04 | `evidence/codex-clipboard-668df8f3-b33c-4e7a-9ae7-6d5b2adc1ddf.png` | Google 富媒体测试页 SEO Copilot 同页对照 |
| E05 | `evidence/codex-clipboard-21ae6057-a159-4287-a4c5-711d318f8fc5.png` | CMLabs Ahrefs：Canonical 分类、noindex、Robots、Sitemap、Hreflang |
| E06 | `evidence/codex-clipboard-5037e872-b624-42c7-808a-fdf1f33f823a.png` | CMLabs SEO Copilot 同页对照 |
| E07 | `evidence/codex-clipboard-cdbe2db5-4b5e-44e4-95c8-3e1f13fec37f.png` | 图片刷新中 146/165，界面明确提示 429 及同服务器余项未检查 |
| E08-A/B | `evidence/Images-https___www.similarweb.com_-2026-11-16-10-48.csv` / `evidence/Images-www.similarweb.com-2026-11-16-10-49.csv` | Ahrefs / SEO Copilot Similarweb 导出 |
| E09-A/B | `evidence/Images-https___thunderbit.com_-2026-11-16-10-49.csv` / `evidence/Images-thunderbit.com-2026-11-16-10-52.csv` | Ahrefs / SEO Copilot Thunderbit 导出 |
| E10-A/B | `evidence/Images-https___www.gps-phone.net_imei-tracker_-2026-11-16-10-52.csv` / `evidence/Images-www.gps-phone.net-2026-11-16-10-52.csv` | Ahrefs / SEO Copilot GPS Phone 导出 |
| E11 | `C:\Users\Administrator\Downloads\hgmoccdbjhknikckedaaebbpdeebhiei.har` | Ahrefs Thunderbit 刷新：328 条图片 GET，两轮各 164，均为 200 |
| E12 | `C:\Users\Administrator\Downloads\bpefilmcgplgmfnbllbkcmggebcploim1507.har` | SEO Copilot Popup HAR：6 条缩略图请求，不含 Status 检查请求或 429 |

## Phase 2 结论分类与 Phase 1 对照

对照 [Phase 1 原始审计归档](PHASE1_RULE_AUDIT.md) 和 1.4.0 计划。**已确认的行为差异不等于已确认缺陷**；修复仍需明确违反了哪条产品规则。

### 已确认缺陷

当前没有发现同时满足“违反明确产品规则、由当前代码造成、证据证明应按缺陷修复”三项条件的规则缺陷。已确认事实是：三组 CSV 各多一条 Bing tracking URL；图片刷新受批次/并发和 429 同源停止规则影响；CMLabs 有已观察到的 Canonical 标签及 Sitemap 结果差异；字数结果不同但原因未知。这些先作为 Phase 3 候选评估材料，不能直接认定为缺陷。

### 合理产品差异／已定义范围

- 1.4.0 计划明确 Robots、Sitemap、Hreflang 等不产生 Audit Issue、不影响 Score。因此 noindex 不生成 Issue 是产品规则，不是缺陷。
- Social tags、Outgoing links 当前为 Coming soon / Not checked。Ahrefs 在 Google 富媒体测试页显示 Social tags badge=1，属于功能覆盖差异。
- Phase 1 已确认 Popup badge 与 Side Panel Issue/分类计数口径不同：图片 alt 问题会合并计数；零 Heading 时 Popup 排除 `HEADING_001`。这不是可以单凭数字不同认定的计算错误。
- Ahrefs 展示 Dates、本方未展示，是当前覆盖差异；尚无明确产品要求证明本方必须实现该字段。

### 未验证假设／差异原因

- 三页 CSV 证明本方各多收录一条 `bat.bing.com/action/0`，但不证明 Ahrefs 通用过滤规则，也没有已确认的本方收录规则要求排除该类 URL。
- 截图证明 UI 报告 429 后同服务器余项未检查；HAR 未含 Status 请求，不能把每条空 Status 映射到 429。
- CMLabs Rendered Canonical 的 `Non-canonical` / `Found` 及 Sitemap URL / `Not found` 差异原因未证实。
- Ahrefs 与本方的字数差异原因、Ahrefs 通用图片过滤算法未证实；字数调查按用户要求暂缓。

### Phase 3 候选评估边界

可以评估但不能自动改动：Bing tracking URL 的收录策略；本方图片 Status 刷新速度与 429 后队列处理。Noindex 规则、CMLabs 未明原因、Dates、Social tags badge、字数以及 Ahrefs 的通用过滤算法不作为已确认缺陷处理。

### 2026-11-13 图片 CSV 逐行对齐

按 `URL` 保留重复次数做多重集差分。以下是**历史导出事实**，各对文件相隔数秒，页面脚本仍可能变化。`Alt` 空值不等同于 DOM 缺失 `alt` 属性。

| 页面 | Ahrefs 行数 | SEO Copilot 行数 | 本方多出的行 | 多出行的 URL 类型 |
| --- | ---: | ---: | ---: | --- |
| Similarweb | 89 | 90 | 1 | `bat.bing.com` 追踪请求 |
| Thunderbit | 164 | 169 | 5 | `t.co` 2、`analytics.twitter.com` 2、`bat.bing.com` 1 |
| GPS | 47 | 81 | 34 | `data:image` 30、`bat.bing.com` 4 |

三组中 Ahrefs URL 多重集均包含在当时本方导出中；本方没有少于 Ahrefs 的 URL。仅能确认多出行的地址归类，**不能据此断定 Ahrefs 的通用抓取过滤算法**。当前 `scanner.ts` 从 DOM `<img>` 收集，只保留 HTTP(S) URL，并排除已知 1×1 图片；历史 CSV 不代表重载后的规则表现。[历史图片界面](evidence/historical-image-inventory.png)供复核。

对历史 CSV 的尺寸与状态复核：Thunderbit 多出的 `t.co` 2 行和 `analytics.twitter.com` 2 行，导出尺寸均为 1×1；其 `bat.bing.com` 1 行无尺寸。Similarweb 多出的 `bat.bing.com` 1 行无尺寸、状态 204；GPS 多出的 `bat.bing.com` 4 行无尺寸、状态均为 204。GPS 另有 30 行 `data:image`。当前代码对 `data:` 和**自然尺寸已知为 1×1 的 DOM 图片**有明确排除路径，Fixture 已验证；`bat.bing.com` 是否由 DOM `<img>` 或资源列表进入历史导出，CSV 无法证明，也不能据 204 推断当前结果。

### 2026-11-16 刷新后图片 CSV 逐行对齐

对用户上传的三组 CSV 使用逐行 CSV 解析（不依赖重复字段名映射），按 URL 多重集保留重复项比较。两边导出时间相差约 1 分钟（Similarweb）、3 分钟（Thunderbit），GPS 均为 10:52；动态页面输入仍是比较限制。

| 页面 | Ahrefs 图片行 / URL 数 | SEO Copilot 图片行 / URL 数 | URL 差异 | Status 列 |
| --- | ---: | ---: | --- | --- |
| Similarweb | 89 / 83 | 90 / 84 | 本方多 1 行：`bat.bing.com/action/0`；竞品无独有行 | Ahrefs 89 行均为 200；本方 13×200、1×204、76 行空值 |
| Thunderbit | 164 / 88 | 165 / 89 | 本方多 1 行：`bat.bing.com/action/0`；竞品无独有行 | Ahrefs 164 行均为 200；本方 136×200、1×204、1×429、27 行空值 |
| GPS Phone（IMEI Tracker） | 47 / 38 | 48 / 39 | 本方多 1 行：`bat.bing.com/action/0`；竞品无独有行 | Ahrefs 47 行均为 200；本方 47×200、1×204 |

这里的“URL 数”是 URL 去重后数量。三组中 Ahrefs 的 URL 多重集均完整包含于 SEO Copilot 清单；本方每页多出的行均为 Bing tracking 请求。结合 `bat.bing.com/action/0` 地址，以及本方扫描器基于 DOM 图片收集的路径，**本方把 Bing tracking pixel 当成图片行收集**是这批差异的明确原因。该结论仅针对这三份导出，不泛化成 Ahrefs 的全站过滤规则。GPS 两个文件名不同：竞品按完整 URL 命名，本方导出文件名只含主机；清单行仍可逐项比较，竞品侧页面路径为 `/imei-tracker/`。

Status 空值代表本方该行导出时没有已记录的 HTTP 状态码（界面对应未检查/`—`），不是 200。HAR 与 CSV 互相印证：Ahrefs 这批 Thunderbit 图片刷新会重新发出图片 GET，导出状态仍为 200；本方 CSV 有 429 与未检查行。Similarweb 本方 CSV 有大量状态空值但没有 429 记录，因此文件本身不能证明这些空值由限流导致；还需要同一轮本方 HAR 或刷新进度记录，不能从空值直接推定原因。

### 2026-11-16 公开页面 DOM 现场输入（不是插件输出）

通过浏览器只读 DOM 检查，并用当前 `scanner.ts` 的来源优先级与已知 1×1 排除条件推算图片数量；**未运行扩展扫描，不能代替 Popup / CSV 实测**。

| 页面 | DOM `<img>` 观察 | 当前扫描条件的单次推算 | 解释边界 |
| --- | --- | --- | --- |
| GPS | 78 个；其中 30 个 `data:image` | 48 个可报告，30 个无 HTTP(S) 来源 | 与历史 Ahrefs 47 接近，但页面和时间不同，不可声称一致 |
| Thunderbit | 一次观察 167 个、其中 2 个自然尺寸 1×1；再次进入页面时 164 个 | 后一次观察推算 164 个 | 页面元素在访问间变化，不能将历史 164/169 与当前 DOM 直接配对 |
| Similarweb | 一次观察 107 个、其中 38 个 `data:image`；再次进入页面时 65 个 | 后一次观察推算 65 个 | 加载阶段或动态内容明显影响清单，必须同次导出比较 |

CMLabs 当前 DOM 的 `robots` 和 `googlebot` 均为 `noindex, nofollow`。但 canonical 与 `hreflang` 已指向 `https://tools-new.cmlabs.dev/en`（历史截图为 `tools.cmlabs.co/en` 自指），说明页面状态已变化；历史 canonical 对比不能作为当前回归结论。

## 本轮可重复的 Fixture 结果

运行 `npx vitest run src/analyzer/phase2Fixtures.test.ts`：**6/6 通过**。合并运行该文件、`PopupToolViews.test.tsx`、`inspectIndexability.test.ts`、`seoRules.test.ts` 与 `App.metadata.test.tsx`：**5 文件、75/75 通过**。这些测试覆盖扫描到 Popup 显示的相关代码路径，没有修改评分实现。JSDOM 没有真实浏览器布局与网络栈；`word-count-hidden` 使用显式 `innerText` 模拟浏览器代码路径，不能替代真实页面验证。

另运行 `npx vitest run src/popup/PopupApp.test.tsx src/analyzer/phase2Fixtures.test.ts`：**2 文件、27/27 通过**。其中已有 Popup 断言确认：缺 Description 且零 Heading 时，Audit 可保留 `META_001`、`HEADING_001` 两个 Issue，Popup Content 角标仅计 1。该差异来自 `PopupApp.tsx` 的零 Heading 聚合条件；历史截图中的角标 2 不能代表当前代码。此测试未更改业务实现。

增加 1×1 图片 Fixture 后，合并运行上述 6 个相关测试文件：**96/96 通过**。该结果只证明当前代码路径，不替代同页双扩展的浏览器结果。

2026-11-16 在同一个 Google 富媒体结果 URL 的公开页面 DOM 快照中，`body.innerText` 标准化后长度 207，按本方 `scanner.ts` 的 CJK / 非 CJK 计数公式为 111 words；`body.textContent` 长度 208,752，同公式为 30,839 words。页面没有 `meta[name="description"]`，也没有 H1–H6。此现场输入证实大量 DOM 文本不属于可见正文，支持历史字数异常与抓取口径有关；**111 与历史 Ahrefs 83、旧版 SEO Copilot 8679 不是同次扩展结果，不能据此断定两者算法或声称差异已修复**。

| Fixture | 实际断言 | 结论边界 |
| --- | --- | --- |
| metadata-no-headings | 缺 Description 和零 Heading 分别生成 `META_001`、`HEADING_001` | 验证本方 Audit 规则，不代表 Ahrefs 规则 |
| heading-order | H2→H1 生成 `HEADING_004`，无 `HEADING_001` | 只覆盖一种 Heading 顺序 |
| images-mixed | 4 个 URL 图片、2 个排除项（data URL、模拟自然尺寸 1×1）、两处缺 alt、重复 URL 保留 | 真实浏览器图片加载、网络状态与动态插图未在 JSDOM 验证 |
| index-noindex | noindex 不生成 Audit Issue | 符合 1.4.0 已定义范围，不属于映射缺口 |
| structured-mixed | `@graph`、Microdata、RDFa 被识别；坏 JSON-LD 触发 `TECH_003` | 不验证 Google 富媒体结果资格 |
| word-count-hidden | 模拟浏览器可见文本计为 3 words | 历史 83/8679 差异是否消失仍待实测 |

## 图片 Status 刷新行为（2026-11-16 代码核查 + 用户现场观察）

用户现场观察：Ahrefs 刷新时会重新显示 loading，但已显示的 HTTP 状态保持不变；SEO Copilot 刷新响应较慢，遇到 429 后停止同一来源剩余检查；选择 `Not checked` 时只刷新未检查图片，而不筛选时再次刷新会重新加载全部图片，并观察到状态短暂回到 `—` 后再显示 200。Ahrefs 的内部缓存、并发、请求节流实现未知；以上只记录可见行为，不推断其实现。

本方代码核查（`src/popup/PopupToolViews.tsx`、`src/popup/checkImageUrls.ts`）：

| 项目 | 当前实现事实 | 影响 / 证据边界 |
| --- | --- | --- |
| 点刷新选择范围 | 刷新按钮把当前 `filteredImages` 全部交给 `refreshImageStatuses`。默认 Status=`all`，所以每次都重新请求全部当前符合筛选条件的 HTTP(S) 图片；选择 `Not checked` 后才只请求未检查项。相同 URL 在一次刷新中会合并为一次网络请求，再把结果写回重复行 | 确认了全部刷新会重查的代码原因；竞品是否也会请求全部 URL，无法从外观判断 |
| 请求速度 | 每次刷新切成每批最多 6 个 URL，批次串行注入页面；每个注入函数内最多 2 个并发请求；每个请求超时为 8 秒；普通请求间加 250ms 间隔；HEAD 遇到 405/501 再发 Range GET | 这些等待与串行批次可累加，列表大时会明显变慢。真实网络耗时取决于图片源，本轮未做受控计时 |
| 加载时状态 | 函数先以 `{ ...imageStatuses }` 复制已有结果，再逐步更新；正常同一组件的二次刷新不主动清空已显示状态。已有测试 `PopupToolViews.test.tsx` 中 consecutive refresh 断言也覆盖“刷新完成后状态仍在”，但代码测试不验证真实浏览器中的加载瞬态 | 用户看到 `—` 与这条正常刷新路径不一致；需要区分 Status 刷新和页面 Rescan/扫描结果替换或组件重挂载。扫描 `scannedAt` 改变时 effect 会将状态重置为新结果携带的 imageStatuses（通常为空），这一分支可以造成状态清空 |
| 429 停止逻辑 | 检出 429 后将 origin 标记为受限，停止该轮剩余同 origin 请求；后续同源图片写为 `unchecked`。不同 origin 仍可继续 | 停止是按 origin，不是停止所有图片；同源旧状态可能被 `unchecked` 覆盖。页面/服务器的限流行为需实测 |
| 再次重试 | 没有已验证状态缓存跳过、429 冷却时间或 `Retry-After` 调度；下一次点击仍会重新请求全部当前筛选结果 | 解释了 429 后反复全量重试的流量和时长问题。持久化 snapshot 用于复开时恢复，不用于跳过请求 |
| HTTP 缓存 | fetch 使用 `cache: 'no-cache'` | 浏览器需重新验证资源；不能据此声称竞品复用了 HTTP 缓存 |

当前可定论：本方全量刷新慢的代码路径与复查全部 URL、串行小批次、最多 2 并发、250ms 间隔和最多 8 秒超时相符；429 后同源状态会被改写为 Not checked，下一次刷新会重新检查。用户提到的“无筛选时 `—` 再变 200”尚未能唯一归因：单纯的 Status 刷新代码保留当前状态；扫描结果替换会重置。需要记录操作是否触发了页面 Rescan，并捕获刷新中途状态截图或录像，才能区分状态刷新与整页重扫造成的短暂清空。

这一项归入 Phase 2 的本方行为证据；不在此阶段调整并发、缓存、429 策略或产品规则。与 Ahrefs 的可见刷新状态对比为用户提供的现场观察，尚无同一资源清单与网络追踪，不能得出竞品请求更少或复用 HTTP 状态缓存的结论。

### Ahrefs 图片刷新 HAR（用户提供，2026-11-16）

文件：`C:/Users/Administrator/Downloads/hgmoccdbjhknikckedaaebbpdeebhiei.har`。分析时只读取了 URL 的 host/path、请求方法、资源类型、状态码、响应 MIME、HAR timing 和传输字节数；未输出 Cookie、Authorization 或其它请求头值。

| 观测项 | HAR 事实 | 可支持的结论 |
| --- | --- | --- |
| 请求量与轮次 | 共 328 条；请求开始集中在 `03:00:13` 和 `03:00:35` 两个时刻，各 164 条，两轮间隔约 22 秒 | 与用户描述的两次刷新、每次检查一组 164 张图片一致；HAR 自身没有点击事件标记，轮次归因结合用户提供的操作上下文 |
| 请求目标 | 两轮每轮 164 条、88 个不同的精确 URL；发起类型均为 `script`；Host 为 `storage.googleapis.com` 214 条、`strapi.thunderbit.com` 66 条、`thunderbit.com` 48 条（合计两轮） | Ahrefs 确实重新请求图片资源，且重复图片 URL 也按图片行重复发出请求；不是只刷新本地状态显示 |
| 方法与响应 | 全部 GET；全部 HTTP 200；MIME 为 `image/png` 272、`image/svg+xml` 50、`image/jpeg` 4、`image/webp` 2（两轮合计） | 这组请求下载/获取的是图片响应，不是 HEAD 状态探测；本 HAR 未见 429、失败或非 200 |
| 单次响应耗时 | 全部请求平均约 333ms、中位数约 193ms、P95 约 1.04s、最长约 1.785s；两轮统计相近 | 单请求普遍较快；164 条请求在 HAR 的秒级时间戳上各自集中启动，符合批量并发发起的表现。因 HAR 时间戳精度为秒，不能精确反推出并发数或轮次端到端完成时间 |
| 下载量 | 两轮 `_transferSize` 合计约 11.94 MB，平均约 36.4 KB/请求 | 证实这不是无响应体的纯状态探测；按图片行重发会产生实际传输成本 |

因此，之前“竞品是否重请求未知”的结论已由这份 HAR 更新为：**竞品刷新确实会重新发起图片 GET；至少这个 Thunderbit 页面样本中，两次各请求 164 次，且已显示状态仍由界面保留。** 这解释了“状态保持”并不代表跳过网络请求。与本方代码对照，当前本方同 URL 会合并为一次请求，并采用串行小批次、2 并发和 250ms 间隔；Ahrefs 样本是 164 条脚本 GET 集中启动，HAR 计时显示单请求耗时通常不到半秒。HAR 有力支持本方节流/批次策略是刷新慢的代码级候选原因，但不能单凭这一份抓包确定 Ahrefs 的实现机制或证明所有网站都如此。

证据边界：HAR 只覆盖 Thunderbit 此页面和这次抓取时段；服务器的缓存头、实际网络缓存命中情况、扩展侧调度算法、两个窗口对应的完整 UI 事件，以及其它页面/429 情况均不在现有结论内。该证据可用于 Phase 3 制定最小性能修复方案，但尚未授权或执行修改。

### 图片模块打开但未点 Status 刷新的 HAR（用户提供，2026-11-16）

两份 HAR 均请求 `sg.aipassportphoto.com`，但采集时间相差约 87 秒，并非同时采集。按已核对的扩展 ID：`bpefilmcgplgmfnbllbkcmggebcploim` 是 SEO Copilot 解压版，`hgmoccdbjhknikckedaaebbpdeebhiei` 是 Ahrefs。上一版曾将两份 HAR 的产品归属写反，以下为更正后的记录。

| 扩展 | HAR 请求 | 图片请求 | 状态与响应时间 | 调用来源 |
| --- | ---: | ---: | --- | --- |
| Ahrefs（`hgmoccdbjhknikckedaaebbpdeebhiei1119.har`） | 17 | 16 | 图片 7×304、9×200；HAR 中单条为 0–100ms。另有 `robots.txt` 1×200、66ms | 16 张图片的 initiator stack 来自 Ahrefs 扩展 `popup.js`；`robots.txt` 由扩展 `event.js` 发起 |
| SEO Copilot（`bpefilmcgplgmfnbllbkcmggebcploim.har`） | 2 | 2 | 两条均 304；349ms、424ms | resource type=`image`，initiator=`script`；URL 为 `logo.svg`、`passport-photo-demo.webp` |

本方源代码 `PopupToolViews.tsx` 的 `ImageThumbnail` 在缩略图进入 `.inspector-tool-panel` 视口或 64px 扩展范围时，将图片 URL 放入 `<img src>`，浏览器随后获取图片文件。解压版 HAR 在该采样下记录到两条图片资源请求，Ahrefs HAR 记录到 16 条；这与“Ahrefs 本次加载的缩略图请求较多、本方较少”一致。请求采集时间相差约 87 秒，缺少同步的视口和滚动位置，因此不能推断所有页面上的固定请求数，也不能只凭数量比较完整弹窗加载耗时。这些图片请求与点击 Status 后的 HTTP 状态检查不同。

结合上一份刷新 HAR，可以把两类流量分开：Ahrefs 未刷新采样记录 16 张图片资源请求；刷新采样额外发起每轮 164 条图片 GET。SEO Copilot 未刷新采样记录 2 条缩略图请求；点击 Status 后则由 `checkImageUrls` 发起状态请求，受批次与并发节流控制。这是两个独立请求路径。

### Indexability 菜单记忆与网络请求（用户截图 + HAR + 本方代码核查）

用户现场观察 Ahrefs 会记住上次关闭时选中的模块，下次打开默认回到该模块。该行为是用户提供的竞品 UI 观察；本 HAR 不能证明其偏好保存方式。

Ahrefs 文件 `hgmoccdbjhknikckedaaebbpdeebhieiindex.har` 记录 2 条由 Ahrefs `event.js` 发起的 Fetch：同源 `robots.txt` GET→200（156ms）和 `sitemap.xml` GET→304（142ms）。这确认 Indexability 查看期间 Ahrefs 发起了 robots 与 sitemap 请求；HAR 中没有页面 HTML 的请求。

本方代码核查：

- `PopupApp.tsx` 将模块状态初始化为 `useState<PopupTool>('content')`，切换模块仅调用 `setTool`，没有保存到 `chrome.storage`、`localStorage` 或 `sessionStorage` 的逻辑。因此本方每次重新打开 Popup 都回到 Content；这是与用户观察到的 Ahrefs 行为的已确认差异。
- 进入 Indexability 后，`PopupToolViews.tsx` 的 effect 调用 `chrome.scripting.executeScript(... inspectIndexability)`。该函数对当前页面 URL、`/robots.txt`、`/sitemap.xml` 发起三路并行 GET（同源、`cache: 'force-cache'`，最多等待 5 秒）。因此代码路径预期会产生请求；页面内容更新由注入结果驱动。
- 用户截图里的 DevTools 正在检查 `chrome-extension://bpefil.../index.html`（SEO Copilot 的 Popup 页面），Network 面板为空。注入函数中的网络请求发生在被检查的网页 Tab 上，不属于 Popup DevTools 的网络目标，所以这个空列表不能证明切换 Indexability 时没有请求。截图中的 Robots.txt URL、Raw HTML canonical 和 Sitemap `Not found` 已显示探测结果，亦与探测完成相符。要直接看到本方这三路请求，Network 应录制目标网页 Tab，而不是 Popup 的 DevTools。

本项可定论：竞品 HAR 确认 robots/sitemap 请求；本方代码也会在切入 Indexability 时请求当前页、robots 和 sitemap。用户在 Popup DevTools 看不到请求属于观测目标不匹配，并非当前证据显示本方没有请求。菜单记忆差异则是代码明确缺少持久化，与竞品观察不一致；仍按 Phase 2 记录，不在此阶段修改。

## 已取得的浏览器对比与待确认项

浏览器安全策略拒绝自动化直接访问本地扩展弹窗；未使用其它入口绕过。用户随后提供了 2026-11-16 同页对比截图、刷新后的 6 份图片 CSV 和 Ahrefs 图片请求 HAR，因此图片清单差异、Status 请求行为和多个模块的可见输出已能核对，不再把“没有自动化读取本地 Popup”当作所有对比的阻塞项。Backlinko 真实页面截图显示前两个标题为 H3，随后为 H2、H1；两端都显示首个标题非 H1 提示。另一个 Fixture 单独使用 H2→H1 序列验证 `HEADING_004`。旧现场 DOM 记录的顺序与本次截图不同，不将它们视为同一采样。Ahrefs JSON-LD 顶层项另有截图记录。

仍未完全闭环的对比：

1. Google 富媒体测试页截图中 Ahrefs Word count 为 85、SEO Copilot 为 111；DOM `innerText` 按本方规则也得 111。截图的采样时点/动态页面内容与双方正文范围尚未严格同步，已确认数值差异，但不能区分动态内容与计数口径差异。
2. Backlinko 用户截图中的 Ahrefs Word count 为 720、本方为 694；两侧截图不是自动同步采集，动态内容及采样时点可能影响字数。用户已明确“字数统计先这样”，因此只记录差异，暂停继续追查根因。真实页面截图显示前两个标题为 H3，随后为 H2、H1；两端都有首个标题非 H1 提示。该序列与 `heading-order` Fixture 的 H2→H1 序列分开记录。Title/Description 计数两侧一致。另一个可见覆盖差异是 Ahrefs 展示 Dates（Published Missing、Modified 2026/11/11 04:15），本方 Content 模块没有 Dates 区块。
3. CMLabs 当前同页复测已完成：两侧都识别 `noindex,nofollow`，Canonical 和 hreflang 的 URL 值一致；Ahrefs 将 Rendered Canonical 标为 `Non-canonical`、Raw 标为 `Self-canonical`，本方 Rendered 只显示 `Found`、Raw 显示 `Self-canonical`。Sitemap 的结果仍不同：Ahrefs 显示 sitemap URL，本方显示 `Not found`。目前已确认差异存在，但尚未定位是哪一层采集/状态映射导致。
4. 最新 Similarweb 本方 CSV 有 76 行空 Status 但无 429；Thunderbit 有 1 个 429 和 27 行空 Status。用户刷新截图确认 UI 出现 429 提示、进度显示 146/165，并写明该图片服务器的剩余图片未检查；所附 HAR 记录的是扩展 Popup 页面，只含 6 条缩略图 `<img>` 资源请求，不含 Status 检查请求。基于 UI 明示结果，记录为“触发 429 后同一图片服务器的剩余项被跳过”；具体 URL 与每条空 Status 的请求映射无法由现有材料核验，且用户无法从当前 Network 记录中看到这些请求，本项以证据限制收尾，不继续要求用户补抓包。

### SEO Copilot 图片 Status 刷新 HAR（2026-11-16 15:07）

文件：`C:/Users/Administrator/Downloads/bpefilmcgplgmfnbllbkcmggebcploim1507.har`。HAR `pages[].title` 是 `chrome-extension://bpefilmcgplgmfnbllbkcmggebcploim/index.html`，共 6 条网络记录，均为图片缩略图 GET 且状态 200：Google Cloud Storage 的 Chrome Web Store 图标，以及 Thunderbit 页面上的 Capterra/G2 评价徽标（其中 `g2-wordmark.svg` 请求了两次）。请求发起栈属于扩展 UI 中的图片元素加载。

同批截图可见 Images 状态刷新进度 `146 of 165`，提示 `An image server limited requests (429). Remaining images on that server were not checked. Try again later.` 这证明刷新 UI 已收到某个图片服务器的 429 并报告同源余项未检查；但该 HAR 本身没有对应图片 URL 的状态检查请求，也没有 429 响应，不能用它确认触发限流的 URL、时间、请求轮次或哪些导出空值由 429 导致。由于 DevTools Network 的记录目标是扩展 `index.html`，而不是 Thunderbit 目标网页，本次 HAR 未捕获 Status 刷新请求。

证据边界：当前 HAR 不能核对具体状态检查请求。虽然从工具角度可以尝试在目标网页 DevTools 另行捕获，但用户已说明看不到这些请求且无法逐条核对；因此本轮不再将补抓 HAR 作为 Phase 2 退出条件，也不把空 Status 的 URL 级原因写成已证实事实。

### Ahrefs `popup.js` / `popup.css` 静态检查：Word count

用户提供文件：`C:/Users/Administrator/Downloads/popup.js`（561,679 bytes）与 `popup.css`（79,618 bytes）。未执行该扩展代码，只做字符串与附近 bundle 代码的只读检查。

- `popup.js` 的 Content 组件从 `pageContent` 读取内容；Word count 标签由 `word_count` 本地化字符串提供，展示值使用收到的 `a[0]` 并经 `intFormatWithCommas` 格式化，再附上 `words` 文案。
- 文件中未发现 `countWords`、`wordCount` 或与页面正文相连的计数函数。bundle 中的 `innerText` 命中位于 React/contenteditable 输入处理，不是页面字数统计；`textContent` 命中也主要属于框架或复制 Heading 文本的显示代码。
- 因而，提供的 Popup JS/CSS 只能证明“字数以预计算数字传到弹窗后展示”，不能证明 Ahrefs 用了 `innerText`、`textContent`、可见节点遍历、词元化服务或特定过滤规则。实际计数实现很可能在未提供的 content/background worker 或另一条数据管线中；这是根据数据流位置作的推断。
- 本方 `scanner.ts` 则明确从 `document.body.innerText` 取可见正文、归一空白并截断至 500,000 字符；随后将中日韩文字字符逐个计数，并将其它 Unicode 字母/数字连续片段计为一个词。该算法与本方代码事实一致，但现有竞品 Popup 文件不足以判断 Ahrefs 是否使用同一规则。

结论：**可以复刻弹窗的字数展示形态，不能据这两个文件复刻或确认 Ahrefs 的计数逻辑。** Google 测试页 Ahrefs 85、本方 111 以及 Backlinko 720/694 的差异原因仍未闭环。若需要继续静态追查，应取得竞品 content script / tab worker 与相关消息处理代码；若目标是行为拟合，则需用固定页面/Fixture 按可见文本、隐藏容器、导航、iframe、CJK、标点、SVG 文本等变量逐项对照输出，而不能把推测写成竞品事实。

### Backlinko 首个标题非 H1 提示：本方实现核查

本方源码包含两个显示分支：“The first heading is not H1”用于有 H1 但首个 Heading 非 H1；“No H1 heading found.”用于没有 H1 但存在其他标题。`HEADING_004` 仅在至少一个 H1 存在且首个 Heading 非 H1 时触发。Fixture 验证 H2→H1 会生成 `HEADING_004`。Backlinko 两张截图显示前两个标题为 H3，随后为 H2、H1，且两端都显示相同提示；这证明两端当前可见输出一致，但不能证明真实页面输入等于 Fixture 的 H2→H1 序列。

## 遗留问题与下一阶段边界

- 当前已确认本方 Fixture 行为、2026-11-16 三页图片 CSV 各多出一条 Bing tracking pixel、Ahrefs 图片刷新会重新发出 GET 并保留界面状态，以及本方模块选择未持久化。竞品通用过滤条件、字数算法和 badge 聚合算法仍无充分证据。
- noindex 在本方 Fixture 不生成 Audit Issue，符合 1.4.0 计划明确的产品范围，不是规则缺陷或 Phase 3 修复候选。
- Phase 2 **完成（带证据限制）**：测试网站矩阵和 HTML Fixture 已建立并运行；用户提供的同页截图、CSV 和 HAR 已用于对比，已记录图片清单差异、Ahrefs 刷新请求行为、Backlinko 标题提示与 CMLabs 对比。图片截图显示本方收到 429 并提示同服务器余项未检查；HAR 目标为扩展 Popup，故无法映射具体请求和每条空状态，用户无法核对该映射，本轮将其作为遗留证据限制收尾，不阻塞 Phase 2 完成。字数差异按用户要求暂缓。另记录 Ahrefs 有 Dates 区块而本方没有；Google 富媒体测试页 Ahrefs 有 Social tags badge=1 而本方无 badge（本方该模块当前尚未采集），作为覆盖/产品范围差异。CMLabs 的 Canonical 分类和 Sitemap 结果仍有已证实差异，但根因未知。不得据未确认差异进入规则修复。
