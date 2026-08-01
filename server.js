// Minimal local server: serves the static app and proxies /chat to whichever
// LLM provider is configured (Anthropic, OpenAI, or a local OpenAI-compatible
// server such as LM Studio or Ollama). See functions/_lib/llm.js.
//
// Run:  LLM_PROVIDER=local LLM_BASE_URL=http://127.0.0.1:1234/v1 node server.js
//       LLM_PROVIDER=anthropic LLM_API_KEY=... node server.js
// Then open: http://localhost:8787

const http = require('http');
const fs = require('fs');
const os = require('os');
const path = require('path');

const PORT = process.env.PORT || 8787;
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

// The provider helper is an ES module and this file is CommonJS, so it is
// pulled in with a cached dynamic import rather than duplicated here — one
// implementation serves both this server and the Cloudflare Functions.
let _llm = null;
async function llm() {
  if (!_llm) _llm = await import('./functions/_lib/llm.js');
  return _llm;
}

// Same reasoning as llm() above — shared with the Cloudflare Functions so the
// two runtimes send the LLM the same conversation, not just the same wire
// format.
let _prompts = null;
async function prompts() {
  if (!_prompts) _prompts = await import('./functions/_lib/prompts.js');
  return _prompts;
}

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js':   'application/javascript; charset=utf-8',
  '.css':  'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.pdf':  'application/pdf'
};

// Security headers applied to every static response, matching the Cloudflare
// Pages `_headers` file so local dev behaves the same as production.
const SECURITY_HEADERS = {
  'Content-Security-Policy': "default-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; object-src 'none'; base-uri 'none'; frame-ancestors 'none'",
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'no-referrer',
};

// Files under the root that must never be served over the LAN, even though
// they're readable on disk: dotfiles/.git (repo internals, e.g. .git/config),
// the local missed-questions store, and any PDF. The PDF rule exists because
// CPACC_BoK.pdf — the IAAP Body of Knowledge — sits at the repo root on the
// author's disk for convenience but may not be redistributed; serving it over
// HTTP would do exactly that.
function isForbiddenPath(url) {
  const segments = url.split('/').filter(Boolean);
  if (segments.some(s => s.startsWith('.'))) return true;
  if (segments[segments.length - 1] === 'data.json') return true;
  if (path.extname(url).toLowerCase() === '.pdf') return true;
  return false;
}

function serveStatic(req, res) {
  const url = req.url === '/' ? '/index.html' : req.url.split('?')[0];
  if (isForbiddenPath(url)) { res.writeHead(404, SECURITY_HEADERS); return res.end('not found'); }
  const filePath = path.normalize(path.join(ROOT, url));
  // path.sep suffix (not just the bare ROOT string) prevents a sibling
  // directory whose name merely starts with ROOT's basename — e.g.
  // "/a/proj-secrets" — from passing a prefix check against "/a/proj".
  if (filePath !== ROOT && !filePath.startsWith(ROOT + path.sep)) {
    res.writeHead(403, SECURITY_HEADERS); return res.end('forbidden');
  }
  fs.readFile(filePath, (err, data) => {
    if (err) { res.writeHead(404, SECURITY_HEADERS); return res.end('not found'); }
    res.writeHead(200, { ...SECURITY_HEADERS, 'Content-Type': MIME[path.extname(filePath)] || 'application/octet-stream' });
    res.end(data);
  });
}

// 256KB comfortably covers a chat turn (question + choices + rationale +
// history) with room to spare, while keeping a misbehaving or malicious
// client from buffering an unbounded body into memory.
const MAX_BODY_BYTES = 256 * 1024;

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    let oversize = false;
    req.on('data', c => {
      if (oversize) return;
      size += c.length;
      if (size > MAX_BODY_BYTES) {
        // Don't destroy the socket — req and res share it, and destroying it
        // here would reset the connection instead of letting us reply 413.
        // Just stop buffering and let the rest of the body drain to 'end'.
        oversize = true;
        const err = new Error('request body too large');
        err.statusCode = 413;
        return reject(err);
      }
      chunks.push(c);
    });
    req.on('end', () => {
      if (oversize) return;
      try { resolve(JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}')); }
      catch (e) { reject(e); }
    });
    req.on('error', reject);
  });
}

/** Run one chat turn and write the normalised { reply, provider, model } result. */
async function respondChat(res, system, messages) {
  const { chat } = await llm();
  const r = await chat({ system, messages }, process.env);
  if (!r.ok) {
    res.writeHead(r.status, { 'content-type': 'application/json' });
    return res.end(JSON.stringify({ error: r.error }));
  }
  res.writeHead(200, { 'content-type': 'application/json' });
  res.end(JSON.stringify({ reply: r.reply, provider: r.provider, model: r.model }));
}

const server = http.createServer(async (req, res) => {
  if (req.method === 'GET' && req.url === '/chat-status') {
    const { resolveConfig } = await llm();
    const cfg = resolveConfig(process.env);
    res.writeHead(200, { 'content-type': 'application/json' });
    return res.end(JSON.stringify({
      enabled: cfg.configured,
      provider: cfg.configured ? cfg.provider : null,
      model: cfg.configured ? cfg.model : null,
    }));
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
        res.writeHead(e.statusCode || 400, {'content-type':'application/json'});
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
    try {
      const { history = [], userMessage } = await readBody(req);
      const { buildGeneralPrompt } = await prompts();
      const { system, messages } = buildGeneralPrompt({ history, userMessage });
      await respondChat(res, system, messages);
    } catch (e) {
      res.writeHead(e.statusCode || 500, {'content-type':'application/json'});
      res.end(JSON.stringify({ error: String(e) }));
    }
    return;
  }

  if (req.method === 'POST' && req.url === '/chat') {
    try {
      const { question, correctLetter, userLetter, choices, why, cite, history = [], userMessage } = await readBody(req);
      const { buildQuestionPrompt } = await prompts();
      const { system, messages } = buildQuestionPrompt({ question, correctLetter, userLetter, choices, why, cite, history, userMessage });
      await respondChat(res, system, messages);
    } catch (e) {
      res.writeHead(e.statusCode || 500, {'content-type':'application/json'});
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
  llm().then(({ resolveConfig }) => {
    const cfg = resolveConfig(process.env);
    console.log(cfg.configured
      ? `Chat: enabled (provider: ${cfg.provider}, model: ${cfg.model})`
      : `Chat: disabled — ${cfg.error}`);
    console.log(`Missed-questions store: ${DATA_FILE}`);
  });
});
