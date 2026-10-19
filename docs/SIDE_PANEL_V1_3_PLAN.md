# SEO Copilot v1.3.0 Side Panel 方案与验证

状态：主界面方案已确定；当前源码仍使用正式版本号 `1.2.0`，本阶段仅作开发提交，尚未发布为 v1.3.0。

## 最终架构

- 浏览器工具栏按钮打开 Side Panel，不再打开 Popup。`index.html` 只保留为本地开发预览入口，不在 Manifest 中声明为 Popup。
- Side Panel 中用户主动点击 Scan 才读取和分析当前网页；不自动扫描。
- 必需权限：`activeTab`、`tabs`、`scripting`、`storage`、`sidePanel`。`tabs` 提供当前 Tab 的 ID、URL 和切换/导航/关闭事件，用于定位页面与隔离扫描；站点内容访问仍由用户批准的可选权限控制。
- 可选站点权限：`http://*/*`、`https://*/*`。按当前页面的 origin pattern（如 `https://example.com/*`）检查和请求。没有必需的 `<all_urls>` 或 `webNavigation`。
- 现有固定的后端与 Mixpanel host permissions 保持不变；不是全站网页访问权限。

## 授权与扫描

新站点：Scan → 在同一用户点击手势内调用 `chrome.permissions.request()` → Allow 后自动继续扫描并显示 Report；Reject 后显示 Permission required，Try again 可重新请求。已授权站点直接扫描，不需要再次点击工具栏或 Scan。旧 `addHostAccessRequest()`、`permissions.onAdded` 等待续扫和 45 秒授权等待已移除。

## Per-Tab 状态规则

每个 Tab 独立保存 `idle`、`scanning`、`report`、`error` 四态及 URL。每次扫描生成新的 `scanId`，异步结果只更新匹配的 `tabId + URL + scanId`；不同 Tab 的完成顺序不会串结果。Re-scan 生成新尝试，完成后覆盖本 Tab 的旧报告。切换 Tab 仅改变当前显示，其他 Tab 的扫描继续进行。

同 Tab 的 URL 改变（包括 SPA/站内导航）会使该 Tab 回到 Idle；URL 不变的刷新保留已有 Report、不自动重扫。扫描中刷新若使扫描失败，会进入 Error；扫描执行设有 30 秒超时，避免永久停在 Scanning。关闭 Tab 仅移除该 Tab 的状态。DOM 改变但 URL 不变时不自动失效或扫描。AI Fix 的展开等临时 UI 状态不在缓存范围。

## Chrome 手工验证（用户报告）

| 场景 | 状态 |
|---|---|
| 新站点 Scan 直接弹站点权限 | PASS |
| Allow 后自动续扫并进入 Report | PASS |
| Reject 后进入 Permission required | PASS |
| Try again 重新请求权限 | PASS |
| 同 origin 后续页面无需重复授权 | PASS |
| 跨 origin 再次请求权限 | PASS |
| 已扫描 Tab 切换后恢复 Report | PASS |
| 多个已完成扫描的 Tab 结果不串 | PASS |
| 同 Tab URL 改变回 Idle | PASS |
| 同 URL 刷新保留 Report | PASS |
| SPA/站内导航 URL 改变回 Idle | PASS |
| `chrome://` 等受限页面显示 unsupported error | PASS |
| 不需要重新点击工具栏图标 | PASS |
| Scanning 中切换 Tab 再切回 | NOT MANUALLY TESTED；`tabId + scanId` 状态测试已覆盖，不作为当前提交 blocker |
| 多 Tab 扫描同时进行且完成顺序交错 | NOT MANUALLY TESTED；状态测试已覆盖 |

上述 PASS 来自用户完成的真实 Chrome 手测，本文件不将自动化测试冒充手工结果。手工测试主要覆盖已完成 Report 的多 Tab 切换；进行中的扫描切换仍可在后续回归补测。

## 下一步与提交边界

本阶段完成代码收口、文档、测试与开发提交，不升级版本号、不推送或部署。下一阶段是 Welcome / Onboarding。Pricing、Payment、License、SEO History、Batch Scan、新 SEO Rule 和新 AI 功能均不属于此方案。
