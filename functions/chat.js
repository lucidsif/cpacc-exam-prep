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

export async function onRequestPost({ request, env }) {
  let body;
  try { body = await request.json(); }
  catch (e) { return badJson(); }

  const { question, correctLetter, userLetter, choices, why, cite, history = [], userMessage } = body;

  const system = [
    'You are a tutor helping a student understand a specific CPACC practice question.',
    'Ground your answers in the IAAP CPACC Body of Knowledge (October 2023, v4.0) when relevant.',
    'Be concise (2-4 short paragraphs max) and conversational.',
    '',
    'Question context:',
    `Question: ${question}`,
    `Choices: ${JSON.stringify(choices)}`,
    `Correct answer: ${correctLetter}`,
    `User's answer: ${userLetter || '(not yet answered)'}`,
    `Rationale per choice: ${JSON.stringify(why)}`,
    cite ? `Source: ${cite}` : '',
  ].filter(Boolean).join('\n');

  const messages = [...history, { role: 'user', content: userMessage }];

  return chatResponse({ system, messages }, env);
}

function badJson() {
  return new Response(JSON.stringify({ error: 'invalid JSON body' }), {
    status: 400,
    headers: { 'content-type': 'application/json; charset=utf-8' },
  });
}
