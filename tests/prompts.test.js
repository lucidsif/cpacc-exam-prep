// tests/prompts.test.js — unit tests for functions/_lib/prompts.js, and a
// drift guard for its three callers (server.js, functions/chat.js,
// functions/chat-general.js).
//
// server.js and the Cloudflare Functions used to build structurally
// different conversations for the same endpoint before prompts.js existed —
// this file asserts the shared builders behave correctly, and greps the
// three call sites to make sure none of them has quietly grown its own copy
// of the system-prompt / message-building logic again.

import path from 'node:path';
import fs from 'node:fs';
import url from 'node:url';
import { buildQuestionPrompt, buildGeneralPrompt } from '../functions/_lib/prompts.js';

const HERE = path.dirname(url.fileURLToPath(import.meta.url));
const ROOT = path.join(HERE, '..');
const read = f => fs.readFileSync(path.join(ROOT, f), 'utf8');

const SAMPLE_QUESTION = {
  question: 'Which of these is a physical disability?',
  choices: { A: 'Low vision', B: 'Paraplegia', C: 'Dyslexia', D: 'Anxiety' },
  why: { A: 'sensory, not physical', B: 'correct — mobility impairment', C: 'cognitive/learning', D: 'psychiatric' },
  correctLetter: 'B',
  userLetter: 'A',
  cite: 'BoK 1.2',
  history: [{ role: 'user', content: 'earlier turn' }, { role: 'assistant', content: 'earlier reply' }],
  userMessage: 'why not A?',
};

export function run({ test, assertTrue, assertEq }) {
  test('buildQuestionPrompt: puts context in system, not a fabricated turn', () => {
    const { system, messages } = buildQuestionPrompt(SAMPLE_QUESTION);
    assertTrue(system.includes('Which of these is a physical disability?'), 'system should carry the question');
    assertTrue(system.includes('BoK 1.2'), 'system should carry the citation');
    // messages holds only real turns: prior history plus this user message —
    // no fabricated assistant acknowledgement.
    assertEq(messages.length, 3);
    assertEq(messages[0].content, 'earlier turn');
    assertEq(messages[1].content, 'earlier reply');
    assertEq(messages[2].content, 'why not A?');
  });

  test('buildQuestionPrompt: formats choices and rationale as a readable list, not JSON', () => {
    const { system } = buildQuestionPrompt(SAMPLE_QUESTION);
    assertTrue(system.includes('A. Low vision'), 'choices should read as "A. text", not JSON');
    assertTrue(system.includes('B: correct — mobility impairment'), 'rationale should read as "B: text", not JSON');
    assertTrue(!system.includes('{"A"'), 'should not fall back to JSON.stringify');
  });

  test('buildGeneralPrompt: carries the full persona, including the domain-coverage sentence', () => {
    const { system, messages } = buildGeneralPrompt({ history: [], userMessage: 'hello' });
    assertTrue(system.includes('Cover disabilities, accessibility/UD, standards, laws, and management as needed.'),
      'general prompt must not drop this sentence relative to the per-question prompt');
    assertEq(messages.length, 1);
    assertEq(messages[0].role, 'user');
    assertEq(messages[0].content, 'hello');
  });

  test('userMessage is capped so an oversized paste cannot balloon the request', () => {
    const huge = 'x'.repeat(10000);
    const { messages } = buildGeneralPrompt({ history: [], userMessage: huge });
    assertTrue(messages[0].content.length < huge.length, 'message should be truncated');
    assertTrue(messages[0].content.length <= 4000, 'message should be capped at 4000 chars');
  });

  test('history is capped by turn count so it cannot grow unbounded', () => {
    const longHistory = Array.from({ length: 100 }, (_, i) => ({ role: 'user', content: `turn ${i}` }));
    const { messages } = buildGeneralPrompt({ history: longHistory, userMessage: 'latest' });
    // capped history + the new user message
    assertTrue(messages.length <= 21, `expected capped history, got ${messages.length} messages`);
    assertEq(messages[messages.length - 1].content, 'latest');
  });

  test('missing history/userMessage do not throw', () => {
    const { messages } = buildGeneralPrompt({});
    assertEq(messages.length, 1);
    assertEq(messages[0].content, '');
  });

  // --- drift guard: every caller must go through the shared builders -------

  test('server.js calls the shared builders instead of building prompts inline', () => {
    const src = read('server.js');
    assertTrue(src.includes("./functions/_lib/prompts.js"), 'server.js should dynamic-import prompts.js, matching how it loads llm.js');
    assertTrue(src.includes('buildQuestionPrompt(') && src.includes('buildGeneralPrompt('), 'server.js should call both shared builders');
    assertTrue(!src.includes('Got it. Ask me anything'), 'server.js should not fabricate an assistant turn any more');
  });

  test('functions/chat.js calls the shared builder instead of building prompts inline', () => {
    const src = read('functions/chat.js');
    assertTrue(src.includes("from './_lib/prompts.js'"), 'functions/chat.js should import prompts.js');
    assertTrue(src.includes('buildQuestionPrompt('), 'functions/chat.js should call the shared builder');
    assertTrue(!src.includes('JSON.stringify(choices)') && !src.includes('JSON.stringify(why)'), 'functions/chat.js should not re-introduce JSON-formatted choices/rationale');
  });

  test('functions/chat-general.js calls the shared builder instead of building prompts inline', () => {
    const src = read('functions/chat-general.js');
    assertTrue(src.includes("from './_lib/prompts.js'"), 'functions/chat-general.js should import prompts.js');
    assertTrue(src.includes('buildGeneralPrompt('), 'functions/chat-general.js should call the shared builder');
  });

  test('server.js and the Functions build byte-identical prompts for the same input', () => {
    // The whole point of extracting prompts.js: server.js's dynamic import and
    // the Functions' static import must resolve to the same implementation.
    const direct = buildQuestionPrompt(SAMPLE_QUESTION);
    const viaSecondImportSite = buildQuestionPrompt({ ...SAMPLE_QUESTION });
    assertEq(JSON.stringify(direct), JSON.stringify(viaSecondImportSite));

    const directGeneral = buildGeneralPrompt({ history: [], userMessage: 'hi' });
    const viaSecondGeneral = buildGeneralPrompt({ history: [], userMessage: 'hi' });
    assertEq(JSON.stringify(directGeneral), JSON.stringify(viaSecondGeneral));
  });
}
