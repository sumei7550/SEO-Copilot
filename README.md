# SEO Copilot

SEO Copilot V1.0.0 是一个 React + TypeScript + Vite + Tailwind CSS 的 Chrome Manifest V3 SEO Audit Extension。

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

扩展按照最新 SEO Engine 规范检测 20 条规则，覆盖 Title、Meta Description、Heading、图片 ALT/体积、URL、Canonical、Schema 和正文质量，并输出 0–100 分、等级、分类得分、影响说明与修复建议。

所有分析都在当前页面本地完成，不上传页面内容。扩展只申请 `activeTab` 和 `scripting` 权限，Popup 文案通过 Chrome i18n 资源提供：en、zh_CN、ja、ko、es、de、fr、pt_BR。

## 测试

```bash
npm test
npm run build
```

规则、评分和旧标签页按需注入流程均包含自动化测试。
