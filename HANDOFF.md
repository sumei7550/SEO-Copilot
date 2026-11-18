## 当前版本状态（2026-11-17）

扩展 Manifest、npm 包、构建校验及 22 个多语言页脚已统一为 `1.4.0`。这是本地候选构建的版本标识，Phase 6 真实 Chrome 验收仍待补齐；版本号更新不代表已经发布。下方 2026-11-15 的交接快照保留原始记录，其中 `1.3.1` 状态已被本节取代。

## 历史交接状态（2026-11-15，1.4 开发快照）

当前开发分支为 `main`，仓库配置版本仍为 `1.3.1`。以下内容是 1.4 候选功能的可继续开发快照，**不是已发布版本**。本节优先于下方历史记录，以及 `docs/planning/SEO_COPILOT_1.4.0_IMPLEMENTATION_PLAN.md` 中后来已被用户逐项调整的旧范围描述。

最新验证：`npm test` 为 **33 个测试文件、222 项测试通过**；`npm run build`（i18n fallback 同步、TypeScript、两次 Vite 构建、Manifest V3 产物校验）通过；`git diff --check` 无空白错误。此前 `docs/testing/` 中的较早测试数字不代表当前代码。

### 当前已实现

- **Popup Page Inspector：**原生 Popup 固定为 720×600，保留 Content、Indexability、Structured data、Social tags、Images、Outgoing links 六个入口和底部 `Open SEO Audit`。模块主体独立滚动，底部入口固定；默认高度、长内容和宽屏字号已调整。
- **Content：**展示 Title、Description、URL、字数和 H1–H6；标题列表保持 DOM 顺序、默认折叠并支持复制完整 TSV。Title/Description 长度颜色和提示与当前竞品口径对齐。入口问题数只统计 Popup 中可见且可定位的问题；标题层级跳跃继续作为 Side Panel 的 0 分 Info，不在 Popup 入口制造无法定位的计数。
- **Indexability：**展示 Canonical、Robots、Sitemaps 和 Hreflangs 的现有采集结果，不把检测结果夸大为 Google 索引资格验证。
- **Structured data：**从当前页面 DOM 采集并展示 JSON-LD、常见 Microdata 和 RDFa。支持多个块、数组、`@graph`、嵌套对象、标量数组和混合格式分组；对象数组使用真实字段而非数字索引，长数组支持 `Show all / Show fewer`。单一格式显示在模块标题后，混合格式按格式分组；空态为中性检测结果。只声明 Detection，不声称 Google Rich Results 资格已验证。
- **Images：**扫描普通、懒加载和离屏图片，按 `data-src`、`data-lazy-src`、`data-lazy`、`data-original`、`data-srcset`、`currentSrc`、`src`、`srcset` 等来源解析可报告 URL；过滤无 HTTP(S) 来源及已知追踪尺寸。Alt 筛选、状态刷新、CSV、缩略图、URL、自然尺寸和文件大小可用。入口 Badge 可显示缺少 `alt` 属性的问题数。
- **Images 修复入口：**`Missing alt text` 与 `Empty alt text` 都保留行内 `How to fix →`。悬停/键盘焦点提示框通过 Portal 显示并可安全移入，不会因鼠标离开触发文字而消失。Popup 只显示 `SEO Audit` 能力说明和 `Open image audit →`；装饰图与信息图的具体处理建议保留在 Side Panel，避免重复。
- **Side Panel Audit：**保留 SEO Score、Critical/Warning/Info、四类问题、Issue Details、Impact、Recommended Action、现有 AI Fix 和 Rescan。Popup 与 Side Panel 使用按 Tab、URL、generation 隔离的 `chrome.storage.session` 快照；单条快照上限 1 MB，超限时重新扫描但不写入会话缓存。
- **扫描与规则：**图片列表区分可报告图片与可审查子集；状态刷新与 SEO 评分分离。`accountantsonair.com` 的懒加载图片场景已用于修正扫描口径（页面 121 个 `<img>`，旧实现只发现已加载子集）。`HEADING_003` 保留标题层级跳跃的 0 分 Info，但不计入 Popup Badge；`HEADING_004` 单独检查“首个标题不是 H1”并可在 Popup 定位。Title/Description 短文本提示已收口。

### 尚未完成／不要误判为已完成

1. Structured data 是标记采集与树形展示，不是完整 RDFa/Microdata 规范解析器，也没有执行 Google Rich Results 或 Schema Validator 外部验证。大规模 RDFa（大量重复实例）、深层混合结构和异常数据仍需真实网站人工复核。
2. Social tags 与 Outgoing links 仍是后续能力；SEO Metrics、Keyword Research 只进入产品后续规划，当前版本没有增加入口，也不能替代底部 SEO Audit。
3. 正式 Chrome 原生 Popup、权限拒绝/允许、同 URL 刷新、跨 Tab 快照、Extension Reload、图片跨域状态请求和 AI 后端仍需按 [人工验收清单](docs/testing/SEO_COPILOT_1.4.0_MANUAL_CHROME_ACCEPTANCE.md) 复核。清单中的旧宽度、旧截图和旧哈希应以当前构建为准。
4. 通过手工验收后，再统一确定 1.4 版本号、商店文案和发布产物。不要把当前 `1.3.1` Manifest 开发构建当作 1.4 正式版。

### 换电脑继续开发

1. 克隆仓库并进入项目目录：`git clone git@github.com:sumei7550/SEO-Copilot.git`。
2. 安装锁定依赖：`npm ci`。
3. 验证基线：`npm test`，预期至少为 **33 files / 222 tests**；如后续提交增加测试，以仓库最新结果为准。
4. 生成扩展：`npm run build`。构建会生成被 Git 忽略的 `dist/`，并执行 Manifest V3 校验。
5. 打开 `chrome://extensions/`，启用开发者模式，选择“加载已解压的扩展程序”，加载仓库的 `dist` 目录。
6. 优先阅读本文件顶部、[1.4 实施验证记录](docs/testing/SEO_COPILOT_1.4.0_IMPLEMENTATION_VERIFICATION.md)和[人工验收清单](docs/testing/SEO_COPILOT_1.4.0_MANUAL_CHROME_ACCEPTANCE.md)。不要依据下方历史记录回退当前产品结构。

本地旧发布包 `seo-copilot-v1.1.1.zip` 不属于本次源码快照，不应加入提交。相关设计、研究、原型和早期验证记录位于 `docs/planning/`、`docs/prototypes/`、`docs/research/`、`docs/testing/`；当前代码状态及本节最新用户反馈优先。

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
