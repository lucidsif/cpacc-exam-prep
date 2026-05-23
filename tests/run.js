// tests/run.js — entry point for all unit + DOM tests.
//
//   node tests/run.js
//
// Exits 0 on full pass, 1 on any failure. Discovers every *.test.js file
// in this directory and calls its exported `run({ test, assertTrue, assertEq })`.
//
// One exception: the legacy data smoke tests run inline below (they were
// written before the runner existed and there's no need to extract them).

const path = require('path');
const url = require('url');
const fs = require('fs');
const ROOT = path.join(__dirname, '..');

let failed = 0;
let total = 0;
async function test(name, fn) {
  total++;
  try {
    await fn();
    console.log('  ✓', name);
  } catch (e) {
    failed++;
    console.error('  ✗', name, '\n     ', e.message);
  }
}

const _cache = {};
async function load(relPath) {
  if (_cache[relPath]) return _cache[relPath];
  const fileUrl = url.pathToFileURL(path.join(ROOT, relPath)).href;
  const mod = await import(fileUrl);
  _cache[relPath] = mod;
  return mod;
}

function assertTrue(c, msg) { if (!c) throw new Error(msg || 'expected truthy'); }
function assertEq(a, b, msg) { if (a !== b) throw new Error(`${msg || 'expected equal'}: got ${a}, want ${b}`); }

function validateQuestionBank(bank, label) {
  assertTrue(Array.isArray(bank), `${label}: not an array`);
  assertTrue(bank.length > 0, `${label}: empty`);
  const ids = new Set();
  for (const q of bank) {
    assertTrue(Number.isInteger(q.id), `${label}: missing/invalid id`);
    assertTrue(!ids.has(q.id), `${label}: duplicate id ${q.id}`);
    ids.add(q.id);
    assertTrue([1, 2, 3].includes(q.domain), `${label}: q${q.id} bad domain ${q.domain}`);
    assertTrue(['recall', 'application', 'analysis'].includes(q.type), `${label}: q${q.id} bad type ${q.type}`);
    assertTrue(typeof q.q === 'string' && q.q.length > 0, `${label}: q${q.id} missing question text`);
    assertTrue(q.choices && q.choices.A && q.choices.B && q.choices.C && q.choices.D, `${label}: q${q.id} missing choices A-D`);
    assertTrue(['A', 'B', 'C', 'D'].includes(q.answer), `${label}: q${q.id} bad answer ${q.answer}`);
    assertTrue(q.why && q.why.A && q.why.B && q.why.C && q.why.D, `${label}: q${q.id} missing why for all 4 choices`);
  }
}

async function dataSmokeTests() {
  console.log('data files');
  await test('questions.js: loads and exposes CPACC_BANK', async () => {
    const m = await load('data/questions.js');
    assertTrue(Array.isArray(m.CPACC_BANK));
  });
  await test('questions.js: all questions valid structure', async () => {
    validateQuestionBank((await load('data/questions.js')).CPACC_BANK, 'CPACC_BANK');
  });
  await test('questions.js: all three domains represented', async () => {
    const ds = new Set((await load('data/questions.js')).CPACC_BANK.map(q => q.domain));
    assertTrue(ds.has(1) && ds.has(2) && ds.has(3), 'missing one of D1/D2/D3');
  });
  await test('bear-questions.js: loads BEAR_BANK', async () => {
    assertTrue(Array.isArray((await load('data/bear-questions.js')).BEAR_BANK));
  });
  await test('bear-questions.js: all valid structure', async () => {
    validateQuestionBank((await load('data/bear-questions.js')).BEAR_BANK, 'BEAR_BANK');
  });
  await test('bear-questions.js: IDs do not collide with CPACC_BANK', async () => {
    const c = (await load('data/questions.js')).CPACC_BANK;
    const b = (await load('data/bear-questions.js')).BEAR_BANK;
    const cIds = new Set(c.map(q => q.id));
    for (const q of b) assertTrue(!cIds.has(q.id), `BEAR id ${q.id} collides with CPACC bank`);
  });
  await test('bear-flashcards.js: loads BEAR_FLASHCARDS', async () => {
    const m = await load('data/bear-flashcards.js');
    assertTrue(Array.isArray(m.BEAR_FLASHCARDS) && m.BEAR_FLASHCARDS.length > 0);
  });
  await test('bear-flashcards.js: every card has id, tag, front, back', async () => {
    const cards = (await load('data/bear-flashcards.js')).BEAR_FLASHCARDS;
    const ids = new Set();
    for (const c of cards) {
      assertTrue(Number.isInteger(c.id), 'card missing id');
      assertTrue(!ids.has(c.id), `duplicate flashcard id ${c.id}`);
      ids.add(c.id);
      assertTrue(typeof c.tag === 'string' && c.tag.length > 0, `card ${c.id} missing tag`);
      assertTrue(typeof c.front === 'string' && c.front.length > 0, `card ${c.id} missing front`);
      assertTrue(typeof c.back === 'string' && c.back.length > 0, `card ${c.id} missing back`);
    }
  });
  await test('disabilities.js: loads DISABILITIES', async () => {
    const m = await load('data/disabilities.js');
    assertTrue(m.DISABILITIES && Array.isArray(m.DISABILITIES.categories) && Array.isArray(m.DISABILITIES.items));
  });
  await test('disabilities.js: every item references a known category', async () => {
    const d = (await load('data/disabilities.js')).DISABILITIES;
    const catIds = new Set(d.categories.map(c => c.id));
    for (const item of d.items) assertTrue(catIds.has(item.category), `item ${item.id} references unknown category ${item.category}`);
  });
  await test('disabilities.js: every category & item has required fields', async () => {
    const d = (await load('data/disabilities.js')).DISABILITIES;
    for (const c of d.categories) assertTrue(c.id && c.label && c.emoji && c.color, `category ${c.id} missing fields`);
    const ids = new Set();
    for (const item of d.items) {
      assertTrue(item.id && item.name && item.emoji && item.description, `item ${item.id} missing required fields`);
      assertTrue(!ids.has(item.id), `duplicate disability id ${item.id}`);
      ids.add(item.id);
    }
  });
  await test('legal.js: loads LEGAL', async () => {
    const m = await load('data/legal.js');
    assertTrue(m.LEGAL && Array.isArray(m.LEGAL.jurisdictions) && Array.isArray(m.LEGAL.items));
  });
  await test('legal.js: every item references a known jurisdiction', async () => {
    const d = (await load('data/legal.js')).LEGAL;
    const jurIds = new Set(d.jurisdictions.map(j => j.id));
    for (const item of d.items) assertTrue(jurIds.has(item.jurisdiction), `legal item ${item.id} references unknown jurisdiction ${item.jurisdiction}`);
  });
  await test('legal.js: every item has id/name/summary/year, ids unique', async () => {
    const items = (await load('data/legal.js')).LEGAL.items;
    const ids = new Set();
    for (const item of items) {
      assertTrue(item.id && item.name && item.summary && item.year, `legal item ${item.id || '(no id)'} missing required fields`);
      assertTrue(!ids.has(item.id), `duplicate legal id ${item.id}`);
      ids.add(item.id);
    }
  });
  await test('legal.js: CPACC-relevant filter leaves all jurisdictions populated', async () => {
    const d = (await load('data/legal.js')).LEGAL;
    const visible = d.items.filter(i => i.cpacc !== false);
    const jurs = new Set(visible.map(i => i.jurisdiction));
    for (const j of d.jurisdictions) assertTrue(jurs.has(j.id), `jurisdiction ${j.id} has no CPACC-relevant items`);
  });

  // Provenance constants — every dataset must declare a default provenance so
  // the UI can render an AI-transparency badge even for items that don't carry
  // a per-item override.
  await test('every dataset exports a *_PROVENANCE object with the IBM FactSheet shape', async () => {
    const cases = [
      ['data/questions.js', 'CPACC_BANK_PROVENANCE'],
      ['data/bear-questions.js', 'BEAR_BANK_PROVENANCE'],
      ['data/bear-flashcards.js', 'BEAR_FLASHCARDS_PROVENANCE'],
      ['data/disabilities.js', 'DISABILITIES_PROVENANCE'],
      ['data/legal.js', 'LEGAL_PROVENANCE'],
    ];
    for (const [file, name] of cases) {
      const mod = await load(file);
      const p = mod[name];
      assertTrue(p, `${file}: missing export ${name}`);
      assertTrue(['ai-from-source', 'ai-from-notes', 'ai-live'].includes(p.category), `${name}: bad category ${p.category}`);
      assertTrue(typeof p.label === 'string' && p.label.length, `${name}: missing label`);
      assertTrue(Array.isArray(p.citations) && p.citations.length, `${name}: must list at least one citation`);
      assertTrue(typeof p.generatedBy === 'string' && p.generatedBy.length, `${name}: missing generatedBy`);
      assertTrue(typeof p.humanReview === 'string' && p.humanReview.length, `${name}: missing humanReview`);
      assertTrue(['high', 'medium', 'low', 'variable'].includes(p.confidence), `${name}: bad confidence ${p.confidence}`);
      assertTrue(Array.isArray(p.limitations), `${name}: limitations must be an array`);
    }
  });
}

async function main() {
  console.log('CPACC test-maker · all tests\n');
  await dataSmokeTests();

  // Discover and run every *.test.js file in tests/.
  const files = fs.readdirSync(__dirname).filter(f => f.endsWith('.test.js')).sort();
  for (const f of files) {
    console.log(`\n${f}`);
    const mod = await import(url.pathToFileURL(path.join(__dirname, f)).href);
    if (typeof mod.run !== 'function') {
      console.error(`  (skipped — ${f} has no exported run() function)`);
      continue;
    }
    await mod.run({ test, assertTrue, assertEq });
  }

  console.log(`\n${total - failed}/${total} passed${failed ? `, ${failed} failed` : ''}`);
  process.exit(failed ? 1 : 0);
}

main().catch(e => { console.error(e); process.exit(1); });
