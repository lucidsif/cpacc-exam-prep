// tests/sampling.test.js — unit tests for src/sampling.js
//
// Verifies:
//   - shuffle is non-mutating and accepts an injected RNG
//   - sampleQuestions returns exactly TEST_SIZE items
//   - sampleQuestions matches the BoK 8/8/4 domain mix when each domain has enough
//   - sampleQuestions tops up from the rest of the bank when a domain is short
//   - sampleMissedQuestions only returns items present in the missed set

import { shuffle, sampleQuestions, sampleMissedQuestions, TEST_SIZE, DOMAIN_QUOTA } from '../src/sampling.js';

export function run({ test, assertTrue, assertEq }) {
  // Deterministic RNG (seedable LCG). Keeps test output stable across runs.
  function makeRng(seed) {
    let s = seed >>> 0;
    return () => {
      s = (s * 1664525 + 1013904223) >>> 0;
      return s / 0x100000000;
    };
  }

  test('shuffle does not mutate input', () => {
    const input = [1, 2, 3, 4, 5];
    const snapshot = input.slice();
    shuffle(input, makeRng(42));
    assertEq(JSON.stringify(input), JSON.stringify(snapshot), 'input mutated');
  });

  test('shuffle returns same elements', () => {
    const out = shuffle([1, 2, 3, 4, 5], makeRng(7));
    assertEq(out.length, 5);
    assertEq(out.slice().sort().join(','), '1,2,3,4,5');
  });

  test('shuffle is deterministic with injected RNG', () => {
    const a = shuffle([1, 2, 3, 4, 5, 6, 7, 8], makeRng(99));
    const b = shuffle([1, 2, 3, 4, 5, 6, 7, 8], makeRng(99));
    assertEq(a.join(','), b.join(','));
  });

  // Build a synthetic bank: enough items in each domain to fill the quota,
  // plus extras so the top-up path doesn't fire.
  function makeBank(d1, d2, d3) {
    let id = 0;
    const items = [];
    for (let i = 0; i < d1; i++) items.push({ id: id++, domain: 1, type: 'recall', q: 'Q', choices: {A:'a',B:'b',C:'c',D:'d'}, answer: 'A', why: {A:'',B:'',C:'',D:''} });
    for (let i = 0; i < d2; i++) items.push({ id: id++, domain: 2, type: 'recall', q: 'Q', choices: {A:'a',B:'b',C:'c',D:'d'}, answer: 'A', why: {A:'',B:'',C:'',D:''} });
    for (let i = 0; i < d3; i++) items.push({ id: id++, domain: 3, type: 'recall', q: 'Q', choices: {A:'a',B:'b',C:'c',D:'d'}, answer: 'A', why: {A:'',B:'',C:'',D:''} });
    return items;
  }

  test('sampleQuestions returns exactly TEST_SIZE items', () => {
    const bank = makeBank(20, 20, 20);
    const out = sampleQuestions(bank, makeRng(1));
    assertEq(out.length, TEST_SIZE);
  });

  test('sampleQuestions matches BoK domain quota when each domain has enough', () => {
    const bank = makeBank(20, 20, 20);
    const out = sampleQuestions(bank, makeRng(1));
    const counts = { 1: 0, 2: 0, 3: 0 };
    for (const q of out) counts[q.domain]++;
    assertEq(counts[1], DOMAIN_QUOTA[1], 'D1 count');
    assertEq(counts[2], DOMAIN_QUOTA[2], 'D2 count');
    assertEq(counts[3], DOMAIN_QUOTA[3], 'D3 count');
  });

  test('sampleQuestions returns no duplicates', () => {
    const bank = makeBank(20, 20, 20);
    const out = sampleQuestions(bank, makeRng(1));
    const ids = new Set(out.map(q => q.id));
    assertEq(ids.size, out.length, 'duplicate ids in sample');
  });

  test('sampleQuestions tops up from rest of bank if a domain is short', () => {
    // D3 short: only 2 items vs quota 4. Bank still has plenty in D1/D2.
    const bank = makeBank(20, 20, 2);
    const out = sampleQuestions(bank, makeRng(5));
    assertEq(out.length, TEST_SIZE, 'still returns 20');
    const d3 = out.filter(q => q.domain === 3).length;
    assertTrue(d3 <= DOMAIN_QUOTA[3], 'D3 not over-counted');
    // The shortfall came from D1/D2 top-up
    const d12 = out.filter(q => q.domain !== 3).length;
    assertEq(d12, TEST_SIZE - d3);
  });

  test('sampleQuestions on empty bank returns empty array', () => {
    const out = sampleQuestions([], makeRng(1));
    assertEq(out.length, 0);
  });

  test('sampleMissedQuestions returns only items in missed set', () => {
    const bank1 = [{ id: 1, domain: 1 }, { id: 2, domain: 1 }, { id: 3, domain: 1 }];
    const bank2 = [{ id: 1001, domain: 2 }, { id: 1002, domain: 2 }];
    const missed = new Set([2, 1001]);
    const out = sampleMissedQuestions([bank1, bank2], missed, makeRng(1));
    assertEq(out.length, 2);
    const ids = out.map(q => q.id).sort((a, b) => a - b);
    assertEq(ids.join(','), '2,1001');
  });

  test('sampleMissedQuestions caps at TEST_SIZE', () => {
    const bank = [];
    for (let i = 0; i < 50; i++) bank.push({ id: i });
    const missed = new Set(bank.map(q => q.id));
    const out = sampleMissedQuestions([bank], missed, makeRng(1));
    assertEq(out.length, TEST_SIZE);
  });

  test('sampleMissedQuestions on empty missed set returns empty array', () => {
    const bank = [{ id: 1 }, { id: 2 }];
    const out = sampleMissedQuestions([bank], new Set(), makeRng(1));
    assertEq(out.length, 0);
  });
}
