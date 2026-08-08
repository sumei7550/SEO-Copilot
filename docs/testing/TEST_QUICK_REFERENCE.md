# SEO Copilot v1.0.0 - 测试快速参考卡

## 🚀 快速开始

### 1. 准备环境
```bash
# 运行准备脚本
bash scripts/run-test-preparation.sh

# 或手动执行
npm test && npm run build
```

### 2. 加载扩展
```
chrome://extensions/ → 开发者模式 → 加载已解压的扩展 → 选择 dist/ 目录
```

### 3. 开始测试
打开 [TEST_REGRESSION_MATRIX.md](TEST_REGRESSION_MATRIX.md) 并逐个测试 20 个网站

---

## 📝 每个网站的标准流程

### 5步测试法
```
1. 访问网站 → 等待完全加载
2. F12 打开 Console → 清空日志
3. 点击扩展图标 → 点击 "Scan Current Page"
4. 观察扫描过程 → 记录控制台状态
5. 验证结果完整性 → 更新测试矩阵
```

### 记录格式
```markdown
| # | 网站 | URL | 扫描 | 控制台 | 评分 | Schema | 性能 | 备注 |
| 1 | 示例 | https://... | ✅ | ✅ | ✅ | ➖ | ⚠️ | 3.2s |
```

---

## ✅ 判定标准速查

| 维度 | ✅ 成功 | ⚠️ 警告 | ❌ 失败 |
|------|---------|---------|---------|
| **扫描** | 完成并显示结果 | - | 崩溃/无响应 |
| **控制台** | 无错误 | 有黄色警告 | 有红色错误 |
| **评分** | 6个类别完整 | 部分类别缺失 | 无评分显示 |
| **Schema** | 成功解析 | - | 有Schema但未识别 |
| **性能** | <2秒 | 2-5秒 | >5秒 |

**重要**: ➖ 表示"不适用"（如页面无Schema）

---

## 🎯 20站测试清单

### 静态站点 (3个)
- [ ] 1. GitHub Pages - https://pages.github.com
- [ ] 2. Bootstrap - https://getbootstrap.com
- [ ] 3. MDN - https://developer.mozilla.org

### CMS平台 (3个)
- [ ] 4. WordPress - https://wordpress.org
- [ ] 5. TechCrunch - https://techcrunch.com
- [ ] 6. White House - https://www.whitehouse.gov

### Next.js (3个)
- [ ] 7. Next.js - https://nextjs.org
- [ ] 8. Vercel - https://vercel.com
- [ ] 9. TikTok - https://www.tiktok.com

### SPA (3个)
- [ ] 10. React - https://react.dev
- [ ] 11. Vue - https://vuejs.org
- [ ] 12. Angular - https://angular.dev

### 电商 (3个)
- [ ] 13. Amazon - https://www.amazon.com
- [ ] 14. eBay - https://www.ebay.com
- [ ] 15. Shopify - https://www.shopify.com

### 新闻媒体 (2个)
- [ ] 16. CNN - https://www.cnn.com
- [ ] 17. BBC - https://www.bbc.com/news

### 超大DOM (3个)
- [ ] 18. Reddit - https://www.reddit.com
- [ ] 19. YouTube - https://www.youtube.com
- [ ] 20. Wikipedia - https://en.wikipedia.org

---

## 🐛 常见问题快速排查

### Q1: 点击按钮无响应
```
→ 查看 Console 是否有 "Refused to execute" 
→ 刷新页面重试
→ 检查扩展权限状态
```

### Q2: 扫描卡住不动
```
→ 等待15秒判定超时
→ 查看 Console 最后一条日志
→ 标记为失败案例
```

### Q3: 评分显示 0 或 NaN
```
→ 检查各类别独立评分
→ 截图完整结果
→ 标记为 P0 问题
```

### Q4: Schema 明明存在却说没有
```
→ 查看源代码确认 JSON-LD 格式
→ 记录到备注列
→ 如格式正确则标记为问题
```

---

## 📊 测试完成后统计

### 必填数据
1. 总成功数: ___ / 20
2. 成功率: ___%
3. P0问题数: ___
4. P1问题数: ___

### 合格标准
- ✅ 成功率 ≥ 90% (18/20)
- ✅ 无 P0 阻塞问题
- ✅ 静态站点 100% 成功

### 上架建议
- [ ] ✅ **通过** - 满足合格标准
- [ ] ⚠️ **条件通过** - 成功率 80-89%
- [ ] ❌ **不通过** - 成功率 < 80%

---

## 💡 测试技巧

### 加速记录
使用简写快速填表，事后补充：
```
1. ✅✅✅➖✅ 1.5s
2. ✅⚠️✅✅⚠️ 3.1s CSP warn
3. ❌❌❌➖❌ inject fail
```

### 并行测试
多窗口同时测试不同类别

### 重点关注
- 静态站点必须 100% 成功
- 主流平台（前15个）是核心
- 超大DOM（后3个）可以较宽松

---

## 📚 相关文档

- [TEST_REGRESSION_MATRIX.md](TEST_REGRESSION_MATRIX.md) - 测试矩阵表格（记录结果）
- [TEST_EXECUTION_GUIDE.md](TEST_EXECUTION_GUIDE.md) - 详细执行指南
- [HANDOFF.md](HANDOFF.md) - 项目交接文档

---

## ⏱️ 预计用时

- 准备环境: 5分钟
- 每个网站测试: 2-3分钟
- 总测试时间: 40-60分钟
- 结果统计: 10分钟

**总计**: 约 1-1.5 小时完成完整回归测试

---

**记住**: 测试目标是验证扫描稳定性，不是评判网站SEO得分高低！
