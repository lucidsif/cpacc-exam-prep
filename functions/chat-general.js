// functions/chat-general.js — Cloudflare Pages Function.
// POST /chat-general → home-page free-form CPACC tutor chat.
//
// Body shape:
//   {
//     history: [{role, content}],
//     userMessage: string,
//   }

import { chatResponse } from './_lib/llm.js';

export async function onRequestPost({ request, env }) {
  let body;
  try { body = await request.json(); }
  catch (e) {
    return new Response(JSON.stringify({ error: 'invalid JSON body' }), {
      status: 400,
      headers: { 'content-type': 'application/json; charset=utf-8' },
    });
  }
  const { history = [], userMessage } = body;
  const system = 'You are a CPACC exam tutor. Be concise (2-4 short paragraphs max). Ground answers in the IAAP CPACC Body of Knowledge (Oct 2023, v4.0) when relevant.';
  const messages = [...history, { role: 'user', content: userMessage }];
  return chatResponse({ system, messages }, env);
}
