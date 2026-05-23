// src/chat.js — fetch wrappers for the Anthropic-proxied chat endpoints.
//
// Two endpoints on the server:
//   /chat-general  — home-page free-form tutor chat
//   /chat          — per-question chat (sent with question/choice context)
//   /chat-status   — probe whether the server has ANTHROPIC_API_KEY set
//
// Failures are returned as a string error rather than thrown — callers
// just push it into the chat log as an "error" message.

/** @returns {Promise<boolean>} true if the server reports chat is enabled. */
export async function fetchChatStatus() {
  try {
    const r = await fetch('/chat-status');
    if (!r.ok) return false;
    const d = await r.json();
    return !!(d && d.enabled);
  } catch (e) {
    return false;
  }
}

/**
 * Send a message to the home-page tutor.
 * @param {Array<{role:string, content:string}>} history - prior messages, NOT including userMessage
 * @param {string} userMessage
 * @returns {Promise<{ok:true, reply:string}|{ok:false, error:string}>}
 */
export async function sendHomeMessage(history, userMessage) {
  try {
    const r = await fetch('/chat-general', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ history, userMessage })
    });
    const data = await r.json();
    if (!r.ok) throw new Error(data.error || ('HTTP ' + r.status));
    const reply = (data.content && data.content[0] && data.content[0].text) || '(no reply)';
    return { ok: true, reply };
  } catch (e) {
    return { ok: false, error: 'Chat failed: ' + e.message };
  }
}

/**
 * Send a message to the per-question tutor (Claude gets the question + BoK rationale as context).
 * @param {object} q - the question object
 * @param {string|null} userLetter - the user's submitted answer letter, if any
 * @param {Array} history - prior messages
 * @param {string} userMessage
 * @returns {Promise<{ok:true, reply:string}|{ok:false, error:string}>}
 */
export async function sendQuestionMessage(q, userLetter, history, userMessage) {
  try {
    const r = await fetch('/chat', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        question: q.q,
        correctLetter: q.answer,
        userLetter: userLetter || null,
        choices: q.choices,
        why: q.why,
        cite: q.cite || null,
        history,
        userMessage,
      })
    });
    const data = await r.json();
    if (!r.ok) throw new Error(data.error || ('HTTP ' + r.status));
    const reply = (data.content && data.content[0] && data.content[0].text) || '(no reply)';
    return { ok: true, reply };
  } catch (e) {
    return { ok: false, error: 'Chat failed: ' + e.message + '\nIs the server running with ANTHROPIC_API_KEY set?' };
  }
}
