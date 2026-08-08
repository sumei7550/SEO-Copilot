# 04_SEO_ENGINE_SPEC.md

# SEO Copilot SEO分析引擎规格文档（最终版）

# 1. SEO Engine概述

## 1.1 定义

SEO Engine 是 SEO Copilot 的核心业务模块。

负责：

1.  获取网页SEO数据
2.  根据SEO规则检测问题
3.  判断问题严重程度
4.  生成优化建议
5.  输出评分依据

## 1.2 产品目标

SEO Engine 不追求成为 Ahrefs、Semrush 级别的数据平台。

目标：

> 用简单、可靠、可执行的规则，帮助普通用户发现页面SEO问题。

# 2. SEO分析流程

网页HTML

↓

SEO Scanner

↓

SEO Page Data

↓

Rule Engine

↓

SEO Issues

↓

Score Engine

↓

SEO Report

# 3. SEO数据结构

``` typescript
interface SEOPageData {

url:string;

title:string;

metaDescription:string;

headings:Heading[];

images:ImageData[];

canonical:string;

schema:any[];

wordCount:number;

}
```

# 4. Rule Engine规则结构

``` typescript
interface SEORule {

id:string;

category:string;

severity:string;

check(data):boolean;

impact:number;

messageKey:string;

solutionKey:string;

}
```

# 5. Title规则

## TITLE_001

名称： Missing Title

目的： 确保搜索引擎能够识别页面主题。

检测：

document.title为空。

Severity：

Critical

影响：

-10分

## TITLE_002

名称： Title Too Short

检测：

title.length \< 30

Severity：

Warning

影响：

-5分

## TITLE_003

名称： Title Too Long

检测：

title.length \> 60

Severity：

Warning

影响：

-3分

## TITLE_004

名称： Duplicate Title

检测： 页面标题重复。

Severity：

Info

# 6. Meta Description规则

## META_001

名称： Missing Meta Description

检测：

不存在 meta description。

Severity：

Critical

影响：

-10分

## META_002

名称： Meta Too Short

检测：

length \< 70

## META_003

名称： Meta Too Long

检测：

length \> 160

# 7. Heading规则

## HEADING_001

名称： Missing H1

检测：

h1.length === 0

Severity：

Critical

影响：

-8分

## HEADING_002

名称： Multiple H1

检测：

h1.length \> 1

Severity：

Warning

影响：

-4分

## HEADING_003

名称： Poor Heading Structure

检测：

标题层级异常。

# 8. Image规则

## IMAGE_001

名称： Missing ALT

检测：

图片没有alt属性。

Severity：

Warning

影响：

-5分

## IMAGE_002

名称： High Missing ALT Ratio

检测：

ALT缺失比例 \>50%

Severity：

Warning

影响：

-5分

## IMAGE_003

名称： Large Image Opportunity

检测：

图片文件过大。

# 9. URL规则

## URL_001

名称： Long URL

检测：

URL长度 \>100字符。

## URL_002

名称： Poor URL Structure

检测：

-   大量参数
-   随机ID
-   不可读路径

# 10. Technical SEO规则

## TECH_001

名称： Missing Canonical

检测：

不存在canonical。

Severity：

Warning

## TECH_002

名称： Missing Schema

检测：

不存在JSON-LD。

Severity：

Info

## TECH_003

名称： Invalid Schema

检测：

JSON解析失败。

# 11. Content规则

## CONTENT_001

名称： Low Word Count

检测：

正文少于300 words。

## CONTENT_002

名称： Low Text Ratio

检测：

页面文本比例过低。

# 12. Issue等级定义

## Critical

严重问题。

例如： - 缺少Title - 缺少Meta - 缺少H1

## Warning

优化建议。

例如： - ALT缺失 - 长度问题

## Info

增强建议。

例如： - Schema优化

# 13. Issue输出格式

``` typescript
{
id:"TITLE_001",
category:"title",
severity:"critical",
impact:-10,
messageKey:"title_missing",
solutionKey:"title_add"
}
```

# 14. SEO Engine与Score Engine关系

SEO Engine：

负责发现问题。

Score Engine：

负责计算分数。

流程：

SEO Rule Engine

↓

Issues

↓

Score Engine

↓

SEO Score

# 15. V1规则数量总结

  分类          数量
----------- ------
  Title            4
  Meta             3
  Heading          3
  Image            3
  URL              2
  Technical        3
  Content          2
  总计            20

# 16. SEO Engine验收标准

完成后：

-   可以扫描页面SEO数据
-   可以检测20条规则
-   每个问题有严重等级
-   每个问题有优化建议
-   输出统一Issue格式
-   Score Engine可以使用Issue数据
