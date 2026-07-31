// functions/_lib/llm.js — provider-agnostic chat helper.
//
// One tutor, three interchangeable backends. Nothing in the app is tied to a
// particular vendor: pick one with env vars and the rest of the code is the same.
//
//   LLM_PROVIDER   anthropic | openai | local   (auto-detected when unset)
//   LLM_API_KEY    credential; not required for `local`
//   LLM_MODEL      model id; per-provider default below when unset
//   LLM_BASE_URL   override the endpoint (any OpenAI-compatible server)
//
// `local` means any OpenAI-compatible server you run yourself — LM Studio,
// Ollama, llama.cpp, vLLM. It is the same wire format as `openai`, minus the
// required credential and pointed at your own host.
//
// Every provider is normalised to one response shape so the client never has to
// branch on vendor:  { reply, provider, model }
//
// Used by the Cloudflare Pages Functions directly, and by server.js via a
// dynamic import (it is CommonJS, this is an ES module).

export const PROVIDERS = ['anthropic', 'openai', 'local'];

// Per-provider endpoint, model, and answer budget.
//
// `maxTokens` differs on purpose. Reasoning-capable local models spend their
// budget thinking before they emit a single visible character — a 4-billion-
// parameter-class question measured at ~1,300 reasoning tokens here — so a
// 1024 budget silently truncates them into an empty reply. Cloud defaults stay
// at 1024 because the tutor answers are meant to be short.
const DEFAULTS = {
  anthropic: { baseUrl: 'https://api.anthropic.com', model: 'claude-sonnet-4-6', maxTokens: 1024 },
  openai: { baseUrl: 'https://api.openai.com/v1', model: 'gpt-4o-mini', maxTokens: 1024 },
  local: { baseUrl: 'http://127.0.0.1:1234/v1', model: 'qwen/qwen3.6-35b-a3b', maxTokens: 3000 },
};

// Cloud providers need a credential to be usable; a local server does not.
const NEEDS_KEY = { anthropic: true, openai: true, local: false };

/**
 * Pick a provider from whatever the operator actually set.
 * Explicit LLM_PROVIDER always wins; otherwise infer from the credentials present.
 */
function detect(env) {
  if (env.LLM_BASE_URL) return 'local';
  if (env.ANTHROPIC_API_KEY) return 'anthropic';
  if (env.OPENAI_API_KEY) return 'openai';
  return null;
}

/**
 * Resolve the effective config. Never throws — an unusable config comes back
 * with `configured: false` and a human-readable `error`, which is what
 * /chat-status reports so the UI can hide the tutor.
 *
 * @param {object} env - process.env or the Pages Functions env binding
 * @returns {{provider:string|null, model:string, baseUrl:string, apiKey:string, configured:boolean, error?:string}}
 */
export function resolveConfig(env = {}) {
  const provider = String(env.LLM_PROVIDER || detect(env) || '').toLowerCase();

  if (!provider) {
    return { provider: null, model: '', baseUrl: '', apiKey: '', configured: false,
      error: 'No LLM provider configured. Set LLM_PROVIDER (anthropic | openai | local).' };
  }
  if (!PROVIDERS.includes(provider)) {
    return { provider, model: '', baseUrl: '', apiKey: '', configured: false,
      error: `Unknown LLM_PROVIDER "${provider}". Expected one of: ${PROVIDERS.join(', ')}.` };
  }

  const d = DEFAULTS[provider];
  // Generic var first, then the vendor-specific ones so existing setups keep working.
  const apiKey = env.LLM_API_KEY
    || (provider === 'anthropic' ? env.ANTHROPIC_API_KEY : '')
    || (provider === 'openai' ? env.OPENAI_API_KEY : '')
    || '';
  const model = env.LLM_MODEL
    || (provider === 'anthropic' ? env.ANTHROPIC_MODEL : '')
    || (provider === 'openai' ? env.OPENAI_MODEL : '')
    || d.model;
  const baseUrl = String(env.LLM_BASE_URL || d.baseUrl).replace(/\/+$/, '');
  const maxTokens = Number(env.LLM_MAX_TOKENS) > 0 ? Number(env.LLM_MAX_TOKENS) : d.maxTokens;

  if (NEEDS_KEY[provider] && !apiKey) {
    return { provider, model, baseUrl, apiKey: '', maxTokens, configured: false,
      error: `LLM_API_KEY is required for provider "${provider}".` };
  }
  return { provider, model, baseUrl, apiKey, maxTokens, configured: true };
}

/** Local reasoning models emit a visible scratchpad; it is not part of the answer. */
function stripThinking(text) {
  return String(text || '').replace(/<think>[\s\S]*?<\/think>/g, '').trim();
}

function buildRequest(cfg, { system, messages, maxTokens }) {
  if (cfg.provider === 'anthropic') {
    return {
      url: `${cfg.baseUrl}/v1/messages`,
      headers: {
        'content-type': 'application/json',
        'x-api-key': cfg.apiKey,
        'anthropic-version': '2023-06-01',
      },
      // Anthropic takes the system prompt as a top-level field, not a message.
      body: { model: cfg.model, max_tokens: maxTokens, system, messages },
    };
  }
  // openai + local share the OpenAI chat-completions wire format.
  const headers = { 'content-type': 'application/json' };
  if (cfg.apiKey) headers.authorization = `Bearer ${cfg.apiKey}`;
  return {
    url: `${cfg.baseUrl}/chat/completions`,
    headers,
    body: {
      model: cfg.model,
      max_tokens: maxTokens,
      messages: system ? [{ role: 'system', content: system }, ...messages] : messages,
    },
  };
}

/** Pull the assistant text out of whichever envelope came back. */
export function extractReply(provider, data) {
  const text = provider === 'anthropic'
    ? data?.content?.[0]?.text
    : data?.choices?.[0]?.message?.content;
  return stripThinking(text);
}

/**
 * Send one chat turn to the configured provider.
 * @returns {Promise<{ok:true, reply:string, provider:string, model:string}|{ok:false, status:number, error:string}>}
 */
export async function chat({ system, messages, maxTokens }, env) {
  const cfg = resolveConfig(env);
  if (!cfg.configured) return { ok: false, status: 503, error: cfg.error };

  const req = buildRequest(cfg, { system, messages, maxTokens: maxTokens || cfg.maxTokens });

  let res;
  try {
    res = await fetch(req.url, {
      method: 'POST',
      headers: req.headers,
      body: JSON.stringify(req.body),
      // A local model on cold-load is slow; cloud APIs should not be.
      signal: AbortSignal.timeout(cfg.provider === 'local' ? 120000 : 60000),
    });
  } catch (e) {
    const hint = cfg.provider === 'local'
      ? ` Is your local model server reachable at ${cfg.baseUrl}?`
      : '';
    return { ok: false, status: 502, error: `Could not reach the ${cfg.provider} endpoint.${hint}` };
  }

  const raw = await res.text();
  let data;
  try { data = JSON.parse(raw); } catch (e) { data = null; }

  if (!res.ok) {
    const detail = data?.error?.message || data?.error || raw.slice(0, 200);
    return { ok: false, status: res.status, error: `${cfg.provider} error: ${detail}` };
  }

  const reply = extractReply(cfg.provider, data);
  if (!reply) {
    // A reasoning model that spends its whole budget thinking returns nothing
    // visible. That is a budget problem, not an outage — say so.
    const truncated = data?.choices?.[0]?.finish_reason === 'length'
      || data?.stop_reason === 'max_tokens';
    return { ok: false, status: 502, error: truncated
      ? `${cfg.provider} hit its ${req.body.max_tokens}-token limit before answering (a reasoning model may be thinking too long). Raise LLM_MAX_TOKENS or use a non-reasoning model.`
      : `${cfg.provider} returned an empty reply.` };
  }

  return { ok: true, reply, provider: cfg.provider, model: cfg.model };
}

/** JSON Response wrapper for the Pages Functions runtime. */
export function jsonResponse(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8' },
  });
}

/** Run a chat turn and return it as an HTTP Response (Pages Functions path). */
export async function chatResponse(payload, env) {
  const r = await chat(payload, env);
  if (!r.ok) return jsonResponse({ error: r.error }, r.status);
  return jsonResponse({ reply: r.reply, provider: r.provider, model: r.model });
}
