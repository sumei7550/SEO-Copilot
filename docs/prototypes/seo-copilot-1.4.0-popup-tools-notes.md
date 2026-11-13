# SEO Copilot 1.4.0 · Popup 工具导航原型说明

[打开独立 HTML 原型](seo-copilot-1.4.0-popup-tools.html)。本轮仅完成 **第一阶段 Popup 原型**；原型使用样例数据，不读取当前页面、不申请 Chrome 权限、不触发正式扫描或 Side Panel。**当前正式 Popup 仍为 Quick Metadata + Open SEO Audit**。Side Panel 原型、技术整合及正式开发留待后续阶段，本轮没有修改业务代码或版本号。

## 项目认知与设计取舍

| 项目 | 设计结论 |
|---|---|
| 用户与任务 | 站长、编辑或营销人员打开 Popup，快速查看当前页数据，必要时进入完整审计 |
| 入口与首个决定 | 打开 Popup 后默认 Content；左栏顶部显示品牌 Logo、SEO Copilot 和 `?` 帮助，其下选择工具；右侧查看当前工具的数据 |
| 保留 | Title、Meta Description、URL 原文及复制；Title/Description 字符数；正常绿色、异常黄色；Open SEO Audit |
| 恢复路径 | 数据缺失显示 Not found；扫描失败说明重载后重试；缺少权限给出原因；复制失败明确反馈 |
| 产品气质 | 参考 Ahrefs 的左侧文字导航，沿用 SEO Copilot 的白色卡片、深蓝文字与紫色主要操作 |
| 主要风险 | 340px 宽度压缩 Metadata 工具行、长 URL 溢出、把完整扫描器的数据误写成 Popup 已实现、导航切换引发重复审计 |

**520px 是主设计基准**。参照用户提供的 Ahrefs 截图，原型采用 **左栏顶部品牌/帮助 + 下方工具导航，右栏固定顶栏与独立滚动内容 + 底部 Open SEO Audit**；不再设置横跨两栏的品牌栏。品牌图标使用项目现有 `public/icons/icon48.png` 的原始字节，并嵌入独立 HTML 原型，避免 `file://` 与本地服务预览时相对路径不同而显示异常；项目图标文件本身未改。帮助按钮位于左栏页眉右侧。右栏顶栏左侧是当前工具名，右侧保留操作容器，目前仅放页面状态；不展示尚未批准或尚未实现的 Upgrade、Inspect、Watch 等按钮。后续若增加操作，优先复用该容器；340px 下需控制数量，更多操作应另行评估收纳方式。另保留 400px 和 340px 检查档。点击六个工具仅切换 Popup 内部视图；Open SEO Audit 仍是唯一通往 Side Panel 的入口。当前 Popup 的 Title/Description 长度口径保持 `title 30–60`、`metaDescription 70–160`，原型字符数由原文长度计算，正常为绿、超出建议范围为黄；不修改正式阈值或颜色规则。

## 数据与功能边界

| 工具 | 数据与基础提示 | 原型操作 / 待开发 | 当前源码证据与上线状态 |
|---|---|---|---|
| Content | Title、Meta Description、URL 原文；字符数绿/黄提示与缺失提示；Word Count 可见文本估算；H1/H2/H3 原顺序、H1 数量提示 | 复制 Metadata/URL；标题前 8 条展开收起；Copy Headings 复制全部纯文本 TSV | Title/Description/URL、字符数和复制**已在 Popup**。Word Count、Headings 在完整扫描器；Copy Headings 在 Side Panel P1-A 开发工作区中，尚未接入 Popup |
| Indexability | 按 Canonical URL、Robots、Sitemaps、Hreflangs 分组；仅当前页面 live DOM 的 Canonical 显示找到/缺失及检查提示，其他信号逐项显示“Not checked” | 复制 Canonical；Robots Meta、Robots.txt、X-Robots-Tag HTTP、Sitemap、Hreflang 标为 Coming soon | Canonical 在完整扫描结果；Raw HTML Canonical 与其他字段未采集或需额外请求，不能把未检查解释为正常 |
| Structured Data | JSON-LD 检测、JSON 解析错误数量；已采集的 Schema 类型单独逐行展示；明确“无解析错误不等于富结果验证通过” | 复制 Schema 类型；Schema Details、Google Rich Results Test、Schema Markup Validator 标为 Coming soon | 扫描器已有类型与无效 JSON-LD 块数量；嵌套属性详情和外部验证未实现 |
| Images | 图片数、URL、Alt Text、自然尺寸；区分无 Alt 属性与空 Alt；提示人工判断图片是否需要替代文本 | 逐项复制图片 URL；Alt 筛选、独立 Refresh、CSV Export 标为 Coming soon | 扫描器已有基础图片数组和数量；Popup 展示及后续工具未实现。尺寸不代表 HTTP 成功状态 |
| Social | Open Graph 和 X (Twitter) Card 分组列出主要字段，逐项显示 Not checked；不展示虚构结果或“检查通过” | Coming soon，无可执行数据操作 | 当前无对应采集数据；Not checked 不等于 Missing 或 incomplete |
| Links | 不展示虚构结果或“检查通过”；Internal/External、Dofollow/Nofollow、UGC/Sponsored 均显示未检查 | Coming soon，无可执行数据操作 | 当前无链接采集数据 |

原型右侧的 “Scan data” 仅表明**现有完整扫描器有该字段**，不表示当前 Popup 已能即时读取它。正式实现需要决定如何在 Popup 内按需获得这些数据，并复用已确认的权限和每 Tab 隔离逻辑；**切换导航不得自动触发完整 SEO Audit**。Robots.txt、Sitemap 等未来功能可能需要网络请求与权限评估，本轮不批准开发。

## 交互与状态

1. 默认选中 Content；左侧使用选中底色与左侧紫色标线。切换同步更新右侧固定顶栏的工具名和下方内容，不打开 Side Panel，也不重新触发完整 SEO Audit。左栏顶部 `?` 打开简短帮助浮层；再次点击 `?`、点击浮层外部或按 Esc 可关闭。
2. Content 保留 Metadata 原文、字符数和复制图标。长文本可 Show more / Show less；长度异常只复用现有 30–60/70–160 建议范围。Word Count 是可见文本估算，不是 SEO Score 优化目标。Heading 按 DOM 顺序平铺，保留 H1/H2/H3 Badge；超过 8 条可展开或收起，复制始终使用全部标题，格式为 `级别 + 真正的 Tab + 文本` 的纯文本 TSV。
3. Canonical 缺失、JSON-LD 解析错误、缺少 Alt 属性可以给出基础提示；“找到”或“0 个解析错误”不代表搜索引擎验证通过。空 Alt 可能用于装饰图片，不自动当成错误。尚未采集的字段显示 Coming soon / Not checked。
   - Indexability 参考用户提供的 Ahrefs 截图，按 Canonical URL、Robots、Sitemaps、Hreflangs 分组。只展示现有 live DOM Canonical；不伪造 Raw HTML Canonical。Robots Meta、Robots.txt、X-Robots-Tag HTTP、Sitemap 和 Hreflang 逐项标为 Not checked。
   - Structured Data 参考截图的类型列表，但仅逐行列出扫描器采集到的 Schema 类型和解析错误数量；没有原始 JSON-LD 属性树，不提供伪造的详情展开。解析失败时类型未知，不把它写成“无 Schema”。
   - Social 参考截图拆分 Open Graph 与 X (Twitter) Card，并列出预期字段；全部标为 Not checked。没有采集结果前，不显示 Missing、incomplete、图片预览或通过状态。
4. Canonical、Schema 类型和图片 URL 提供原型复制操作；Social、Links 没有真实数据，保持无结果、无虚假操作。
   - Images 参考用户提供的 Ahrefs 截图：第二张卡片不设独立的 Image details 标题行；Alt text、Status 筛选器、刷新图标和 Export CSV 操作栏作为卡片首行。操作栏下方用细分隔线分隔列表，列表列头为 `Image details / Status`，采用紧凑纵向行布局。不显示 `8 of 8` 数量角标或 Image 1/2/3 序号；空 alt 文案简化为 `Empty`，图片 URL 以可换行的超链接呈现，状态未检查时显示 `—`。这轮只更新原型表现，不代表新增正式功能或改变扫描逻辑。
5. Open SEO Audit 固定在底部，不随右侧长内容滚走。原型按钮只给出说明；正式产品应沿用现有 Popup → Side Panel 行为。
6. 控制区可切换 Sample page、Length warning、Issues found、Data missing、Scanning、Scan failed、Access needed。Issues found 演示多个 H1、缺失 Canonical 和 JSON-LD 解析错误；扫描中和失败时隐藏旧结果。失败提供 Try again，权限不足提供 Allow access；它们在原型中仅模拟恢复，不调用浏览器 API。缺失状态把未知扫描数据写为 Not available，不用 `0` 伪装已检查。

Images 视觉微调：图片 URL 使用 11px、常规字重和较柔和的紫色（`#6861a6`），保留完整文本、自然换行及超链接。缩略图统一为 36 × 36px；图片行上下 Padding 从各 8px 减至各 6px，以提高单屏信息密度。此调整仅应用于 HTML 原型。

### 帮助入口

- 气泡正文固定为：`Choose a tool to inspect this page. Open SEO Audit for prioritized issues.`
- 底部 `View guide` 在新标签页打开[官网 Features 操作流程](https://seo-copilot-website.vercel.app/features/#feature-workflow)，使用 `noopener noreferrer`。源码中的该页面包含操作步骤和专题指南入口，且页面 URL 已返回 HTTP 200；目前官网尚无独立 `/guide/` 路由，因此原型不指向不存在的页面。
- 气泡再次点 `?`、点击外部或按 Esc 关闭；点击气泡内部不会误关闭。导航切换会关闭气泡。此处仅为原型交互，正式 Popup 仍待审核后实施。

## 宽度与验收检查

| 宽度 | 布局约束 | 重点检查 |
|---|---|---|
| **520px 主基准** | 左栏 126px，Logo/品牌名与帮助同一行；右栏固定顶栏左标题、右操作容器，内容独立滚动；底部 CTA 固定 | 两栏顶线对齐、操作容器不挤压标题、六模块信息密度与长图片 URL |
| 400px | 左栏 112px；右栏 `minmax(0,1fr)` | Metadata 与 Word Count/Headings 层级清楚，无横向滚动 |
| 340px | 左栏 104px；Logo 与品牌文字可紧凑换行；右顶栏缩小状态区预留宽度；由 Popup 容器查询触发 Metadata 标签与操作分行 | `?` 仍可点击，Structured Data 标题可换行，状态与标题不重叠，长 URL 和标题自然换行、底部按钮可见 |

已做 HTML 脚本语法与 DOM 交互检查：左栏品牌图标、名称和帮助按钮位置；帮助开关、外部点击与 Esc 关闭、`View guide` 目标；右栏固定顶栏的工具名、操作容器与页面状态；工具切换时顶栏及内容同步；六个导航入口；520px 默认宽度；绿/黄字符数；六模块状态与 Coming soon；Copy Headings 全量 TSV；Canonical/Schema 类型/图片 URL 复制；复制失败回退；缺失/扫描中/失败/权限状态、恢复按钮及三档宽度切换通过。Issues found 另覆盖 Canonical 缺失、JSON-LD 解析错误和多个 H1 的提示。本轮增加了 Indexability 分组、Structured Data 类型逐项展示及 Social 未检查字段检查。**浏览器视觉截图仍未验收**：此前浏览器安全策略阻止本地 `file://` 原型，故没有生成或伪造 340/400/520px 截图。实际版式和滚动表现需在允许访问本地原型的预览环境中复核。第一阶段原型等待审核，不提前修改 Side Panel 或业务代码。
