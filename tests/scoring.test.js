// tests/scoring.test.js — unit tests for src/scoring.js

import { scoreTest, domainLabel } from '../src/scoring.js';

export function run({ test, assertTrue, assertEq }) {
  // Helper to make a fake question with just the fields scoreTest reads.
  function q(id, domain, answer) {
    return { id, domain, answer };
  }

  test('empty test returns zero score', () => {
    const r = scoreTest([], {});
    assertEq(r.correct, 0);
    assertEq(r.total, 0);
    assertEq(r.pct, 0);
  });

  test('perfect score', () => {
    const qs = [q(1, 1, 'A'), q(2, 2, 'B'), q(3, 3, 'C')];
    const r = scoreTest(qs, { 1: 'A', 2: 'B', 3: 'C' });
    assertEq(r.correct, 3);
    assertEq(r.total, 3);
    assertEq(r.pct, 100);
  });

  test('zero score', () => {
    const qs = [q(1, 1, 'A'), q(2, 2, 'B'), q(3, 3, 'C')];
    const r = scoreTest(qs, { 1: 'B', 2: 'A', 3: 'D' });
    assertEq(r.correct, 0);
    assertEq(r.pct, 0);
  });

  test('partial score percentage rounds correctly', () => {
    // 5 of 7 = 71.428% → 71
    const qs = [];
    for (let i = 1; i <= 7; i++) qs.push(q(i, 1, 'A'));
    const answers = { 1: 'A', 2: 'A', 3: 'A', 4: 'A', 5: 'A', 6: 'X', 7: 'X' };
    const r = scoreTest(qs, answers);
    assertEq(r.correct, 5);
    assertEq(r.pct, 71);
  });

  test('unanswered counts as incorrect', () => {
    const qs = [q(1, 1, 'A'), q(2, 2, 'B')];
    const r = scoreTest(qs, { 1: 'A' });
    assertEq(r.correct, 1);
    assertEq(r.pct, 50);
  });

  test('domain breakdown is correct', () => {
    const qs = [
      q(1, 1, 'A'), q(2, 1, 'A'), q(3, 1, 'A'),     // 2/3 D1
      q(4, 2, 'B'), q(5, 2, 'B'),                   // 1/2 D2
      q(6, 3, 'C'),                                 // 0/1 D3
    ];
    const answers = { 1: 'A', 2: 'A', 3: 'X', 4: 'B', 5: 'X', 6: 'X' };
    const r = scoreTest(qs, answers);
    assertEq(r.domainStats[1].c, 2);
    assertEq(r.domainStats[1].t, 3);
    assertEq(r.domainStats[2].c, 1);
    assertEq(r.domainStats[2].t, 2);
    assertEq(r.domainStats[3].c, 0);
    assertEq(r.domainStats[3].t, 1);
  });

  test('domainLabel returns the right string for each domain', () => {
    assertTrue(domainLabel(1).includes('Disabilities'));
    assertTrue(domainLabel(2).includes('Accessibility'));
    assertTrue(domainLabel(3).includes('Standards'));
  });
}
