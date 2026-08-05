// functions/corrections.js — POST /corrections → store user flag in D1.

export async function onRequestPost({ request, env }) {
  let body;
  try { body = await request.json(); }
  catch (e) { return json({ ok: false, error: 'invalid JSON body' }, 400); }

  const { id, itemLabel, text, pageUrl } = body;
  if (!id || !text) return json({ ok: false, error: 'missing required fields' }, 400);

  const validPrefixes = ['question-', 'results-', 'flashcards', 'disabilities', 'legal'];
  if (!validPrefixes.some(p => id.startsWith(p))) {
    return json({ ok: false, error: 'unknown item' }, 400);
  }

  await env.DB.prepare(
    'INSERT INTO corrections (item_id, item_label, text, page_url) VALUES (?, ?, ?, ?)'
  ).bind(id, itemLabel || '', text, pageUrl || '').run();

  return json({ ok: true });
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status, headers: { 'content-type': 'application/json; charset=utf-8' },
  });
}
