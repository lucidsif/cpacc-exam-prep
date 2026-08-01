// functions/chat.js — Cloudflare Pages Function.
// POST /chat → per-question chat tutor.
//
// Body shape:
//   {
//     question, correctLetter, userLetter, choices, why, cite,
//     history: [{role, content}],
//     userMessage: string,
//   }
//
// Returns the normalised shape { reply, provider, model } regardless of backend.

import { chatResponse } from './_lib/llm.js';
import { buildQuestionPrompt } from './_lib/prompts.js';

export async function onRequestPost({ request, env }) {
  let body;
  try { body = await request.json(); }
  catch (e) { return badJson(); }

  const { question, correctLetter, userLetter, choices, why, cite, history = [], userMessage } = body;
  const { system, messages } = buildQuestionPrompt({ question, correctLetter, userLetter, choices, why, cite, history, userMessage });

  return chatResponse({ system, messages }, env);
}

function badJson() {
  return new Response(JSON.stringify({ error: 'invalid JSON body' }), {
    status: 400,
    headers: { 'content-type': 'application/json; charset=utf-8' },
  });
}
