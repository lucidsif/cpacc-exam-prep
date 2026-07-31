// functions/chat-status.js — Cloudflare Pages Function.
// GET /chat-status → { enabled, provider, model }
//
// Reports whether a chat provider is configured in the Pages environment.
// The client uses this to decide whether to render the chat UI, and to label
// which backend is answering.

import { resolveConfig, jsonResponse } from './_lib/llm.js';

export async function onRequestGet({ env }) {
  const cfg = resolveConfig(env);
  return jsonResponse({
    enabled: cfg.configured,
    provider: cfg.configured ? cfg.provider : null,
    model: cfg.configured ? cfg.model : null,
  });
}
