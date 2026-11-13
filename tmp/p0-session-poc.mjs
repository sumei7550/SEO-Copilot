import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import http from 'node:http';
import { spawn } from 'node:child_process';
import { performance } from 'node:perf_hooks';

const chromePath = process.env.P0_BROWSER_PATH || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const root = fs.mkdtempSync(path.join(os.tmpdir(), 'seo-copilot-p0-'));
const extensionDir = path.join(root, 'extension');
const profileDir = path.join(root, 'profile');
fs.mkdirSync(extensionDir);
fs.writeFileSync(path.join(extensionDir, 'manifest.json'), JSON.stringify({
  manifest_version: 3, name: 'SEO Copilot P0 Session PoC', version: '0.0.1',
  minimum_chrome_version: '116',
  permissions: ['storage', 'tabs', 'sidePanel'],
  action: { default_popup: 'popup.html' },
  side_panel: { default_path: 'panel.html' },
  background: { service_worker: 'sw.js' }
}));
const doc = (name) => `<!doctype html><meta charset="utf-8"><title>${name}</title><script src="ui.js"></script>`;
fs.writeFileSync(path.join(extensionDir, 'popup.html'), doc('Popup'));
fs.writeFileSync(path.join(extensionDir, 'panel.html'), doc('Side Panel'));
fs.writeFileSync(path.join(extensionDir, 'ui.js'), `
window.poc = {
  query: async (url) => (await chrome.tabs.query({})).find(t => t.url === url),
  generation: async (tabId) => (await chrome.storage.session.get('gen:' + tabId))['gen:' + tabId] ?? 0,
  write: async (tabId, url, generation, result) => chrome.runtime.sendMessage({type:'WRITE', tabId, url, generation, result}),
  read: async (tabId, url) => chrome.runtime.sendMessage({type:'READ', tabId, url}),
  bytes: async () => chrome.storage.session.getBytesInUse(null),
  openPanel: async (tabId) => chrome.sidePanel.open({tabId}),
  reloadExtension: () => chrome.runtime.reload()
};`);
fs.writeFileSync(path.join(extensionDir, 'sw.js'), `
const queues = new Map();
function enqueue(tabId, task) {
  const prior = queues.get(tabId) || Promise.resolve();
  const next = prior.catch(() => {}).then(task);
  queues.set(tabId, next);
  next.finally(() => { if (queues.get(tabId) === next) queues.delete(tabId); });
  return next;
}
async function generation(tabId) {
  const key = 'gen:' + tabId;
  return (await chrome.storage.session.get(key))[key] ?? 0;
}
chrome.tabs.onUpdated.addListener((tabId, change) => {
  if (change.status !== 'loading' && change.url === undefined) return;
  void enqueue(tabId, async () => {
    const next = (await generation(tabId)) + 1;
    await chrome.storage.session.set({ ['gen:' + tabId]: next });
    await chrome.storage.session.remove('snap:' + tabId);
  });
});
chrome.tabs.onRemoved.addListener((tabId) => {
  void enqueue(tabId, () => chrome.storage.session.remove(['gen:' + tabId, 'snap:' + tabId]));
});
chrome.runtime.onMessage.addListener((message, sender, respond) => {
  if (message.type !== 'WRITE' && message.type !== 'READ') return;
  void enqueue(message.tabId, async () => {
    const tab = await chrome.tabs.get(message.tabId).catch(() => null);
    const current = await generation(message.tabId);
    if (!tab || tab.url !== message.url || tab.status !== 'complete') return {ok:false, reason:'tab-mismatch-or-loading', generation:current};
    if (message.type === 'WRITE') {
      if (message.generation !== current) return {ok:false, reason:'stale-generation', generation:current};
      await chrome.storage.session.set({ ['snap:' + message.tabId]: {
        tabId:message.tabId, url:message.url, generation:current, result:message.result
      }});
      return {ok:true, generation:current};
    }
    const snapshot = (await chrome.storage.session.get('snap:' + message.tabId))['snap:' + message.tabId];
    return snapshot?.url === message.url && snapshot.generation === current
      ? {ok:true, snapshot} : {ok:false, reason:'no-valid-snapshot', generation:current};
  }).then(respond, e => respond({ok:false, reason:String(e)}));
  return true;
});`);

const server = http.createServer((req, res) => {
  res.writeHead(200, {'content-type':'text/html; charset=utf-8'});
  res.end('<!doctype html><title>Fixture</title><h1>Fixture</h1>');
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const baseUrl = `http://127.0.0.1:${server.address().port}/page`;

function sleep(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }
async function waitFor(fn, timeoutMs = 15000, every = 100) {
  const until = Date.now() + timeoutMs;
  let last;
  while (Date.now() < until) {
    try { const value = await fn(); if (value) return value; } catch (error) { last = error; }
    await sleep(every);
  }
  throw new Error(`Timed out: ${last?.message || 'condition'}`);
}
async function startChrome() {
  fs.rmSync(path.join(profileDir, 'DevToolsActivePort'), {force:true});
  const child = spawn(chromePath, [
    '--start-minimized', '--window-position=-2000,-2000', '--disable-gpu', '--no-first-run', '--no-default-browser-check',
    '--disable-background-networking', '--disable-component-update',
    `--user-data-dir=${profileDir}`, `--load-extension=${extensionDir}`,
    `--disable-extensions-except=${extensionDir}`, '--remote-debugging-port=0', 'about:blank'
  ], {stdio:'ignore'});
  const port = await waitFor(() => {
    const p = path.join(profileDir, 'DevToolsActivePort');
    if (!fs.existsSync(p)) return null;
    return Number(fs.readFileSync(p, 'utf8').split('\n')[0]);
  }, 20000);
  return {child, port};
}
async function list(port) { return await (await fetch(`http://127.0.0.1:${port}/json`)).json(); }
async function openTarget(port, url) {
  const target = await (await fetch(`http://127.0.0.1:${port}/json/new?${encodeURIComponent(url)}`, {method:'PUT'})).json();
  return target;
}
async function closeTarget(port, id) { await fetch(`http://127.0.0.1:${port}/json/close/${id}`); }
class CDP {
  constructor(url) { this.ws = new WebSocket(url); this.pending = new Map(); this.id = 0;
    this.ready = new Promise((resolve, reject) => {
      this.ws.addEventListener('open', resolve, {once:true});
      this.ws.addEventListener('error', reject, {once:true});
    });
    this.ws.addEventListener('message', ({data}) => {
      const message = JSON.parse(data); const pending = this.pending.get(message.id);
      if (!pending) return; this.pending.delete(message.id);
      message.error ? pending.reject(new Error(message.error.message)) : pending.resolve(message.result);
    });
  }
  async send(method, params={}) {
    await this.ready;
    const id = ++this.id;
    return await new Promise((resolve, reject) => {
      this.pending.set(id, {resolve,reject}); this.ws.send(JSON.stringify({id,method,params}));
    });
  }
  async evaluate(expression, userGesture=false) {
    const response = await this.send('Runtime.evaluate', {expression, awaitPromise:true, returnByValue:true, userGesture});
    if (response.exceptionDetails) throw new Error(response.exceptionDetails.text + ': ' + response.result?.description);
    return response.result?.value;
  }
  close() { this.ws.close(); }
}
function fixtureResult(url) {
  const images = Array.from({length:1000}, (_,i) => ({
    src: `${url}/images/${i.toString().padStart(4,'0')}.webp?size=large&variant=desktop`,
    alt: i % 9 ? `Image ${i}: representative descriptive alternative text` : null,
    auditable:true, naturalWidth:1200, naturalHeight:800, renderedWidth:600,
    renderedHeight:400, transferSize:0
  }));
  return {page:{url,title:'Fixture',titleTagCount:1,metaDescription:'Fixture',headings:[{level:1,text:'Fixture'}],images,canonical:url,schemas:[],invalidSchemaCount:0,wordCount:350,textRatio:0.2},
    metrics:{h1Count:1,h2Count:0,h3Count:0,imageCount:1000,auditableImageCount:1000,imagesWithoutAlt:112,altCoverage:88.8,schemaTypes:[],wordCount:350,textRatio:0.2},
    issues:[{id:'IMAGE_001',category:'images',severity:'warning',messageKey:'fixture',impactKey:'fixture',solutionKey:'fixture',impact:5}],
    score:95,grade:'good',categoryScores:{title:100,meta:100,heading:100,images:95,technical:100,content:100},
    categoryWeights:{title:20,meta:20,heading:20,images:10,technical:20,content:10},scannedAt:Date.now()};
}
const record = {root, chromePath, url:baseUrl, checks:{}, metrics:{}};
let browser;
try {
  browser = await startChrome();
  const worker = await waitFor(async () => (await list(browser.port)).find(t => t.type === 'service_worker' && t.url.endsWith('/sw.js')), 20000);
  const extensionId = new URL(worker.url).host;
  record.extensionId = extensionId;
  record.chromeVersion = await new CDP(worker.webSocketDebuggerUrl).send('Browser.getVersion').then(x => x.product).catch(() => 'unknown');
  const page = await openTarget(browser.port, baseUrl);
  const pageCdp = new CDP(page.webSocketDebuggerUrl);
  await waitFor(async () => (await pageCdp.evaluate('document.readyState')) === 'complete');
  const popup = await openTarget(browser.port, `chrome-extension://${extensionId}/popup.html`);
  const popupCdp = new CDP(popup.webSocketDebuggerUrl);
  await waitFor(async () => await popupCdp.evaluate('Boolean(window.poc)'));
  const tab = await popupCdp.evaluate(`poc.query(${JSON.stringify(baseUrl)})`);
  if (!tab?.id) throw new Error('Fixture tab not visible to extension');
  record.tabA = tab.id;
  const generation = await popupCdp.evaluate(`poc.generation(${tab.id})`);
  const result = fixtureResult(baseUrl);
  const payloadBytes = Buffer.byteLength(JSON.stringify(result));
  const writeMs = [], readMs = [];
  for (let i=0;i<15;i++) {
    let t=performance.now();
    const written = await popupCdp.evaluate(`poc.write(${tab.id},${JSON.stringify(baseUrl)},${generation},${JSON.stringify(result)})`);
    writeMs.push(performance.now()-t);
    if (!written?.ok) throw new Error('Write failed: ' + JSON.stringify(written));
    t=performance.now();
    const read = await popupCdp.evaluate(`poc.read(${tab.id},${JSON.stringify(baseUrl)})`);
    readMs.push(performance.now()-t);
    if (!read?.ok || read.snapshot.result.page.images.length !== 1000) throw new Error('Read failed');
  }
  record.metrics.payloadBytes = payloadBytes;
  record.metrics.storageBytesInUse = await popupCdp.evaluate('poc.bytes()');
  const percentile = (values, q) => [...values].sort((a,b)=>a-b)[Math.ceil(values.length*q)-1];
  record.metrics.writeMs = {median:percentile(writeMs,.5),p95:percentile(writeMs,.95),max:Math.max(...writeMs)};
  record.metrics.readMs = {median:percentile(readMs,.5),p95:percentile(readMs,.95),max:Math.max(...readMs)};
  record.checks.popupWrite1000Images = true;
  try {
    await popupCdp.evaluate(`poc.openPanel(${tab.id})`, true);
    record.nativePanelOpen = 'api-succeeded';
    record.nativePanelTargets = (await list(browser.port)).filter(t => t.url === `chrome-extension://${extensionId}/panel.html`).map(t => ({id:t.id,type:t.type}));
  } catch (error) { record.nativePanelOpen = 'api-failed: ' + error.message; }
  await closeTarget(browser.port, popup.id); popupCdp.close();
  const panel = (await list(browser.port)).find(t => t.url === `chrome-extension://${extensionId}/panel.html`)
    || await openTarget(browser.port, `chrome-extension://${extensionId}/panel.html`);
  record.panelSurface = record.nativePanelTargets?.some(t => t.id === panel.id) ? 'native-side-panel-target' : 'extension-document-tab';
  const panelCdp = new CDP(panel.webSocketDebuggerUrl);
  await waitFor(async () => await panelCdp.evaluate('Boolean(window.poc)'));
  const afterClose = await panelCdp.evaluate(`poc.read(${tab.id},${JSON.stringify(baseUrl)})`);
  record.checks.panelReadsAfterPopupCloses = !!afterClose?.ok && afterClose.snapshot.result.score === 95 && afterClose.snapshot.result.page.images.length === 1000;
  const pageB = await openTarget(browser.port, baseUrl);
  const pageBCdp = new CDP(pageB.webSocketDebuggerUrl);
  await waitFor(async () => (await pageBCdp.evaluate('document.readyState')) === 'complete');
  const tabB = await panelCdp.evaluate(`(async()=> (await chrome.tabs.query({})).find(t=>t.url===${JSON.stringify(baseUrl)} && t.id!==${tab.id}))()`);
  record.tabB = tabB?.id;
  const crossTab = await panelCdp.evaluate(`poc.read(${tabB.id},${JSON.stringify(baseUrl)})`);
  record.checks.sameUrlOtherTabIsolated = !crossTab?.ok;
  const staleGeneration = generation;
  await pageCdp.send('Page.reload');
  await waitFor(async () => (await panelCdp.evaluate(`poc.generation(${tab.id})`)) > staleGeneration);
  const afterRefresh = await panelCdp.evaluate(`poc.read(${tab.id},${JSON.stringify(baseUrl)})`);
  record.checks.sameUrlRefreshInvalidates = !afterRefresh?.ok;
  await waitFor(async () => (await pageCdp.evaluate('document.readyState')) === 'complete');
  const oldWrite = await panelCdp.evaluate(`poc.write(${tab.id},${JSON.stringify(baseUrl)},${staleGeneration},${JSON.stringify(result)})`);
  const afterOldWrite = await panelCdp.evaluate(`poc.read(${tab.id},${JSON.stringify(baseUrl)})`);
  record.checks.oldAsyncResultRejected = !oldWrite?.ok && !afterOldWrite?.ok;
  record.oldWriteReason = oldWrite?.reason;
  const currentGeneration = await panelCdp.evaluate(`poc.generation(${tab.id})`);
  const freshResult = {...result, score:92, scannedAt:Date.now()};
  const currentWrite = await panelCdp.evaluate(`poc.write(${tab.id},${JSON.stringify(baseUrl)},${currentGeneration},${JSON.stringify(freshResult)})`);
  record.checks.newGenerationWrites = !!currentWrite?.ok;
  const delayedOldWrite = await panelCdp.evaluate(`poc.write(${tab.id},${JSON.stringify(baseUrl)},${staleGeneration},${JSON.stringify(result)})`);
  const retainedNew = await panelCdp.evaluate(`poc.read(${tab.id},${JSON.stringify(baseUrl)})`);
  record.checks.oldAsyncCannotOverwriteNew = !delayedOldWrite?.ok && retainedNew?.snapshot?.result?.score === 92;
  await closeTarget(browser.port, page.id); pageCdp.close();
  await waitFor(async () => (await panelCdp.evaluate(`poc.read(${tab.id},${JSON.stringify(baseUrl)})`)).reason === 'tab-mismatch-or-loading');
  record.checks.tabCloseClears = true;
  const beforeReload = await panelCdp.evaluate(`poc.read(${tabB.id},${JSON.stringify(baseUrl)})`);
  record.checks.tabBStillIndependent = !beforeReload?.ok;
  const tabBGeneration = await panelCdp.evaluate(`poc.generation(${tabB.id})`);
  const bWrite = await panelCdp.evaluate(`poc.write(${tabB.id},${JSON.stringify(baseUrl)},${tabBGeneration},${JSON.stringify(result)})`);
  if (!bWrite.ok) throw new Error('Tab B write failed');
  if (!process.env.P0_SKIP_RELOAD) {
    await panelCdp.evaluate('poc.reloadExtension()').catch(()=>{});
    await sleep(1500);
    const panelAfterReload = await openTarget(browser.port, `chrome-extension://${extensionId}/panel.html`);
    const reloadCdp = new CDP(panelAfterReload.webSocketDebuggerUrl);
    await waitFor(async () => await reloadCdp.evaluate('Boolean(window.poc)'));
    const reloadRead = await reloadCdp.evaluate(`poc.read(${tabB.id},${JSON.stringify(baseUrl)})`);
    record.checks.extensionReloadClears = !reloadRead?.ok;
    const newGeneration = await reloadCdp.evaluate(`poc.generation(${tabB.id})`);
    const rewrite = await reloadCdp.evaluate(`poc.write(${tabB.id},${JSON.stringify(baseUrl)},${newGeneration},${JSON.stringify(result)})`);
    if (!rewrite.ok) throw new Error('Write before browser restart failed');
    reloadCdp.close();
  }
  panelCdp.close(); pageBCdp.close();
  browser.child.kill();
  await waitFor(() => browser.child.exitCode !== null || browser.child.signalCode !== null, 10000);
  await sleep(700);
  browser = await startChrome();
  const panelAfterRestart = await openTarget(browser.port, `chrome-extension://${extensionId}/panel.html`);
  const restartCdp = new CDP(panelAfterRestart.webSocketDebuggerUrl);
  await waitFor(async () => await restartCdp.evaluate('Boolean(window.poc)'));
  record.checks.browserRestartClears = (await restartCdp.evaluate('poc.bytes()')) === 0;
  restartCdp.close();
  record.success = Object.values(record.checks).every(Boolean);
} catch (error) {
  record.error = error.stack || String(error); record.success = false;
  if (browser?.port) record.targetsAtFailure = await list(browser.port).catch(() => []);
}
finally {
  if (browser?.child && browser.child.exitCode === null) browser.child.kill();
  server.close();
  fs.writeFileSync(path.join(root, 'result.json'), JSON.stringify(record,null,2));
  console.log(JSON.stringify(record,null,2));
}
