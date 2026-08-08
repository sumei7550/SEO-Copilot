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