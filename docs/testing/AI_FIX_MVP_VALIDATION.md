# SEO Copilot v1.1 AI Fix MVP 验证记录

## 产品目标

AI Fix MVP 的定位是提供一个可控的 SEO 问题处理闭环：

发现 SEO 问题
→ AI 提供优化建议
→ 用户复制执行
→ Re-scan 验证

AI Fix 负责生成和呈现建议，不直接修改用户网页。用户执行建议后，通过重新扫描确认问题是否已经改善。

## 已完成

- AI Fix Prototype
- React 接入
- `AiFixPanel`
- Mock Provider
- AI Context
- Copy
- Re-scan
- 自动化测试覆盖 AI Fix 范围、AI Context、Mock Provider、扫描器和复制降级逻辑。

## AI Fix 支持范围

### 支持

- Title missing / short / long
- Meta description missing / short / long

Alpha Real AI 暂不开放 H1 AI Fix；H1 问题仅显示 Recommended Action。

### 禁止

- Canonical
- Schema
- Multiple title
- Multiple H1
- Technical issues

禁止范围中的问题通常涉及结构调整、技术配置或需要人工判断的页面级变更，不在当前 MVP 的文案生成能力内。

## 验证结果

- 已完成 20 site regression，扫描与评分流程在 20 个站点上保持可用。
- 已完成 Chrome Extension real DOM validation，用于验证扩展在真实浏览器 DOM 上的接入与扫描链路。

## 当前限制

- Title 和 Meta Description 已接入 Real Provider；H1 仍未接入 Real AI。
- Mock Provider 仍保留用于本地开发与兼容性测试。
- AI Context 仍需继续优化，以提高建议与具体页面内容及问题上下文的匹配度。
- 当前 UI 的复制动作只把候选文案写入剪贴板，不会自动改写当前网页或 CMS；重新扫描仍需用户先完成页面修改。

## 发布前复验

```bash
npm test
npm run build
```

发布前还应在 Chrome 中加载最新 `dist/`，验证真实 DOM 扫描、AI Fix 展开、复制和重新扫描链路；本地 Mock Provider 不代表真实模型输出质量或网络错误处理已验收。
