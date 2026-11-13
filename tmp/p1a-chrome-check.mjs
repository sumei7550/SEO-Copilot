import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import http from 'node:http';
import { spawn } from 'node:child_process';
import { createHash } from 'node:crypto';

const browserPath = process.env.P1A_BROWSER_PATH || path.join(os.tmpdir(), 'seo-copilot-p0-cft', 'chrome-win64', 'chrome.exe');
const sourceExtension = path.resolve('dist');
const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'seo-copilot-p1a-'));
const extensionPath = path.join(profile, 'qa-extension');
fs.cpSync(sourceExtension, extensionPath, { recursive: true });
const qaManifest = JSON.parse(fs.readFileSync(path.join(extensionPath, 'manifest.json'), 'utf8'));
qaManifest.host_permissions.push('http://127.0.0.1/*');
fs.writeFileSync(path.join(extensionPath, 'manifest.json'), JSON.stringify(qaManifest));
const extensionId = [...createHash('sha256').update(extensionPath, 'utf16le').digest('hex').slice(0,32)]
  .map(hex => 'abcdefghijklmnop'[Number.parseInt(hex,16)]).join('');
const outputDir = path.resolve('docs/screenshots');
fs.mkdirSync(outputDir, { recursive: true });
const pageHtml = `<!doctype html><html lang="en"><head><title>A complete test page title for SEO Copilot check</title><meta name="description" content="This is a representative page description that stays within the existing suggested metadata range and helps verify the Popup preview."><link rel="canonical" href="http://127.0.0.1:PORT/page"><script type="application/ld+json">{"@context":"https://schema.org","@type":"Article","headline":"Fixture"}</script></head><body><h1>Main fixture heading</h1><h2>First section</h2><h3>First detail</h3>${Array.from({length:8},(_,i)=>`<h2>Section ${i+2} has a longer heading that should wrap naturally inside the narrow Popup</h2>`).join('')}<p>${'Useful visible page content for SEO analysis. '.repeat(65)}</p><img src="/one.png" alt="First image" width="100" height="100"><img src="/two.png" width="100" height="100"></body></html>`;
let visualHtml = '';
const server = http.createServer((req,res) => {
  if (req.url === '/visual' && visualHtml) { res.writeHead(200, {'content-type':'text/html; charset=utf-8'}); res.end(visualHtml); return; }
  if (req.url?.endsWith('.png')) { res.writeHead(404); res.end(); return; }
  res.writeHead(200, {'content-type':'text/html; charset=utf-8'});
  const fixtureHtml=pageHtml.replace('PORT', String(server.address().port));
  const imageFixture=fixtureHtml.replace('</body>', `${Array.from({length:998},(_,i)=>`<img loading="lazy" src="/bulk-${i}.png" alt="Bulk ${i}" width="20" height="20">`).join('')}</body>`);
  res.end(req.url === '/issue' ? fixtureHtml.replace('A complete test page title for SEO Copilot check', 'Short') : req.url === '/images' ? imageFixture : fixtureHtml);
});
await new Promise(resolve => server.listen(0,'127.0.0.1',resolve));
const url = `http://127.0.0.1:${server.address().port}/page`;
const result = {browserPath, url, checks:{}, screenshots:[], errors:[]};
function sleep(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }
async function waitFor(fn, timeout=16000) {
  const end=Date.now()+timeout; let last;
  while(Date.now()<end){ try { const v=await fn(); if(v) return v; }catch(e){last=e;} await sleep(100); }
  throw new Error('Timeout: '+(last?.message || 'condition'));
}
async function list(port){return await (await fetch(`http://127.0.0.1:${port}/json`)).json();}
async function open(port,u){return await (await fetch(`http://127.0.0.1:${port}/json/new?${encodeURIComponent(u)}`,{method:'PUT'})).json();}
class CDP {
  constructor(url){this.ws=new WebSocket(url);this.id=0;this.pending=new Map();this.ready=new Promise((resolve,reject)=>{this.ws.addEventListener('open',resolve,{once:true});this.ws.addEventListener('error',reject,{once:true});});this.ws.addEventListener('message',({data})=>{const m=JSON.parse(data),p=this.pending.get(m.id);if(!p)return;this.pending.delete(m.id);m.error?p.reject(new Error(m.error.message)):p.resolve(m.result);});}
  async send(method,params={}){await this.ready;const id=++this.id;return await new Promise((resolve,reject)=>{const timer=setTimeout(()=>{this.pending.delete(id);reject(new Error('CDP timeout: '+method));},8000);this.pending.set(id,{resolve:v=>{clearTimeout(timer);resolve(v);},reject:e=>{clearTimeout(timer);reject(e);}});this.ws.send(JSON.stringify({id,method,params}));});}
  async eval(expression,userGesture=false){const r=await this.send('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true,userGesture});if(r.exceptionDetails)throw new Error(r.result?.description||r.exceptionDetails.text);return r.result?.value;}
  close(){this.ws.close();}
}
let child;
try {
  child=spawn(browserPath,['--window-size=1000,800','--window-position=30,30','--no-first-run','--no-default-browser-check','--disable-background-networking',`--user-data-dir=${profile}`,`--load-extension=${extensionPath}`,`--disable-extensions-except=${extensionPath}`,'--remote-debugging-port=0','about:blank'],{stdio:'ignore'});
  const port=await waitFor(()=>{const p=path.join(profile,'DevToolsActivePort');return fs.existsSync(p)?Number(fs.readFileSync(p,'utf8').split('\n')[0]):null;},20000);
  result.browserVersion=(await (await fetch(`http://127.0.0.1:${port}/json/version`)).json()).Browser;
  const id=extensionId;
  const worker=await waitFor(async()=>(await list(port)).find(t=>t.type==='service_worker'&&t.url===`chrome-extension://${id}/background.js`),20000);
  result.extensionId=id;
  const fixture=await open(port,url), fixtureCdp=new CDP(fixture.webSocketDebuggerUrl);
  await waitFor(async()=>await fixtureCdp.eval('document.readyState')==='complete');
  const sw=new CDP(worker.webSocketDebuggerUrl);
  let popupTarget=await waitFor(async()=>(await list(port)).find(t=>t.url===`chrome-extension://${id}/index.html`),2500).catch(()=>null);
  if(!popupTarget){popupTarget=await open(port,`chrome-extension://${id}/index.html`);result.popupSurface='extension-tab';}
  else result.popupSurface='native-action-popup-target';
  const popup=new CDP(popupTarget.webSocketDebuggerUrl);
  await waitFor(async()=>await popup.eval('Boolean(document.querySelector(".inspector-popup"))'));
  if(result.popupSurface==='extension-tab') {
    result.tabsBefore=await popup.eval('(async()=> (await chrome.tabs.query({})).map(t=>({id:t.id,url:t.url,active:t.active})))()');
    const tabId=result.tabsBefore.find(t=>t.url===url)?.id;
    result.fixtureTabId=tabId;
    await popup.eval(`chrome.tabs.update(${tabId},{active:true})`);
  }
  await waitFor(async()=>await popup.eval('document.querySelectorAll(".inspector-tool-nav button").length===6'));
  result.checks.sixNav=await popup.eval('document.querySelectorAll(".inspector-tool-nav button").length===6');
  result.checks.logoLoaded=await popup.eval('document.querySelector(".inspector-brand img")?.complete && document.querySelector(".inspector-brand img")?.naturalWidth>0');
  result.checks.metadata=await waitFor(async()=>await popup.eval('document.body.innerText.includes("A complete test page title")'),9000).catch(()=>false);
  result.checks.headings=await waitFor(async()=>await popup.eval('document.body.innerText.includes("Copy headings") && document.querySelectorAll(".inspector-heading-row").length===8'),30000).catch(()=>false);
  result.popupText=await popup.eval('document.body.innerText.slice(0,1400)');
  const contentMarkup=await popup.eval('document.querySelector(".inspector-popup").outerHTML');
  const select=async(label)=>await popup.eval(`([...document.querySelectorAll('.inspector-tool-nav button')].find(b=>b.textContent===${JSON.stringify(label)})).click()`);
  for(const width of [520,400,340]){
    await popup.send('Emulation.setDeviceMetricsOverride',{width,height:630,deviceScaleFactor:1,mobile:false});
    result.checks[`noOverflow${width}`]=await popup.eval('document.documentElement.scrollWidth<=innerWidth');
  }
  await select('Indexability');
  result.checks.canonical=await popup.eval('document.body.innerText.includes("Canonical URL") && document.body.innerText.includes("Found")');
  await select('Structured Data');
  result.structuredText=await popup.eval('document.body.innerText.slice(0,1000)');
  result.checks.schema=await popup.eval('document.querySelectorAll(".inspector-schema-type").length===1 && document.body.innerText.includes("Article")');
  await select('Images');
  result.checks.images=await popup.eval('document.body.innerText.includes("Image details") && document.body.innerText.includes("2 collected")');
  await select('Social');
  result.checks.socialSoon=await popup.eval('document.body.innerText.includes("Not checked")');
  await select('Links');
  result.checks.linksSoon=await popup.eval('document.body.innerText.includes("Links are coming soon")');
  await popup.send('Emulation.setDeviceMetricsOverride',{width:520,height:630,deviceScaleFactor:1,mobile:false});
  await popup.eval('document.querySelector(".popup-audit-button").click()',true);
  const panelTarget=await waitFor(async()=>(await list(port)).find(t=>t.url===`chrome-extension://${id}/sidepanel.html`),10000);
  const panel=new CDP(panelTarget.webSocketDebuggerUrl);
  result.checks.audit=await waitFor(async()=>await panel.eval('Boolean(document.querySelector(".score-card") && document.querySelector(".audit-category-grid"))'),30000).catch(()=>false);
  await panel.eval('document.querySelector(".rescan-button")?.click()',true);
  result.checks.rescan=await waitFor(async()=>await panel.eval('Boolean(document.querySelector(".score-card") && document.querySelector(".rescan-button"))'),30000).catch(()=>false);
  result.panelText=await panel.eval('document.body.innerText.slice(0,1000)');
  for(const width of [520,400,340]){
    try {
      await panel.send('Emulation.setDeviceMetricsOverride',{width,height:700,deviceScaleFactor:1,mobile:false});
      result.checks[`panelNoOverflow${width}`]=await panel.eval('document.documentElement.scrollWidth<=innerWidth');
    } catch(e) { result.errors.push(`sidepanel ${width}: ${e.message}`); }
  }
  await panel.send('Emulation.setDeviceMetricsOverride',{width:520,height:700,deviceScaleFactor:1,mobile:false}).catch(()=>{});
  try {
    const shot=await panel.send('Page.captureScreenshot',{format:'png',captureBeyondViewport:false,fromSurface:false});
    fs.writeFileSync(path.join(outputDir,'seo-copilot-1.4.0-sidepanel-prod-520.png'),Buffer.from(shot.data,'base64'));
    result.screenshots.push('seo-copilot-1.4.0-sidepanel-prod-520.png');
  } catch(e) { result.errors.push(`sidepanel screenshot: ${e.message}`); }
  const other=await open(port,url);
  const otherCdp=new CDP(other.webSocketDebuggerUrl);
  await waitFor(async()=>await otherCdp.eval('document.readyState')==='complete');
  result.checks.otherTabDoesNotShowScore=await waitFor(async()=>await panel.eval('!document.querySelector(".score-card")'),10000).catch(()=>false);
  await panel.eval(`chrome.tabs.update(${result.fixtureTabId},{active:true})`);
  result.checks.returnToOriginalTabRestores=await waitFor(async()=>await panel.eval('Boolean(document.querySelector(".score-card"))'),10000).catch(()=>false);
  await fixtureCdp.send('Page.reload');
  result.checks.refreshHidesScore=await waitFor(async()=>await panel.eval('!document.querySelector(".score-card")'),10000).catch(()=>false);
  const crossOrigin=`http://localhost:${server.address().port}/page`;
  await fixtureCdp.send('Page.navigate',{url:crossOrigin});
  await waitFor(async()=>await fixtureCdp.eval('document.readyState')==='complete').catch(()=>{});
  result.checks.crossOriginDoesNotShowScore=await waitFor(async()=>await panel.eval('!document.querySelector(".score-card")'),10000).catch(()=>false);
  await fixtureCdp.send('Page.navigate',{url:`http://127.0.0.1:${server.address().port}/issue`});
  await waitFor(async()=>await panel.eval('Boolean(document.querySelector(".audit-scan-button:not(:disabled)"))'),10000);
  await panel.eval('document.querySelector(".audit-scan-button").click()',true);
  result.checks.aiFixAvailable=await waitFor(async()=>await panel.eval('Boolean(document.querySelector(".ai-fix-button"))'),8000).catch(()=>false);
  result.aiText=await panel.eval('document.body.innerText.slice(0,1500)');
  await fixtureCdp.send('Page.navigate',{url:`http://127.0.0.1:${server.address().port}/images`});
  await waitFor(async()=>await fixtureCdp.eval('document.readyState')==='complete');
  const imagePopupTarget=await open(port,`chrome-extension://${id}/index.html`);
  const imagePopup=new CDP(imagePopupTarget.webSocketDebuggerUrl);
  await imagePopup.eval(`chrome.tabs.update(${result.fixtureTabId},{active:true})`);
  await waitFor(async()=>await imagePopup.eval('document.querySelector(".inspector-page-state")?.textContent==="Current page"'),30000);
  await imagePopup.eval(`([...document.querySelectorAll('.inspector-tool-nav button')].find(b=>b.textContent==='Images'))?.click()`);
  result.checks.thousandImagesRendered=await waitFor(async()=>await imagePopup.eval('document.querySelectorAll(".inspector-image-entry").length===1000'),30000).catch(()=>false);
  imagePopup.close();
  const logoData='data:image/png;base64,'+fs.readFileSync(path.join(sourceExtension,'icons','icon48.png')).toString('base64');
  const compiledCss=fs.readFileSync(path.join(sourceExtension,'assets','styles.css'),'utf8');
  visualHtml=`<!doctype html><html><head><meta charset="utf-8"><style>${compiledCss}</style></head><body class="popup-page"><div id="root">${contentMarkup.replace(/src="chrome-extension:[^"]+\/icons\/icon48\.png"/,`src="${logoData}"`)}</div></body></html>`;
  const visualTarget=await open(port,`http://127.0.0.1:${server.address().port}/visual`);
  const visual=new CDP(visualTarget.webSocketDebuggerUrl);
  await waitFor(async()=>await visual.eval('Boolean(document.querySelector(".inspector-popup"))'));
  for(const width of [520,400,340]){
    await visual.send('Emulation.setDeviceMetricsOverride',{width,height:630,deviceScaleFactor:1,mobile:false});
    const shot=await visual.send('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});
    const name=`seo-copilot-1.4.0-popup-dom-${width}.png`;
    fs.writeFileSync(path.join(outputDir,name),Buffer.from(shot.data,'base64'));
    result.screenshots.push(name);
  }
  visual.close();
  try {
    await panel.eval('chrome.storage.session.set({p1aReloadProbe:"present"})');
    const managerTarget=await open(port,'chrome://extensions');
    const manager=new CDP(managerTarget.webSocketDebuggerUrl);
    await waitFor(async()=>await manager.eval('document.readyState==="complete"'));
    result.extensionsManager=await manager.eval(`(()=>{
      function deep(root,selector){const found=[...root.querySelectorAll(selector)];for(const el of root.querySelectorAll('*'))if(el.shadowRoot)found.push(...deep(el.shadowRoot,selector));return found;}
      return deep(document,'extensions-item').map(item=>({id:item.data?.id,name:item.data?.name,shadowLength:item.shadowRoot?.innerHTML.length,
        controls:deep(item.shadowRoot||item,'[id*="reload"],cr-icon-button,cr-button').map(b=>({tag:b.tagName,id:b.id,aria:b.getAttribute('aria-label')})).slice(0,25)}));
    })()`);
    const reloaded=await manager.eval(`(()=>{
      function deep(root,selector){const found=[...root.querySelectorAll(selector)];for(const el of root.querySelectorAll('*'))if(el.shadowRoot)found.push(...deep(el.shadowRoot,selector));return found;}
      const item=deep(document,'extensions-item').find(i=>i.data?.id===${JSON.stringify(id)});
      const button=item?.shadowRoot?.querySelector('#dev-reload-button');
      if(!button)return false;button.click();return true;
    })()`,true);
    result.checks.chromeReloadClicked=reloaded;
    await sleep(1000);
    const reloadedTarget=await open(port,`chrome-extension://${id}/index.html`);
    const reloadedPage=new CDP(reloadedTarget.webSocketDebuggerUrl);
    result.reloadPageState=await reloadedPage.eval('({url:location.href,ready:document.readyState,chrome:typeof chrome, runtime:chrome?.runtime?.id, session:Boolean(chrome?.storage?.session)})');
    await waitFor(async()=>await reloadedPage.eval('Boolean(globalThis.chrome?.storage?.session)'),10000);
    const probe=await reloadedPage.eval('chrome.storage.session.get("p1aReloadProbe")');
    result.checks.chromeExtensionReloadClears=!probe?.p1aReloadProbe;
    reloadedPage.close();
    manager.close();
  } catch(e) { result.errors.push('extension manager inspection: '+e.message); }
  result.success=Object.values(result.checks).every(Boolean) && result.errors.length===0;
  sw.close();popup.close();panel.close();fixtureCdp.close();otherCdp.close();
}catch(e){result.errors.push(e.stack||String(e));result.success=false;}
finally{if(child&&child.exitCode===null)child.kill();server.close();console.log(JSON.stringify(result,null,2));}
