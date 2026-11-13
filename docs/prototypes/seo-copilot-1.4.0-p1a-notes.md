# SEO Copilot 1.4.0 · Side Panel 审计原型说明

[打开 Side Panel 交互原型](seo-copilot-1.4.0-p1a.html) · [查看已通过的 Popup 工具原型](seo-copilot-1.4.0-popup-tools.html)

两份文件均为独立 HTML 样例原型，不读取当前网页、不请求 Chrome 权限，也不运行正式扫描或 AI。本轮仅调整第二阶段 Side Panel 原型与本说明；Popup 原型保持第一阶段已通过状态。两份原型一起等待统一审核，随后才进入共享数据与扫描流程的技术整合评估。本轮不修改正式业务代码、版本号或发布说明。

## 设计决策与职责

| 界面 | 用户任务 | 保留或展示 |
|---|---|---|
| Popup | 快速查看页面数据，做基础检查与复制 | 左侧六个工具入口；Content 中的 Metadata、Word Count、H1/H2/H3、Copy Headings；其他工具中已有的扫描数据与明确标记的待开发字段；Open SEO Audit |
| Side Panel | 阅读 SEO 诊断并定位优先处理的问题 | SEO Score、Grade、Critical / Warning / Info、四大 Audit Categories、Issue Details、Impact、Recommended Actions、AI Fix、Rescan |
| 两者关系 | 从页面事实进入问题处理 | Popup 是页面数据工具入口；Side Panel 是完整审计入口。原型尚未定义共享数据结构、状态同步或跨 Tab 扫描实现 |

Side Panel 原型已移除 **Audit / Content Analysis 双 Tab**、Word Count、Headings 与 Copy Headings。此前 P1-A 将内容分析放在 Side Panel 的方案，由后续已通过的 Popup 工具方案取代。保留 Content SEO 作为**审计问题分类**；Popup 的 Content 是**页面数据工具**，两者含义不同。原型继续采用现有深蓝评分卡、白色问题卡和紫色操作语言，不引入新组件库或额外导航。

## 审计数据与交互

- 顶部评分卡保留 SEO Score、Grade 和问题总数。四大分类卡片按 2×2 排列：Content SEO、Page Structure、Technical SEO、Images。分类数字仅统计实际 Issue 数，不生成分类分数，不改变 SEO Score、评分权重或七种底层 Rule Category。
- 展示层映射为：Content SEO = title/meta/content；Page Structure = heading；Technical SEO = technical/url；Images = images。
- Critical、Warning、Info 由**完整 Issue 列表**统计。选择分类仅过滤可见 Issue 卡片并滚至问题列表；不修改评分、严重度总数、原始 Issue 数据或顺序。Show all issues 恢复完整列表。
- 零问题类别显示“此分类无问题”和返回完整列表的操作；整页无问题时四类均为 0，保留可再次扫描的空状态，不显示已移出的内容分析入口。
- 每条问题保留 Severity、分值影响、Current（若有）、Impact 和 Recommended Action。Title / Meta Description 的样例 Issue 保留 Improve with AI、候选选择、复制和 Generate another 的原型交互。AI 文案为样例，不调用真实模型。
- Scan current page / Re-scan page 在独立原型中模拟扫描到报告；正式产品沿用现有首次扫描、Rescan、权限与 AI Fix 流程。原型分数只是样例数字，不代表评分算法调整。

## 状态覆盖

| Scenario | 验收重点 |
|---|---|
| Report · mixed issues | 评分、Grade、Severity、四类计数与筛选、Issue 详情、AI Fix、Rescan |
| Report · category empty | 整页有问题，但 Page Structure、Technical SEO、Images 为 0；选择零问题类别后可恢复完整列表，评分与 Severity 总数不变 |
| Report · no issues | 四类和 Severity 均为 0；无 Issue 空态；仍可 Rescan |
| 选择零问题类别 | 分类高亮，列表空态，Show all issues 可恢复原始顺序 |
| Ready to scan | 主动扫描入口，不预先显示旧结果 |
| Scanning | 仅显示扫描反馈，不显示过期报告 |
| Permission needed | 原因与重试入口 |
| Scan failed | 错误与重试入口，不显示过期结果 |
| Unsupported page | 明确说明打开普通网页，不提供无效扫描操作 |
| AI Fix 原型 | 展开、选择候选、再次生成样例、复制反馈 |

在原型左侧控制区切换 Scenario 和 340 / 400 / 520px 宽度。宽标题、Issue 文本和操作文案允许换行；340px 仍保持 2×2 分类卡片。控制区不是产品界面的一部分。

## 本轮检查与统一审核

本轮移除了 Content Analysis 专用样例数据、状态、样式和复制事件，保留审计分类与 AI Fix 的原型交互。DOM 检查通过：默认六条 Issue 与四类卡片、Technical SEO 过滤及 Show all issues、AI 候选展示；在 Report · category empty 中选择零问题类别并恢复完整列表；筛选前后 Score 和 Critical / Warning / Info 总数不变；整页无问题、待扫描、扫描中、权限不足、失败、受限页面状态，以及 340 / 400 / 520px 宽度切换均正常渲染。此检查不等同于浏览器视觉验收。

原有 [400px Audit 截图](../screenshots/seo-copilot-1.4.0-p1a-report.png) 与 [520px 分类高亮和 AI Fix 截图](../screenshots/seo-copilot-1.4.0-p1a-report-520.png) 属于**旧双视图原型的历史截图**，不能作为本轮改版后的视觉验收依据。当前原型需与已通过的 Popup 原型一起审核：Popup 中查看页面事实，Side Panel 中处理审计问题。浏览器视觉截图如未重新生成，不应宣称已验收当前版式。
