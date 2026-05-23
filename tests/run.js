// Smoke tests for the CPACC test-maker data files.
// Run: node tests/run.js
// Exits 0 on pass, 1 on any failure.

const path = require('path');
const ROOT = path.join(__dirname, '..');

let failed = 0;
let total = 0;
function test(name, fn) {
  total++;
  try {
    fn();
    console.log('  ✓', name);
  } catch (e) {
    failed++;
    console.error('  ✗', name, '\n     ', e.message);
  }
}
function load(file) {
  const win = {};
  global.window = win;
  delete require.cache[require.resolve(path.join(ROOT, file))];
  require(path.join(ROOT, file));
  return win;
}
function assertEq(a, b, msg) { if (a !== b) throw new Error(`${msg || 'expected equal'}: got ${a}, want ${b}`); }
function assertTrue(c, msg) { if (!c) throw new Error(msg || 'expected truthy'); }

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

console.log('CPACC test-maker · smoke tests\n');

console.log('questions.js');
test('loads and exposes CPACC_BANK', () => {
  const w = load('questions.js');
  assertTrue(Array.isArray(w.CPACC_BANK));
});
test('all questions valid structure', () => {
  const w = load('questions.js');
  validateQuestionBank(w.CPACC_BANK, 'CPACC_BANK');
});
test('has all three domains represented', () => {
  const w = load('questions.js');
  const ds = new Set(w.CPACC_BANK.map(q => q.domain));
  assertTrue(ds.has(1) && ds.has(2) && ds.has(3), 'missing one of D1/D2/D3');
});

console.log('\nbear-questions.js');
test('loads and exposes BEAR_BANK', () => {
  const w = load('bear-questions.js');
  assertTrue(Array.isArray(w.BEAR_BANK));
});
test('all questions valid structure', () => {
  const w = load('bear-questions.js');
  validateQuestionBank(w.BEAR_BANK, 'BEAR_BANK');
});
test('IDs do not collide with CPACC_BANK', () => {
  const c = load('questions.js').CPACC_BANK;
  const b = load('bear-questions.js').BEAR_BANK;
  const cIds = new Set(c.map(q => q.id));
  for (const q of b) {
    assertTrue(!cIds.has(q.id), `BEAR id ${q.id} collides with CPACC bank`);
  }
});

console.log('\nbear-flashcards.js');
test('loads and exposes BEAR_FLASHCARDS', () => {
  const w = load('bear-flashcards.js');
  assertTrue(Array.isArray(w.BEAR_FLASHCARDS));
  assertTrue(w.BEAR_FLASHCARDS.length > 0);
});
test('every card has id, tag, front, back', () => {
  const cards = load('bear-flashcards.js').BEAR_FLASHCARDS;
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

console.log('\ndisabilities.js');
test('loads and exposes DISABILITIES', () => {
  const w = load('disabilities.js');
  assertTrue(w.DISABILITIES && Array.isArray(w.DISABILITIES.categories) && Array.isArray(w.DISABILITIES.items));
});
test('every item references a known category', () => {
  const d = load('disabilities.js').DISABILITIES;
  const catIds = new Set(d.categories.map(c => c.id));
  for (const item of d.items) {
    assertTrue(catIds.has(item.category), `item ${item.id} references unknown category ${item.category}`);
  }
});
test('every category has emoji and color; every item has required fields', () => {
  const d = load('disabilities.js').DISABILITIES;
  for (const c of d.categories) {
    assertTrue(c.id && c.label && c.emoji && c.color, `category ${c.id} missing fields`);
  }
  const ids = new Set();
  for (const item of d.items) {
    assertTrue(item.id && item.name && item.emoji && item.description, `item ${item.id} missing required fields`);
    assertTrue(!ids.has(item.id), `duplicate disability id ${item.id}`);
    ids.add(item.id);
  }
});

console.log('\nlegal.js');
test('loads and exposes LEGAL', () => {
  const w = load('legal.js');
  assertTrue(w.LEGAL && Array.isArray(w.LEGAL.jurisdictions) && Array.isArray(w.LEGAL.items));
});
test('every item references a known jurisdiction', () => {
  const d = load('legal.js').LEGAL;
  const jurIds = new Set(d.jurisdictions.map(j => j.id));
  for (const item of d.items) {
    assertTrue(jurIds.has(item.jurisdiction), `legal item ${item.id} references unknown jurisdiction ${item.jurisdiction}`);
  }
});
test('every item has id, name, summary, year; ids unique', () => {
  const items = load('legal.js').LEGAL.items;
  const ids = new Set();
  for (const item of items) {
    assertTrue(item.id && item.name && item.summary && item.year, `legal item ${item.id || '(no id)'} missing required fields`);
    assertTrue(!ids.has(item.id), `duplicate legal id ${item.id}`);
    ids.add(item.id);
  }
});
test('CPACC-relevant filter leaves all jurisdictions populated', () => {
  const d = load('legal.js').LEGAL;
  const visible = d.items.filter(i => i.cpacc !== false);
  const jurs = new Set(visible.map(i => i.jurisdiction));
  for (const j of d.jurisdictions) {
    assertTrue(jurs.has(j.id), `jurisdiction ${j.id} has no CPACC-relevant items`);
  }
});

console.log(`\n${total - failed}/${total} passed${failed ? `, ${failed} failed` : ''}`);
process.exit(failed ? 1 : 0);
