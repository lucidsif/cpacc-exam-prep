// functions/_lib/anthropic.js — shared Anthropic API call helper.
//
// Cloudflare Pages Functions (Workers runtime) provides global fetch.

const DEFAULT_MODEL = 'claude-sonnet-4-6';

/**
 * Forward a chat request to the Anthropic Messages API.
 * @param {object} payload - { model?, max_tokens?, system, messages }
 * @param {string} apiKey
 * @returns {Promise<Response>} — the Anthropic response, ready to return as-is
 */
export async function callAnthropic(payload, apiKey, model) {
  const body = JSON.stringify({
    model: model || DEFAULT_MODEL,
    max_tokens: payload.max_tokens || 1024,
    system: payload.system,
    messages: payload.messages,
  });
  return fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body,
  });
}

/** Convenience helper for non-streaming JSON proxy passthrough. */
export async function proxyAnthropic(payload, env) {
  if (!env.ANTHROPIC_API_KEY) {
    return new Response(JSON.stringify({ error: 'ANTHROPIC_API_KEY not configured' }), {
      status: 500,
      headers: { 'content-type': 'application/json; charset=utf-8' },
    });
  }
  const upstream = await callAnthropic(payload, env.ANTHROPIC_API_KEY, env.ANTHROPIC_MODEL);
  const text = await upstream.text();
  return new Response(text, {
    status: upstream.status,
    headers: { 'content-type': 'application/json; charset=utf-8' },
  });
}
