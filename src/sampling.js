// src/sampling.js — pure sampling logic for practice tests.
//
// All functions are pure: they take banks and a missed-set as arguments
// and return new arrays. Easy to unit-test (see tests/sampling.test.js).

export const TEST_SIZE = 20;

// BoK weighting: D1=40%, D2=40%, D3=20%  →  8/8/4 of 20
export const DOMAIN_QUOTA = { 1: 8, 2: 8, 3: 4 };

/**
 * Fisher–Yates shuffle. Non-mutating: returns a new array.
 * Optionally takes a custom RNG (returns [0,1)) for deterministic tests.
 * @template T
 * @param {T[]} arr
 * @param {() => number} [rng]
 * @returns {T[]}
 */
export function shuffle(arr, rng = Math.random) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Sample TEST_SIZE questions from `bank`, matching the BoK domain mix.
 * If a domain is short, tops up from the rest of the bank.
 * @param {Array<{id:number, domain:1|2|3}>} bank
 * @param {() => number} [rng]
 * @returns {Array}
 */
export function sampleQuestions(bank, rng = Math.random) {
  const byDomain = { 1: [], 2: [], 3: [] };
  for (const q of bank) byDomain[q.domain]?.push(q);

  let picked = [];
  for (const d of [1, 2, 3]) {
    const want = DOMAIN_QUOTA[d];
    const pool = shuffle(byDomain[d], rng);
    picked = picked.concat(pool.slice(0, want));
  }
  // If a domain was short, top up from the remaining bank.
  if (picked.length < TEST_SIZE) {
    const pickedIds = new Set(picked.map(q => q.id));
    const rest = shuffle(bank.filter(q => !pickedIds.has(q.id)), rng);
    picked = picked.concat(rest.slice(0, TEST_SIZE - picked.length));
  }
  return shuffle(picked, rng).slice(0, TEST_SIZE);
}

/**
 * Sample up to TEST_SIZE missed questions from the union of `banks`.
 * @param {Array<Array<{id:number}>>} banks
 * @param {Set<number>} missed
 * @param {() => number} [rng]
 * @returns {Array}
 */
export function sampleMissedQuestions(banks, missed, rng = Math.random) {
  const all = banks.flat();
  const pool = all.filter(q => missed.has(q.id));
  return shuffle(pool, rng).slice(0, TEST_SIZE);
}
