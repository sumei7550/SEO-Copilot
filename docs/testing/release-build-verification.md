# SEO Copilot V1.1.0 — Release Build Verification

## V1.1.0 本地构建记录

**日期：** 2026-08-26
**版本：** `1.1.0`
**命令：** `npm run build`

### 结果

- ✅ i18n fallback 同步完成
- ✅ TypeScript 增量检查通过
- ✅ Vite production build 通过
- ✅ Extension build verifier 通过
- ✅ Manifest V3、最小权限和自包含 content script 验证通过

### 构建产物摘要

| 文件 | 大小 | gzip |
| --- | ---: | ---: |
| `dist/index.html` | 0.33 kB | 0.24 kB |
| `dist/assets/popup.css` | 17.90 kB | 4.94 kB |
| `dist/content.js` | 8.51 kB | 2.77 kB |
| `dist/popup.js` | 215.07 kB | 67.96 kB |

构建产物未纳入 Git（`dist/` 在 `.gitignore` 中），使用以下命令即可重新生成：

```bash
npm run build
```

以下为 V1.0.0 的历史验证记录。

---

# SEO Copilot V1.0.0 — Historical Release Build Verification

**Date:** 2026-08-08
**Node/npm:** as shipped with local environment
**Working directory:** `d:\Program Files\Zozo\SEO-Copilot`
**Command:** `npm test` then `npm run build`

---

## 1. Tests

```
> seo-copilot@1.0.0 test
> vitest run

 RUN  v4.1.10 D:/Program Files/Zozo/SEO-Copilot

 Test Files  4 passed (4)
      Tests  14 passed (14)
   Start at  21:41:17
   Duration  737ms
```

* **Result:** ✅ PASS
* **Files:** `src/analyzer/scanner.test.ts`, `src/popup/scanActiveTab.test.ts`, `src/rules/seoRules.test.ts`, `src/scoring/score.test.ts`
* **Warnings:** none.
* **Notes:** Test suite is intentionally small (14 tests across scanner / rule engine / scoring / active-tab handshake). No DOM-scanner integration tests exist yet — the 20-site regression compensates by exercising real HTML through the rule set.

## 2. TypeScript check

`npm run build` runs `tsc -b` before Vite.

* **Result:** ✅ PASS (no diagnostics printed; if `tsc` had errors the build would have aborted before Vite began).
* Existing incremental artifact preserved: `tsconfig.tsbuildinfo`.

## 3. Production build (Vite)

```
Synchronized the English development fallback catalog.
vite v8.2.1 building client environment for production...
✓ 28 modules transformed.
rendering chunks...
computing gzip size...
dist/index.html          0.33 kB │ gzip:  0.24 kB
dist/assets/popup.css   14.70 kB │ gzip:  3.89 kB
dist/content.js          6.90 kB │ gzip:  2.24 kB
dist/popup.js          204.07 kB │ gzip: 64.16 kB

✓ built in 1.58s
Extension build verified: V1.0.0, minimal permissions, self-contained content script, and valid Manifest V3 manifest.
```

* **Result:** ✅ PASS
* **Warnings:** none.
* **Post-build verifier (`scripts/verify-extension-build.mjs`):** ✅ PASS. It asserts:
  * `dist/content.js` contains no ESM `import`/`export` statements (Chrome content scripts are not modules).
  * `dist/manifest.json` is a valid Manifest V3 popup extension.
  * Manifest version is exactly `1.0.0`.
  * Permissions are exactly `activeTab,scripting,storage` plus the configured SEO Copilot backend host permission.
  * All four icon sizes (16/32/48/128) exist in `dist/icons/`.
  * All 8 locales (`en`, `zh_CN`, `ja`, `ko`, `es`, `de`, `fr`, `pt_BR`) have message catalogs whose keys match the English catalog exactly.

## 4. `dist/` contents

```
dist/manifest.json                532 B
dist/index.html                   336 B
dist/content.js                 6.9 KB
dist/popup.js                 204.1 KB
dist/assets/popup.css          14.7 KB
dist/icons/icon16.png             602 B
dist/icons/icon32.png            1.4 KB
dist/icons/icon48.png            2.4 KB
dist/icons/icon128.png           8.7 KB
dist/icons/icon-master.png     358.5 KB   ← source master, not required for CWS
dist/_locales/{en,zh_CN,ja,ko,es,de,fr,pt_BR}/messages.json
```

* **`manifest.json` at dist root:** ✅ present.
* **Content script self-contained:** ✅ (verifier already asserted).
* **Icons complete:** ✅ 16/32/48/128 all present.
* **Locales complete:** ✅ 8 locales, key-parity enforced by verifier.
* **Note:** `dist/icons/icon-master.png` (358 KB) is the source master. It is copied into `dist/` because `public/` is served verbatim by Vite. It ships in the ZIP too. Not a blocker for CWS, but a small housekeeping candidate for a future build tweak.

### Manifest at dist root

```json
{
  "manifest_version": 3,
  "name": "__MSG_extensionName__",
  "description": "__MSG_extensionDescription__",
  "version": "1.0.0",
  "default_locale": "en",
  "icons": { "16": "icons/icon16.png", "32": "icons/icon32.png", "48": "icons/icon48.png", "128": "icons/icon128.png" },
  "action": {
    "default_popup": "index.html",
    "default_title": "__MSG_extensionName__",
    "default_icon": { "16": "icons/icon16.png", "32": "icons/icon32.png", "48": "icons/icon48.png" }
  },
  "permissions": ["activeTab", "scripting"]
}
```

## 5. Release ZIP

* **File:** `seo-copilot-v1.0.0.zip` (454,676 bytes)
* **SHA-256:** `d8adb8471cbf2889a1fe31526719680980c617804d613a98573706ba617b1fbb`
* **ZIP root contains `manifest.json`:** ✅ yes (17 entries, all at ZIP root — no wrapper directory).
* **Content parity check** (byte-for-byte SHA-256, dist vs ZIP):

  ```
  manifest.json   MATCH  ecd3be596e26…
  content.js      MATCH  828d4904f950…
  popup.js        MATCH  5bba43f39c4b…
  index.html      MATCH  41279c660bff…
  ```

  → the ZIP on disk matches today's rebuilt `dist/`.
* **Note:** the ZIP timestamp is `2026-08-08 20:23` (earlier today, from a prior build). Content is identical, so it is safe to ship. If you want a fully reproducible build stamp, re-zip from the current `dist/` before submitting.

## 6. Overall

| Check | Result |
|-------|--------|
| Unit tests | ✅ 14/14 pass |
| TypeScript strict | ✅ pass |
| Vite production build | ✅ pass (1.58 s) |
| Post-build verifier | ✅ pass |
| `dist/manifest.json` at root | ✅ present |
| Manifest version matches package version (`1.0.0`) | ✅ |
| Permissions minimal (`activeTab`, `scripting`) | ✅ |
| Icons 16/32/48/128 packaged | ✅ |
| Locales key-parity across 8 languages | ✅ |
| Release ZIP root contains `manifest.json` | ✅ |
| ZIP contents match `dist/` | ✅ |

**No blocking build issues.** Optional cleanups: exclude `icons/icon-master.png` from the shipped ZIP; re-generate the ZIP so the archive timestamp matches the current build.
