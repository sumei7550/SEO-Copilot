import { createServer } from 'node:http';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const host = '127.0.0.1';
const port = 8765;
const body = Array.from({ length: 35 }, () => 'Visible page text for the SEO Copilot manual acceptance fixture. It keeps the word count above the existing low-content warning threshold while we inspect the other tools.').join(' ');
const headings = [
  ['h1', 'Manual acceptance page'], ['h2', 'Overview'], ['h3', 'First detail'],
  ['h2', 'Features'], ['h3', 'A longer heading that should wrap naturally inside the Popup content area without clipping'],
  ['h2', 'Repeated section'], ['h2', 'Repeated section'], ['h3', 'Another detail'],
  ['h2', 'Final section'], ['h3', 'Final detail']
].map(([tag, value]) => `<${tag}>${value}</${tag}>`).join('\n');

const server = createServer((request, response) => {
  const route = new URL(request.url ?? '/', `http://${host}:${port}`).pathname;
  if (route === '/icon48.png' || route === '/icon128.png') {
    const file = path.join(root, 'public', 'icons', route.slice(1));
    response.writeHead(200, { 'content-type': 'image/png', 'cache-control': 'no-store' });
    response.end(readFileSync(file));
    return;
  }
  if (route !== '/' && route !== '/page') {
    response.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
    response.end('Not found');
    return;
  }
  response.writeHead(200, { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' });
  response.end(`<!doctype html><html lang="en"><head>
    <meta charset="utf-8"><title>Short</title>
    <meta name="description" content="A stable local page for manually reviewing SEO Copilot metadata, headings, indexability, structured data, image details and the audit handoff.">
    <link rel="canonical" href="http://${host}:${port}/page">
    <script type="application/ld+json">{"@context":"https://schema.org","@type":"WebPage","name":"SEO Copilot acceptance fixture"}</script>
  </head><body><main>
    <button id="fix-title" type="button" onclick="document.title='A complete test page title for SEO Copilot manual acceptance'; this.textContent='Title changed on this page'">Fix title on this page</button>
    ${headings}
    <p>${body}</p>
    <img src="/icon48.png" alt="Small SEO Copilot icon" width="48" height="48">
    <img src="/icon128.png" width="128" height="128">
  </main></body></html>`);
});

server.listen(port, host, () => {
  process.stdout.write(`Manual acceptance fixture: http://${host}:${port}/page\n`);
});
