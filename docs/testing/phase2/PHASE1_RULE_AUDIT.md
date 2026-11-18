# Phase 1：全链路规则审计（原始交付归档）

本文件归档自 Codex 对话“评估模块复刻竞品能力”中 Phase 1 的原始只读审计回复，用于与 Phase 2 证据逐项对照。未更改原审计结论，也未修改业务代码。原始答复称本阶段只静态核对代码和已有测试，未运行测试。

## 总结

Popup 与 Side Panel 共用页面扫描结果，但不共用问题展示口径。Side Panel 由 21 条规则生成 Issue 并计算 Score；Popup 六模块根据各自信号和筛选规则展示，导航数字还会合并或排除问题。因此两处数字不一致本身不能证明计算错误。竞品算法和真实页面差异留给 Phase 2 验证。

## 矩阵一：数据采集与计算链路

| 环节 | 审计事实 | 代码位置 |
| --- | --- | --- |
| 页面扫描 | 采集标题、描述、H1–H6、图片、Canonical、结构化数据、可见文本；Popup 与 Side Panel 完整扫描共用内容脚本 | `src/content/content.ts` |
| 字数 | 优先取 `body.innerText`；中日韩字符逐字计数，其他文字按词组计数；上限 500,000 字符 | `src/analyzer/scanner.ts` |
| 图片 | DOM 顺序收集 HTTP(S) 图片，排除已知 1×1，最多 1,000 张；未加载图片仍可能进入 alt 检查；数量非网络请求数或去重 URL 数 | `src/analyzer/scanner.ts` |
| 图片指标 | 缺少 alt 指 `alt === null`；空 alt 单独判断；覆盖率分母为可报告图片；`auditableImageCount` 实际等于图片总数，命名易误读；性能规则另看单图 `auditable` | `src/analyzer/pageAnalyzer.ts` |
| 结构化数据 | JSON-LD、Microdata、RDFa；JSON-LD 解析错误单独计数；检测不限预设 Schema 类型，不等于 Google 富结果验证 | `src/analyzer/structuredData.ts` |
| 规则与评分 | 扫描后计算指标、21 条规则及分类分数；URL 扣分归 Technical；类别分数下限为 0，总分为六类之和 | `src/content/content.ts`、`src/scoring/score.ts` |
| 扫描缓存 | 按 Tab、URL、代次存储；导航失效，缓存最长 10 分钟；读取前检查访问权限 | `src/background/background.ts` |

## 矩阵二：Popup 六模块

| 模块 | 展示/检查 | 统一 Issue 关系 |
| --- | --- | --- |
| Content | 快速读取 Metadata；完整扫描后显示字数、Heading 和部分 H1 提示 | 导航混合 Title、Description、部分 Heading；零 Heading 时不计 `HEADING_001`，也不计低字数、低文本比例和层级跳跃 |
| Indexability | Rendered/Raw Canonical、Robots、Sitemap、Hreflang；部分信号来自独立请求 | 可计 URL 与无 Canonical 问题；Robots、Sitemap、Hreflang、noindex 当前不生成统一 Issue |
| Structured data | 展示类型、嵌套属性和 JSON-LD 解析错误 | 仅 JSON-LD 解析失败计 `TECH_003`；不验证富结果资格 |
| Images | 可报告图片、alt；HTTP 状态需手动刷新；缩略图请求与状态请求分离 | 缺 alt、低覆盖率、空 alt 合为一类 badge；性能问题另计；筛选数按行数 |
| Social tags | 固定显示 Not checked / Coming soon | 不采集，不映射 Issue |
| Outgoing links | 固定显示 Coming soon | 不采集，不映射 Issue |

## 矩阵三：Side Panel Audit 的 21 条规则

| Rule ID | 触发条件 | Severity / 分数影响 | 分类 |
| --- | --- | --- | --- |
| TITLE_001 | 无 Title | Critical / −10 | Content SEO |
| TITLE_002 | Title 少于 15 字符 | Warning / −5 | Content SEO |
| TITLE_003 | Title 超过 60 字符 | Warning / −3 | Content SEO |
| TITLE_004 | `head` 内多个 Title | Info / −1 | Content SEO |
| META_001 | 无 Description | Critical / −10 | Content SEO |
| META_002 | Description 少于 100 字符 | Warning / −5 | Content SEO |
| META_003 | Description 超过 160 字符 | Warning / −3 | Content SEO |
| HEADING_001 | 无 H1 | Critical / −8 | Page Structure |
| HEADING_002 | 多个 H1 | Warning / −4 | Page Structure |
| HEADING_003 | Heading 层级跳跃 | Info / 0 | Page Structure |
| HEADING_004 | 有 H1，但首个 Heading 不是 H1 | Warning / −3 | Page Structure |
| IMAGE_001 | 至少一张可报告图片缺少 alt 属性 | Warning / −5 | Images |
| IMAGE_002 | 有图片且 alt 覆盖率低于 50% | Warning / −5 | Images |
| IMAGE_003 | 可审计图片触发大小/像素性能条件 | Info / −3 | Images |
| IMAGE_004 | 至少一张图片有空 alt | Info / 0 | Images |
| URL_001 | URL 超过 100 字符 | Warning / −2 | Technical SEO |
| URL_002 | URL 命中当前结构规则 | Warning / −3 | Technical SEO |
| TECH_001 | 无 Canonical | Warning / −5 | Technical SEO |
| TECH_003 | JSON-LD 解析失败 | Warning / −5 | Technical SEO |
| CONTENT_001 | 字数少于 300 | Warning / −5 | Content SEO |
| CONTENT_002 | 文本比例低于 0.1 | Info / 0 | Content SEO |

四个 Audit 分类由 `src/report/auditCategories.ts` 定义。Score 权重依次为 Title 15、Meta 15、Heading 15、Images 15、Content 15、Technical 25。Phase 1 没有评价或调整阈值。

## 矩阵四：Popup ↔ Side Panel 映射与状态

| 场景 | 当前实现 | 审计结论 |
| --- | --- | --- |
| 内容问题数 | Popup 混合 Title、Meta、部分 Heading；Side Panel 将 Heading、低字数分别放 Page Structure、Content SEO | 分类口径不是一一对应 |
| 图片问题数 | Popup 合并三个 alt 规则；Side Panel 按 Rule ID 计数 | Popup 1、Audit 2+ 可能是既有映射结果 |
| Indexability 数字 | Popup 可能计 URL/Canonical 问题但模块没有逐项列出 URL 详情 | badge 数字不能直接由当前面板行数解释 |
| Structured data | Popup 显示解析错误；Audit 将 `TECH_003` 放 Technical SEO | 同一 Issue 跨模块分类不同 |
| How to fix | 目前只传分类，不传 Rule ID/Issue ID；不定位或展开具体 Issue | 与后续 Phase 4 目标有差距，Phase 1 记为现状 |
| Audit 列表 | 数字来自同一个 `result.issues`；按规则数组顺序显示 | 内部计数一致，未按 Severity 排序 |
| 刷新/Tab/旧结果 | 清理旧报告，按 Tab/URL/代次核对快照 | 有基础的旧页面隔离；尚无具体 Issue 消失后的定位处理 |
| AI Fix | 仅 Title/Description 若干规则提供真实入口 | 其他 Issue 没有同等 AI Fix 入口 |

## Phase 1 问题清单（按审计时结论）

1. Popup 与 Side Panel 的数字、分类含义不同，界面没有解释映射，Indexability badge 也不逐项展示其问题来源。
2. Popup → Side Panel 当前只定位分类，不能用 Issue ID 定位并自动展开；这是原计划 Phase 4 的联动项。
3. 字数、图片数、Canonical/Robots/Sitemap/Hreflang 对 Ahrefs 的差异原因待 Phase 2 实测；不推测竞品算法。
4. `auditableImageCount` 名称与实际范围不符，属命名/可读性风险；代码和测试均按全部可报告图片使用，不能直接称为统计缺陷。
5. Social tags、Outgoing links 明确 Coming soon，不应因竞品差异擅自扩展采集或评分。

## Phase 2 对照索引

Phase 2 确认 Backlinko 两端截图均显示首个标题非 H1 提示，且可见标题顺序为 H3、H3、H2、H1；单独的 Fixture 验证 H2→H1 规则输入。截图不能证明现场 DOM 与 Fixture 序列相同。三组图片 CSV 各有一条 `bat.bing.com/action/0` 额外记录，但是否应过滤尚无产品规则证据；CMLabs 的 Canonical 状态文案和 Sitemap 结果差异原因未证实；noindex 不生成 Issue 与 1.4.0 计划一致。上述事实与“已确认缺陷”区分见 `PHASE2_MATRIX_AND_RESULTS.md` 的分类表。
