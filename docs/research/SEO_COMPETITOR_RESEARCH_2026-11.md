# SEO Copilot 竞品研究与产品方向档案

**研究快照：**2026 年 11 月 10 日
**来源范围：**2026 年 11 月 SEO Copilot 竞品与 ASO 连续讨论记录（含 19 款扩展分析、产品方向、CWS 截图描述和排名快照）；《SEO项目商业化评估与定价》只是对话标题，并非独立研究文档
**文档性质：**历史研究归档与后续决策依据；本次仅整理已有讨论，未重新访问商店、运行竞品或核查当前代码
**决策状态：**Quick Metadata Overview 是待技术评估的候选改进，并非已批准开发的需求

## 1. 摘要与决策边界

此前研究支持一个聚焦的产品方向：**快速查看页面元数据 + 可执行的页面 SEO 诊断 + 按需使用 AI 建议**。多款竞品将 Title、Meta Description 等现有信息作为直接可见的基础价值；SEO Copilot 此前讨论中的主要体验路径则是打开侧栏、主动扫描、查看评分和问题，再按需使用 AI。因此，值得先验证能否以较小改动提供 Title、Description、URL、字符数和复制操作的概览。

这不是竞品功能与增长之间的因果结论。商店搜索排名、安装量、产品功能和留存是不同指标。现有材料不能证明增加概览会改善排名或安装转化，也不能证明某个关键词的搜索量。增长侧应保留当前商店标题和排名作为基线，独立跟踪 ASO；产品侧应先进行只读技术评估，再决定是否开发。

## 2. 研究范围、过程和证据等级

此前讨论先后收集了 19 款与 Title、Meta Description、页面 SEO、社交预览、复制导出或关键词提取相关的 Chrome 扩展。最终分析把它们合并成四类，比较用户要完成的任务、界面层次、与 SEO Copilot 的重合能力，以及哪些方向属于相邻需求。对话还记录了 Extension Ranker 的英文默认搜索排名快照，以及 Chrome Web Store 后台近 30 天指标。本文沿用这些既有记录，不补做搜索或体验测试。

本文采用以下标记，避免把历史讨论写成现时事实：

| 标记 | 含义 | 使用边界 |
|---|---|---|
| 对话记录 | 前次讨论中明确给出的名称、ID、数据或判断 | 可追溯到本轮引用的历史对话，但未在本次重新核验 |
| 商店宣传待复核 | 前次讨论依据商店描述概括的功能 | 不等于安装后实测；详情页可能已更新 |
| 推断或建议 | 根据多款产品定位形成的产品判断 | 需要技术评估与用户行为数据验证 |
| 未提供 | 对话没有可引用的数字、截图或测试记录 | 不填猜测值 |
| 截图观察转述 | 历史对话描述了商店截图中可见的布局和字段 | 原图未随本档案保存；不等于安装实测 |
| 历史估计/约数 | 对话记录的约数或笼统规模说法 | 无统一采集时刻，不作当前值 |

**证据局限：**历史对话保留了官方详情页链接和若干商店描述摘要，但未保留 19 款逐一安装测试记录、竞品截图原件、统一抓取日期、完整评分和用户数表。此前对话确有一张竞品 CWS 截图的内容描述，见附录 A.2。下表的功能是“此前讨论中的定位摘要”，并非本次实测确认。官方链接用于后续复核，不代表本文已重新打开页面。第三方排名仅是当时工具和搜索设置下的快照。

## 3. 19 款竞品基线

类别按此前讨论的主要宣传定位归纳；跨类别功能可能存在。下表“可借鉴点”是研究判断，不是竞品实测清单。所有行的当前评分、用户数和精确核实日期均**未在本次复核**；已记录的历史用户量见附录 A，不能当作当前值。

| # | 类别 | 竞品与官方链接 | 此前讨论中的定位或功能摘要 | 对 SEO Copilot 的参考 |
|---:|---|---|---|---|
| 1 | Title / Meta 专项 | [Meta Title & Description Checker](https://chromewebstore.google.com/detail/ammogonjgjnnijonikkannkhdbjgahfo) | Title、Description 原文、字符数、复制、长度提示 | 快速读取与复制；商店宣传待复核 |
| 2 | Title / Meta 专项 | [Title Tag & Meta Description Length Checker](https://chromewebstore.google.com/detail/iojnimjpcjafibinpihnpgkbaffpkhki) | Title 与 Description 长度检查 | 字符数与提示的简明呈现；待复核 |
| 3 | Title / Meta 专项 | [Page Meta Checker](https://chromewebstore.google.com/detail/okldgfkjgbikmklgfepadaepenmidfeo) | 元数据原文与 URL 快速复制 | 低步骤获取信息；待复核 |
| 4 | Title / Meta 专项 | [Meta Tag Analyzer](https://chromewebstore.google.com/detail/hdkkhhoelnbnoljknkcnniakpgljojhi) | Meta 提取与基础检查 | 将读取和检查分层；待复核 |
| 5 | 相邻需求 | [SEO Keyword Extractor](https://chromewebstore.google.com/detail/kbldlmjcoelkdnjaiegddeinclgnmbmo) | 页面关键词提取 | 说明存在邻近意图；近期不扩入关键词提取 |
| 6 | 综合 SEO | [SEO Checker Pro – VSUDO](https://chromewebstore.google.com/detail/gedlmoffaoldkaepglmbpjjcbfkjadoh) | 多项 SEO 诊断 | 比较诊断信息结构；待复核 |
| 7 | 综合 SEO | [SEO Meta Tags Analyzer – SEO Checker Pro](https://chromewebstore.google.com/detail/fpmonichemgmfodehndmehkkkdjaaadj) | SEO Score、Meta、Schema 等 | 参考评分与具体检查的关系；待复核 |
| 8 | Title / Meta 专项 | [SEO Meta Checker](https://chromewebstore.google.com/detail/iaiemnlapofidbgfphpmfmdahbidaihf) | 基础 Meta 检查 | 基础需求和用词线索；待复核 |
| 9 | 综合 SEO | [SEO Meta Tags – On Page Checker](https://chromewebstore.google.com/detail/haokbiapnfpfkhmpipbabhkcgjkjkaol) | 页面基础 SEO 检查 | 参考检查范围；待复核 |
| 10 | 综合 SEO | [Meta Explorer](https://chromewebstore.google.com/detail/dggmapjanngfjjakfgeoegfmgpmcamfh) | Meta、问题导出、SPA、社交预览等 | 快速信息与深入检查并存；扩展功能暂不复制 |
| 11 | 综合 SEO | [AIO SEO Checker](https://chromewebstore.google.com/detail/ndldmmbhemfoepokpdlkfcmakgeefcdp) | 综合 SEO 与 AI 搜索相关检查 | 观察定位差异；待复核 |
| 12 | Title / Meta 专项 | [1 Click SEO Meta Tags Analyzer](https://chromewebstore.google.com/detail/lpooclffajlbhjdeejhmbnaojfkojfhk) | 一键读取 SEO 信息 | 低操作成本；待复核 |
| 13 | 综合 SEO | [Meta Tags Pro](https://chromewebstore.google.com/detail/miihmfdpfdioogfbfofbnagblnjbjomg) | Meta 与更广泛的审计能力 | 范围对照；待复核 |
| 14 | 社交预览 | [SEO Meta Tags & OG Previewer](https://chromewebstore.google.com/detail/mekjdhoenipabelfjjhgmoccjpllinkk) | OG 与 SEO 信息预览 | 独立使用意图，近期暂缓 |
| 15 | 社交预览 | [Link Preview & SEO Meta Tags Checker](https://chromewebstore.google.com/detail/joppngopkbognhkobhopdambdnlgchhl) | 分享卡片预览 | 独立使用意图，近期暂缓 |
| 16 | 社交预览 | [MetaScout](https://chromewebstore.google.com/detail/begklbialleoecpfihedecgihlnghnio) | Meta 与社交预览 | 观察需求边界；待复核 |
| 17 | 复制与导出 | [SEO META 1 COPY](https://chromewebstore.google.com/detail/eblbmdomppeajmpblgeppodbkfnonppc) | SEO 数据查看、复制、Markdown / 制表符导出、侧栏 | 复制优先；大规模导出暂缓 |
| 18 | 综合 SEO | [SEOquake](https://chromewebstore.google.com/detail/akdgnmcogleenhbclghghlkkdndkjdjc) | 成熟综合 SEO 工具 | 参考信息呈现，不扩大成同等范围 |
| 19 | 综合 SEO | [SEO META in 1 CLICK](https://chromewebstore.google.com/detail/bjogjfinolnhfhkbipphpdlldadpnmhc) | Title、Description、长度及其他页面信息快速查看 | 快速读取正常数据与异常数据的体验参考 |

**历史规模说法，均待复核：**此前分析提及 Page Meta Checker 约 2 位用户、SEO Checker Pro – VSUDO 约 22 位用户、Meta Explorer 和 SEO META 1 COPY 各约 10,000 用户，并笼统提到 SEOquake / SEO META in 1 CLICK 为百万级产品。对话没有为这些数值保留统一采集时间和截图，因此本文不将其视作当前用户数，也不据此做定量比较。其中 10 款的历史用户数及评分数量已由此前讨论补充，另 9 款的缺失数据保持未记录；逐行功能与证据见附录 A。

## 4. 跨产品发现

### 4.1 快速读取是值得验证的基础任务

Title / Meta 专项产品强调读取原文、检查字符数、复制和简单长度提示。此前讨论还指出，SEO META in 1 CLICK 的商店描述把 Title、Description 和长度等作为基础信息展示。这些材料支持“用户可能想先看当前页面是什么”的假设。它们尚不能证明 SEO Copilot 用户也有相同需求，更不能证明某一种界面会提高转化。

### 4.2 快速查看与深入审计可以分层

Meta Explorer、SEO META 1 COPY 以及 SEO META in 1 CLICK 在此前分析中被视为快速信息展示与更多检查能力并存的例子。对 SEO Copilot 的启发是：让基础信息更容易取得，同时保留现有讨论中的 SEO Score、Issues、Recommended Actions、Rescan 和按需 AI Fix。具体放在扫描前、扫描后还是报告内，仍须由代码结构与用户流程验证。

### 4.3 四类意图不应混成同一个版本目标

| 用户意图 | 典型任务 | 本阶段判断 |
|---|---|---|
| Metadata 快速查看 | 读取、计数、复制 Title / Description / URL | 优先验证最小概览 |
| 综合页面 SEO | 理解问题、严重程度、建议行动 | 保留并改善已有流程 |
| 社交预览 | 检查 OG / 分享卡片 | 有独立市场，近期暂缓 |
| 关键词提取 | 提取词或分析密度 | 相邻需求，近期不扩展 |

### 4.4 排名与用户量不能倒推算法

此前排名快照中，小用户量产品也可能排在 SEO Copilot 前面。这仅提示安装量不是可观察到的唯一相关因素；不能据此识别 Chrome Web Store 的排序机制。成熟竞品的较大用户规模也不能证明复制其功能会带来同样增长。功能数量、安装量、排名和留存之间没有由本轮资料建立的因果关系。

## 5. SEO Copilot 产品差异化与候选方向

**推荐定位：**Quick metadata inspection + actionable on-page SEO checks + optional AI suggestions。

| 层次 | 用户价值 | 此前讨论中的现状或候选 | 验证要求 |
|---|---|---|---|
| Quick Metadata | 立即看到 Title、Meta Description、URL、字符数并可复制 | 候选 Quick Metadata Overview；尚未确认当前 UI 与数据结构 | 只读检查原始值、无 Warning 时数据、复制入口及展示位置 |
| SEO Audit | 理解 SEO Score、Issues、严重程度、Recommended Actions、Rescan | 此前讨论认为已有主要能力；本次未核代码 | 核对现有实现和回归风险 |
| AI Suggestions | 对受支持的 Title / Meta 问题按需生成候选文案，用户自行修改网页 | 此前讨论认为已有部分 AI Fix；本次未核代码 | 核对触发条件、成本和用户主动性 |

**Quick Metadata Overview 的拟议边界：**优先复用已有扫描结果，在现有 Side Panel 内以最小展示改动实现；先不预设独立 Tab 或自动扫描；避免新增 Chrome 权限、后端接口、数据库和 AI 请求。上述是设计约束与待评估方案，**不是已验证可行性或开发承诺**。如果现有扫描不保留正常字段原文，或只能在 Warning 中拿到值，复杂度可能明显上升。

**近期暂不纳入：**全站 Crawl、关键词提取与密度分析、OG / Twitter 社交预览、大规模 CSV / Markdown 导出、新 AI 功能和整体 UI 重构。重新考虑这些方向应有明确的用户需求证据，并单独评估成本。

## 6. ASO 排名与商店指标基线

以下数字是截至 2026 年 11 月 10 日此前讨论整理的**历史快照**，本次没有重新登录后台或打开第三方工具验证。

| 来源 | 指标或关键词 | 历史记录 | 限制 |
|---|---|---:|---|
| Chrome Web Store 后台，近 30 天 | 总展示 | 约 356 | 指标口径和归因未完整核实 |
| 同上 | 详情页浏览 | 约 66 | 不与其他数字直接拼接漏斗 |
| 同上 | 安装次数 | 约 293 | 时间与统计口径需复核，不能直接推算转化率 |
| 同上 | 每周用户数 | 约 6 | 与近 30 天指标并非同一口径 |
| [Extension Ranker 排名检查工具](https://extensionranker.com/tools/rank-checker?utm_source=chatgpt.com&id=kjkjgpmhjilegalgphglnagjnfgnighb&keyword=meta+description+checker)，英文默认搜索 | `meta description checker` | #21 | 第三方单次快照；非长期或美国单独排名 |
| 同一工具，此前讨论记录 | `seo title checker` | #27 | 缺少独立结果页留存，待复核 |
| 同一工具，此前讨论记录 | `title tag checker` | 前 30 以外 | 缺少独立结果页留存，待复核 |

此前记录的商店标题为 **SEO Copilot – Title & Meta Description Checker**。两组相关词曾进入前 30，说明当前标题至少与这些查询存在一定相关性线索；不能据此断定标题最优，也不宜在没有对照观察前盲目改名。GSC 的网页搜索数据与 Chrome Web Store 内搜索数据来源不同，不得相互替代。

## 7. 后续行动与决策条件

1. **归档本快照。** 后续讨论引用本档案时保留“历史记录、待复核”的标记，不把商店宣传改写成实测事实。
2. **进行只读代码评估。** 核对当前扫描结果是否包含 Title / Description 原始值、URL、字符数；无 Warning 时是否仍有完整值；是否已有相似展示；IssueList 是否按 SEO impact 排序；Rescan 与 AI Fix 的数据流如何工作。
3. **比较最小方案。** 分别估算现有报告中的概览卡片、独立 Quick View、暂不开发三种选择的改动文件、权限或请求变化、测试范围与回归风险。只有在可复用数据且不会破坏现有主流程时，才把概览卡片提交为小版本候选。
4. **独立跟踪 ASO。** 固定搜索语言、地区、时间和工具，定期记录三组关键词排名及商店展示、详情页浏览、安装和每周用户。保留标题基线；每次只改变可归因的少数商店字段，并观察足够时间后再判断。
5. **补齐证据。** 若未来需要对外引用竞品用户数、评分或具体功能，逐项保存官方页面日期、截图或安装实测记录。若要证明 Quick Metadata 的价值，收集用户访谈、使用路径或小范围发布数据。

## 8. 待验证事项清单

- 19 款竞品的当前名称、描述、用户数、评分、更新日期和真实功能；本次仅保留 ID 与历史摘要。
- Meta Explorer、SEO META 1 COPY、Page Meta Checker 等历史用户量说法及采集时间。
- 356、66、293、6 四项 Chrome Web Store 指标的准确口径、时间窗口与后台截图。
- 三组 Extension Ranker 排名的复测时间、搜索地区、语言、登录状态及波动情况。
- SEO Copilot 当前源码是否真的提供完整元数据、复制能力、SEO Score、Issues、AI Fix、Rescan，以及无 Warning 时的数据可用性。
- Quick Metadata 是否改善首次使用体验、安装转化或留存；目前没有实证数据。

## 9. 来源索引

1. 2026 年 11 月 SEO Copilot 竞品与 ASO 连续讨论记录；当前对话标题为《SEO项目商业化评估与定价》，并非同名独立来源文件。记录涵盖“19 款竞品统一整理”“产品方向与竞品研究结论”“ASO 增长文档”及后续归档审核。本档案中的分类、判断和数值均由这些对话记录整理而来。
2. 上表 19 条 Chrome Web Store 官方详情页链接：供逐项复核产品身份和商店声明；本次未重新访问。
3. [Extension Ranker 排名检查工具及 `meta description checker` 查询链接](https://extensionranker.com/tools/rank-checker?utm_source=chatgpt.com&id=kjkjgpmhjilegalgphglnagjnfgnighb&keyword=meta+description+checker)：此前讨论中的第三方快照入口；当前排名可能变化。
4. Chrome Web Store 后台指标：数值来自历史对话转述，未附后台导出或截图，需由账号持有人复核。

## 附录 A. 19 款竞品功能与证据矩阵

### A.1 阅读规则

本附录只展开原稿和此前对话已经记录的内容。功能格中的 **S** 表示历史讨论中的商店描述或功能摘要声称支持，**O** 表示历史讨论曾描述商店截图中可见，**U** 表示没有足够的逐项证据，**—** 表示不适合由现有材料判定；S/O 均未经本次复核。它们不代表已安装实测。`Title/Desc` 指能读取原文，`长度` 指字符数或长度检查，`诊断` 包括 SEO Score 或检查结果；两者只在证据允许时细分。`历史用户` 是讨论时记录的展示值或约数，不是当前用户数；部分竞品的用户数及评分数量已有 2026 年 11 月历史讨论记录，详见附录 A。其余数据标记为未记录。所有历史数据均未在本次重新核验，不代表当前商店状态。

| # | 竞品（对应第 3 节官方链接） | 历史用户 | 评分/评价数 | Title/Desc | 长度 | 复制 | URL | 诊断/Score | AI | OG/社交 | 导出 | 证据与限制 |
|---:|---|---:|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|---|
| 1 | Meta Title & Description Checker | 152 | 1 | O | O | O | O | U | U | U | U | 历史 CWS 截图讨论描述了同一弹窗中的字段与按钮；长度提示仅见原稿摘要 S，未见实测 |
| 2 | Title Tag & Meta Description Length Checker | 47 | 0 | S | S | U | U | U | U | U | U | 原稿历史功能摘要，未保留截图或实测 |
| 3 | Page Meta Checker | 2 | 0 | S | U | S | S | U | U | U | U | 功能据原稿摘要；用户量据历史对话，采集时间不详 |
| 4 | Meta Tag Analyzer | 3,000 | 0 | S | U | U | U | S（基础检查） | U | U | U | 只有 Meta 提取与基础检查的历史摘要 |
| 5 | SEO Keyword Extractor | 1,000 | 1 | U | U | U | U | U | U | U | U | 已记录的是关键词提取定位，不能推断其元数据功能 |
| 6 | SEO Checker Pro – VSUDO | 22 | 1 | U | U | U | U | S（多项诊断） | U | U | U | 用户量据历史审核记录；无逐项诊断清单 |
| 7 | SEO Meta Tags Analyzer – SEO Checker Pro | 153 | 9 | S | U | U | U | S（Score、Schema 等） | U | U | U | 原稿摘要仅支持这些宽泛标签 |
| 8 | SEO Meta Checker | 84 | 1 | S | U | U | U | S（基础检查） | U | U | U | 原稿历史摘要，具体检查项未知 |
| 9 | SEO Meta Tags – On Page Checker | 未记录 | 未记录 | U | U | U | U | S（页面基础检查） | U | U | U | 原稿历史摘要，具体检查项未知 |
| 10 | Meta Explorer | 10,000 | 48 | S | U | U | U | S（问题） | U | S（社交预览） | S（问题导出） | 历史摘要还提 SPA；具体交互和导出格式未核 |
| 11 | AIO SEO Checker | 未记录 | 未记录 | U | U | U | U | S（综合检查） | U | U | U | “AI 搜索相关”是定位摘要，不能等同 AI 生成功能 |
| 12 | 1 Click SEO Meta Tags Analyzer | 未记录 | 未记录 | S | U | U | U | U | U | U | U | 仅“一键读取 SEO 信息”的历史摘要；字段细节未知 |
| 13 | Meta Tags Pro | 未记录 | 未记录 | S | U | U | U | S（较广审计） | U | U | U | 原稿历史摘要，无逐项功能证据 |
| 14 | SEO Meta Tags & OG Previewer | 未记录 | 未记录 | S | U | U | U | U | U | S | U | 历史定位为 OG 与 SEO 信息预览 |
| 15 | Link Preview & SEO Meta Tags Checker | 未记录 | 未记录 | S | U | U | U | U | U | S | U | 历史定位为分享卡片预览 |
| 16 | MetaScout | 未记录 | 未记录 | S | U | U | U | U | U | S | U | 历史定位为 Meta 与社交预览 |
| 17 | SEO META 1 COPY | 10,000 | 4 | S | U | S | U | U | U | U | S（Markdown/制表符） | 原稿历史摘要记录侧栏与导出；未安装实测 |
| 18 | SEOquake | 百万级（笼统说法） | 未记录 | U | U | U | U | S（综合 SEO） | U | U | U | 用户规模只在原稿作笼统描述，无精确数值 |
| 19 | SEO META in 1 CLICK | 百万级（笼统说法） | 未记录 | S | S | U | U | S（其他页面信息，细项未知） | U | U | U | 历史摘要，不把产品名“1 CLICK”当作复制功能证据 |

**矩阵结论：**可直接支持“快速查看 Title、Description、字符数和复制”界面观察的是第 1 款历史截图描述；其余多数功能仍只达到历史商店摘要层级。第 10、17、19 款为“快速查看与较深能力可共存”的定位线索，不能据此确认每项功能的操作质量。Score、AI、URL、复制、导出等空白格不能按竞品类别自动补全。

### A.2 已提供的竞品 CWS 截图：界面解读

此前对话明确描述过 **Meta Title & Description Checker** 的 Chrome Web Store 截图：**同一弹窗直接呈现 Title、Description、URL、字符数和复制按钮**。这是对截图内容的历史转述；本档案没有截图原件、版本号或安装实测，无法再检查按钮状态、响应速度、超长文本处理、空字段行为或是否自动刷新。

从这项可见布局可推导的用户路径是：打开扩展后，在一个界面读取当前页面的元数据，检查长度，再复制需要的字段。字段原文与长度并列，使“查看现状”和“进行简单判断”不必先进入完整诊断报告。复制按钮靠近结果，减少重新选中文字的操作。这是**界面可用性推断**，并非用户研究结果。

它与此前讨论的 SEO Copilot 路径——**打开 Side Panel → 主动扫描 → 查看 SEO Score / Issues → 按需 AI Fix**——形成一个可验证的交互差异：用户若只想确认 Title 或复制 Description，完整扫描路径可能较长；若用户意图是理解问题，现有深入审计仍有价值。截图支持探索“在现有 Side Panel 内提供简短概览”的候选方案，但**不证明弹窗优于侧栏**，也不证明独立 Quick View、自动扫描或新增权限是必要的。原图未随本档案保存，因此未来引用具体视觉细节时应补存截图。

## 附录 B. ASO 关键词排名与历史规模快照

### B.1 `meta description checker` 的同次讨论样本

下表来自此前对 Extension Ranker **英文默认搜索**结果的记录，属于单次第三方排序快照。历史用户量为同期讨论中的 CWS 展示值或约数，来源、采集时刻与排名工具的测量时刻未做统一校准。

| 名次 | 扩展 | 历史用户量 | 证据状态 | 可以得出的判断 |
|---:|---|---:|---|---|
| #12 | Page Meta Checker | 约 2 | 排名与用户量均为历史对话记录 | 小规模样本排在 SEO Copilot 前面 |
| #17 | SEO Meta Checker by BatchPro | 约 4 | 仅在历史排名讨论出现；与附录 A 第 8 款“SEO Meta Checker”的 ID 对应关系未确认 | 不合并为同一竞品，也不补 ID |
| #20 | Meta Tag & SEO Checker | 约 8 | 仅在历史排名讨论出现；不在原 19 款名单中 | 作为排名对照样本，不扩写为第 20 款研究对象 |
| #21 | SEO Copilot | 约 9 | 排名与用户量均为历史对话记录 | 本产品当时位于上述三个样本之后 |

这四条记录说明**当次结果不能只用展示用户量大小解释**。它们没有控制关键词匹配、地区、语言、时间、商店文案等变量，也没有公开排序算法，因此不能判断任何单个因素的权重，更不能推断改功能会提升排名。

### B.2 已记录的其他查询与商店指标

| 查询/指标 | SEO Copilot 历史记录 | 证据局限 |
|---|---:|---|
| `seo title checker` | #27 | 历史对话记录；未留独立结果页 |
| `title tag checker` | 前 30 以外 | 历史对话记录；未留独立结果页 |
| CWS 近 30 天总展示 | 约 356 | 后台指标口径与截图未存档 |
| CWS 近 30 天详情页浏览 | 约 66 | 不与展示或安装直接组成漏斗 |
| CWS 近 30 天安装次数 | 约 293 | 归因与统计窗口待复核 |
| CWS 每周用户 | 约 6 | 与近 30 天数据不同口径 |

当前文档保留的商店标题为 **SEO Copilot – Title & Meta Description Checker**。两组查询进入前 30 只是当次相关性线索；是否修改标题，应在相同设置下观察多次排名与后台指标后单独决策。上述不是美国地区专属排名；GSC 网页搜索量也不能替代 CWS 站内搜索量。

## 附录 C. Quick Metadata 产品取舍与决策记录

### C.1 问题与备选项

问题是：如何让只想读取或复制 Title / Description 的用户更快获得答案，同时保留 SEO Copilot 现有的诊断和 AI 建议价值。历史竞品摘要与第 1 款 CWS 截图提供的是**需求线索**，未提供 SEO Copilot 用户的行为证据。

| 选项 | 可能收益 | 前置条件与成本 | 当前结论 |
|---|---|---|---|
| A. 继续扩充综合 SEO 检查项 | 深入审计更丰富 | 需证明新增项解决高频问题；增加规则、解释与回归工作 | 不作为本轮默认方向；功能数量不等于增长 |
| B. 独立 Quick View / SEO Audit 双标签页 | 两类任务分区清楚 | 需核实导航、扫描时机、状态同步、空状态和现有 Side Panel 布局；改动面可能更大 | 仅作技术比较，不预先批准 |
| C. 现有 Side Panel 中的 Quick Metadata Overview 卡片 | 复用现有入口、可能缩短读取路径 | 必须有无 Warning 时也可取到的原始字段；需确认字符数、复制、加载和重扫行为 | **首选评估的最小候选**，尚未批准开发 |
| D. 暂不开发，先观察 ASO 与用户需求 | 避免无证据的改动，保留当前基线 | 需有固定口径的排名、商店指标与用户路径记录 | 若数据不可复用或风险高，合理选择 |

### C.2 收敛理由与当前决定

1. **发现需求线索。** 多款 Title / Meta 产品以原文、长度和复制为入口；第 1 款历史截图把这些信息放在同一弹窗。此处只能说“值得验证”，不能说已经证明 SEO Copilot 用户需要它。
2. **保留已有差异化。** 历史讨论认为 SEO Copilot 有 SEO Score、Issues、Recommended Actions、Rescan 和按需 AI Fix。概览若实施，应成为获取现状的轻量层，而非替代审计或让 AI 成为基础信息的前置步骤；这些现状仍需代码核对。
3. **控制方案范围。** 相比独立标签页，概览卡片可能更易复用现有 Side Panel；这只是设计估计。是否真正“最小”，取决于扫描结果的数据结构、无 Warning 时的字段保留和现有 UI 组件。
4. **分开产品与增长判断。** 排名快照说明需单独跟踪 ASO，但没有证据把 CWS 排名变化归因于 Quick Metadata。短期内保留当前标题基线。
5. **决定的只是下一步。** 先只读检查现有代码，并比较卡片、独立 Quick View、暂不开发三种方案的改动、权限/请求、测试范围与回归风险。**未批准任何 UI 实施**。

### C.3 评估通过条件与未验证假设

技术评估须回答：扫描结果是否含 Title、Meta Description 原文、URL、字符数；无 Warning 时是否仍可取得；已有 UI 是否展示相同信息；重扫与 AI Fix 如何使用数据；IssueList 是否按 SEO impact 排序；最小卡片与双标签页分别改哪些文件；是否引入权限、后端或 AI 请求；如何保持 SEO Score、Issues、AI Fix、Rescan 正常。若原始字段缺失或只能从 Warning 中推断，卡片的“低成本”假设不成立，应重新估算或暂缓。

仍待验证的产品假设包括：有足够多用户需要快速读取和复制；概览能缩短任务时间且不遮挡审计；它会改善首次使用体验；以及它能影响安装、留存或商店排名。前两项需要用户路径或可用性证据，后两项需要发布后的对照数据；本档案均不能证明。
