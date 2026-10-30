// Local server for Stelar: serves the app and the AI chat on http://localhost:8000
// Run with:  npm start   (or: node server.mjs)
// Needs Node.js 18 or newer and a .env file containing ANTHROPIC_API_KEY=...
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chat, rateLimited } from './api/chat.js';

const dir = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT) || 8000;

// Load .env without any extra packages
try {
  for (const line of fs.readFileSync(path.join(dir, '.env'), 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
} catch { /* no .env file: the chat will report that it is not configured */ }

const TYPES = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml', '.ico': 'image/x-icon', '.webp': 'image/webp'
};

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);

  if (url.pathname === '/api/chat') {
    if (req.method !== 'POST') { res.writeHead(405).end(); return; }
    if (rateLimited(req.socket.remoteAddress || 'local')) { send(res, 429, { error: 'rate' }); return; }
    let raw = '';
    for await (const chunk of req) { raw += chunk; if (raw.length > 20_000) { send(res, 413, { error: 'bad' }); return; } }
    let body = {};
    try { body = JSON.parse(raw); } catch {}
    const r = await chat(body);
    send(res, r.status, r.json);
    return;
  }

  // Static files. Hidden files (like .env) and anything outside this folder are never served.
  let rel = decodeURIComponent(url.pathname);
  if (rel === '/') rel = '/index.html';
  const file = path.normalize(path.join(dir, rel));
  if (!file.startsWith(dir + path.sep) || rel.split('/').some(p => p.startsWith('.')) || file.includes(path.sep + 'api' + path.sep) || file.endsWith('server.mjs')) {
    res.writeHead(404).end('Not found'); return;
  }
  fs.readFile(file, (err, data) => {
    if (err) { res.writeHead(404).end('Not found'); return; }
    res.writeHead(200, { 'content-type': TYPES[path.extname(file)] || 'application/octet-stream' }).end(data);
  });
});

function send(res, status, json) {
  res.writeHead(status, { 'content-type': 'application/json' }).end(JSON.stringify(json));
}

server.listen(PORT, () => {
  console.log(`Stelar is running at http://localhost:${PORT}`);
  if (!process.env.ANTHROPIC_API_KEY) console.log('⚠  No ANTHROPIC_API_KEY found. Create a .env file (see .env.example) to turn on the AI chat.');
});
