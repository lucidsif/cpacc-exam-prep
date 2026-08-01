// functions/_lib/prompts.js — builds the { system, messages } payload sent to
// the LLM for each chat endpoint.
//
// This exists because server.js and the Cloudflare Functions used to build
// two structurally different conversations for the same endpoint (context
// stuffed into a fabricated user/assistant turn vs. folded into the system
// prompt, choices formatted as a readable list vs. JSON.stringify'd, and one
// sentence of persona wording that had quietly forked between the two). A
// prompt is part of the app's behavior just as much as any UI code, so it
// gets the same single-implementation treatment functions/_lib/llm.js
// already gives the provider wiring.
//
// Structure choice: context lives in the system prompt and `messages` holds
// only turns the user and assistant actually said — no fabricated
// acknowledgement turn.
//
// Used by the Cloudflare Pages Functions directly, and by server.js via a
// dynamic import (it is CommonJS, this is an ES module) — see llm() in
// server.js for the identical pattern.

// A chat turn should be a question, not an essay; 4000 characters is well
// beyond anything the UI's chat box is meant to hold. History is capped by
// turn count rather than characters because each turn already carries its
// own reply-length budget from the model.
const MAX_USER_MESSAGE_CHARS = 4000;
const MAX_HISTORY_MESSAGES = 20;

function capUserMessage(userMessage) {
  return String(userMessage || '').slice(0, MAX_USER_MESSAGE_CHARS);
}

function capHistory(history) {
  return Array.isArray(history) ? history.slice(-MAX_HISTORY_MESSAGES) : [];
}

/** Render a { A: '...', B: '...' } map as an indented, human-readable list. */
function renderMap(map, sep) {
  return Object.entries(map || {}).map(([k, v]) => `  ${k}${sep} ${v}`).join('\n');
}

/**
 * Build the { system, messages } payload for the per-question tutor
 * (POST /chat).
 */
export function buildQuestionPrompt({ question, choices, why, correctLetter, userLetter, cite, history, userMessage }) {
  const system = [
    'You are a tutor helping a student understand a specific CPACC practice question.',
    'Ground your answers in the IAAP CPACC Body of Knowledge (October 2023, v4.0) when relevant.',
    'Be concise (2-4 short paragraphs max) and conversational.',
    'When relevant, cite the BoK page reference provided in the question context.',
    'If asked to go deeper, explain the underlying concept, not just the right letter.',
    '',
    'Question context:',
    `Question: ${question}`,
    `Choices:\n${renderMap(choices, '.')}`,
    `Correct answer: ${correctLetter}`,
    `User's answer: ${userLetter || '(not yet answered)'}`,
    `Per-choice rationale:\n${renderMap(why, ':')}`,
    cite ? `BoK citation: ${cite}` : '',
  ].filter(Boolean).join('\n');

  const messages = [...capHistory(history), { role: 'user', content: capUserMessage(userMessage) }];
  return { system, messages };
}

/**
 * Build the { system, messages } payload for the home-page free-form tutor
 * (POST /chat-general).
 */
export function buildGeneralPrompt({ history, userMessage }) {
  const system = 'You are a CPACC exam tutor. Be concise (2-4 short paragraphs max). Ground answers in the IAAP CPACC Body of Knowledge (Oct 2023, v4.0) when relevant. Cover disabilities, accessibility/UD, standards, laws, and management as needed.';
  const messages = [...capHistory(history), { role: 'user', content: capUserMessage(userMessage) }];
  return { system, messages };
}
