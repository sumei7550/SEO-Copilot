# Chrome Extension 官网 Starter Template

> 用于 SEO 工具、Tab Copier、ExportAI 及其他 Chrome Extension 官网。
> 本文档是可复制的启动模板，不包含任何具体产品承诺或最终营销文案。

## 0. 使用规则

- 先填完本文档中的产品变量，再开始写页面。
- 先冻结正式 URL、语言路由、canonical、trailing slash 和计划页面，再进入开发。
- 所有官网事实以 `PRODUCT_FACTS.md` 为唯一来源；未验证的能力不能写成已支持。
- 官网的目标是帮助用户理解产品并完成首次使用，不是堆页面数量。
- 每个阶段完成并验收后再进入下一阶段；不要在 SEO、文案、UI 和发布之间反复漂移。

## 1. 项目启动顺序

```text
产品事实盘点
↓
目标用户与首要转化动作
↓
URL / 语言 / 页面清单冻结
↓
信息架构与页面文案骨架
↓
Design System 与 Header/Footer
↓
Home MVP
↓
核心内页
↓
PRODUCT_FACTS 与 SEO 实现
↓
响应式与可访问性 QA
↓
MVP Freeze
↓
Build / Release QA
↓
Preview Deployment
↓
Preview QA
↓
Production Deploy
↓
Post-deploy QA
↓
External SEO Tool Review
↓
GSC / Social Preview / 索引观察
```

### 启动清单

- [ ] 明确产品名称、扩展类型、安装来源和主要用户
- [ ] 明确唯一主 CTA：通常为 `[Browser] Add to Chrome`
- [ ] 创建 `PRODUCT_FACTS.md`
- [ ] 冻结 production origin：`https://[PRODUCTION_DOMAIN]`
- [ ] 冻结英文默认路由与多语言 locale 集合
- [ ] 按 Required / Conditional / Deferred 列出页面，避免机械创建空页面
- [ ] 确定真实产品截图、图标、Logo、OG 图和 favicon 来源
- [ ] 定义发布、回滚和线上验收负责人

## 2. 信息架构（IA）

### 页面树决策

页面不按模板机械创建，先按以下三类判断：

```text
Required:
/
/privacy
/support

Conditional:
/features
/platforms
/templates
/faq
/terms
/welcome

Deferred:
/pricing
/about
/changelog
/blog
/use-cases
```

Required 页面是当前产品和上线流程不可缺少的基础；Conditional 页面只有在有真实内容、明确用户任务或法律/产品需要时才创建；Deferred 页面保留为后续选项，不为“完整”而提前上线。

### 推荐页面树（按决策结果生成）

```text
/
├── /features
├── /platforms              # 如产品涉及多个目标网站
├── /templates              # 如产品有模板能力
├── /support
├── /privacy
└── 条件创建：/features /platforms /templates /faq /terms /welcome

# Deferred：/pricing /about /changelog /blog /use-cases
```

### 页面角色

| 页面 | 主要任务 | 是否进入主导航 | 默认 SEO 状态 |
|---|---|---:|---|
| Home | 解释产品、建立信任、完成转化 | 是 | index |
| Features | 解释核心能力与使用场景 | 是 | index |
| Platforms | 区分已验证、已适配、未验证平台 | 视产品而定 | index |
| Templates | 展示模板或工作流 | 视产品而定 | index |
| FAQ | 消除安装、兼容性和隐私疑问 | 可放 Footer | 视内容决定 |
| Support | 提供问题解决路径 | 可放 Footer | index |
| Privacy | 法律与信任基础 | Footer | index |
| Terms | 法律与信任基础（如确有需要） | Footer | 视内容决定 |
| Welcome | 安装后的首次使用引导 | 否 | 通常 noindex，不进 sitemap |
| 未完成页面 | 保留产品结构但避免假内容 | 可显示 disabled | 不发布占位页 |

未完成的 Pricing、About、Changelog 可以显示在结构中，但必须不可点击或明确标注状态；不要链接到空白页、假页面或 404。

## 3. URL 与多语言路由策略

### 推荐路由

英文为默认语言，不增加 `/en` 前缀；其他语言统一使用 `/{locale}/` 前缀。支持语言集合由产品变量决定，不把某一个 locale 写死为 Starter 的固定项：

```text
English:  /
          /features
          /templates

Other:    /{locale}/
          /{locale}/features
          /{locale}/templates
```

语言切换必须保留当前页面：

```text
/templates  ↔  /{locale}/templates
```

### 路由冻结表

| 页面 | English | zh-CN | canonical | hreflang | trailing slash |
|---|---|---|---|---|---|
| Home | `/` | `/{locale}/` | `[填入]` | `[填入]` | `[统一规则]` |
| Features | `/features` | `/{locale}/features` | `[填入]` | `[填入]` | `[统一规则]` |
| Platforms | `/platforms` | `/{locale}/platforms` | `[填入]` | `[填入]` | `[统一规则]` |
| Templates | `/templates` | `/{locale}/templates` | `[填入]` | `[填入]` | `[统一规则]` |
| FAQ | `/faq` | `/{locale}/faq` | `[填入]` | `[填入]` | `[统一规则]` |

要求：

- `NEXT_PUBLIC_SITE_URL`（或等价配置）是所有 SEO URL 的唯一来源。
- 统一规范化 origin：HTTPS、无末尾 `/`，production 缺失时 build fail。
- 每个语言页面有自指 canonical，并通过 `hreflang` 互相指向。
- 不要在项目中分别硬编码多个域名。
- `DEFAULT_LOCALE = en`；英文 URL 不带 `/en`，其他启用的语言使用 `/{locale}/` 前缀。
- 语言切换保留当前 pathname，并对不存在的翻译页面定义明确 fallback 或不展示入口的规则。

## 4. Header 标准

### Desktop

```text
[Logo + Brand]   Features   Platforms   Templates   Pricing

                                              [Language] [Primary CTA]
```

规则：

- Product nav 靠近 Logo；右侧只放语言切换与主 CTA。
- 主 CTA 全站保持统一命名、图标和链接。
- Pricing、About、Changelog 等未完成页面显示但 disabled，不制造错误链接。
- Language dropdown 的 trigger、Chevron、hover、mouseleave、focus 状态必须同步。
- dropdown 与 trigger 之间不能有会导致闪烁的空隙。

### Mobile

```text
[Logo + Brand]                         [Language?] [Menu]
```

菜单展开后：

- 从 Header 底部覆盖到 viewport 底部。
- 使用 fixed panel，`top = header height`，`bottom = 0`。
- 白色或明确的品牌背景完全遮住页面内容。
- 打开菜单时锁定 body scroll；关闭时恢复。
- Language 入口采用可选策略：根据 locale 数量、Header 空间和转化优先级，可放在 Header，也可放入 Menu 第一层；但必须在 1–2 次操作内可达，且不能造成溢出、遮挡或键盘不可达。
- 当语言放入 Menu 时，显示当前语言与可展开的语言列表，不要把完整 locale 列表直接横向铺在 Header。
- 菜单中的项目按转化顺序排列：核心导航 → 辅助页面 → Primary CTA。

## 5. Footer 标准

```text
Product       Resources       Company       Legal
Features      FAQ             About         Privacy
Platforms     Support         Changelog     Terms
Templates
Pricing
```

只显示真实存在且可访问的链接。未完成项目可作为 disabled 结构项，但不能被搜索引擎抓到空内容。

## 6. Home 页面骨架

```text
Header
↓
Hero：产品是什么、为谁解决什么问题、主 CTA
↓
Core Value：3 个以内的核心价值
↓
真实产品截图：证明产品如何工作
↓
How It Works：3–4 步完成首次使用
↓
Feature Detail：按用户任务组织，不按内部代码模块组织
↓
Templates / Workflow：如产品具备此能力
↓
Platforms / Compatibility：明确验证状态
↓
Privacy / Trust：事实描述、权限和数据处理
↓
Final CTA：一个主转化 + 一个辅助动作
↓
Footer
```

内容原则：

- Hero 回答“这是什么”；截图回答“它真的怎么用”；Workflow 回答“下一步做什么”。
- 避免空泛的 `Best`、`#1`、`Thousands`、`Millions`、`100% private` 等未经证实的表述。
- 每个 section 只服务一个问题；不要一上来堆大量功能卡。
- 用具体动作描述能力，例如“在当前页面选择、优化、复制或插入”，不要夸大兼容性。

### Hero Screenshot 标准

Hero 截图必须优先展示产品差异化最高、最能解释核心价值的真实结果态，而不是普通初始页或空状态。

- 优先展示真实的核心结果、修复后状态、AI 建议、Before / After 或可执行动作。
- 截图主体应占其容器的大部分面积，用户无需放大即可理解关键 UI 和产品价值。
- 禁止用巨大空框包住过小截图，或让大量无意义留白成为首屏主视觉。
- 允许适度 crop、圆角、轻微阴影和简洁 framing，但不得伪造不存在的 UI、数据或产品状态。
- 新版本主功能必须在首屏截图或首屏文案中得到体现。

## 7. CTA 体系

### Primary CTA

```text
[Browser icon] Add to Chrome
```

- 深色背景、白色文字、明确的浏览器图标。
- Header、Hero、关键转化位置保持一致。
- 链接到真实的 Chrome Web Store 安装页；没有真实链接前不要伪造。
- 所有 Primary install CTA 统一不使用 `→`、`↗`、`ExternalLink` 等装饰性箭头；除非品牌规范明确规定，否则按钮只保留浏览器图标与 CTA 文案。

### Secondary CTA

```text
View Features     Browse Templates     Read FAQ     Get Support
```

- 白底、边框、深色文字。
- 只承担辅助探索，不与 Primary CTA 抢层级。

### Dark Section CTA

深色背景下使用浅品牌色按钮（例如 `[LIGHT_BRAND_COLOR]`），不要继续使用难以区分的纯黑按钮。

### Final CTA 规则

```text
一个核心转化动作 + 一个辅助动作
```

不要放 3–4 个同等级按钮。若用户已经安装扩展（如 Welcome 页），主 CTA 应改为 `[Open Supported Site]` 或 `[Start Using Product]`，不再重复 `Add to Chrome`。

## 8. Design System 基线

### Brand Asset Freeze

正式开发前先冻结并记录以下来源；它们是官网和扩展品牌呈现的唯一基准：

- 正式 Logo 与 Extension icon
- favicon、manifest icon 和 OG branding
- Primary / Secondary brand colors
- 字体、圆角、图标风格（如已有规范）
- Hero 与页面截图的真实来源、版本和脱敏状态
- Chrome Web Store / Store branding 资产

禁止使用字母、临时图形或自行重绘的 placeholder logo。若正式资产尚未确认，先标记为 blocker，不进入视觉完成阶段。

### 产品变量

```text
BRAND_NAME = [Product name]
BRAND_TAGLINE = [One-sentence factual description]
PRIMARY_COLOR = [#...]
LIGHT_BRAND_COLOR = [#...]
TEXT_COLOR = [#...]
MUTED_TEXT_COLOR = [#...]
SURFACE_COLOR = [#...]
FONT_HEADING = [font]
FONT_BODY = [font]
RADIUS = [small / medium / large]
```

### 固定设计约束

- 建立统一的颜色、字体、间距、圆角、阴影、按钮、卡片和容器宽度 token。
- Desktop 与 Mobile 是两套信息组织方案，不是简单缩放。
- 主容器、section 间距和标题层级全站统一。
- 确保文字与背景对比度、键盘 focus、hover、disabled、错误和空状态可见。
- 图标是装饰性时使用 `alt=""` 与 `aria-hidden`，不要为了 SEO 工具添加重复 alt。

## 9. PRODUCT_FACTS 约束

建议在项目根目录维护 `PRODUCT_FACTS.md`：

```md
# Product Facts

## Verified capabilities
- [已验证能力]

## Supported platforms
- [平台] — [Verified / Configured, not verified / Experimental]

## Storage and data handling
- [存储位置]
- [哪些内容会被读取]
- [是否调用远程 API]

## Permissions
- [权限] — [真实用途]

## Not supported / not verified
- [明确不能承诺的能力]

## Prohibited claims
- 不写：100% private / 100% offline / never accesses network，除非有完整技术与法律依据
- 不写：Best / #1 / all platforms / millions of users，除非有可审计证据
- 不写未验证的平台、价格、评分、下载量、用户评价
```

官网文案、Platforms 状态、Privacy、Schema、FAQ 和截图说明都必须能回溯到这份事实表。

## 10. SEO 基础设施

必须具备：

- 每页唯一 `title` 与 `description`。
- canonical、`hreflang`、`og:url` 使用同一个 production origin helper。
- `sitemap.xml` 只收录正式、可索引、返回 200 的页面。
- `robots.txt` 指向正式 sitemap，不阻塞重要页面和静态资源。
- Open Graph：`og:title`、`og:description`、`og:type`、`og:url`、`og:image`。
- Twitter/X metadata：至少有 title、description、image 和 card 类型。
- favicon、manifest、OG 图片路径在 production 可直接访问。
- 404、redirect、trailing slash 规则保持一致。
- Welcome、测试页、临时预览页默认 `noindex`，不进 sitemap。

### SEO Landing Page 决策与关键词映射

只有同时满足以下条件时，才为搜索意图创建独立 Landing Page：

1. 有独立且可描述的搜索意图。
2. 能提供明显不同于首页或现有页面的内容与任务路径。
3. 产品事实中存在对应能力、场景或兼容性依据。
4. 可以自然建立内链，并有明确 CTA。
5. 与现有页面不会形成严重 keyword cannibalization。

每个 SEO Landing Page 在开发前必须登记关键词映射：

```text
URL = /[slug]
Primary keyword = [唯一主关键词]
Secondary keywords = [相关词]
Search intent = [informational / commercial / transactional]
H1 = [与搜索意图一致的唯一 H1]
Unique value = [本页独有内容或产品任务]
CTA = [与意图匹配的动作]
Internal links = [来源页与目标页]
Canonical / locale variants = [填写]
```

不同页面不得只替换关键词后复用同一套薄内容。没有独立价值、无法从 `PRODUCT_FACTS.md` 证明或缺少可验证 CTA 的关键词，进入 Deferred，不创建页面。

### Metadata 占位

```text
SITE_URL = https://[PRODUCTION_DOMAIN]
OG_IMAGE = [1200 × 630 absolute URL]
DEFAULT_TITLE = [事实型首页标题]
DEFAULT_DESCRIPTION = [事实型首页描述]
```

## 11. Schema 原则

只标记真实存在、页面可见或产品事实明确支持的内容。常见基础组合：

- `WebSite`：站点级信息。
- `SoftwareApplication`：确实是软件/扩展，且字段有真实值。
- `FAQPage`：页面确有 FAQ，且 Schema 与 UI 共用同一份数据源。

除非事实成立，不要添加：

- `AggregateRating`、`Review`
- `Offer`、`Price`
- 虚构的下载量、用户数或组织信息

Rich Results 工具提示缺少 `offers`、`aggregateRating` 等，不代表必须补齐；真实、少而准确的 Schema 比工具全绿更重要。

## 12. 截图与资产规范

### 目录建议

```text
public/
├── images/product/raw/       # 经清理、可作为正式来源的原始截图
├── images/product/processed/ # 裁切、压缩、标注后的展示图
├── images/og/                # 1200×630 社交分享图
├── icons/                    # Logo、浏览器图标、功能图标
└── favicon.*
```

### 截图 QA

- [ ] 用户名、邮箱、头像、账号标识已移除
- [ ] Sidebar 历史、测试数据、quota、Upgrade 信息已清理
- [ ] 旧 Logo、旧品牌色、开发环境 URL 已移除
- [ ] 截图展示真实 UI，不用无法实现的 mock 状态
- [ ] 移动端截图在 390px 和 360px 宽度下不会溢出
- [ ] 图片有明确 alt 或作为装饰性图片处理
- [ ] 体积已压缩，首屏图片使用合适的尺寸与加载策略

## 13. 响应式规范

至少验证：

```text
Desktop 1440
Desktop 1280
Tablet 1024
Tablet 768
Mobile 390
Mobile 360
```

重点检查：

- Header、dropdown、mobile menu 是否完整覆盖且可操作
- Hero 标题、长中文、按钮是否自然换行
- CTA 是否宽度协调、触控区域足够
- Cards、截图、表格和代码块是否横向溢出
- 图片裁切、比例、焦点位置是否合理
- 固定元素是否遮挡内容
- Safari iOS、Chrome Mobile 的滚动锁定和返回行为

## 14. Onboarding 评估点

安装后用户应能回答：

1. 去哪里使用扩展？
2. 如何触发核心功能？
3. 模板、复制、导出或设置在哪里？
4. 产品与目标网站的关系是什么？

### 推荐决策

优先评估轻量 Welcome Page：

```text
Install
↓
首次安装事件（仅 reason = install）
↓
打开 /welcome 或 /zh-CN/welcome
↓
3–4 步真实截图引导
↓
Open Supported Site / Start Using Product
```

选择官网 Welcome 页还是扩展内页时，评估：离线可用性、网络依赖、版本耦合、权限、国际化、维护成本和安装审核风险。不要为引导流程扩大权限；更新事件不应重复打开。Welcome 页通常不进主导航、不进 sitemap、设为 `noindex`，但可在 Settings / Support 保留手动入口。

## 15. Release QA

### Build QA

- [ ] `npm run build` 成功
- [ ] `git diff --check` 无错误
- [ ] production env 缺失时能明确失败
- [ ] 所有正式路由可构建
- [ ] 无明显 console error、404 资源和 broken image
- [ ] 关键页面 title、description、canonical、Schema 已检查

### 功能 QA

- [ ] Header desktop / mobile
- [ ] Language dropdown 与当前页面切换
- [ ] Primary CTA、Store 链接、辅助 CTA
- [ ] Footer 所有 live link
- [ ] FAQ 展开、键盘操作、Schema 同步
- [ ] 404 与外部链接
- [ ] Privacy / Terms 可访问

### Preview Deployment / Preview QA

Production 前必须先完成一次可访问的 Preview Deployment，并在 Preview 环境执行回归。Preview QA 至少覆盖：

- [ ] 1440 / 1280 / 1024 / 768 / 390 / 360
- [ ] Header、mobile menu、language entry 和 Footer
- [ ] Hero screenshot 尺寸、裁切、可读性与真实结果态
- [ ] Primary install CTA 无装饰性箭头，Chrome Web Store 链接正确
- [ ] 代表性页面、所有启用 locale 路由和 404
- [ ] canonical、hreflang、x-default、og:url、sitemap、robots、locale `lang`
- [ ] 无横向滚动、broken image、明显 console error 或错误 redirect

Preview QA 通过后，才允许进入 Production Deploy；Preview 域名不得被当作正式 canonical、sitemap 或生产索引来源。

## 16. Post-deploy QA

使用 production URL 实测，而不是只看本地：

- [ ] 首页及代表性内页返回 HTTP 200
- [ ] canonical 指向正式域名
- [ ] `hreflang` 成对且路径对应
- [ ] OG / Twitter 标题、描述、图片正确
- [ ] OG 图片可直接访问，尺寸为 1200×630 或产品确定的标准尺寸
- [ ] sitemap、robots 可访问且内容正确
- [ ] JSON-LD 可解析，且没有虚假字段
- [ ] CTA、Store 链接、语言切换可用
- [ ] 旧域名、preview 域名和错误 trailing slash 行为符合计划
- [ ] 真实手机与桌面浏览器各验证一轮

## 17. External SEO Tool Review

外部工具的 warning 必须先判断是否是真实用户问题：

- Empty alt：装饰性图标可保持空 alt，不添加重复文案。
- Crawler 403：人工访问正常时，记录为 crawler limitation，不立即改代码。
- 缺少 `fb:app_id`：没有 Facebook App 时不创建虚假 ID。
- LinkedIn 缺 author / publication date：首页不是 Article 时可忽略。
- 社交平台 CDN 图片地址：抓取后变成平台 CDN 通常是正常缓存行为。

记录模板：

```md
## Tool Review — [date]
- Tool / URL:
- Fetch:
- Preview:
- Title / Description:
- Image:
- Canonical:
- Warnings:
- Decision: Fix / Ignore / Optional
- Reason:
- Code changed: Yes / No
```

## 18. GSC 与 Social Preview 收尾

### Google Search Console

- [ ] Property verification passed
- [ ] sitemap submitted
- [ ] sitemap discovered URLs 已记录
- [ ] 首页与代表性页面提交 indexing request（遵守配额）
- [ ] 未确认的页面不要写成 `Indexed`
- [ ] 后续观察 Coverage、页面索引、canonical 和语言版本

### Social Preview

- [ ] Facebook / Meta Sharing Debugger fetch 成功
- [ ] LinkedIn Post Inspector fetch 与 preview 成功
- [ ] X 可选；未测试不应标记为失败
- [ ] 记录最终抓取 URL、HTTP 200、标题、描述、图片、canonical

## 19. Codex 分阶段执行 SOP

### Phase 1 — Discovery

只做：读取项目结构、扩展入口、已有页面、路由、资产、环境变量和发布方式。

输出：现状、风险、缺口、不可假设的产品事实。

### Phase 2 — Product Facts & IA

先创建/完善 `PRODUCT_FACTS.md`，冻结页面清单、URL、语言、CTA、SEO origin 和暂缓页面。此阶段不追求视觉完成度。

### Phase 3 — Design System & Shell

实现 token、Header、mobile menu、语言切换、Footer、按钮和容器。先验证 shell，再扩展页面。

### Codex UI Execution Rule

涉及 Design System、Header、Footer、Hero、responsive、accessibility 或 visual QA 时，必须先使用已安装的 `ui-ux` Skill 完成审计与执行检查，再实施修改并进行视觉验证。不能只根据代码逻辑完成页面，也不能跳过该 Skill 直接把“能渲染”视为 UI 验收通过。

### Phase 4 — Home MVP & Core Pages

按 Home 骨架实现真实内容、截图和核心内页。每完成一个页面立即验证 desktop 1440/1280 与 mobile 390/360。

### Phase 5 — SEO Finalization

实现 metadata、canonical、hreflang、OG/Twitter、sitemap、robots、Schema 和 env guard。FAQ UI 与 FAQ Schema 使用同一数据源。

### Phase 6 — Freeze & Release QA

停止新增功能，执行 build、diff check、路由、链接、响应式、可访问性、图片和 Schema 检查，形成 checkpoint。

### Phase 7 — Preview Deployment & Preview QA

先部署 Preview，完成所有断点、页面、语言、CTA、截图和 SEO 标签回归；Preview QA 未通过时不得进入生产部署。

### Phase 8 — Production & Post-deploy

部署后直接访问 production URL，验证 HTTP、SEO 标签、资源、CTA、404、语言切换、sitemap、robots 和 JSON-LD。

### Phase 9 — External Review & GSC

记录 SEO 工具、Rich Results、Facebook、LinkedIn、GSC 的真实结果；区分 `Passed`、`Ignore`、`Optional`、`Pending`，不要为消除黄色提示制造数据。

### Phase 10 — Onboarding / Conversion Follow-up

上线后优先评估首次使用和转化问题，再决定 Pricing、About、Changelog、Blog 等扩展页面。

## 20. 产品变量 vs. Starter 固定项

### 产品变量（每个项目替换）

- 品牌名、Logo、品牌色、字体
- Hero 标题、描述、截图和产品动作
- 功能模块与使用场景
- 支持平台及验证状态
- Chrome Web Store URL
- 权限、数据处理、存储和网络行为
- FAQ 内容、Privacy / Terms 内容
- 定价、About、Changelog、Blog 是否上线
- Onboarding 步骤、截图和首次使用 CTA

### Starter 固定项（原则上复用）

- English 默认无 `/en` 前缀；其他启用 locale 使用 `/{locale}/` 前缀，语言集合由产品变量决定
- Header / mobile menu / Footer 信息架构
- Primary / Secondary CTA 层级
- Production origin 单一来源
- canonical、hreflang、OG/Twitter、sitemap、robots 基础设施
- Schema 只写真实事实的原则
- Home 页面叙事顺序
- 截图清理清单
- 1440 / 1280 / 1024 / 768 / 390 / 360 响应式检查
- Brand Asset Freeze、Hero Screenshot 标准和 Primary install CTA 无装饰性箭头
- Preview Deployment / Preview QA → Production / Post-deploy → External Review / GSC SOP
- 涉及 UI 质量的 Codex 任务使用已安装 `ui-ux` Skill

## 21. 最终交付检查表

- [ ] `PRODUCT_FACTS.md` 已完成且无矛盾
- [ ] 正式 URL、语言路由、canonical 和 trailing slash 已冻结
- [ ] 页面已按 Required / Conditional / Deferred 决策，没有机械创建空页面
- [ ] SEO Landing Page 已完成关键词映射与 cannibalization 检查
- [ ] Brand Asset Freeze 已完成，未使用 placeholder logo
- [ ] Header、Mobile Header、Footer 完成
- [ ] Home 按标准骨架完成
- [ ] CTA 层级清晰，每个页面没有过多同级动作
- [ ] 真实截图已脱敏、压缩并验证
- [ ] Hero screenshot 展示真实差异化功能和结果态，尺寸与留白通过 QA
- [ ] SEO 基础设施全部使用 production origin
- [ ] Schema 与页面事实一致
- [ ] Onboarding 已评估，未把 install-only 页面当 SEO 页面
- [ ] Build QA 通过
- [ ] Preview Deployment 与 Preview QA 通过
- [ ] Production QA 通过
- [ ] 外部 SEO 工具结果已记录并分类
- [ ] GSC property、sitemap、代表性 indexing request 已完成
- [ ] Social Preview 已验证或明确标记 Optional
- [ ] 未确认的收录状态没有被写成已收录
