# SEO Copilot 官网 Website Audit 与修复记录

> 审计日期：2026-09-04
> 审计范围：`website/` 官网源码、静态导出、浏览器预览与多语言路由
> 本文记录上线前审计结论、已完成修复、验证证据和下一步工作。它不替代 `PRODUCT_FACTS.md`，所有产品能力与隐私边界仍以产品事实文档和实际实现为准。

## 1. 当前结论

官网已完成本轮 UI/UX、SEO、技术 SEO、CTA、响应式和可访问性修复，适合进入“生产环境注入真实域名后的最终验收”阶段。

已确认生产域名为 `https://seo-copilot-website.vercel.app/`。本轮接下来会使用 `NEXT_PUBLIC_SITE_URL=https://seo-copilot-website.vercel.app` 重新构建；本地构建仍不能替代线上可抓取性证明，因此线上 canonical/hreflang、sitemap、robots 和社交预览仍需单独验证。

本轮没有修改 Extension 或 Backend，没有新增未经验证的产品能力，没有创建 Schema 扩展，也没有 commit、push 或 deploy。

## 2. 审计范围与判定口径

### 页面范围

- 首页 `/`
- Features、Support、Privacy、Terms
- SEO Checker、SEO Audit、Title Tag Checker、Meta Description Checker、On-page SEO Checker
- 英文默认路由及 `zh-CN`、`zh-TW`、`ja`、`ko`、`de`、`fr`、`es`、`pt-BR` 八个 locale
- Header、Footer、Hero、真实产品截图、CTA、移动端菜单、站内链接
- Next.js 静态导出、metadata、canonical、hreflang、sitemap、robots、JSON-LD

### 重要截图判定修正

首页截图中的 India Passport Photo 文案属于真实第三方页面内容，不应被误判为官网虚构的 SEO Copilot 功能。本轮采用以下口径保留并复核该截图：

- 保留真实网页背景与产品界面，不合成虚假产品状态；
- 重点确认 SEO Copilot v1.1 的实际 UI 是否展示 SEO issue、Improve with AI、Before/After 和 recommendations；
- 不因第三方页面的行业文案、页面标题或示例内容而否定产品截图；
- 官网文案不把截图扩展为自动发布、自动编辑或全站爬虫等未验证能力。

## 3. 审计结果

### UI / UX

| 项目 | 审计结论 | 状态 |
|---|---|---|
| 首屏价值主张 | 能说明 SEO Copilot 面向当前页面的扫描、问题解释和可选 AI 建议 | 已修复/通过 |
| Hero 信息密度 | 桌面端标题过长的问题已收敛，标题约三行，产品截图可在首屏内形成证据闭环 | 已修复 |
| 截图可信度 | 使用真实产品截图，展示 issue、AI Fix、Before/After 与建议，不新增虚构 UI | 通过 |
| CTA 层级 | Add to Chrome 作为主 CTA，See how it works / View Features / Support 作为辅助路径 | 通过 |
| Header 当前页 | 桌面和移动导航增加当前页视觉状态及 `aria-current="page"` | 已修复 |
| 移动菜单 | 维持 ESC 关闭、body 滚动锁定、移动端语言切换；预览中可正常展开 | 通过 |
| Footer | 产品、资源、法律分组及链接文案按 locale 提供本地化标签 | 已修复 |
| 空间与响应式 | 1440、1280、1024、768、390、360 宽度均未发现横向溢出 | 通过 |

### SEO 内容与搜索意图

| 页面 | 主搜索意图 | 本轮处理 |
|---|---|---|
| SEO Checker | 当前页面快速 SEO 检查 | 增加独立说明：页面级检查、评分/问题列表、从结果开始下一步 |
| SEO Audit | 当前页面的系统性 SEO 审计 | 增加 scan → prioritize → understand → manual update → re-scan 工作流 |
| Title Tag Checker | title 标签缺失、长度和可读性检查 | 增加 title 问题类型及 AI Fix 只提供建议、不自动发布的边界 |
| Meta Description Checker | meta description 缺失、长度和摘要质量检查 | 增加问题类型、建议候选和人工更新/重新扫描路径 |
| On-page SEO Checker | 页面内 SEO 信号综合检查 | 增加 metadata、headings、images、canonical、structured data、URL signals 范围 |

五个工具页现在各自拥有独立的任务说明，降低 SEO Checker、SEO Audit 与 On-page SEO Checker 的关键词和内容互相蚕食风险。未创建 pricing、blog、templates、platforms 等没有真实内容或验证边界的页面。

### Technical SEO

- 首页 metadata 已按 locale 提供本地化 title/description。
- Support metadata 不再错误复用 FAQ answer，而使用独立的本地化 support description。
- Terms 页面补齐本地化正文，不再只依赖英文回退。
- 英文默认路由继续不带 `/en` 前缀；其他八个 locale 使用 `/{locale}/` 前缀。
- sitemap 不包含 `/en` 前缀，生成 90 个 URL；静态导出共生成 91 个 HTML 文件。
- 生产 robots.txt 预期指向 `https://seo-copilot-website.vercel.app/sitemap.xml`；需在真实线上响应中确认。
- canonical、hreflang、Open Graph、sitemap、robots 和 JSON-LD 继续由 `NEXT_PUBLIC_SITE_URL` 驱动，未在源码中硬编码生产域名。
- 未机械新增 Schema；保留现有、与产品事实一致的 `SoftwareApplication` 结构化数据。

### CTA、内部链接与可发现性

首页增加五个工具页入口，分别链接到 SEO Checker、SEO Audit、Title Tag Checker、Meta Description Checker 和 On-page SEO Checker。

工具页按意图建立相关链接：

- SEO Checker ↔ SEO Audit / On-page SEO Checker
- SEO Audit ↔ SEO Checker / On-page SEO Checker
- On-page SEO Checker ↔ SEO Audit / SEO Checker
- Title Tag Checker ↔ Meta Description Checker

这套链接用于帮助用户从单项检查进入完整审计，也让搜索引擎能发现并理解工具页之间的任务关系。

## 4. 已完成修复清单

### 文案与 metadata

- `website/src/lib/site.ts`
  - 增加八个 locale 的首页 metadata。
  - 增加 Footer UI labels 和 Support descriptions 的本地化内容。
- `website/src/app/[locale]/[[...slug]]/page.tsx`
  - 使用本地化首页和 Support metadata。
  - 增加 Terms 本地化文案。
  - 增加按搜索意图组织的 related links。

### UI / UX

- `website/src/components/Header.tsx`
  - 增加桌面、移动导航当前页状态。
  - 增加 `aria-current="page"`。
  - 保留移动菜单键盘关闭和滚动行为。
- `website/src/components/Footer.tsx`
  - 接入 locale-aware labels。
- `website/src/components/LandingPage.tsx`
  - 增加可复用的工具页 detail section，用于补充任务边界、工作流和下一步。
- 五个工具页
  - 增加与页面主意图匹配的独立内容，避免仅由模板标题、描述和 CTA 构成薄页面。
- `website/src/app/(site)/page.tsx`
  - 增加五个工具页的首页内部链接。
- `website/src/app/(site)/globals.css`
  - 增加导航 active state、工具链接、landing detail 样式。
  - 调整 Hero 桌面列宽、标题尺寸、截图高度和 `object-fit`。
  - 增加平板和移动端布局规则。

## 5. 验证证据

### 本地构建与静态产物

使用：

```powershell
$env:NEXT_PUBLIC_SITE_URL='https://seo-copilot-website.vercel.app'
npm.cmd run build
```

结果：

- Next.js 编译成功。
- 静态页面生成 `95/95`，导出成功 `2/2`。
- HTML 文件数量：91。
- sitemap URL 数量：90。
- sitemap 不含英文 `/en` 前缀。
- `git diff --check` 通过。

### 浏览器预览

在本地 Next 预览环境检查 1440、1280、1024、768、390、360 宽度：

- 所有宽度 `overflow=false`。
- 桌面 Hero 标题约三行，未出现首屏标题挤压截图的旧问题。
- 截图在桌面宽度使用约 720px 高度，在 1024px 使用约 620px 高度，移动端随布局收缩。
- 五个首页工具链接在全部检查宽度可见。
- Features 桌面导航和移动菜单均显示当前页状态。
- 八个 locale 首页均验证了本地化 title、description 和 Footer heading。
- 日文 Terms 验证了 `適切な利用`、`サービスの制限`、`お問い合わせ` 等本地化正文。
- 移动菜单可展开，当前页 link 带 `aria-current="page"`。

## 6. 未完成事项与上线前下一步

### P0：真实生产环境验收

1. 使用最终生产域名 `https://seo-copilot-website.vercel.app/` 配置 `NEXT_PUBLIC_SITE_URL`，重新执行 production build。
2. 在真实 Preview URL 验证首页、八个 locale、工具页、Terms、Support、Privacy 的页面可访问性、canonical、hreflang、Open Graph、sitemap、robots、JSON-LD、trailing slash 和 locale 切换。
3. 在真实 Production URL 再做一次同样的 smoke check，并单独记录“已部署”和“线上可抓取”的证据。

### P1：内容与转化复核

1. 逐语言人工复核八个 locale 的首页、工具页、Terms 和 Footer，重点检查英文回退、术语一致性和 CTA 语气。
2. 确认 Chrome Web Store URL、Support 邮箱/入口和 Privacy URL 均为最终公开地址。
3. 检查 OG 图、favicon、截图 alt 文本和浏览器分享预览。
4. 观察工具页之间的搜索意图是否仍有重叠，再决定是否保留全部五个 landing page。

### P2：发布后观察

1. 提交 sitemap 到 Google Search Console（如使用该工具）。
2. 观察索引、canonical 选择、页面查询词和 landing page 转化，不在没有数据前继续批量新增页面。
3. 根据真实搜索词和安装转化再决定是否建设 blog、use-cases、platforms 或 pricing 页面。

## 7. 当前变更边界

- 本轮只修改官网 `website/` 源码和本审计记录文档。
- 未修改 Extension、Backend、隐私事实、权限、发布 ZIP 或商店素材。
- 未执行部署、commit 或 push。
- 当前工作区中的 website 源码改动仍需由后续发布阶段统一 review、commit 和部署。
