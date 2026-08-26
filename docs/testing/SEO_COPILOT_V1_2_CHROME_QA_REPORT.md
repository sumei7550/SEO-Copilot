# SEO Copilot v1.2 Chrome Extension QA Report

**Date:** 2026-08-26  
**Scope:** Popup、真实 DOM、产品/电商页面、AI Fix MVP  
**Code changes:** None

## Executive result

真实 Chrome 截图确认扩展能够完成扫描并显示 Report、Score、Issues 和 AI Fix。

| Page | Score | Result |
|---|---:|---|
| Amazon homepage | 87 / Good | Scan complete、3 issues、AI Fix 可用 |
| Apple iPhone 16 | 97 / Excellent | `IMAGE_003` 触发 |
| Shopify homepage | 97 / Excellent | `TITLE_003` 触发、AI Fix 可用 |

## Popup chain

页面加载 → 扩展 Popup → Analyze → content script → `SCAN_PAGE` → Report 的最终用户结果已通过 Popup 截图验证。截图不能直接观测消息名称本身，但 Scan complete 和 Report 成功出现，证明用户可见链路工作。

## Rule findings

- `IMAGE_001`：Amazon DOM 采样为 24 个可审查图片、10 个缺 alt、58% coverage；触发合理。
- `IMAGE_002`：Amazon、eBay、Shopify、Apple 均未发现低于 50% coverage 的误报。
- `IMAGE_003`：Apple Popup 明确显示图片性能优化机会；规则能够真实触发。
- `TITLE_004`：此前的 head-only 修复继续有效，未见 body 示例代码误报。
- `CONTENT_002`：保持 Info、impact=0，不影响 Score。

## Performance

CNN、YouTube、Wikipedia 的 DOM 采样没有超时；页面 HTML 大小约为 6.99 MB、3.01 MB 和 0.51 MB。当前没有 Popup 实际 scan duration，因此不将 DOM 读取耗时当作 Extension scan time。

## Release recommendation

建议进入真实 AI API 阶段的受控 Alpha。进入前继续补测真实 API 的超时、错误和额度限制，并补充 Amazon Product Page Product Schema 与 `IMAGE_003` transfer size 数值证据。

详细结果：[results/v1.2](E:/susm-program/SEO-Copilot/docs/testing/results/v1.2)。
