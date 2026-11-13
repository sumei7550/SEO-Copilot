## 当前交接状态（2026-11-13，1.4 开发快照）

仓库配置版本仍为 `1.3.1`；以下是 1.4 候选功能的开发快照，**不是已发布版本**。本节优先于下方 2026-10-19 的历史记录，以及 `docs/planning/SEO_COPILOT_1.4.0_IMPLEMENTATION_PLAN.md` 中后来已被用户逐项调整的旧范围描述。

提交前验证：`npm test` 为 **32 个测试文件、206 项测试通过**；`npm run build`（TypeScript、Vite、MV3 构建校验）通过；`git diff --check` 无空白错误。此前 `docs/testing/` 的较早测试数字不代表当前代码。

### 当前已实现

- **Popup Page Inspector：**六个入口。Content 展示 Meta、字数和 H1–H3，并支持复制标题；Indexability 展示 Rendered/Raw Canonical、Robots、Sitemaps、Hreflangs；Images 有 Alt 筛选、图片状态刷新、CSV 导出、How to fix 提示及 Audit 入口。Social tags 与 Outgoing links 明确标为 Coming soon。
- **Structured data：**从当前页面 DOM 采集 JSON-LD（含多个块、数组、`@graph`、嵌套字段）、常见 Microdata 和 RDFa 标记。一级、二级节点默认收起；单一格式在模块标题后显示，混合格式在列表中分组。只展示已采集标记和 JSON-LD 解析错误，不声称 Google 富媒体结果资格已验证。复杂 RDFa 语义与 Google 各结果类型的验证尚未覆盖。
- **Side Panel Audit：**保留评分、问题分类和现有 AI Fix；Popup 与 Side Panel 使用按 Tab、URL、generation 隔离的 `chrome.storage.session` 快照。单条快照上限 1 MB，过大时可重新扫描但不会写入会话缓存。
- **扫描与规则：**图片清单区分可报告与可审查子集，状态刷新与 SEO 评分分离；可见文本字数、Title/Description 长度提示及部分规则口径已调整。Manifest 使用工具栏 Popup 入口，并分别构建自包含的内容脚本。

### 继续开发与验收

1. 在新电脑执行 `npm ci`、`npm test`、`npm run build`，到 `chrome://extensions/` 加载 `dist`。正式 Chrome 原生 Popup、权限拒绝/允许、同 URL 刷新、跨 Tab 快照、Extension Reload 和 AI 后端仍需按 [人工验收清单](docs/testing/SEO_COPILOT_1.4.0_MANUAL_CHROME_ACCEPTANCE.md) 复核。清单是早期基线；其中“Copy schema types”、旧宽度与旧截图/哈希应以当前构建为准。
2. 用 Backlinko 等页面复核结构化数据树，特别是混合格式、深层属性和大数据量。Microdata/RDFa 目前是常见标记采集，不等同完整规范解析；Google 富媒体资格校验尚未实现。
3. 检查 Images 的状态请求在不同站点和权限条件下是否完成，复核 CSV、筛选与长 URL。Social tags 和 Outgoing links 仍是后续功能。
4. 通过手工验收后，再统一确定 1.4 版本号、更新商店文案和发布产物。不要把当前 `1.3.1` Manifest 的开发构建当作 1.4 正式版。

相关设计、研究、原型和早期验证记录位于 `docs/planning/`、`docs/prototypes/`、`docs/research/`、`docs/testing/`。这些文件记录不同阶段的决定；以上当前代码状态及最新用户反馈优先。

---

## 历史交接状态（2026-10-19）

SEO Copilot 扩展的 v1.3.0 主界面方案已确定为 Side Panel；当前代码和 Manifest 仍保持正式版本 `1.2.0`，本阶段仅作开发提交，不发布。最终方案使用 `tabs` 读取当前页面 URL、`permissions.request()` 按 origin 请求可选站点权限，并按 Tab 保存扫描状态。用户已报告主要 Chrome 手工流程通过；扫描中切换 Tab 尚未手工验证，已有自动化状态测试覆盖。下一阶段是 Welcome / Onboarding，不属于本轮范围。

方案、手工验证清单、剩余风险及提交范围见 [docs/SIDE_PANEL_V1_3_PLAN.md](docs/SIDE_PANEL_V1_3_PLAN.md)。以下为早期上架审计与历史记录，不代表当前版本状态。

---

结论：目前不建议直接上架。核心功能已接近可发布，但存在几项明确的上架阻塞。

## 上架审计结果

| 检查项当前状态结论 |                                     |                                                        |
| ------------------ | ----------------------------------- | ------------------------------------------------------ |
| Manifest V3        | 已使用 MV3                          | 通过                                                   |
| 扩展版本           | Manifest、package 仍为 `0.1.0`      | 阻塞：需统一为 `1.0.0`                                 |
| 核心扫描功能       | 已实现，注入问题已修复              | 需真实 Chrome 回归                                     |
| 权限               | `activeTab`、`scripting`、`storage` | 需调整：`storage` 仅保存安装时间，不是用户功能，应删除 |
| 商店图标           | 缺少 Manifest icons 和 PNG 图标     | 阻塞                                                   |
| 商店截图/宣传图    | 仓库中不存在                        | 阻塞                                                   |
| 隐私政策           | 不存在公开隐私政策 URL              | 阻塞                                                   |
| 数据声明           | 本地处理 URL 和网页内容             | 需要在商店隐私页面明确声明                             |
| 国际化             | 8 个资源包键完整                    | 6 个语言的新增内容仍有英文回退                         |
| 自动化测试         | 11 个测试通过                       | 基础通过，但缺少 DOM Scanner 测试                      |
| 生产构建           | 成功，内容脚本自包含                | 通过                                                   |
| 发布 ZIP           | 没有正式 `v1.0.0` 发布包            | 阻塞                                                   |
| 人工验收           | 尚未完成完整网站矩阵                | 阻塞                                                   |

Chrome Web Store 要求 Manifest 包含 `name`、`version`、`description` 和 `icons`；当前项目缺少 icons。[官方准备指南](https://developer.chrome.com/docs/webstore/prepare)

商店还至少需要：

- 128×128 商店图标
- 至少一张 1280×800 或 640×400 截图
- 440×280 小型宣传图

这些是官方列出的必要图片素材。[官方图片要求](https://developer.chrome.com/docs/webstore/images)

虽然 SEO 分析完全在本地完成，但它仍然读取当前页面 URL 和网站内容。Chrome 官方把本地处理网页内容也视为“处理用户数据”，因此需要准确的隐私政策和商店数据声明。[用户数据 FAQ](https://developer.chrome.com/docs/webstore/program-policies/user-data-faq)、[隐私政策要求](https://developer.chrome.com/docs/webstore/program-policies/privacy)

## 推荐调整方案

### P0：上架硬性条件

1. 版本统一
   - `package.json` → `1.0.0`
   - `package-lock.json` → `1.0.0`
   - 两份 Manifest → `1.0.0`
   - README 和发布文档改为 V1.0.0
2. 权限收敛
   - 删除当前没有用户价值的 `storage` 权限
   - 删除只记录安装时间的后台 Service Worker
   - 最终只保留 `activeTab` 和 `scripting`
   - 如果决定在 V1.0.0 提供历史记录，则保留 `storage`，但必须实现对应功能和说明
3. 图标和商店素材
   - PNG 图标：16、32、48、128
   - Manifest `icons`
   - Action `default_icon`
   - 440×280 小型宣传图
   - 建议制作 3 张 1280×800 功能截图：
     - 一键扫描与总评分
     - 分类得分
     - 问题影响与修复建议
4. 隐私与合规
   - 创建正式隐私政策
   - 明确声明：
     - 只读取用户主动扫描的当前页面
     - 分析在本地执行
     - 不上传页面内容
     - 不收集浏览历史
     - 不出售或共享数据
   - 准备 Chrome Dashboard 的单一用途说明、权限理由和数据声明
   - 隐私政策必须部署到公开 HTTPS URL
5. 发布质量
   - 补充 Scanner DOM 测试
   - 测试无效 Schema、超大页面、SPA、无标题页面
   - 在干净 Chrome Profile 中重新加载 `dist`
   - 至少验证 10 个不同类型网站
   - 再次验证 `aipassportphoto.com`
6. 发布包
   - 清理构建产物
   - 重新执行测试和构建
   - 检查 ZIP 根目录直接包含 `manifest.json`
   - 生成 `seo-copilot-v1.0.0.zip`
   - 输出文件清单和 SHA-256

### P1：建议上架前完成

- 完成德语、西班牙语、法语、日语、韩语、葡萄牙语新增文案翻译
- 准备英文和中文商店长描述
- 增加支持邮箱或 Support URL
- 增加首页或产品介绍页
- 固定 npm 依赖版本，避免继续使用 `latest`
- 增加基础 UI 可访问性检查

## 推荐执行范围

建议确认后一次完成：

> V1.0.0 版本同步 + 权限收敛 + 图标与商店素材 + 隐私文档 + Store Listing 文案 + 测试增强 + 正式发布 ZIP。

涉及公开隐私政策 URL 的部署需要你提供网站地址或之后单独确认托管方式；其余内容可以在项目内完成。

如果确认，请回复：**“按推荐方案执行 V1.0.0 上架准备”**。我再开始修改。

# Codex Execution Status

## 已完成（Codex 已执行）

### 1. Version
- 已统一版本号到 1.0.0
- package.json 已修改
- manifest 已修改

### 2. Permissions
- 已移除 storage permission
- 当前发布权限：
  - activeTab
  - scripting
- 原后台安装时间记录逻辑未进入生产包

### 3. Icons
- 已生成品牌图标
- 已生成：
  - 16x16 PNG
  - 32x32 PNG
  - 48x48 PNG
  - 128x128 PNG
- Manifest icons 已配置

### 4. Privacy / Compliance
已完成：
- privacy policy 文档
- 数据处理说明
- Chrome Web Store 权限说明
- 商店描述文案

### 5. User Consent Flow
已修改 Popup：
- 扫描前展示读取范围说明
- 用户确认后执行扫描

### 6. Testing
已完成：
- 4 个测试文件
- 14 个测试全部通过
- TypeScript strict check 通过

### 7. Screenshot Preparation
已完成：
- 本地预览环境启动
- 商店截图尺寸设置
- 第一张功能截图生成

## Codex 中断位置

Codex 最后正在处理：

1. 修复 Vite i18n warning
2. 完成剩余商店截图
3. 最终 build
4. 生成发布 ZIP
5. SHA256 校验

## Claude 接下来执行

不要重新审计。

直接继续：
1. 检查当前 git diff
2. 验证 i18n 修改
3. 完成截图
4. npm test
5. npm build
6. 打包 v1.0.0

## 官网 Website Audit 状态（2026-09-04）

官网本轮上线前审计与修复已完成，范围限定在 `website/`。已处理：

- 首页和工具页的 UI/UX、Hero 信息密度、导航当前页状态、移动端菜单和响应式布局；
- 首页到五个 SEO 工具页的内部链接；
- SEO Checker、SEO Audit、Title Tag Checker、Meta Description Checker、On-page SEO Checker 的关键词/搜索意图区分和独立说明；
- 八个 locale 的首页 metadata、Footer labels、Support metadata 和 Terms 本地化；
- sitemap、robots、静态导出和页面结构的本地验证。

验证结果：Next.js build 成功，静态页面 `95/95`，导出 `2/2`，HTML `91`，sitemap URL `90`，`git diff --check` 通过；1440、1280、1024、768、390、360 宽度预览均未发现横向溢出。

重要边界：本轮保留真实第三方页面截图内容（包括 India Passport Photo），判断依据是截图中是否展示真实 SEO Copilot v1.1 的 issue、Improve with AI、Before/After 和 recommendations，不把第三方页面文案误判为官网能力，也没有新增自动发布或全站爬虫等产品承诺。

官网下一步不是重新审计，而是：

1. 使用已确认的生产域名 `https://seo-copilot-website.vercel.app/` 配置 `NEXT_PUBLIC_SITE_URL`，重建并验证 canonical、hreflang、Open Graph、sitemap、robots、JSON-LD；
2. 在 Preview 和 Production URL 分别完成页面可访问性、语言切换、移动端和社交预览 smoke check；
3. 完成八个 locale 的人工文案复核，以及 Chrome Web Store、Support、Privacy 的最终公开 URL 复核；
4. 发布后观察 Search Console 和真实安装转化，再决定是否新增 blog、use-cases、platforms 或 pricing 页面。

官网审计完整记录见：[docs/WEBSITE_AUDIT_2026-09-04.md](docs/WEBSITE_AUDIT_2026-09-04.md)。当前没有执行 commit、push 或 deploy。
