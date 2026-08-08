- 06_CODEX_BUILD_PROMPT.md

  # SEO Copilot Codex 开发执行规范（最终版）

  # 1. 开发任务定义

  项目名称：

  SEO Copilot

  开发目标：

  根据项目文档：

  -   01_PROJECT_PLAN.md
  -   02_PRODUCT_SPEC.md
  -   03_TECHNICAL_SPEC.md
  -   04_SEO_ENGINE_SPEC.md
  -   05_BUSINESS_ROADMAP.md

  开发完整 Chrome Extension MVP。

  # 2. 产品目标

  创建：

  Chrome Manifest V3 SEO Audit Extension。

  用户流程：

  打开网页

  ↓

  点击 SEO Copilot

  ↓

  扫描页面

  ↓

  分析 SEO

  ↓

  生成评分

  ↓

  显示报告

  # 3. 开发原则

  ## MVP优先

  第一版本只实现：

  快速发现网页SEO问题，并提供优化建议。

  禁止：

  -   AI API
  -   用户登录
  -   支付系统
  -   SaaS后台
  -   排名追踪
  -   外链数据库
  -   关键词数据库

  ## 模块化

  要求：

  -   单一职责
  -   可维护
  -   可扩展

  ## 类型安全

  必须：

  -   TypeScript
  -   明确定义接口
  -   避免大量any

  # 4. 技术要求

  Frontend:

  -   React
  -   TypeScript
  -   Vite
  -   Tailwind CSS

  Extension:

  -   Chrome Manifest V3

  Storage:

  -   Chrome Storage API

  Internationalization:

  -   Chrome i18n API

  支持：

  -   en
  -   zh_CN
  -   ja
  -   ko
  -   es
  -   de
  -   fr
  -   pt_BR

  # 5. 项目结构

  生成：

  SEO-Copilot/

  docs/

  src/

  background/

  content/

  analyzer/

  rules/

  scoring/

  popup/

  report/

  components/

  types/

  utils/

  \_locales/

  必须包含：

  -   manifest.json
  -   package.json
  -   vite.config.ts
  -   tsconfig.json
  -   README.md

  # 6. 功能要求

  ## SEO Scanner

  负责：

  读取网页。

  获取：

  -   URL
  -   Title
  -   Meta Description
  -   H1
  -   H2
  -   H3
  -   图片ALT
  -   Canonical
  -   Schema

  输出：

  SEO Page Data。

  ## Analyzer

  整理扫描数据。

  例如：

  图片数量100

  缺少ALT40

  输出：

  ALT覆盖率60%。

  ## Rule Engine

  根据 SEO Engine 文档实现规则。

  至少：

  20条SEO规则。

  输出：

  { id, category, severity, messageKey, solutionKey, impact }

  ## Score Engine

  根据Issue计算：

  SEO Score。

  输出：

  { score, grade }

  ## Popup

  显示：

  -   SEO Score
  -   Issue Summary
  -   View Report

  ## Report

  显示：

  -   总评分
  -   分类评分
  -   问题
  -   严重等级
  -   解决建议

  # 7. SEO规则要求

  实现：

  Title:

  -   Missing Title
  -   Too Short
  -   Too Long
  -   Duplicate

  Meta:

  -   Missing Description
  -   Too Short
  -   Too Long

  Heading:

  -   Missing H1
  -   Multiple H1
  -   Poor Structure

  Images:

  -   Missing ALT
  -   ALT比例不足
  -   图片过大

  URL:

  -   URL过长
  -   URL结构异常

  Technical:

  -   Missing Canonical
  -   Missing Schema
  -   Invalid Schema

  Content:

  -   Low Word Count
  -   Low Text Ratio

  # 8. 国际化要求

  禁止：

  硬编码文本。

  错误：

  "Missing Title"

  正确：

  chrome.i18n.getMessage()

  # 9. 错误处理

  必须处理：

  -   页面无法访问
  -   Chrome限制页面
  -   DOM不存在
  -   Schema解析失败

  插件不能崩溃。

  # 10. 性能要求

  目标：

  普通网页2秒完成扫描。

  要求：

  -   减少DOM重复遍历
  -   异步处理
  -   控制内存占用

  # 11. 安全要求

  禁止：

  -   收集浏览历史
  -   上传网页数据
  -   未授权数据采集

  权限：

  -   activeTab
  -   scripting
  -   storage

  # 12. 测试要求

  测试：

  ## 安装

  chrome://extensions

  ## 功能

  确认：

  -   扫描成功
  -   Score生成
  -   Issue显示
  -   Report正常

  ## 多语言

  测试：

  -   English
  -   中文
  -   日本語

  # 13. Codex输出要求

  完成后输出：

  1.  文件树

  2.  创建文件列表

  3.  安装步骤

  4.  Build步骤

  5.  Chrome加载步骤

  6.  测试结果

  7.  已知问题

  # 14. 最终验收标准

  必须：

  -   Chrome插件可安装
  -   可以扫描网页
  -   SEO规则运行
  -   SEO Score生成
  -   Report正常
  -   支持8语言
  -   npm build成功

  # 开发完成标准

  SEO Copilot MVP 可以交付真实用户测试。
