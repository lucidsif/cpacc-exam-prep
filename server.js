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
    try {
      const { history = [], userMessage } = await readBody(req);
      const system = "You are a CPACC exam tutor. Be concise (2-4 short paragraphs max). Ground answers in the IAAP CPACC Body of Knowledge (Oct 2023, v4.0) when relevant. Cover disabilities, accessibility/UD, standards, laws, and management as needed.";
      const messages = [...history, { role: 'user', content: userMessage }];
      await respondChat(res, system, messages);
    } catch (e) {
      res.writeHead(500, {'content-type':'application/json'});
      res.end(JSON.stringify({ error: String(e) }));
    }
    return;
  }

  if (req.method === 'POST' && req.url === '/chat') {
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

      await respondChat(res, system, messages);
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
  llm().then(({ resolveConfig }) => {
    const cfg = resolveConfig(process.env);
    console.log(cfg.configured
      ? `Chat: enabled (provider: ${cfg.provider}, model: ${cfg.model})`
      : `Chat: disabled — ${cfg.error}`);
    console.log(`Missed-questions store: ${DATA_FILE}`);
  });
});
