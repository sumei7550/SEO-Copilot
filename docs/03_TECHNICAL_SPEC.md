# 03_TECHNICAL_SPEC.md

# SEO Copilot 技术规格文档（最终版）

# 1. 技术目标

## 1.1 开发目标

开发一个 Chrome Manifest V3 Extension。

用户流程：

打开网页 → 点击 SEO Copilot → 扫描页面 → 分析 SEO 问题 → 计算 SEO Score
→ 生成报告

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

popup/ - App.tsx - main.tsx

report/

components/

types/ - seo.ts

utils/

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
