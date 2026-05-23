// Minimal local server: serves the static app and proxies /chat to the Anthropic API.
// Run:  ANTHROPIC_API_KEY=sk-ant-... node server.js
// Then open: http://localhost:8787

const http = require('http');
const https = require('https');
const fs = require('fs');
const os = require('os');
const path = require('path');

const PORT = process.env.PORT || 8787;
const API_KEY = process.env.ANTHROPIC_API_KEY;
const MODEL = process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-6';
const ROOT = __dirname;
const DATA_FILE = path.join(ROOT, 'data.json');

function loadData() {
  try { return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8')); }
  catch (e) { return { missed: [] }; }
}
function saveData(d) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(d, null, 2));
}
function lanAddresses() {
  const out = [];
  const ifs = os.networkInterfaces();
  for (const name of Object.keys(ifs)) {
    for (const n of ifs[name]) {
      if (n.family === 'IPv4' && !n.internal) out.push(n.address);
    }
  }
  return out;
}

if (!API_KEY) {
  console.warn('[warn] ANTHROPIC_API_KEY is not set — /chat will return 500. The test itself still works.');
}

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js':   'application/javascript; charset=utf-8',
  '.css':  'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.pdf':  'application/pdf'
};

function serveStatic(req, res) {
  const url = req.url === '/' ? '/index.html' : req.url.split('?')[0];
  const filePath = path.normalize(path.join(ROOT, url));
  if (!filePath.startsWith(ROOT)) { res.writeHead(403); return res.end('forbidden'); }
  fs.readFile(filePath, (err, data) => {
    if (err) { res.writeHead(404); return res.end('not found'); }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(filePath)] || 'application/octet-stream' });
    res.end(data);
  });
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', c => chunks.push(c));
    req.on('end', () => {
      try { resolve(JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}')); }
      catch (e) { reject(e); }
    });
    req.on('error', reject);
  });
}

function callAnthropic(payload) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify(payload);
    const req = https.request({
      hostname: 'api.anthropic.com',
      path: '/v1/messages',
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': API_KEY,
        'anthropic-version': '2023-06-01',
        'content-length': Buffer.byteLength(body)
      }
    }, (r) => {
      const chunks = [];
      r.on('data', c => chunks.push(c));
      r.on('end', () => resolve({ status: r.statusCode, body: Buffer.concat(chunks).toString('utf8') }));
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

const server = http.createServer(async (req, res) => {
  if (req.method === 'GET' && req.url === '/chat-status') {
    res.writeHead(200, { 'content-type': 'application/json' });
    return res.end(JSON.stringify({ enabled: !!API_KEY, model: API_KEY ? MODEL : null }));
  }

  // Shared missed-questions store (server-side). No auth — LAN-only intended.
  if (req.url === '/missed') {
    if (req.method === 'GET') {
      const d = loadData();
      res.writeHead(200, {'content-type':'application/json'});
      return res.end(JSON.stringify({ ids: d.missed || [] }));
    }
    if (req.method === 'PUT') {
      try {
        const body = await readBody(req);
        const ids = Array.isArray(body.ids) ? body.ids.filter(n => Number.isInteger(n)) : [];
        saveData({ missed: ids });
        res.writeHead(200, {'content-type':'application/json'});
        return res.end(JSON.stringify({ ok: true, count: ids.length }));
      } catch (e) {
        res.writeHead(400, {'content-type':'application/json'});
        return res.end(JSON.stringify({ error: String(e) }));
      }
    }
    if (req.method === 'DELETE') {
      saveData({ missed: [] });
      res.writeHead(200, {'content-type':'application/json'});
      return res.end(JSON.stringify({ ok: true }));
    }
  }

  if (req.method === 'POST' && req.url === '/chat-general') {
    if (!API_KEY) { res.writeHead(500, {'content-type':'application/json'}); return res.end(JSON.stringify({error:'ANTHROPIC_API_KEY not set on server'})); }
    try {
      const { history = [], userMessage } = await readBody(req);
      const system = "You are a CPACC exam tutor. Be concise (2-4 short paragraphs max). Ground answers in the IAAP CPACC Body of Knowledge (Oct 2023, v4.0) when relevant. Cover disabilities, accessibility/UD, standards, laws, and management as needed.";
      const messages = [...history, { role: 'user', content: userMessage }];
      const r = await callAnthropic({ model: MODEL, max_tokens: 1024, system, messages });
      res.writeHead(r.status, { 'content-type': 'application/json' });
      res.end(r.body);
    } catch (e) {
      res.writeHead(500, {'content-type':'application/json'});
      res.end(JSON.stringify({ error: String(e) }));
    }
    return;
  }

  if (req.method === 'POST' && req.url === '/chat') {
    if (!API_KEY) { res.writeHead(500, {'content-type':'application/json'}); return res.end(JSON.stringify({error:'ANTHROPIC_API_KEY not set on server'})); }
    try {
      const { question, correctLetter, userLetter, choices, why, cite, history = [], userMessage } = await readBody(req);
      const system = [
        "You are a CPACC exam tutor. Be concise (2-4 short paragraphs max). Ground answers in the IAAP CPACC Body of Knowledge.",
        "When relevant, cite the BoK page reference provided in the question context.",
        "If asked to go deeper, explain the underlying concept, not just the right letter."
      ].join(' ');

      const context = [
        `Question: ${question}`,
        `Choices:\n` + Object.entries(choices).map(([k,v]) => `  ${k}. ${v}`).join('\n'),
        `Correct answer: ${correctLetter}`,
        `User's answer: ${userLetter || '(none)'}`,
        `Per-choice rationale:\n` + Object.entries(why).map(([k,v]) => `  ${k}: ${v}`).join('\n'),
        cite ? `BoK citation: ${cite}` : ''
      ].filter(Boolean).join('\n\n');

      const messages = [
        { role: 'user', content: `Context for our conversation about a CPACC practice question:\n\n${context}\n\n— end context —` },
        { role: 'assistant', content: 'Got it. Ask me anything about this question.' },
        ...history,
        { role: 'user', content: userMessage }
      ];

      const r = await callAnthropic({ model: MODEL, max_tokens: 1024, system, messages });
      res.writeHead(r.status, { 'content-type': 'application/json' });
      res.end(r.body);
    } catch (e) {
      res.writeHead(500, {'content-type':'application/json'});
      res.end(JSON.stringify({ error: String(e) }));
    }
    return;
  }
  if (req.method === 'GET') return serveStatic(req, res);
  res.writeHead(405); res.end('method not allowed');
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`CPACC test app running:`);
  console.log(`  Local:  http://localhost:${PORT}`);
  for (const ip of lanAddresses()) {
    console.log(`  LAN:    http://${ip}:${PORT}   (open this on your phone — same Wi-Fi)`);
  }
  console.log(API_KEY ? `Chat: enabled (model: ${MODEL})` : 'Chat: disabled (set ANTHROPIC_API_KEY to enable)');
  console.log(`Missed-questions store: ${DATA_FILE}`);
});
