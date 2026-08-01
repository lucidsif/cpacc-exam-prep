// src/router.js — pure hash-path <-> state mapping. No DOM, no history API.
//
// Two functions:
//   pathFor(state)                 — the hash path string for the current state
//   applyPath(path, state, ids)    — mutates state to match the path; returns
//                                    true if restorable, false if it isn't
//                                    (caller is expected to fall back to home)
//
// `ids` is `{ disabilityCategoryIds, legalCategoryIds }` (both optional
// Set<string> or arrays) — the known category/jurisdiction ids, used only
// to detect an unknown `#/disabilities/<id>` or `#/legal/<id>`. Passed
// separately rather than baked into state, since state doesn't own the
// static reference data (main.js does). Omit it and any non-empty id is
// accepted (useful for tests that don't care about that check).
//
// Deliberately NOT in the path: flashcard index (a study action on a
// freshly-shuffled deck, not navigation), flipped state, chat open/closed,
// answer selections. Question index IS in the path — stepping between
// questions in an in-memory test is a real navigation axis.
//
// Some paths can never be reconstructed from a URL alone: the question set
// is sampled at runtime and results/mid-test state lives only in memory.
// applyPath returns false for those so the caller can replaceState back to
// a URL that matches what's actually on screen.

/** Build the hash path for the current state. */
export function pathFor(state) {
  switch (state.view) {
    case 'test':         return `#/test/${state.index + 1}`;
    case 'results':      return `#/results`;
    case 'flashcards':   return `#/flashcards`;
    case 'disabilities': return state.disabilities.category
      ? `#/disabilities/${state.disabilities.category}`
      : `#/disabilities`;
    case 'legal':         return state.legal.category
      ? `#/legal/${state.legal.category}`
      : `#/legal`;
    case 'home':
    default:              return `#/`;
  }
}

/**
 * Mutate `state` to match `path`. Returns true if the path was restorable,
 * false if it wasn't (caller should fall back to home).
 * @param {string} path
 * @param {object} state
 * @param {{disabilityCategoryIds?: Iterable<string>, legalCategoryIds?: Iterable<string>}} [ids]
 * @returns {boolean}
 */
export function applyPath(path, state, ids = {}) {
  const p = (path || '').replace(/^#/, '');
  const parts = p.split('/').filter(Boolean); // e.g. ['test', '3']

  if (parts.length === 0) {
    state.view = 'home';
    return true;
  }

  const [head, arg] = parts;

  if (head === 'test') {
    // Question set only exists in memory for the current session; a fresh
    // load (or a stale history entry after reload) has no sample to show.
    if (state.questions.length === 0) return false;
    const n = parseInt(arg, 10);
    if (!Number.isInteger(n) || n < 1) return false;
    const clamped = Math.max(0, Math.min(state.questions.length - 1, n - 1));
    state.index = clamped;
    state.view = 'test';
    return true;
  }

  if (head === 'results') {
    // `submitted` alone isn't the real invariant: "Back to start" clears
    // state.questions but (before this fix) left `submitted` true, so a
    // history entry could restore #/results with nothing to score or list.
    // renderResults depends on a non-empty question set, so require both.
    if (!state.submitted || state.questions.length === 0) return false;
    state.view = 'results';
    return true;
  }

  if (head === 'flashcards') {
    if (!state.flashcards) return false;
    state.view = 'flashcards';
    return true;
  }

  if (head === 'disabilities') {
    if (!arg) {
      state.disabilities = { view: 'categories' };
      state.view = 'disabilities';
      return true;
    }
    const known = !ids.disabilityCategoryIds || [...ids.disabilityCategoryIds].includes(arg);
    if (!known) {
      state.disabilities = { view: 'categories' };
      state.view = 'disabilities';
      return false;
    }
    state.disabilities = { view: 'list', category: arg };
    state.view = 'disabilities';
    return true;
  }

  if (head === 'legal') {
    if (!arg) {
      state.legal = { view: 'categories' };
      state.view = 'legal';
      return true;
    }
    const known = !ids.legalCategoryIds || [...ids.legalCategoryIds].includes(arg);
    if (!known) {
      state.legal = { view: 'categories' };
      state.view = 'legal';
      return false;
    }
    state.legal = { view: 'list', category: arg };
    state.view = 'legal';
    return true;
  }

  state.view = 'home';
  return false;
}
