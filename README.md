# SEO Copilot

SEO Copilot 是一个 React + TypeScript + Vite + Tailwind CSS 的 Chrome Manifest V3 SEO Audit Extension MVP。

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

扩展检测 Title、Meta Description、H1/H2、图片 ALT、URL、Canonical、Schema 和 Robots，并输出 0–100 分、分类问题与修复建议。所有 Popup 文案来自 Chrome i18n：en、zh_CN、ja、ko、es、de、fr、pt_BR。
