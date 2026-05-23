// functions/chat-status.js — Cloudflare Pages Function.
// GET /chat-status → { enabled: boolean }
//
// Reports whether ANTHROPIC_API_KEY is configured in the Pages environment.
// The client uses this to decide whether to render the chat UI.

export async function onRequestGet({ env }) {
  return new Response(JSON.stringify({ enabled: !!env.ANTHROPIC_API_KEY }), {
    headers: { 'content-type': 'application/json; charset=utf-8' },
  });
}
