# SEO Copilot v1.2 Alpha Release Candidate Checklist

## 发布范围

- Real AI 仅支持 Title 和 Meta Description。
- H1、Canonical、Schema、Image、Technical SEO 不接入 Real AI。
- H1 问题不显示 `Improve with AI`，仅保留 `Recommended Action`。

## 功能验证

- [ ] SEO Scan：扫描当前页面并生成报告
- [ ] Score：显示总分、等级和分类分数
- [ ] Issue List：问题、严重程度、影响和 Recommended Action 正常显示
- [ ] AI Fix：Title 和 Meta Description 可展开并生成候选
- [ ] Copy：可选择候选并复制，复制成功/失败状态正确
- [ ] Generate another：可重新生成候选，加载状态正确
- [ ] Re-scan：用户修改页面后可重新扫描并刷新结果

## AI 验证

- [ ] Title Real AI：请求经 Backend Proxy，返回候选和 rationale
- [ ] Meta Real AI：请求经 Backend Proxy，返回候选和 rationale
- [ ] H1 不误导：H1 问题不显示 `Improve with AI`，不声称使用 DeepSeek
- [ ] AI Error 状态：Backend 错误、超时、空响应时显示可重试状态

## 构建验证

- [ ] `npm test`
- [ ] `npm run build`
- [ ] `npm run backend:build`

## 安全验证

- [ ] API Key 不进入 Extension bundle
- [ ] DeepSeek URL 不暴露在 Extension bundle
- [ ] `.env` 不提交，且仅提交 `.env.example`

## Chrome 验证

- [ ] Chrome 扩展页使用 `Load unpacked` 加载最新 `dist/`
- [ ] 打开测试页面并执行 Scan
- [ ] Title / Meta Description 执行 AI Fix
- [ ] 选择候选并执行 Copy
- [ ] 修改页面后执行 Re-scan
- [ ] Reload 扩展后重复 Scan / AI Fix / Copy 流程

## 结论记录

- RC 日期：
- 测试环境：
- 测试人：
- 结果：
- 阻塞问题：
