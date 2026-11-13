# SEO Copilot 1.4.0 正式 Chrome 人工验收清单

日期：2026-11-12。**状态：等待人工执行；以下勾选框均不代表已经通过。**只使用本机正式 Google Chrome，不把 Chrome for Testing、Edge 或旧截图计入本表的通过证据。目标是核对当前 1.4.0 候选功能；本轮不改版本号、业务代码或 Release Notes。

## 构建身份与加载

- [ ] 记录 Chrome 版本、操作系统、测试日期及本次加载后 `chrome://extensions/` 显示的扩展 ID。测试者：____；Chrome 版本：____；扩展 ID：____。
- [ ] 加载目录：`E:\susm-program\SEO-Copilot\dist`。2026-11-12 16:06（北京时间）重新执行 `npm run build` 通过，并修复了原生 Popup 初始尺寸。`dist/index.html` SHA-256：`C9C7F9BA3446927FB19D44FB9B976A5ED0F3A81034AD9AF102154FF5E783A17F`；`dist/assets/styles.css` SHA-256：`5EDF4A872ADE32F218B2E091DDA2A1259D146413F83FEE1850ED5F8CF7A687B3`；`dist/popup.js` SHA-256：`24450AF0768FA6914B9D274703BF5B4DAA97812B60CFF8A6BBEAE07041C7E2BB`。验收前如重新构建，重新记录哈希并以新构建为准。
- [ ] **版本标识注意：**当前候选构建的 Manifest 仍显示 `1.3.1`；产品上一发布版由用户确认为 `1.3.2`。此差异待验收结束后核对并统一更新为 `1.4.0`。测试期间不要改版本，也不要把本候选构建作为 1.3.1 正式版。

**人工加载：**Chrome 地址栏打开 `chrome://extensions/` → 开启右上角「开发者模式」→「加载已解压的扩展程序」→ 选择上述 `dist` **文件夹本身**。确认卡片是 SEO Copilot，记下扩展 ID；如浏览器已有商店版，用 ID 区分两者。将本次扩展固定到工具栏，点击其图标打开原生 Popup。不要选择项目根目录或历史 `release/` ZIP。

**本轮尺寸修复后的重试：**如果此前已加载同一个 `dist`，先关闭旧 Popup，在 `chrome://extensions/` 对本次扩展 ID 点击 Reload，再打开测试页并点击工具栏图标。预期 Popup 是可读的两栏界面，约 520px 宽，底部有 Open SEO Audit；若仍只出现窄条，请截图扩展卡片 ID、Popup 和该卡片的错误详情，先将第 1 项标为失败。

**可复现测试页：**在项目目录运行 `node tmp/seo-copilot-1.4.0-manual-server.mjs`，保持终端运行；Chrome 打开 `http://127.0.0.1:8765/page`。服务仅绑定本机回环地址。页面有短 Title、10 条 H1–H3 标题、Canonical、一个有效 JSON-LD 块及两张图片；点击页面顶部 **Fix title on this page** 可在同一 URL 修改 Title，供 Rescan 使用。关闭终端即停止测试页服务。

每项填写 **通过／失败／无法验证**，失败或无法验证时写原因。截图建议保存在 `docs/screenshots/seo-copilot-1.4.0-manual/`，文件名按下列建议；截图应能看到扩展及当前页面，避免包含个人信息、AI 请求正文或密钥。

## 1. 原生工具栏 Popup 与六个模块

- [ ] **步骤：**在测试页点击工具栏 SEO Copilot 图标；确认打开的是浏览器工具栏 Popup。依次点击 Content、Indexability、Structured Data、Images、Social、Links，并在每项内容较长时滚动到底部。关闭再打开 Popup。
- **预期：**左侧品牌 Logo、帮助问号和六入口正常；右侧只切换当前工具，底部始终可见 Open SEO Audit。Content 保留 Title、Meta Description、字符数颜色、Copy、Word Count；Headings 默认 8 条，Show more 后 10 条，Show fewer 恢复 8 条，Copy Headings 输出 10 行 TSV（每行 `H1/H2/H3` + 真实 Tab + 完整标题，保留重复与 DOM 顺序）。Indexability 显示并可复制 Canonical；Structured Data 显示 1 个 JSON-LD block、0 个解析错误和 `WebPage` 类型；Images 显示 2 张已采集图片、URL、Alt 与自然尺寸，第二张缺 Alt，可逐项复制 URL。Social、Links 仅显示 Not checked／Coming soon。重新打开仍显示当前页面，不出现旧页面数据；没有额外打开 Side Panel。
- **截图：**`01-popup-content-top.png`、`01-popup-headings-expanded.png`、`01-popup-indexability.png`、`01-popup-structured.png`、`01-popup-images.png`、`01-popup-social-links.png`。Copy Headings 可粘贴到纯文本编辑器另存 `01-headings-tsv.txt`，确认 Tab 与 10 行。
- **实际：**____；**结果：**□ 通过 □ 失败 □ 无法验证；**证据：**____。

## 2. 站点权限：拒绝、允许、重新授权

- [ ] **步骤：**先通过 Popup 打开 Side Panel。随后在测试页 Tab 导航到 `https://example.com/`，再返回测试页，使临时 `activeTab` 授权结束。Side Panel 显示待扫描时点击 **Scan current page**；在 Chrome 权限提示中先拒绝，记录提示。点击 **Try again**，这次允许，记录新报告。如首次未出现授权提示，到本次扩展的详情页检查 `127.0.0.1` 站点访问权限；仅针对该测试扩展撤销该站点授权，再离开并返回测试页重试。最后再次撤销授权并重复允许流程，验证重新授权。
- **预期：**拒绝后不显示扫描结果，给出可重试的权限／扫描失败提示；允许后当前页扫描成功。撤销授权并离开／返回后，不应展示此前缓存的页面结果；重新授权后可以再次扫描。切到 `example.com` 时不得看到本地测试页的 Score 或内容。若 Chrome 从未显示权限提示，记录实际授权状态并将对应子项标为无法验证，不把无提示扫描当作“拒绝通过”。
- **截图：**`02-permission-prompt.png`、`02-permission-denied.png`、`02-permission-allowed.png`、`02-permission-revoked.png`、`02-permission-regranted.png`；扩展详情截图需能辨认扩展 ID。
- **实际：**____；**结果：**□ 通过 □ 失败 □ 无法验证；**证据：**____。

## 3. Popup → Side Panel 自动扫描与共享快照

- [ ] **步骤：**在测试页刷新一次，打开原生 Popup，等待页面数据加载；直接点击底部 **Open SEO Audit**。可在该扩展的 `chrome://extensions/` 卡片点击 Service worker 的「检查」打开 DevTools Console，查看会话键和快照元数据，不展开或截图完整页面数据：`Object.entries(await chrome.storage.session.get(null)).filter(([k])=>k.startsWith('seoSnapshot:')).map(([k,v])=>({key:k,generation:v.generation,savedAt:v.savedAt,score:v.result?.score}))`。如需确认复用，在 Popup 首次完成后记录 `savedAt`，重新打开 Popup 并点击 Open SEO Audit，再读一次。
- **预期：**点击后原生 Side Panel 打开，无需再次点 Scan；出现同一测试页的 SEO Score、Grade、Critical／Warning／Info、四大 Audit Categories 和 Issues。Popup 与 Side Panel 针对同一 Tab／URL 读取同一快照；若未发生 Rescan／刷新，快照 `generation` 与 `savedAt` 不变化。若无法读取 DevTools 元数据，可验证自动显示报告，但“共享快照未重扫”子断言标为无法验证。
- **截图：**`03-popup-open-audit.png`、`03-sidepanel-report.png`、`03-snapshot-before-after.png`（只显示 key、generation、savedAt、score）。
- **实际：**____；**结果：**□ 通过 □ 失败 □ 无法验证；**证据：**____。

## 4. 多 Tab、同 URL 刷新与 Rescan 同步

- [ ] **步骤：**保持测试页 Tab A 的报告，再开 Tab B 访问完全相同的 URL；在 Side Panel 中切换 A／B。回到 A 并刷新相同 URL，观察旧 Score 是否消失；手动扫描。点击测试页的 **Fix title on this page**，不改变 URL；回到 Side Panel 点 **Re-scan page**，记下前后 Score 与 Title Issue。最后再开 Popup，确认显示更新后的 Title。
- **预期：**Tab B 不复用 Tab A 的旧报告；切回 A 可读取仍有效的 A 快照。同 URL 刷新开始后旧报告立即失效，完成加载后回到待扫描态。点击页面按钮本身不自动改 Score；Rescan 后 Title 短问题消失、Score 按既有规则变化，Popup 获取当前页新数据。分类筛选不会改变 Score、Severity 总数或原始 Issues。
- **截图：**`04-tab-a-report.png`、`04-tab-b-no-old-report.png`、`04-refresh-idle.png`、`04-rescan-before-after.png`、`04-popup-updated-title.png`。
- **实际：**____；**结果：**□ 通过 □ 失败 □ 无法验证；**证据：**____。

## 5. AI Fix：真实后端成功与失败处理

- [ ] **步骤：**刷新测试页恢复短 Title，扫描后找到 Title Warning。为验证失败处理，可先在 **Side Panel 自身的 DevTools** 的 Network 面板设为 Offline，然后展开 **Improve with AI**；确认错误与 Retry，再恢复 Online 并点 Retry。成功路径只请求一次即可，不反复点击生成；记录后端 HTTP 状态及界面结果，但不要保存请求正文、认证头或密钥。若无法对 Side Panel 单独设置 Offline，可先在线验证真实后端成功，失败处理标为无法验证。
- **预期：**网络不可达时显示明确错误和 Retry，不显示伪造建议；恢复网络后通过真实后端获得 3 条可选择的建议并能复制选中项。若后端返回配额／限流错误，按其真实状态记录对应文案与倒计时，不能把这种响应写成成功。Offline 只证明客户端失败处理，不等于后端真实 5xx；若需证明 5xx，必须有实际后端失败响应。
- **截图：**`05-ai-failure.png`、`05-ai-success.png`、`05-ai-copy.png`；可附脱敏 Network 状态截图 `05-ai-network-status.png`。
- **实际：**____；**结果：**□ 通过 □ 失败 □ 无法验证；**真实后端状态：**____；**证据：**____。

## 6. Extension Reload 后清空 `chrome.storage.session`

- [ ] **步骤：**先在测试页完成扫描。在该扩展的 Service worker DevTools Console 执行：`Object.keys(await chrome.storage.session.get(null)).filter(k=>k.startsWith('seoSnapshot:'))`，确认至少一个快照键。到 `chrome://extensions/` 找到**本次扩展 ID** 的卡片，点击 Reload。**Reload 后先不要打开 Popup 或 Side Panel，也不要手动扫描。**重新检查该扩展 Service worker，在 Console 执行同一表达式；随后回到测试页重新打开 Popup／Audit，确认可以生成新快照。只对本次扩展操作，不重载商店版。
- **预期：**Reload 前快照键非空，Reload 后读取为空数组；重新扫描后产生新快照和正确报告。若 Reload 后无法检查 Service worker 或浏览器自动触发了新扫描，记录经过并标为无法验证，不能仅凭报告暂时消失宣称 session 已清空。
- **截图：**`06-reload-before-keys.png`、`06-reload-after-empty.png`、`06-reload-rescan.png`，包含扩展 ID 或能对应到扩展卡片的上下文，不截图完整存储值。
- **实际：**____；**结果：**□ 通过 □ 失败 □ 无法验证；**证据：**____。

## 人工结论

- [ ] 六项结果和证据齐全；失败／无法验证项已列出具体原因。
- [ ] 记录本轮实际扩展 ID、Chrome 版本、构建哈希及测试日期；截图未包含私密请求内容。
- [ ] 测试结束后停止本地 fixture 服务；如在日常 Chrome Profile 中加载了测试扩展，仅移除**本次扩展 ID** 的未打包副本，不影响商店版或其他扩展。

**总体：**□ 通过 □ 不通过 □ 证据不足。**审核人／日期：**____。在收到人工结果并确认全部发布门槛前，不更新版本配置、Release Notes 或执行发布操作。
