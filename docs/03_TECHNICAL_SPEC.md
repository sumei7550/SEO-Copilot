# 03_TECHNICAL_SPEC.md

# SEO Copilot 技术规格文档（最终版）

# 1. 技术目标

## 1.1 开发目标

开发一个 Chrome Manifest V3 Extension。

用户流程：

打开网页 → 点击 SEO Copilot → 扫描页面 → 分析 SEO 问题 → 计算 SEO Score
→ 生成报告 →（可选）生成 AI 文案建议 → 复制到页面 → Re-scan 验证

# 2. 技术选型

## React

用途： - Popup界面 - Report页面 - 组件管理

原因： - 生态成熟 - 组件化开发 - 方便未来扩展 SaaS Web端

## TypeScript

用途： - 定义数据结构 - 保证类型安全 - 降低维护成本

要求： 开启 strict mode。

## Vite

用途： - 快速开发 - 构建 React + TypeScript 项目

## Tailwind CSS

用途： - 快速构建UI - 保持设计一致性

# 3. Chrome Extension 架构

整体流程：

用户浏览器

↓

当前网页

↓

Content Script

↓

SEO Scanner

↓

Analyzer

↓

Rule Engine

↓

Score Engine

↓

React UI

↓

SEO Report

# 4. Chrome Extension模块设计

## 4.1 Manifest

文件：

manifest.json

职责： - 插件信息 - 权限 - 页面入口 - Content Script配置

版本： Manifest V3

## 4.2 Background Service Worker

文件：

src/background/serviceWorker.ts

职责： - 插件生命周期 - 消息通信 - 后台事件

不负责SEO业务逻辑。

## 4.3 Content Script

文件：

src/content/scanner.ts

职责： 读取当前网页DOM。

采集：

页面基础信息： - URL - Title - Meta Description

页面结构： - H1 - H2 - H3

图片： - 图片数量 - ALT信息

Technical： - Canonical - Schema

输出： SEO Page Data。

## 4.4 Analyzer模块

职责： 整理原始数据。

例如：

输入： 图片100张 缺少ALT 40张

输出： ALT覆盖率60%。

## 4.5 Rule Engine

核心业务模块。

输入： SEO Page Data

输出： SEO Issue。

示例：

输入： title为空

输出：

{ id:"TITLE_001", severity:"critical", impact:-10 }

## 4.6 Score Engine

职责： 计算最终SEO评分。

输出：

{ score:82, grade:"good" }

## 4.7 React UI

包含：

Popup： 快速查看。

Report： 完整分析。

## 4.8 AI Fix 服务边界

AI Fix 只处理可通过文案生成直接修复的问题：

- `TITLE_001`、`TITLE_002`、`TITLE_003`
- `META_001`、`META_002`、`META_003`
- `HEADING_001`、`HEADING_003`

`IssueList` 通过 `canUseAiFix()` 判断是否显示入口，并由 `buildAiFixContext()` 组装最小页面上下文（URL、标题、描述、H1、语言、页面类型、品牌和问题诊断）。`generateSeoFix()` 是唯一的服务入口，当前实现调用本地 `generateSeoFixMock()`，返回 3 条候选、理由和重点。组件不直接依赖 provider，便于后续替换真实 API。

AI Fix 不会自动修改网页，也不处理 Canonical、Schema、重复标签、图片或其他技术/结构问题。用户必须自行复制并修改页面，再通过重新扫描验证。

# 5. 项目目录结构

SEO-Copilot/

docs/

src/

background/ - serviceWorker.ts

content/ - scanner.ts

analyzer/ - titleAnalyzer.ts - metaAnalyzer.ts - headingAnalyzer.ts -
imageAnalyzer.ts - technicalAnalyzer.ts

rules/ - titleRules.ts - metaRules.ts - headingRules.ts -
imageRules.ts - technicalRules.ts

scoring/ - scoreEngine.ts

popup/ - App.tsx - main.tsx - previewResult.ts - scanActiveTab.ts

report/ - Report.tsx

components/ - AiFixPanel.tsx - IssueList.tsx - ScoreCard.tsx

types/ - seo.ts - aiFix.ts

services/ - buildAiFixContext.ts - generateSeoFix.ts - generateSeoFix.mock.ts

utils/ - aiFix.ts - i18n.ts

\_locales/

# 6. 数据模型设计

## SEOReport

包含：

-   url
-   score
-   grade
-   metrics
-   issues

## SEO Metrics

包含：

-   title
-   meta
-   heading
-   images
-   technical
-   content

## SEO Issue

包含：

-   id
-   category
-   severity
-   messageKey
-   solutionKey
-   impact

# 7. 数据流程

用户点击插件

↓

获取当前Tab

↓

启动Content Script

↓

读取网页DOM

↓

生成SEO Data

↓

Rule Engine分析

↓

生成Issue列表

↓

Score Engine计算

↓

React展示报告

# 8. 数据存储方案

MVP：

使用 Chrome Storage API。

保存：

## 用户设置

例如： - 默认语言 - UI偏好

## 扫描历史（可选）

保存：

-   URL
-   Score
-   Date

AI Fix MVP 不持久化页面内容、建议或扫描历史；Mock Provider 仅在当前 Popup 生命周期内生成结果。

# 9. 验证要求

提交前至少执行：

```bash
npm test
npm run build
```

`npm run build` 会同步 i18n fallback、执行 TypeScript 检查、构建 Vite 产物，并验证 Manifest V3 扩展包及自包含 content script。

不保存：

-   浏览历史
-   用户隐私数据
-   页面内容

# 9. 多语言架构

支持：

-   en
-   zh_CN
-   ja
-   ko
-   es
-   de
-   fr
-   pt_BR

目录：

\_locales/

-   en
-   zh_CN
-   ja
-   ko
-   es
-   de
-   fr
-   pt_BR

要求：

禁止硬编码文本。

必须使用 Chrome i18n API。

# 10. Chrome权限设计

最小权限原则。

需要：

-   activeTab
-   scripting
-   storage

禁止：

-   浏览历史权限
-   用户数据权限
-   未授权采集

# 11. 性能要求

目标：

普通网页2秒内完成扫描。

要求：

-   减少DOM重复遍历
-   异步处理
-   大页面降级处理

# 12. 安全要求

MVP：

本地分析优先。

禁止：

-   上传用户网页内容
-   收集浏览记录
-   未授权数据采集

# 13. 开发规范

必须：

-   模块化
-   TypeScript严格类型
-   单一职责
-   可测试

避免：

-   一个文件包含全部逻辑
-   UI和业务混合
-   硬编码文本

# 14. 技术验收标准

完成后：

-   Chrome插件可以安装
-   可以扫描网页
-   可以生成SEO Score
-   可以显示Issue
-   可以显示优化建议
-   多语言可切换
-   npm build成功
