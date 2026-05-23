// src/scoring.js — score and per-domain stats for a finished test.
//
// Pure functions; unit-tested in tests/scoring.test.js.

/**
 * Compute correct count, per-domain breakdown, and percentage.
 * @param {Array<{id:number, domain:1|2|3, answer:string}>} questions
 * @param {Record<number,string>} answers - id → letter the user picked
 * @returns {{correct:number, total:number, pct:number, domainStats:Record<number,{c:number,t:number}>}}
 */
export function scoreTest(questions, answers) {
  let correct = 0;
  const domainStats = { 1: { c: 0, t: 0 }, 2: { c: 0, t: 0 }, 3: { c: 0, t: 0 } };
  for (const q of questions) {
    domainStats[q.domain].t++;
    const a = answers[q.id];
    if (a === q.answer) {
      correct++;
      domainStats[q.domain].c++;
    }
  }
  const total = questions.length;
  const pct = total === 0 ? 0 : Math.round(100 * correct / total);
  return { correct, total, pct, domainStats };
}

/**
 * Human-readable label for a CPACC domain number.
 * @param {1|2|3} d
 * @returns {string}
 */
export function domainLabel(d) {
  return d === 1 ? "Domain 1 · Disabilities & AT"
       : d === 2 ? "Domain 2 · Accessibility & UD"
       : "Domain 3 · Standards, Laws & Mgmt";
}
