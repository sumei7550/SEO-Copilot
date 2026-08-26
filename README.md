# SEO Copilot

SEO Copilot 是一个 React + TypeScript + Vite + Tailwind CSS 构建的 Chrome Manifest V3 SEO Audit Extension。当前版本在本地 SEO 扫描基础上提供 AI Fix MVP：针对可通过文案改写直接处理的问题生成候选内容，用户复制到页面或 CMS 后重新扫描验证。

当前版本：`1.1.0`（Alpha）。生产扩展构建产物位于本地 `dist/` 目录，版本信息由 `package.json`、根目录 `manifest.json` 和 `public/manifest.json` 保持一致。

## 安装与开发

```bash
npm install
npm run dev
npm run build
```

`npm run build` 会先同步 i18n fallback，执行 TypeScript 类型检查，再生成 Vite production bundle，并验证 Manifest V3、最小权限和自包含 content script。构建成功后可直接在 Chrome 的开发者模式中加载 `dist/`。

开发时可用 Vite 预览 Popup UI；Chrome 扩展加载使用构建产物。

## 在 Chrome 中加载

1. 执行 `npm run build`。
2. 打开 `chrome://extensions`，开启“开发者模式”。
3. 点击“加载已解压的扩展程序”，选择项目生成的 `dist` 目录。
4. 打开任意 HTTP/HTTPS 页面，点击扩展图标查看扫描结果。

扩展按照 SEO Engine 规范检测 20 条规则，覆盖 Title、Meta Description、Heading、图片 ALT/体积、URL、Canonical、Schema 和正文质量，并输出 0–100 分、等级、分类得分、影响说明与修复建议。扫描、解析、规则判断和评分均在当前页面本地完成。

### AI Fix MVP

AI Fix 仅对以下问题开放入口：Title 缺失/过短/过长、Meta Description 缺失/过短/过长。每个问题可生成 3 个候选、查看生成理由、选择并复制一条建议，然后点击 Re-scan 检查页面是否改善。Alpha Real AI 暂不覆盖 H1 或其他技术 SEO 问题。

当前 `src/services/generateSeoFix.ts` 根据配置选择 Mock 或 Real Provider；Real Provider 通过 Backend Proxy 调用 DeepSeek，不把 API Key 放入扩展。Canonical、Schema、H1、重复标签、图片和其他技术/结构问题不会触发 AI Fix。

### Backend / Vercel 部署

Backend 已适配 Vercel Serverless Function，目录结构如下：

```text
api/
└── v1/
    └── seo-fixes.ts       # POST /api/v1/seo-fixes
server/
├── requestHandler.ts      # Node 与 Vercel 共用的 HTTP 处理层
├── seoFixService.ts
├── promptBuilder.ts
├── deepseekClient.ts
└── responseValidator.ts
vercel.json
```

本地使用 Vercel 运行时：

```bash
npx vercel dev
# 或
npm run vercel:dev
```

在 Vercel Project Settings → Environment Variables 中设置 `DEEPSEEK_API_KEY`、`DEEPSEEK_MODEL` 和 `DEEPSEEK_BASE_URL`。API Key 不应写入代码、仓库或 Extension。`DEEPSEEK_MODEL` 未设置时默认为 `deepseek-chat`，`DEEPSEEK_BASE_URL` 未设置时默认为 `https://api.deepseek.com`。

部署 Backend 时可在仓库根目录执行：

```bash
npx vercel login
npx vercel link
npx vercel env add DEEPSEEK_API_KEY production
npx vercel env add DEEPSEEK_MODEL production
npx vercel env add DEEPSEEK_BASE_URL production
npx vercel --prod
```

部署后的生产 API 地址为 `https://<your-project>.vercel.app/api/v1/seo-fixes`。Extension 的 Real Provider 只需将 `VITE_SEO_COPILOT_BACKEND_URL` 配置为不带路径的项目地址（例如 `https://<your-project>.vercel.app`），再重新构建 Extension；不要把 `/api/v1/seo-fixes` 重复配置进去。

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
- [`docs/testing/release-build-verification.md`](docs/testing/release-build-verification.md)
