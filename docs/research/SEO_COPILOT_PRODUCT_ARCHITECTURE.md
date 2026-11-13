# SEO Copilot 产品能力架构与竞品功能规划

**评估日期：**2026-11-11
**状态：**待审核的产品规划；本轮仅修订本文档
**证据：**[19 款竞品与 ASO 原始研究档案](SEO_COMPETITOR_RESEARCH_2026-11.md)、用户提供的 Ahrefs SEO Toolbar 截图观察和产品决策、当前工作区源码。未重新搜索或实测竞品，也未重复核查已有明确证据的代码。原始研究档案保持不变。工作区有未提交修改，下述“当前”指本轮读取到的工作区状态，不等于已发布商店版本；`public/manifest.json` 标为 1.3.1，而 [PRODUCT_FACTS.md](../../PRODUCT_FACTS.md) 仍写 1.2.0 Alpha，发布口径须另行核实。

## Executive Summary

最终方向为 **Quick Metadata + Full SEO Audit + Page Analysis Tools + AI SEO Fix**。Popup 快速读取 Metadata、Side Panel 完整审计及 Popup 的 **Open SEO Audit → 自动首次扫描**已在当前工作区实现；Page Analysis Tools 仍以规划为主。完整基础 SEO 扫描与基础页面工具保持免费，AI Fix 以有限免费试用和未来 Pro 额度为商业化方向。本文件保留 2026 年 11 月历史竞品研究的证据边界，不以商店排名或用户数推断功能会带来增长。

优先级已按本轮决策重排：**P0 架构与四类分类映射；P1-A 审计类别与内容；P1-B Schema；P1-C Images；P2 其他数据采集与待评估能力；P3 高权限、高请求或高复杂度能力。**这些是规划顺序，不是全部批准开发。P1-B 的 Schema 详情需要范围受控的扫描器补采，不应误称为纯 UI 工作。

## 19 款竞品研究与历史市场证据

### 来源、四类定位与差异化

[原始研究档案](SEO_COMPETITOR_RESEARCH_2026-11.md)的快照日期为 **2026-11-10**，归档的是此前对话中的商店宣传、截图转述、第三方排名及后台数字；并非本轮安装实测。19 款按主要意图分为 **Title / Meta 专项、综合 SEO、社交预览、复制与导出**；SEO Keyword Extractor 属于单列的**相邻需求**，不应硬归为上述四类中的产品能力承诺。多类产品可能交叉。历史用户数/评分没有统一采集时刻，未记录的格子保持未记录。

| 类型 | 历史研究揭示的用户任务 | 对当前方向的约束 |
|---|---|---|
| Title / Meta 专项 | 低步骤读取原文、字符数、复制 | Quick Metadata 应直接完成读取任务 |
| 综合 SEO | 看评分、问题、解释与建议 | Side Panel 保持可执行的完整审计，而非只堆检查项 |
| 社交预览 | 预览分享卡片 | 独立意图，近期不因竞品存在就复制 |
| 复制与导出 | 将页面数据带到工作流中 | 优先小范围复制/CSV，避免大规模导出承诺 |
| 相邻需求：关键词提取 | 提取关键词或密度 | 不进入当前核心定位 |

### 19 款名单、官方链接与历史规模

下表“历史用户/评分”按原档案逐项保留，是当时对话记录的商店展示值或约数，**不是 2026-11-11 当前值**；名称及功能也未经本轮复核。`百万级` 只是原稿笼统说法。功能细目及证据矩阵紧随其后。

| # | 历史研究分类 | 竞品与官方链接 | 历史用户 | 评分/评价数 |
|---:|---|---|---:|---:|
| 1 | Title / Meta 专项 | [Meta Title & Description Checker](https://chromewebstore.google.com/detail/ammogonjgjnnijonikkannkhdbjgahfo) | 152 | 1 |
| 2 | Title / Meta 专项 | [Title Tag & Meta Description Length Checker](https://chromewebstore.google.com/detail/iojnimjpcjafibinpihnpgkbaffpkhki) | 47 | 0 |
| 3 | Title / Meta 专项 | [Page Meta Checker](https://chromewebstore.google.com/detail/okldgfkjgbikmklgfepadaepenmidfeo) | 2 | 0 |
| 4 | Title / Meta 专项 | [Meta Tag Analyzer](https://chromewebstore.google.com/detail/hdkkhhoelnbnoljknkcnniakpgljojhi) | 3,000 | 0 |
| 5 | 相邻需求 | [SEO Keyword Extractor](https://chromewebstore.google.com/detail/kbldlmjcoelkdnjaiegddeinclgnmbmo) | 1,000 | 1 |
| 6 | 综合 SEO | [SEO Checker Pro – VSUDO](https://chromewebstore.google.com/detail/gedlmoffaoldkaepglmbpjjcbfkjadoh) | 22 | 1 |
| 7 | 综合 SEO | [SEO Meta Tags Analyzer – SEO Checker Pro](https://chromewebstore.google.com/detail/fpmonichemgmfodehndmehkkkdjaaadj) | 153 | 9 |
| 8 | Title / Meta 专项 | [SEO Meta Checker](https://chromewebstore.google.com/detail/iaiemnlapofidbgfphpmfmdahbidaihf) | 84 | 1 |
| 9 | 综合 SEO | [SEO Meta Tags – On Page Checker](https://chromewebstore.google.com/detail/haokbiapnfpfkhmpipbabhkcgjkjkaol) | 未记录 | 未记录 |
| 10 | 综合 SEO | [Meta Explorer](https://chromewebstore.google.com/detail/dggmapjanngfjjakfgeoegfmgpmcamfh) | 10,000 | 48 |
| 11 | 综合 SEO | [AIO SEO Checker](https://chromewebstore.google.com/detail/ndldmmbhemfoepokpdlkfcmakgeefcdp) | 未记录 | 未记录 |
| 12 | Title / Meta 专项 | [1 Click SEO Meta Tags Analyzer](https://chromewebstore.google.com/detail/lpooclffajlbhjdeejhmbnaojfkojfhk) | 未记录 | 未记录 |
| 13 | 综合 SEO | [Meta Tags Pro](https://chromewebstore.google.com/detail/miihmfdpfdioogfbfofbnagblnjbjomg) | 未记录 | 未记录 |
| 14 | 社交预览 | [SEO Meta Tags & OG Previewer](https://chromewebstore.google.com/detail/mekjdhoenipabelfjjhgmoccjpllinkk) | 未记录 | 未记录 |
| 15 | 社交预览 | [Link Preview & SEO Meta Tags Checker](https://chromewebstore.google.com/detail/joppngopkbognhkobhopdambdnlgchhl) | 未记录 | 未记录 |
| 16 | 社交预览 | [MetaScout](https://chromewebstore.google.com/detail/begklbialleoecpfihedecgihlnghnio) | 未记录 | 未记录 |
| 17 | 复制与导出 | [SEO META 1 COPY](https://chromewebstore.google.com/detail/eblbmdomppeajmpblgeppodbkfnonppc) | 10,000 | 4 |
| 18 | 综合 SEO | [SEOquake](https://chromewebstore.google.com/detail/akdgnmcogleenhbclghghlkkdndkjdjc) | 百万级（笼统说法） | 未记录 |
| 19 | 综合 SEO | [SEO META in 1 CLICK](https://chromewebstore.google.com/detail/bjogjfinolnhfhkbipphpdlldadpnmhc) | 百万级（笼统说法） | 未记录 |

**证据等级：**`O`＝历史对话中的商店截图观察转述；`S`＝历史商店宣传/功能摘要；`U`＝没有足够逐项证据。`O/S` 都不等于安装实测。下表保留原档案的功能矩阵；`诊断`可能只是基础检查，`AI 搜索相关`不等于生成式 AI，产品名中的“1 CLICK”不能推断复制能力。详细限制及每行解释见[原档案附录 A](SEO_COMPETITOR_RESEARCH_2026-11.md#附录-a-19-款竞品功能与证据矩阵)。

| # | Title/Desc | 长度 | 复制 | URL | 诊断/Score | AI | OG/社交 | 导出 | 证据边界 |
|---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|---|
| 1 | O | O | O | O | U | U | U | U | 同一 Popup 截图转述；长度提示的范围仅有 S |
| 2 | S | S | U | U | U | U | U | U | 仅历史摘要 |
| 3 | S | U | S | S | U | U | U | U | 仅历史摘要 |
| 4 | S | U | U | U | S（基础） | U | U | U | 未见逐项检查 |
| 5 | U | U | U | U | U | U | U | U | 只记录关键词提取定位 |
| 6 | U | U | U | U | S（多项） | U | U | U | 无检查细目 |
| 7 | S | U | U | U | S（Score/Schema） | U | U | U | 宽泛摘要 |
| 8 | S | U | U | U | S（基础） | U | U | U | 细目未知 |
| 9 | U | U | U | U | S（页面基础） | U | U | U | 细目未知 |
| 10 | S | U | U | U | S（问题） | U | S | S（问题） | SPA/导出格式未核 |
| 11 | U | U | U | U | S（综合） | U | U | U | AI 搜索定位不等于 AI 生成 |
| 12 | S | U | U | U | U | U | U | U | 仅一键读取摘要 |
| 13 | S | U | U | U | S（较广） | U | U | U | 无逐项证据 |
| 14 | S | U | U | U | U | U | S | U | OG 预览定位 |
| 15 | S | U | U | U | U | U | S | U | 分享卡片定位 |
| 16 | S | U | U | U | U | U | S | U | Meta/社交预览定位 |
| 17 | S | U | S | U | U | U | U | S（Markdown/制表符） | 侧栏与导出仅摘要 |
| 18 | U | U | U | U | S（综合） | U | U | U | 历史规模不精确 |
| 19 | S | S | U | U | S（其他信息） | U | U | U | 产品名不证明复制 |

### 历史 ASO 排名与商店指标

以下均为原档案截至 **2026-11-10** 整理的历史快照，未在本轮复查。Extension Ranker 为英文默认搜索的第三方单次结果，地区/时点/排序变量未统一；Chrome Web Store 后台指标口径与截图未完整存档。不能用 GSC 网页搜索量替代 CWS 搜索，也不能把数字拼接为转化漏斗。

| 来源与指标 | 历史记录 | 限制 |
|---|---:|---|
| Extension Ranker：`meta description checker` | Page Meta Checker #12（历史用户约 2）；SEO Meta Checker by BatchPro #17（约 4）；Meta Tag & SEO Checker #20（约 8）；**SEO Copilot #21（约 9）** | 后两名称只出现于排名样本；不得与 19 款名单中的同名项自动合并。用户量和排名测量时刻未校准，非当前值 |
| Extension Ranker：`seo title checker` | SEO Copilot #27 | 未留独立结果页 |
| Extension Ranker：`title tag checker` | SEO Copilot 前 30 以外 | 未留独立结果页 |
| CWS 后台近 30 天总展示 | 约 356 | 历史口径待复核 |
| CWS 后台近 30 天详情页浏览 | 约 66 | 不与安装直接算转化率 |
| CWS 后台近 30 天安装 | 约 293 | 统计窗口与归因待复核 |
| CWS 每周用户 | 约 6 | 与近 30 天不同口径 |

历史记录的商店标题是 **SEO Copilot – Title & Meta Description Checker**。小用户量竞品排在 SEO Copilot 之前只能说明安装量不足以单独解释当次排序；不能反推排序算法，也不能证明扩充功能会提升排名。产品与 ASO 应分别验证。

### Quick Metadata 的研究依据与决策演进

原档案的第 1 款 Meta Title & Description Checker **历史 CWS 截图转述**显示：同一 Popup 可见 Title、Description、URL、字符数和复制按钮；原图未随档案保存，按钮状态与性能未实测。多款 Title/Meta 专项工具的商店摘要也强调快速读取。此前因此提出 **Side Panel 内 Quick Metadata Overview 卡片**作为候选，与独立 Quick View、保持原状并列比较，彼时仅批准只读技术评估，**不是已上线结论**。

后续 Chrome 权限评估发现：长期开启 Side Panel 后跨域切换会增加获取页面访问权的摩擦。进一步设计和真实浏览器测试后，当前工作区采用 **Popup 快速读取 Metadata + Side Panel 完整 SEO Audit**。Popup 的 **Open SEO Audit** 会打开侧栏并自动执行该页首次扫描；之后 Rescan 针对当前页，跨域按实际权限请求授权。双入口**已实现，不再列为待开发**。这一演进解决了快速读取与深入诊断的不同任务，但“改善安装、留存或 CWS 排名”仍是未经用户数据证实的假设。

## 产品定位、三层架构与权益边界

**定位：Quick Metadata + Full SEO Audit + Page Analysis Tools + AI SEO Fix。**核心使用路径为快速读取当前页事实 → 本地审计并定位问题 → 查看原始页面数据 → 用户主动请求 AI 文案建议、复制后自行修改并重扫。只分析可访问的当前页面，不承诺全站爬取、排名监控或自动修改网站。

| 层级 | 用户任务 | 当前状态 | 拟定权益 |
|---|---|---|---|
| 1. Quick Metadata | 即时看和复制 Title、Meta Description、URL | **已实现于 Popup**；标题/描述有长度提示 | 免费 |
| 2. Full SEO Audit | 评分、问题、Recommended Actions、重扫；通过 Page Analysis Tools 进一步检查页面原始数据 | **审计已实现**；大部分工具栏目**待开发** | 完整基础 SEO 检查、问题列表、建议行动与基础页面工具免费 |
| 3. AI SEO Fix | 针对支持的问题生成、选择并复制候选文案 | **Title/Meta 部分问题有真实后端接入**；Pro 未实现 | 有限免费试用与 Pro 额度仍属产品规划 |

**Free / Pro 决策：**不把现有基础审计、Audit Categories、单页基础工具、复制标题或图片/链接 CSV 放入付费墙。Pro 的候选价值是更高 AI 额度、批量工作流、历史记录、客户/PDF 报告等，均须单独验证成本与需求；账号、支付、许可证、权益校验及正式价格**未实现、未定稿**。早期 [商业路线图](../05_BUSINESS_ROADMAP.md) 中“限制免费扫描次数”、`$9/月`、PDF/批量收费是历史设想，不能当作本轮已确认权益或对外价格。AI 调用须在用户主动点击后发生；基础扫描本地执行。

## 当前真实功能状态与扫描数据

| 能力 | 当前结论与边界 | 主要证据 |
|---|---|---|
| Popup Quick Metadata | **已实现**读取 Title、Description、URL，显示字符数/长度状态，逐项复制；页面无权限时可请求站点访问；Open SEO Audit 打开 Side Panel 并传递当前页审计意图 | `src/popup/quickMetadata.ts`、`PopupApp.tsx`、`src/components/QuickMetadataCard.tsx` |
| Side Panel Audit | **已实现**主动 Scan；从 Popup 进入时自动执行首次扫描；0–100 评分、等级、严重度计数、问题及 Recommended Action、当前页 Rescan；每 Tab 状态在内存隔离，跨域按需授权。报告尚无页面工具导航或四类问题定位 | `src/popup/App.tsx`、`src/report/Report.tsx`、`src/components/IssueList.tsx`、`ScoreCard.tsx`、`src/popup/perTabScanState.ts` |
| 审计规则 | **已实现**Title 4、Meta 3、Heading 3、Images 3、URL 2、Technical 3、Content 2，共 20 条规则；问题带 category/severity/impact，类别分数已有计算但 UI 未逐类展示。IssueList 按规则产生顺序呈现，没有类别导航 | `src/rules/seoRules.ts`、`src/types/seo.ts`、`src/scoring/score.ts`、`src/components/IssueList.tsx` |
| 页面扫描数据 | **已采集** URL、document.title、title 标签数、Description、H1–H3 文本及顺序、最多 1000 张图片的 URL/alt/自然与渲染尺寸/可审计标记/Performance transfer size、canonical、JSON-LD 顶层类型及解析失败数、可见文本字数、文本密度估计、页面 `lang`。**未采集**链接、发布/修改日期、robots/hreflang、HTTP 响应头或原始 HTML | `src/types/seo.ts`、`src/analyzer/scanner.ts`、`pageAnalyzer.ts` |
| AI Fix | **已实现** TITLE_001–003 与 META_001–003 的入口、真实后端调用、生成结果复制、限流/日额错误；H1 不在当前问题卡片的可用入口内。生产默认 real provider，开发默认 mock；没有 Pro 计费。用户需自行改页面 | `src/utils/aiFix.ts`、`src/components/IssueList.tsx`、`AiFixPanel.tsx`、`src/services/aiProvider.ts`、`generateSeoFix.real.ts` |
| Welcome 与官网 | **产品决策：**不自动打开 Welcome。**当前代码状态：**本轮未重新核查 `onInstalled` 是否已经关闭自动打开逻辑，待核实；此前文档记录过自动打开，不能沿用为当前事实。`welcome.html` 文件暂时保留。官网有 Support 与现有指南内容；独立 `/guide/` 路由仍属规划 | `src/background/background.ts`、`welcome.html`、`website/src/app/(site)/support/page.tsx`、`website/src/lib/localized-guides.ts` |

扫描使用 live DOM：Title、Heading、Canonical、JSON-LD 等是执行时页面状态，不能称为服务器返回的 Raw 值。字数来自移除脚本、样式、模板和显式隐藏节点后的正文副本，最多取 500,000 字符；CJK 字符按字符计，其余按词匹配，因此是产品定义的估算。图片总数最多采集 1000 张；`auditable` 旨在降低隐藏图、1×1 图等噪声，`naturalWidth=0` 不能单独证明 HTTP 404。Performance transfer size 为 0 也可能是跨域资源计时限制或缓存，并非文件真的为零字节。

## Ahrefs 截图观察与页面工具候选

以下是**用户提供的截图/讨论候选**，不是本轮重新安装验证的 Ahrefs 现况，也不是 SEO Copilot 已上线承诺。

| 竞品栏目 | 截图/讨论中的功能 | 本产品当前对应 |
|---|---|---|
| Content | Title、Meta Description、Word Count、H1/H2/H3、Copy Headings、Published Date、Modified Date、Raw / Rendered Inspect | 前六项的**数据已部分具备**：Title/Meta 已在 Popup 展示，word count/headings 在扫描结果但无工具视图；Copy Headings 待 UI；日期和 Raw/Rendered 待扩展 |
| Indexability | Canonical URL、Raw/Rendered Canonical、robots.txt、Robots Meta Tag、X-Robots-Tag HTTP、Sitemap、Hreflang | 只采集 rendered DOM canonical 并有“缺失”规则；其余待开发 |
| Structured Data | JSON-LD Detection、Schema Type、Schema Details、Google Rich Results Test、Schema Markup Validator | 类型及解析失败数已采集/用于规则；详情和外部验证入口待开发 |
| Images | Count、Alt All/Not empty/Empty、Status All/OK/Broken、Refresh、Thumbnail、URL、Alt、Dimensions、Export CSV | 数量及 URL/alt/尺寸已采集；筛选/明细 UI/导出待开发；真实状态检测需要新请求或额外证据 |
| Outgoing Links | Count、All/Dofollow/Nofollow、UGC/Sponsored、Internal/External、Search、Check Status、Highlight、Export | 当前扫描器**没有链接数据**；全栏目待开发 |
| Help / Tutorial | How to use、Getting Started、Quick Metadata、SEO Audit、Content、Indexability、Structured Data、Images、Outgoing Links、AI SEO Fix | 入口与分主题教程待规划，只介绍已上线且经过验证的能力 |

**其他可见入口：**Metrics、Social Tags、HTTP Headers、Saved URLs、User Agent、Metrics Bar、Search Tools、Settings、Help / How to use、Suggest a feature。材料只支持“截图可见入口”这一观察；没有内部截图或操作实测的模块，不推断字段、计算方式或完整功能。Social Tags 可作为 P2 采集研究；HTTP Headers、Metrics Bar、User Agent 的复杂能力列入 P3；其余入口先作信息架构参考，不自动变成开发任务。

## 四大 SEO Audit Categories 与工具信息架构

**Audit Categories 是问题统计和定位；Page Analysis Tools 用来查看、复制、筛选、验证和导出原始页面数据。**同一类别可有 0 个问题但仍可在工具中查看正常值。展示层统一使用下列**四类**，底层七个 Rule Category 保持 `title/meta/heading/images/url/technical/content`。**第一版只从实际 `issues` 聚合四类问题数量并定位问题；不增加四类独立评分，不修改现有 SEO Score、评分权重、扣分规则或 `categoryScores`。**“0 个 Issue”不代表该类没有页面数据。

| 展示类别 | 底层 Rule Category | 统计与定位范围 |
|---|---|---|
| Content SEO | `title`、`meta`、`content` | Title、Description、可见内容问题 |
| Page Structure | `heading` | H1 缺失/多个、层级跳跃 |
| Technical SEO | `url`、`technical` | URL、canonical、Schema；当前没有 robots/hreflang 规则 |
| Images | `images` | Alt 缺失/覆盖率、图片性能提示 |

**导航方案，待可用性验证：**Popup 使用 400px 布局；Side Panel 的 `.sidepanel-page .extension` 已改为宽度 100%，随面板宽度伸缩（`src/styles.css`）。窄侧栏仍需验证紧凑布局。先保留 Score + Issues 的 Overview，放四类问题定位；以折叠工具入口或单层分段切换进入 Content、Indexability、Structured Data、Images。AI Fix 继续附着于问题卡片；不预先冻结七个顶部 Tab。验证长 URL、图片明细、返回 Overview、重扫后的视图状态和空态，再确定最终导航。Outgoing Links 待数据采集验证后再进入正式工具导航。

## Page Analysis Tools 与实现依赖

| 功能 | 可复用现有数据与最小实现 | 新采集/请求/权限及风险 |
|---|---|---|
| Word Count、H1–H3、Copy Headings | `result.page.wordCount`、`headings[]` 可直接展示；Copy Headings 按 DOM 顺序拼接并加层级前缀，经点击写入剪贴板；无新扫描请求 | 仅 UI/交互；明确空标题、重复标题、换行格式。当前只采 H1–H3 |
| Structured Data 类型与详情 | 类型已在 `schemas[]`；检测数量/解析错误可直接展示 | 详情须在扫描器中保留经限长的 JSON-LD 对象或文本、脚本位置和解析错误信息；处理 `@graph`、数组、多脚本、巨大/敏感 JSON、克隆对象开销，不能把“可解析”写成“符合富结果要求” |
| 外部 Schema 验证 | 用 `result.page.url` 构造官方工具入口，用户明确点击时打开新标签页 | 使用固定 HTTPS 官方 origin，`new URL()` 与 `searchParams.set()` 编码 URL、校验 `http/https`、`noopener`/`noreferrer`；不要拼接 HTML/脚本或允许页面提供外部域名。URL 可能含 token/query，先提示会向第三方提供当前地址，允许先复制或手动粘贴；不自动请求第三方。具体工具是否接受 URL 参数与参数名须实施前核对，若无可靠深链则只打开官方主页并复制 URL |
| Images 明细、Alt 筛选、独立 Refresh、CSV | 当前 1000 张上限内的 `src/alt/naturalWidth/naturalHeight/renderedWidth/renderedHeight/auditable` 可展示/过滤/导出；**独立 Images Refresh 尚未实现**，可复用已有主动扫描管线，但需设计图片视图局部刷新语义 | Thumbnail 可能触发图片加载、跨域防盗链或泄露浏览 URL 到资源方；优先用已有 URL 与按需加载。CSV 做规范转义、UTF-8 BOM 兼容、公式注入防护，标明扫描时间与截断上限；`alt=null` 与 `alt=""` 区分（属性缺失 vs 空值），筛选命名需明确。状态 OK/Broken 不可从尺寸推断 |
| Canonical / Indexability | rendered canonical 可直接展示 | robots meta、hreflang 和日期需扩展 DOM 扫描；robots.txt、sitemap、X-Robots-Tag、HTTP 状态/头需网络请求或浏览器网络接口。相同站点 origin 可在既有可选站点权限下评估；跨 origin、重定向目标、外部 CDN/链接可能需额外 host 权限。CORS、认证、反爬、缓存与 SPA 使结果不完整；不能把请求失败等同“不可索引” |
| Outgoing Links | 无现成数组，CSV 也无可复用链接数据 | 扩展扫描器采集 `<a href>`、`rel`、锚文本、DOM 标识；基于解析后的 URL 与当前 origin 分类，记录特殊协议、fragment、重复链接。Highlight 需安全标记当前 DOM、回收标记，避免破坏页面。搜索/过滤/CSV 依赖先有链接数组 |
| Outgoing Links Check Status | 无 | 仅用户主动对可见或选中链接批量检查，先去重并限数量（建议每次最多 20–50 个唯一 URL）、并发 2–4、超时 5–8 秒、全局取消、失败不无界重试；先评估 HEAD，必要时有界 GET fallback。跨域请求可能受 CORS、目标站限制、host permission、登录态与重定向影响；状态标记为“已验证/无法验证/未检查”，不可把无法验证写成 broken。不得扫描时自动请求所有外链 |
| Published / Modified Date | 无 | 采集可信 DOM 线索（如 `article:published_time`、`time[datetime]`、JSON-LD date），区分来源与冲突；不把页面显示日期或 HTTP Last-Modified 直接当文章发布日期 |
| Raw / Rendered HTML 与 Canonical | rendered DOM canonical 已有 | Raw HTML 要另取导航响应正文，可能遭遇认证、个性化、缓存、重定向及 CORS，且重新 fetch 不一定等于原导航响应；准确原始响应可能需 `webRequest`/`debugger` 等高权限或受限 API，复杂度高。Rendered 可读取当前 DOM 序列化，但体积大、可能含敏感值/注入后的脚本，须限长、按需采集、仅本地展示并标时间点；SPA/hydration 会使它与初始 HTML 不同。Raw/Rendered 差异应明确采集时刻，不承诺精确浏览器网络回放 |
| HTTP Headers / Redirect Analysis | 当前无 | 需要响应/跳转链证据，普通页面 DOM 扫描无法回推；浏览器 API/额外请求与权限、跨域和缓存造成准确性问题，另案评估 |
| Social Tags / Social Preview | 当前扫描器无 OG/Twitter 数据 | Social Tags 仅见竞品入口，P2 先评估 DOM 采集；完整分享卡片预览是独立意图，不因入口可见而推断已验证或近期必做 |

**权限判断：**当前 Manifest 有 `activeTab/tabs/scripting/storage/sidePanel`、后端与 Mixpanel 固定 host、HTTP/HTTPS 可选站点 host。复用已扫描数据的 UI、Copy、CSV、打开外部验证页面通常无需新增 Chrome 权限；新增网络检测需要逐项验证可选 host 覆盖与浏览器跨域行为，不能笼统断言“无需权限”。第三方网站、跳转目标和图片状态尤其可能引发权限申请。请求量、隐私说明和 Chrome Web Store 权限解释须随实现同步复核。

## AI Fix 覆盖及商业化

当前真实 AI 范围严格为 Title 缺失/短/长、Meta Description 缺失/短/长；入口依附问题卡片，候选建议可复制，页面不会自动修改。重复 Title、H1、图片 Alt、Schema、内容段落、Canonical、技术问题均**未上线真实 AI Fix**。`aiProvider.ts` 保留 H1 mock 路径用于开发/测试，不可据此宣传 H1 AI 已上线。免费调用的实际后端配额与运营成本应在正式权益方案中核对；前端已能处理 `DAILY_QUOTA_EXCEEDED`、`RATE_LIMITED` 等状态，但这不构成 Pro 购买流程。

当前有 AI Fix 基础调用和后端保护机制；本轮**不重新开发 AI 功能**。四种概念不得混写：

| 概念 | 作用 | 当前状态 |
|---|---|---|
| API Rate Limit | 控制短时间请求频率与滥用 | 前端处理 `RATE_LIMITED`，后端保护机制已有；不等于付费权益 |
| Backend Daily Quota | 控制每日服务成本/调用量 | 前端处理 `DAILY_QUOTA_EXCEEDED`，现有后端额度机制不等于用户试用方案 |
| User Free Trial | 明确用户可用的免费 AI 次数、周期和提示 | **规划中**；尚无正式权益定义 |
| Pro License | 识别付费用户并赋予更高额度 | **未实现**；账号、激活、支付、续费与恢复均待规划 |

商业化顺序：先验证当前 AI 建议质量、主动调用率、复制率、单位成本及误用；再确定可解释的有限免费额度与 Pro 更高额度；之后才评估 H1、图片 Alt、Schema 等真实 AI 覆盖扩展以及历史/批量/报告等高成本能力。基础页面分析工具保持免费。对外权益、价格、支付及隐私文本须经产品和发布审核后才上线。

## Help / Tutorial 入口

候选为 Side Panel 页眉的 Help/`?` 入口（所有状态可达），打开扩展内简短帮助或官网 `/guide/`；官网可从 Support/导航通达。**用户主动打开、可随时退出、不强制完成**。教程信息架构按任务：Getting Started、Quick Metadata、SEO Audit；Content、Indexability、Structured Data、Images、Outgoing Links、AI SEO Fix 仅在对应功能发布后出现。每段写入口、操作步骤、结果解释、权限/数据外发边界和常见失败，链接指向当前有效 UI，不发布空教程。

**Welcome 三项状态：**产品决策是**不自动打开 Welcome**；当前代码是否已经关闭自动打开逻辑**待核实**（此前核查曾记录 `background.ts` 的安装触发，本轮不把旧记录当作当前状态）；`welcome.html` 文件**暂时保留**。若核实后仍有自动触发，再另案调整，保留用户主动访问帮助的路径；本轮不改代码。官网 `/guide/` 建立前先对照实际版本和 [官网事实源](../../PRODUCT_FACTS.md)，核对路由、内链、索引策略。扩展 UI 目前大量英文硬编码，而官网有多语言页面；教程先以已审核语言发布，新增语言须同步截图、术语、链接与版本维护，不要让翻译领先功能上线。

## 竞品到产品的功能追踪矩阵

`Research Source` 中 **19 款**指上文历史商店摘要/截图，**Ahrefs** 指用户提供的截图观察，**用户决策**指本轮明确的产品方向。`Data Availability` 说的是当前扫描结果，不是竞品数据。`部分实现`不代表完整工具 UI 已上线。`采用`表示采用该方向或现有能力，仍须按优先级逐项审核实施；`待评估`和`暂缓`更不构成开发批准。

| Feature / Research Source | User Task | Current Status | Data Availability | Technical Dependency | Priority | Decision |
|---|---|---|---|---|---|---|
| Popup Metadata / 19 款 #1–4、#19；用户决策 | 快看并复制标题/描述/URL | **已实现** | Popup 直接读取 | 维持双入口和授权体验 | P0 | 采用 |
| Full Audit、Rescan / 综合 SEO；用户决策 | 发现并复查问题 | **已实现** | 20 条规则与问题 | 维持现有评分规则 | P0 | 采用 |
| 四类 Audit Categories / 用户决策 | 按类别统计、定位问题 | 未实现展示层 | 七类 issue category 已有 | 只聚合实际 Issue 数；不新增四类评分 | P1-A | 采用 |
| Word Count / Ahrefs | 快看内容规模 | 部分实现：仅扫描结果 | 已有 `wordCount` | 工具 UI 与口径说明 | P1-A | 采用 |
| H1/H2/H3 / Ahrefs | 检查标题层级 | 部分实现：仅扫描结果 | 已有文本与顺序 | 工具 UI、空态 | P1-A | 采用 |
| Copy Headings / Ahrefs；19 款复制意图 | 复制页面标题结构 | 未实现 | 已有 H1–H3 | 格式化与剪贴板 | P1-A | 采用 |
| Canonical / Ahrefs | 看当前 canonical | 部分实现：有规则无工具视图 | 已有 live DOM canonical | 工具 UI；标明 rendered | P2 | 待评估 |
| JSON-LD Detection / Ahrefs | 确认是否有结构化数据 | 部分实现：有规则无工具视图 | 已有类型/无效数 | Schema 类型视图中展示，区分检测与验证 | P1-B | 采用 |
| Schema Types / Ahrefs | 查看 Schema 类型 | 部分实现：仅扫描结果 | 已有 `schemas[].type` | 工具 UI | P1-B | 采用 |
| Google Rich Results Test / Ahrefs | 外部验证富结果 | 未实现 | 当前页 URL 已有 | 固定官方入口、URL 编码与外传提示 | P1-B | 采用 |
| Schema Markup Validator / Ahrefs | 外部验证 Schema | 未实现 | 当前页 URL 已有 | 同上；深链参数核对 | P1-B | 采用 |
| Schema Details / Ahrefs | 查具体 JSON-LD | 未实现 | 仅类型，无完整对象 | 先评估必要字段，再限长补采与脱敏 | P1-B | 待评估 |
| Images URL/Alt/Dimensions/Count / Ahrefs | 核对图片属性 | 部分实现：仅数据/指标 | 1000 张以内已有 | 明细 UI、分页与截断说明 | P1-C | 采用 |
| Images Alt All/Not empty/Empty / Ahrefs | 找缺失或空 Alt | 未实现 | URL/alt 已有 | 筛选 UI；区分 null 与空串 | P1-C | 采用 |
| Images Thumbnail / Ahrefs | 识别目标图片 | 未实现 | URL 已有 | 按需加载与失败态 | P2 | 待评估 |
| Images 独立 Refresh / Ahrefs | 更新当前图片列表 | 未实现 | 可重扫当前页 | 复用扫描管线，设计局部刷新 | P1-C | 采用 |
| Images CSV / Ahrefs；19 款 #17 | 带出图片清单 | 未实现 | 图片数组已有 | CSV 转义、公式注入保护 | P1-C | 采用 |
| Images OK/Broken / Ahrefs | 检查图片请求状态 | 未实现 | 自然尺寸不等于 HTTP 状态 | 额外有界请求/权限与失败语义 | P3 | 暂缓 |
| Robots Meta / Ahrefs | 看页面索引指令 | 未实现 | 无 | DOM 扫描扩展 | P2 | 待评估 |
| Hreflang / Ahrefs | 核对语言版本声明 | 未实现 | 无 | DOM 扫描扩展 | P2 | 待评估 |
| Robots.txt、Sitemap / Ahrefs | 核对站点声明 | 未实现 | 无 | 网络请求、权限/错误处理 | P2 | 待评估 |
| X-Robots-Tag / Ahrefs | 看响应索引头 | 未实现 | 无 HTTP 头 | 网络/浏览器 API 可行性 | P2 | 待评估 |
| Published / Modified Date / Ahrefs | 识别内容时间 | 未实现 | 无 | 多来源 DOM 提取与可信度 | P2 | 待评估 |
| Outgoing Links 分类/搜索/导出 / Ahrefs | 找内外链及 rel 类型 | 未实现 | 无链接数组 | 扩展扫描器、URL/rel 归类与 CSV | P2 | 待评估 |
| Social Tags / Ahrefs 可见入口；19 款 #14–16 | 查分享元数据 | 未实现 | 无 OG/Twitter 数据 | DOM 采集；入口内部功能未见 | P2 | 待评估 |
| Link Check Status / Ahrefs | 验证链接响应 | 未实现 | 无 | 限量并发、跨域/权限、取消 | P3 | 暂缓 |
| Link Highlight / Ahrefs | 定位页面链接 | 未实现 | 无 DOM 标识 | 页面标记和清理 | P3 | 暂缓 |
| Raw/Rendered、Raw Canonical / Ahrefs | 对比响应与渲染 | 未实现；仅 rendered canonical | 无原始响应 | 高成本采集、时点与敏感数据 | P3 | 暂缓 |
| HTTP Headers、Redirect / Ahrefs 入口/用户议题 | 查响应与跳转 | 未实现 | 无 | 网络证据和权限验证 | P3 | 暂缓 |
| Metrics Bar、User Agent / Ahrefs 可见入口 | 任务未知，先识别入口 | 未实现 | 未知 | 内部截图/实测后再定义 | P3 | 暂缓 |
| Saved URLs、Search Tools、Settings、Metrics、Suggest a feature / Ahrefs 可见入口 | 任务和内部功能未验证 | 未实现/不推断 | 未知 | 仅保留观察，先验证需求 | P3 | 暂缓 |
| 基础 Help / 用户决策；Ahrefs | 随时查看已上线操作说明 | 未实现 Side Panel 入口 | 功能事实已有 | 入口、内容与语言维护 | P2 | 待评估 |
| AI Fix Title/Meta / 用户决策 | 生成并复制候选文案 | **部分问题已实现** | 上下文已有 | 维护现有调用；不重复开发 | P0 | 采用 |
| AI Free Trial / Pro License / 用户决策 | 获得清晰额度和升级路径 | 未实现权益/支付 | 基础调用与后端保护已有 | 额度、身份、支付、恢复与运营 | P2 | 待评估 |

## 技术依赖、权限与性能风险

上文 Page Analysis Tools 表给出了逐项依赖。跨域状态检查和站点文件读取可能需要新请求、可选 host 权限与 CORS 处理；只展示既有扫描数据、复制和本地 CSV 通常无需新权限。图片与链接状态不能以 `naturalWidth`、Performance size 或请求失败直接判定。所有批量网络检查都必须用户主动触发、去重、限量、限并发并可取消。Raw/Rendered 不承诺取到原导航响应。外部 Schema 验证只在点击后传递经过安全编码的当前页 URL，并提示第三方可见该地址。

## P0–P3 优先级路线图

评分均为 **1–5**：价值/竞品验证/定位匹配度越高越好；复杂度/性能权限风险越高越难。竞品验证指历史档案或用户截图的观察程度，不等于实测用户收益。**P0 只做产品方向、四类映射及架构确认；P1-A 为类别与内容，P1-B 为 Schema，P1-C 为 Images；P2 为其他数据采集和待评估能力；P3 为高复杂度候选。**P1-B 的 Schema 详情是范围受控的补采例外，不能只靠 UI 完成。均非开发批准。已实现能力不再作为待开发项评分。

| 候选功能 | 价值 | 竞品验证 | 复杂度 | 性能/权限风险 | 定位匹配 | 建议 | 依据 |
|---|---:|---:|---:|---:|---:|---|---|
| 四类 Audit 映射与架构确认 | 5 | 5 | 1 | 1 | 5 | P0 | 产品口径定稿；不修改评分规则 |
| Audit Categories 统计/定位 | 5 | 4 | 2 | 1 | 5 | P1-A | 只聚合实际 Issue 数，不增加四类评分 |
| Word Count / Headings 视图 | 5 | 5 | 1 | 1 | 5 | P1-A | 已采集，仅需展示与空态 |
| Copy Headings | 4 | 5 | 1 | 1 | 5 | P1-A | 复用 H1–H3 与剪贴板 |
| Schema Type / Detection 展示 | 4 | 5 | 1 | 1 | 5 | P1-B | 已采集，须避免等同有效性验证 |
| Schema Details | 4 | 5 | 3 | 2 | 4 | P1-B | 尚无详情数据，先定范围再限长补采 |
| Schema 外部验证入口 | 4 | 5 | 2 | 2 | 4 | P1-B | 固定官方入口与 URL 外传提示 |
| Images 明细 / Alt 筛选 / CSV | 5 | 5 | 2 | 2 | 5 | P1-C | 复用数组；CSV 安全与 1000 张上限 |
| Images 独立 Refresh | 4 | 5 | 2 | 1 | 5 | P1-C | 复用扫描管线，但新建独立交互 |
| Canonical 工具视图 | 3 | 5 | 1 | 1 | 4 | P2 | 有数据，但不扩大本轮 P1 清单 |
| Images Thumbnail | 3 | 5 | 2 | 2 | 3 | P2 | 按需加载与失败态待评估 |
| Help 入口 / 已上线教程 | 4 | 4 | 2 | 1 | 5 | P2 | 内容随真实功能维护；Welcome 状态待核实 |
| Robots Meta / Hreflang | 4 | 5 | 3 | 2 | 4 | P2 | 需扩展 DOM 扫描 |
| robots.txt / Sitemap / X-Robots-Tag | 4 | 5 | 4 | 4 | 4 | P2 | 网络、权限、CORS 与认证边界 |
| Outgoing Links 列表/过滤/CSV | 4 | 5 | 3 | 2 | 4 | P2 | 先采链接数组、去重与分类 |
| Published / Modified Date | 3 | 5 | 3 | 2 | 3 | P2 | 来源不一，须记录冲突 |
| Social Tags | 3 | 2 | 3 | 2 | 3 | P2 | 仅入口可见，范围待验证 |
| Images OK/Broken 状态 | 3 | 5 | 4 | 5 | 3 | P3 | 请求额外图片资源 |
| Outgoing Links Check Status / Highlight | 3 | 5 | 5 | 5 | 3 | P3 | 跨域状态与页面 DOM 操作 |
| Raw / Rendered Inspect | 3 | 5 | 5 | 5 | 3 | P3 | 原导航响应难还原，HTML 敏感 |
| HTTP Headers / Redirect Analysis | 3 | 2 | 5 | 5 | 3 | P3 | 仅 Headers 入口可见，需网络证据 |
| Metrics Bar / User Agent | 2 | 1 | 5 | 4 | 2 | P3 | 只见入口，不能推断内部功能 |

**建议实施批次：**

1. **P0：**确认 Popup + Side Panel 双入口、三层定位、Free/Pro 边界、四类展示映射与底层七类规则的关系；第一版四类只统计实际 Issue 数量，维持现有 SEO Score 和评分权重。属于架构和决策工作。
2. **P1-A：**Audit Categories 问题计数与定位；Word Count 展示；H1/H2/H3 列表；Copy Headings。复用现有 `issues`、`wordCount` 和 `headings[]`。
3. **P1-B：**Schema 类型/检测展示、Schema 详情及 Google Rich Results Test / Schema Markup Validator 外部验证入口。详情尚无完整对象，必须先批准最小补采范围、限长和隐私处理；外部验证须核对深链并提示 URL 外传。
4. **P1-C：**Images 明细、Alt All/Not empty/Empty 筛选、独立 Refresh、CSV Export。复用现有图片数组与扫描管线；独立 Refresh 仍需新交互定义，CSV 需转义及公式注入保护。
5. **P2：**Robots/Sitemap/Hreflang、发布日期、Outgoing Links、Social Tags；Canonical 工具视图、Images Thumbnail 与基础 Help 作为本轮 P1 清单外的待评估项。明确字段、数据上限、跨域权限和失败语义后再排开发。
6. **P3：**Image/Link 状态、Highlight、HTTP Headers、Redirect、Raw/Rendered、Metrics Bar、User Agent；仅保留研究候选。

## 已确认决策、待评估与暂缓

**已确认：**三层核心定位；Quick Metadata Popup 与 Full SEO Audit Side Panel 双入口**已实现**；Open SEO Audit 自动触发首次扫描、Rescan 重扫当前页，跨域按实际权限授权；完整基础扫描和基础 Page Analysis Tools 免费；AI Fix 有限免费试用与 Pro 为商业化方向，权益尚未实现；四大 Audit Categories 映射七种底层 Rule Category，第一版只统计实际 Issue 数，不增加四类独立评分或改动现有 SEO Score/权重；Categories 与 Tools 分工；**产品决策是不自动打开 Welcome**，`welcome.html` 暂时保留，教程只介绍上线能力。本轮不开发、不提交、不推送、不部署。

**待评估：**最终 Side Panel IA 与窄宽度交互实测；Schema 详情最小补采范围及数据上限；外部验证器深链格式与 URL 隐私提示；图片/链接 CSV 字段和公式注入处理；跨域检测的请求限额与权限；官网 `/guide/` 的语言/维护责任；**当前代码是否已关闭 Welcome 自动打开逻辑待核实**，文件暂留；正式 AI 免费额度、Pro 权益、价格与发布版本口径。历史竞品用户规模、排名和 CWS 指标不得升级为当前事实，产品转化效益仍需用户数据验证。

**暂缓：**全站 Crawl、关键词数据库/排名追踪、自动改站、无界外链检测、Image/Link 状态、Highlight、Raw/Rendered 精确网络回放、HTTP Headers/Redirect、Metrics Bar、User Agent，以及没有成本证据的批量/历史/PDF/Agency 套餐。Social Tags 仅纳入 P2 采集评估；没有内部截图的其他入口不推断功能。历史商业文档中的价格和扫描限制不自动继承为本轮决定。
