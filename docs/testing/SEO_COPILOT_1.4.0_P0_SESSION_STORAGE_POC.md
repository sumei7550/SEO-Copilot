# SEO Copilot 1.4.0 P0：Popup／Side Panel 会话快照技术验证

日期：2026-11-12。此报告只验证跨扩展界面共享扫描结果的机制，**不是 1.4.0 功能验收**。未修改业务代码、Manifest、版本号或已审核原型。

## 结论

`chrome.storage.session` 可作为 Popup 与 Side Panel 的共享快照通道。Chrome for Testing 和 Edge 的独立 MV3 测试扩展均验证了关闭 Popup 文档后从**原生 Side Panel**读取同一快照、同 URL 跨 Tab 隔离、同 URL 刷新失效、旧代次写入被拒绝，以及浏览器重启后清空。Edge 还验证了扩展 `runtime.reload()` 后清空。建议在 1.4.0 正式接入时采用会话存储，键与读写校验均包含 **tabId + URL + generation**，并保留缺失／超限时从唯一内容脚本按需重扫的路径。

Chrome for Testing 的命令行加载扩展在调用 `runtime.reload()` 后未恢复扩展页面，无法在该测试方式下完成 Chrome 专属 Reload 断言；此项由 Edge 实测与 [Chrome Storage API 官方文档](https://developer.chrome.com/docs/extensions/reference/api/storage)的生命周期规定共同支持，但仍应在正式构建的真实 Chrome 手工验收中复核。当前 PoC 没有证明生产扫描、权限判断、UI 首屏和大规模多 Tab 的整体性能。

## 环境与方法

- Chrome for Testing 157.0.8103.78（官方 ZIP，隔离 Profile）；Microsoft Edge 157.0.4341.42（隔离 Profile）。本机正式版 Chrome 155 未通过命令行参数加载测试扩展，故未用于自动化断言。
- 测试扩展为独立 MV3，权限仅 `storage`、`tabs`、`sidePanel`；`popup.html` 作为扩展文档打开，写入后关闭该文档目标；通过 `chrome.sidePanel.open({tabId})` 打开并连接原生 `panel.html` 目标。测试页为本机 `127.0.0.1`。没有调用正式 SEO Copilot 的扫描代码或远程 API。
- 快照使用与当前 `SeoResult` 相同的主要字段形状，合成 1000 条图片记录，包含 URL、Alt、可审查标记和尺寸。它测量会话存储的序列化、写入、读取及跨界面传输成本，**不代表真实页面扫描或图片下载时间**。
- 测试后台为同一 Tab 的事件和读写建立顺序队列。`tabs.onUpdated` 进入 `loading` 时递增 generation 并清除快照；读写前重查 Tab URL、加载状态和 generation。该队列是 PoC 实现，正式代码仍需审查并发、重复 loading、SPA 与权限边界。
- 可复现脚本：[p0-session-poc.mjs](../../tmp/p0-session-poc.mjs)。运行时在系统临时目录生成测试扩展和 Profile；未向项目业务目录写入测试扩展。

## 断言结果

| 断言 | Chrome for Testing | Edge | 证据口径 |
|---|---|---|---|
| Popup 文档写入 1000 张图片的快照，关闭后原生 Side Panel 读取 | 通过 | 通过 | Side Panel 读到同一 `SeoResult`，图片 1000 条，Score 95。 |
| Tab B 与 Tab A 使用同一 URL 时隔离 | 通过 | 通过 | Tab B 无 Tab A 快照；Tab A 关闭后其条目清理。 |
| Tab A 同 URL 刷新使旧结果失效 | 通过 | 通过 | 观察到 `loading` 后 generation 增加，旧快照无法读取。 |
| 旧异步结果不能覆盖新结果 | 通过 | 通过 | 旧 generation 写入返回 `stale-generation`；新代次 Score 92 写入后，旧 Score 95 再写仍被拒绝，读回保持 92。 |
| 扩展 Reload 清空 `storage.session` | 测试环境未完成 | 通过 | Edge 调用 `runtime.reload()` 后新扩展页面读不到原快照；Chrome for Testing 的命令行加载方式未恢复扩展页面。 |
| 浏览器重启清空 `storage.session` | 通过 | 通过 | 使用相同 Profile 重启，`getBytesInUse(null) === 0`。 |

测试脚本执行了 15 轮 1000 张图片快照的写入／读取。以下耗时是此机器上的 CDP 调用端到端计时，包含测试协议和大对象传输，不等于 Chrome API 的纯内部耗时，也不能直接当作生产 UI 延迟预算。

| 浏览器 | JSON 快照大小 | `storage.session` 占用 | 写入中位／P95 | 读取中位／P95 |
|---|---:|---:|---:|---:|
| Chrome for Testing | 254,932 B | 684,448 B | 32.2 / 45.5 ms | 32.3 / 37.3 ms |
| Edge | 254,932 B | 684,448 B | 42.0 / 116.1 ms | 34.4 / 93.4 ms |

上述是各浏览器最后一次并行重跑的样本，系统竞争可能影响 P95；此次没有发生配额错误。单页约 684 KB 的存储占用意味着多 Tab 必须设置容量上限和过期清理，不能无限保留。Chrome 官方文档规定 `storage.session` 是内存存储，扩展停用、重载、更新和浏览器重启时清除，且默认不向内容脚本开放；[API 文档](https://developer.chrome.com/docs/extensions/reference/api/storage)列出的当前总限额为 10 MB。

## 正式接入条件

1. 只缓存展示与 Audit 所需的有限 `SeoResult`；不存 Raw HTML、页面正文全文、AI 请求内容或永久历史。对大载荷、配额错误和超时采用按需重扫，不能截断结果后继续显示完整报告。
2. 读时重新检查当前 Tab、URL、generation、页面状态与站点权限；未经授权不显示缓存。Popup 关闭、Side Panel 打开和 Rescan 都使用同一采集链及同一规则。
3. 在 `tabs.onUpdated` 首次 `loading`、URL 变化和 Tab 关闭时失效或清理；处理旧请求晚到、重复 `loading`、service worker 重启、SPA URL 变化和多 Tab 容量回收。正式代码须确定有界容量与过期时间。
4. 正式构建验收仍需在实际 Chrome 中复核扩展 Reload、Popup 工具栏真实交互、权限拒绝／授予、Quick Metadata 首屏、1000 图片渲染和多 Tab 压力。PoC 的合成数据只证明共享存储机制可行。

**决策：**P0 机制选用 `chrome.storage.session`，按需重扫作为快照缺失或不可用时的回退。该决策不批准 P1-B、P1-C 或任何新 SEO 功能。
