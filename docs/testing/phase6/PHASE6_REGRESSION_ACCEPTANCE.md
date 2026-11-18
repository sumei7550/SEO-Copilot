# SEO Copilot 1.4.0 — Phase 6 回归验收记录

日期：2026-11-17（北京时间）
结论：**自动化回归通过；完整浏览器验收证据不足，Phase 6 暂不能签核通过。**

## 本次构建与工作区

- 在现有未提交的 Phase 3、4、5 工作区上执行；未清理、覆盖或提交这些更改。
- `npm test`：37 个测试文件、259 个用例通过。
- `npm run build`：TypeScript、两个 Vite 构建和扩展产物校验通过。构建脚本报告的 Manifest 版本仍为 `1.3.1`；本轮未修改版本号。
- `git diff --check`：退出码 0；仅提示部分文件未来可能由 LF 转为 CRLF，没有空白错误。

## 验收矩阵

| 范围 | 自动化证据 | 真实 Chrome 操作 | 本轮判定 |
| --- | --- | --- | --- |
| Popup 六模块 | `PopupApp.test.tsx`、`PopupToolViews.test.tsx` 覆盖六个入口、主要内容、筛选和未实现状态 | 未执行 | 自动化通过；实测待补 |
| Side Panel 四大分类、Issue 数量 | `Report.test.tsx` 覆盖分类筛选、总数和空分类 | 未执行 | 自动化通过；实测待补 |
| Score 与 Severity | `score.test.ts`、`seoRules.test.ts`、`Report.test.tsx` 覆盖算法、统计与语义类 | 未执行；本轮无新截图 | 自动化通过；视觉待补 |
| Popup → Side Panel 定位 | `auditIntent.test.ts`、`background.test.ts`、`App.metadata.test.tsx`、`Report.test.tsx`、`IssueList.test.tsx` 覆盖真实 Issue ID、过期、Tab/URL 隔离、展开和滚动 | 未执行 | 自动化通过；端到端待补 |
| AI Fix | `IssueList.test.tsx`、`generateSeoFix.real.test.ts` 覆盖交互、响应整理和错误处理；测试使用模拟请求 | 未调用真实后端 | 自动化通过；真实后端待补 |
| 多 Tab、刷新、Rescan、快照同步 | `sessionSnapshot.test.ts`、`App.metadata.test.tsx` 覆盖隔离、失效、旧结果拒绝与重扫 | 未执行 | 自动化通过；实测待补 |
| Images 状态刷新与 429 | `PopupToolViews.test.tsx`、`sessionSnapshot.test.ts` 覆盖缓存、强制刷新、2 并发、429、过期与旧请求 | 未执行 | 自动化通过；实测待补 |
| 扫描失败与权限状态 | `sitePermission.test.ts`、`App.metadata.test.tsx`、`sessionSnapshot.test.ts` 覆盖拒绝、失权和重试路径 | 未执行真实授权弹窗 | 自动化通过；实测待补 |

## 真实浏览器证据限制

本轮尝试在现有 Chrome 会话中打开本地扩展页面进行实测，但浏览器控制环境拒绝访问 `chrome-extension:` 页面，并明确禁止通过其他浏览器控制路径绕过该限制。因此没有新取得的 Popup、Side Panel、权限弹窗或 AI Fix 截图。已有用户截图属于此前视觉反馈，不能代替本次构建的 Phase 6 操作证据。

后续需按 [`SEO_COPILOT_1.4.0_MANUAL_CHROME_ACCEPTANCE.md`](../SEO_COPILOT_1.4.0_MANUAL_CHROME_ACCEPTANCE.md) 在正式 Chrome 上记录：实际加载的扩展 ID、Chrome 版本、构建哈希，以及 Popup、Side Panel、Issue 定位、AI Fix、多 Tab、刷新、Rescan、权限拒绝/允许和扫描失败的步骤、结果与截图。执行时应以本次构建为准，避免把旧扩展的结果计入本轮。

## 失败与遗留问题

- 自动化测试和构建无失败。
- 原生扩展交互、真实权限弹窗和真实后端 AI Fix 尚未验证；这属于验收证据缺口，不能判为功能失败或功能通过。
- 版本标识尚未调整到 1.4.0，按阶段约束留待后续独立处理。

## 发布风险

当前代码层回归风险较低，但由于本轮未取得真实 Chrome 端到端证据，发布门槛仍未满足。**不建议仅凭这次自动化结果发布。**

## 后续版本标识更新（2026-11-17）

在上述回归执行之后，用户要求将扩展版本统一为 `1.4.0`。此前记录的 `1.3.1` 是回归当时的真实构建信息，保留用于追溯。版本更新后再次执行 `npm test`，37 个测试文件、259 个用例通过；`npm run build` 通过，扩展产物校验输出 `V1.4.0`；`git diff --check` 退出码为 0。仍需完成真实 Chrome 验收。

## 代码复查补记（2026-11-17）

按用户要求以代码检查收尾。第一次全量重跑时，图片 429 并发测试在 5 秒默认时限内超时（其余 258 项通过）；单独重跑该用例通过，再次全量重跑 259 项全部通过。该现象记录为测试运行稳定性风险，不据此判定图片限流功能失败，也不抹去首次超时。之后 `npm run build` 再次通过，产物仍为 `V1.4.0`。本轮未修改业务代码或测试。
