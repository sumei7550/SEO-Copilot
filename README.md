# SEO Copilot

SEO Copilot 是一个 React + TypeScript + Vite + Tailwind CSS 构建的 Chrome Manifest V3 SEO Audit Extension。当前版本在本地 SEO 扫描基础上提供 AI Fix MVP：针对可通过文案改写直接处理的问题生成候选内容，用户复制到页面或 CMS 后重新扫描验证。

## 安装与开发

```bash
npm install
npm run dev
npm run build
```

开发时可用 Vite 预览 Popup UI；Chrome 扩展加载使用构建产物。

## 在 Chrome 中加载

1. 执行 `npm run build`。
2. 打开 `chrome://extensions`，开启“开发者模式”。
3. 点击“加载已解压的扩展程序”，选择项目生成的 `dist` 目录。
4. 打开任意 HTTP/HTTPS 页面，点击扩展图标查看扫描结果。

扩展按照 SEO Engine 规范检测 20 条规则，覆盖 Title、Meta Description、Heading、图片 ALT/体积、URL、Canonical、Schema 和正文质量，并输出 0–100 分、等级、分类得分、影响说明与修复建议。扫描、解析、规则判断和评分均在当前页面本地完成。

### AI Fix MVP

AI Fix 仅对以下问题开放入口：Title 缺失/过短/过长、Meta Description 缺失/过短/过长，以及 H1 缺失/不清晰。每个问题可生成 3 个候选、查看生成理由、选择并复制一条建议，然后点击 Re-scan 检查页面是否改善。

当前 `src/services/generateSeoFix.ts` 使用本地 Mock Provider，尚未连接真实 AI API；真实服务接入时应只替换 service provider，不把 API Key 放入扩展。Canonical、Schema、重复标签、图片和其他技术/结构问题不会触发 AI Fix。

所有分析都在当前页面本地完成，不上传页面内容。扩展只申请 `activeTab` 和 `scripting` 权限，Popup 文案通过 Chrome i18n 资源提供：en、zh_CN、ja、ko、es、de、fr、pt_BR。

## 测试

```bash
npm test
npm run build
```

规则、评分、扫描器、AI Context、AI Fix 范围、复制降级逻辑和旧标签页按需注入流程均包含自动化测试。回归验证记录见：

- [`docs/testing/AI_FIX_MVP_VALIDATION.md`](docs/testing/AI_FIX_MVP_VALIDATION.md)
- [`docs/testing/SEO_RULE_VALIDATION_REPORT.md`](docs/testing/SEO_RULE_VALIDATION_REPORT.md)
- [`docs/testing/TEST_REGRESSION_MATRIX.md`](docs/testing/TEST_REGRESSION_MATRIX.md)
