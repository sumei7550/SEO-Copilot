# SEO Copilot 1.4.0 P0 + P1-A 实施验证记录

日期：2026-11-12。目标版本为 1.4.0；原型与开发阶段未修改现有版本号。本记录只覆盖本轮已实施的 P0 与 P1-A，不批准发布或启动 P1-B／P1-C。

## 实施范围

- P0：Popup 与 Side Panel 通过 `chrome.storage.session` 共享有限 `SeoResult`；后台以 Tab ID、URL、generation 及页面状态校验读写。相同 URL 刷新进入 `loading` 时立即失效；旧 generation 写入被拒绝；Tab 关闭清理。单快照 JSON 上限 1 MB，会话预算 8 MB，10 分钟过期，写入失败或快照缺失时由现有内容脚本按需扫描。读取快照前再次验证页面访问权限。不保存原始 HTML、正文全文或 AI 请求。
- 首次安装不再自动打开 Welcome；`welcome.html` 仍在构建产物中。
- P1-A：Popup 六入口、Content 的 Metadata／Word Count／Headings／全量 TSV Copy、Canonical、JSON-LD 块数／解析错误／去重类型、图片 URL／Alt／自然尺寸及逐项复制。Social／Links 及暂缓工具只显示未检查／Coming soon。
- Side Panel 保留 Audit、Score、Grade、Severity、四大问题分类、Issues、Recommended Actions、原有 AI Fix 范围和 Rescan；移除 Content Analysis 视图。分类筛选不参与评分。
- 扫描器只新增 `jsonLdBlockCount` 标量；没有改动 SEO Score 算法、既有规则权重或 AI Fix 可用 Issue 范围。Word Count 文案与现有 `CONTENT_001` 规则一致。Popup 全部已采集图片与 Audit 可审查子集分别标示。

## 自动化结果

| 检查 | 结果 | 说明 |
|---|---|---|
| `npm test` | 通过 | 30 个测试文件、149 项测试。根目录脚本排除网站子项目测试；网站有独立 Vitest 配置。 |
| `npm run build` | 通过 | TypeScript、Popup／Side Panel／content script 构建及 MV3 产物验证通过，构建版本仍为 1.3.1。 |
| 1000 张图片会话快照 | 通过 | 正式后台协调层单测写入／读取 1000 条图片，低于 1 MB 单快照限制；超限、配额写入失败、TTL、Tab 关闭和旧代次均有断言。独立 PoC 的浏览器性能结果见 [P0 报告](SEO_COPILOT_1.4.0_P0_SESSION_STORAGE_POC.md)。 |
| `git diff --check` | 通过 | 仅有工作区既有文件的 CRLF 提示，无空白错误。 |

## Chrome 构建产物检查

Chrome for Testing 157.0.8103.78，隔离 Profile。本机 HTTP fixture 与测试专用构建副本一起使用；副本只为本机 fixture 增加 `http://127.0.0.1/*` 站点权限，仓库 Manifest 未因此增加权限。测试脚本为 `tmp/p1a-chrome-check.mjs`。

- 已观察到六入口切换、现有 Metadata、11 条标题默认展示 8 条、Canonical、Schema、Images、Social／Links 占位；切换工具未触发独立 Audit。
- 原生 Side Panel 显示 Score、四大分类和空问题态；Rescan 后恢复报告；同 URL 的另一个 Tab 不读取原 Tab 的 Score；切回原 Tab 可恢复有效快照；同 URL 刷新及跨域导航后不再显示旧 Score。
- 340／400／520px 的 Popup 和 Side Panel 均未产生页面级水平溢出。1000 张图片 fixture 可在 Popup Images 列表中渲染 1000 项。短 Title fixture 曾显示原有 `TITLE_002` Warning、95 分与“Improve with AI”入口；自动化在跨域后的快速连续导航中该入口检查有一次未完成，需在手工验收复核。未触发 AI 后端生成调用。
- Side Panel 截图为实际扩展面板：[520px](../screenshots/seo-copilot-1.4.0-sidepanel-prod-520.png)。Popup 的 [520px](../screenshots/seo-copilot-1.4.0-popup-dom-520.png)、[400px](../screenshots/seo-copilot-1.4.0-popup-dom-400.png)、[340px](../screenshots/seo-copilot-1.4.0-popup-dom-340.png) 图是实际扩展 DOM 与 CSS 的视觉快照，**不是浏览器工具栏原生 Popup 截图**。

## 尚未完成的正式 Chrome 验收

1. **Extension Reload 生命周期。**在 `chrome://extensions` 点击测试扩展 Reload 后，Chrome for Testing 命令行加载的扩展页面变为 `chrome-error://chromewebdata/`，因此无法读取重载后的 `storage.session` 并完成 Chrome 专属断言。获得用户确认后又启动了隔离 Chrome Profile，尝试通过界面正常加载未打包扩展；Windows 界面控制在绑定该 Chrome for Testing 窗口时返回 `window id ... no longer belongs to Chrome; current owner is Chrome`，未能进入加载步骤。已关闭该隔离进程，未触及日常 Chrome Profile。独立 PoC 已在 Edge 完成 Reload 清空验证，Chrome for Testing 已验证浏览器重启清空。正式 Chrome 通过“加载已解压的扩展程序”安装构建后，仍需人工复核 Reload 清空及重开恢复扫描。
2. **原生工具栏 Popup 与权限对话框。**本轮自动化主要通过扩展文档 Tab 操作 Popup，尚需在正式 Chrome 原生工具栏 Popup 中检查尺寸、关闭重开、跨域授权接受／拒绝、受限页面、长内容和复制反馈。跨域旧 Score 隔离已实测；授权请求路径有单元测试。
3. **AI 后端。**本轮只验证现有支持范围的入口和组件测试；未消耗真实后端额度，也未验收生成响应。

结论：P0 与 P1-A 代码和自动化门槛已完成；上述真实 Chrome 手工项目仍是 1.4.0 发布验收的剩余条件。没有修改版本号、提交、推送或部署。

## 2026-11-12 原生 Popup 尺寸返修

人工截图显示工具栏 Popup 收缩为窄条，原生 Popup 验收记为**失败，待复测**。入口页面原先以 `min(520px, 100vw)` 和 `min(630px, 100vh)` 为自身定宽高；Chrome 在按内容确定初始 Popup 视口时，这一视口依赖可能使文档尺寸塌缩。已将仅用于 Popup 的 HTML／CSS 改为明确的 520×600 尺寸，未改 Side Panel 或功能逻辑。单 worker 执行的 149 项测试和生产构建通过；首次默认并行测试因本机 Node worker 内存不足中断，不作为功能失败或通过证据。新构建的 `dist/index.html` SHA-256 为 `C9C7F9BA3446927FB19D44FB9B976A5ED0F3A81034AD9AF102154FF5E783A17F`，`dist/assets/styles.css` 为 `5EDF4A872ADE32F218B2E091DDA2A1259D146413F83FEE1850ED5F8CF7A687B3`。**尚未取得正式 Chrome 原生 Popup 的修复后截图，不标为通过。**

## 2026-11-12 Word Count 人工对比差异

用户在 Thunderbit 页面提供的截图显示：[Ahrefs 2,473 words](../screenshots/seo-copilot-1.4.0-word-count-ahrefs.png)，[SEO Copilot 2,380 words](../screenshots/seo-copilot-1.4.0-word-count-popup.png)，相差 **93**（约为 Ahrefs 数值的 3.8%）。两份 Copy Headings 粘贴结果均为 63 条且无可见差异；标题一致不能证明整页正文词数一致。

**当前源码事实：**`scanner.ts` 从 `body` 的克隆中删除 script／style／noscript／template／`[hidden]`／`[aria-hidden="true"]`，取 `textContent` 并按 Unicode 字母／数字段及逐个 CJK 字符计数。`textContent` 不插入块元素间的布局分隔符；最小复现 `<div>Alpha</div><div>Beta</div>` 得到 `AlphaBeta`，按当前非 CJK 规则是 1 词。这是可能低估的具体机制，但**不能据此证明截图中恰好少了 93 词**；Ahrefs 的正文提取／分词规则和两次截图的 DOM 时点尚未核实。

**验收状态：待核查。**现有产品文案写“Visible page text estimate”，而 1.4.0 实施计划将“新字数算法”列为暂缓，`CONTENT_001` 又直接使用此值。当前不凭竞品单页差异擅自更改扫描算法或评分输入；需要在同一页面、同一时点比较可见正文提取与分词后，再决定是否单独批准口径修正。

## 2026-11-12 Images 长 URL 布局调整

根据用户提供的 Ahrefs Images 对比截图，Popup 图片明细调整为紧凑的 Image 编号、Alt、URL 摘要、自然尺寸和逐项复制。HTTP(S) URL 展示域名与路径，查询参数／片段仅以省略标记表示；两行之后视觉截断，复制仍使用完整原始 URL。零自然尺寸显示“Natural size unavailable”，不推断图片损坏。复制失败时提供完整 URL 文本供手动复制。图片数量、无 Alt／空 Alt 口径、Audit 可审查子集和暂缓的筛选／刷新／CSV／状态检测均未改变；未加载远程缩略图。

定向 `PopupToolViews.test.tsx` **7/7 通过**，`npm run build` 通过。正式 Chrome 原生 Popup 的紧凑布局与长 URL 截图仍待人工复核；此前的原生 Popup 验收失败状态未由构建结果自动改为通过。
