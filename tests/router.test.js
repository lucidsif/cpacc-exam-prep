// tests/router.test.js — unit tests for src/router.js
//
// Verifies:
//   - every route round-trips: pathFor(applyPath(path)) === path
//   - unrestorable paths (#/test/n, #/results with nothing in memory) return false
//   - unknown category/jurisdiction ids fall back to the grid
//   - out-of-range question numbers clamp instead of failing outright
//   - malformed/empty hashes resolve to home

import { pathFor, applyPath } from '../src/router.js';
import { createState } from '../src/state.js';

const routeIds = {
  disabilityCategoryIds: ['visual', 'auditory'],
  legalCategoryIds: ['us', 'eu'],
};

export function run({ test, assertTrue, assertEq }) {
  test('home round-trips', () => {
    const state = createState();
    const ok = applyPath('#/', state);
    assertTrue(ok, 'home should be restorable');
    assertEq(state.view, 'home');
    assertEq(pathFor(state), '#/');
  });

  test('empty hash resolves to home', () => {
    const state = createState();
    const ok = applyPath('', state);
    assertTrue(ok);
    assertEq(state.view, 'home');
  });

  test('malformed hash resolves to home (not restorable)', () => {
    const state = createState();
    const ok = applyPath('#/nonsense/garbage', state);
    assertEq(ok, false);
    assertEq(state.view, 'home');
  });

  test('#/test/<n> round-trips when a question set is in memory', () => {
    const state = createState();
    state.questions = [{ id: 1 }, { id: 2 }, { id: 3 }];
    const ok = applyPath('#/test/2', state);
    assertTrue(ok, 'should restore with a sampled set present');
    assertEq(state.view, 'test');
    assertEq(state.index, 1, '1-based path -> 0-based index');
    assertEq(pathFor(state), '#/test/2');
  });

  test('#/test/<n> is unrestorable on a cold load (no questions in memory)', () => {
    const state = createState();
    const ok = applyPath('#/test/3', state);
    assertEq(ok, false, 'no sampled set exists yet — cannot honor this path');
    assertEq(state.view, 'home', 'falls back to home');
  });

  test('#/test/<n> out of range clamps to the last question', () => {
    const state = createState();
    state.questions = [{ id: 1 }, { id: 2 }];
    const ok = applyPath('#/test/99', state);
    assertTrue(ok);
    assertEq(state.index, 1, 'clamped to last valid index');
  });

  test('#/test/<n> with n < 1 is unrestorable', () => {
    const state = createState();
    state.questions = [{ id: 1 }];
    const ok = applyPath('#/test/0', state);
    assertEq(ok, false);
  });

  test('#/test/<n> with a non-numeric n is unrestorable', () => {
    const state = createState();
    state.questions = [{ id: 1 }];
    const ok = applyPath('#/test/abc', state);
    assertEq(ok, false);
  });

  test('#/results round-trips when the test was submitted', () => {
    const state = createState();
    state.questions = [{ id: 1 }];
    state.submitted = true;
    const ok = applyPath('#/results', state);
    assertTrue(ok);
    assertEq(state.view, 'results');
    assertEq(pathFor(state), '#/results');
  });

  test('#/results is unrestorable on a cold load (nothing submitted)', () => {
    const state = createState();
    const ok = applyPath('#/results', state);
    assertEq(ok, false);
    assertEq(state.view, 'home');
  });

  test('#/flashcards round-trips when a deck is active', () => {
    const state = createState();
    state.flashcards = { cards: [{ id: 1 }], index: 0, flipped: false };
    const ok = applyPath('#/flashcards', state);
    assertTrue(ok);
    assertEq(state.view, 'flashcards');
    assertEq(pathFor(state), '#/flashcards');
  });

  test('#/flashcards is unrestorable when no deck is active', () => {
    const state = createState();
    const ok = applyPath('#/flashcards', state);
    assertEq(ok, false);
    assertEq(state.view, 'home');
  });

  test('#/disabilities (grid) round-trips', () => {
    const state = createState();
    const ok = applyPath('#/disabilities', state);
    assertTrue(ok);
    assertEq(state.view, 'disabilities');
    assertEq(state.disabilities.view, 'categories');
    assertEq(pathFor(state), '#/disabilities');
  });

  test('#/disabilities/<known id> round-trips', () => {
    const state = createState();
    const ok = applyPath('#/disabilities/visual', state, routeIds);
    assertTrue(ok);
    assertEq(state.disabilities.view, 'list');
    assertEq(state.disabilities.category, 'visual');
    assertEq(pathFor(state), '#/disabilities/visual');
  });

  test('#/disabilities/<unknown id> falls back to the category grid', () => {
    const state = createState();
    const ok = applyPath('#/disabilities/not-a-real-category', state, routeIds);
    assertEq(ok, false);
    assertEq(state.view, 'disabilities');
    assertEq(state.disabilities.view, 'categories');
  });

  test('#/disabilities/<id> is accepted without the ids param (permissive default)', () => {
    const state = createState();
    const ok = applyPath('#/disabilities/anything', state);
    assertTrue(ok, 'without a known-ids list, any non-empty id is accepted');
    assertEq(state.disabilities.category, 'anything');
  });

  test('#/legal (grid) round-trips', () => {
    const state = createState();
    const ok = applyPath('#/legal', state);
    assertTrue(ok);
    assertEq(state.view, 'legal');
    assertEq(pathFor(state), '#/legal');
  });

  test('#/legal/<known id> round-trips', () => {
    const state = createState();
    const ok = applyPath('#/legal/us', state, routeIds);
    assertTrue(ok);
    assertEq(state.legal.category, 'us');
    assertEq(pathFor(state), '#/legal/us');
  });

  test('#/legal/<unknown id> falls back to the jurisdiction grid', () => {
    const state = createState();
    const ok = applyPath('#/legal/nowhere', state, routeIds);
    assertEq(ok, false);
    assertEq(state.view, 'legal');
    assertEq(state.legal.view, 'categories');
  });

  // applyPath has no concept of "app-internal, not-a-route" fragments like
  // the skip link's href="#app" — it treats any hash it can't parse into a
  // known head segment as an unrestorable path and falls back to home, same
  // as `#/nonsense/garbage` above. That's correct in isolation (it's just
  // "unknown route -> home"), but it is NOT what keeps the skip link from
  // bouncing a mid-test user to home: that guard is the
  // `if (hash !== '' && !hash.startsWith('#/')) return;` early-return in
  // main.js's popstate listener, which never calls applyPath at all for a
  // hash like "#app" — see src/main.js around the "skip link" comment.
  // The real regression test for "activating the skip link must not
  // navigate" therefore belongs in views.test.js, driven through a full
  // app boot (it's exercising main.js's listener, not router.js). This
  // test instead documents applyPath's actual, narrower contract so a
  // future reader doesn't mistake router.js for owning that guard.
  test('applyPath treats "#app" as an unknown route (falls back to home) — filtering app-internal fragments is main.js\'s job, not the router\'s', () => {
    const state = createState();
    const ok = applyPath('#app', state);
    assertEq(ok, false, '#app is not a route applyPath recognizes');
    assertEq(state.view, 'home', 'router.js has no special case for "#app"; see main.js\'s popstate listener for the actual guard');
  });

  // Regression: "Back to start" clears state.questions but used to leave
  // `submitted` true, so a stale #/results history entry could restore
  // with `submitted === true` and an empty question set — rendering a
  // results page claiming a phantom 0/0 (0%) score for a test that no
  // longer existed. `submitted` alone is not the invariant; both must hold.
  test('#/results returns false when submitted but the question set is empty — guards the phantom 0/0 (0%) results page', () => {
    const state = createState();
    state.submitted = true;
    // state.questions is already [] from createState(); assert explicitly
    // so the fixture's intent survives future createState() changes.
    assertEq(state.questions.length, 0, 'fixture precondition: no questions in memory');
    const ok = applyPath('#/results', state);
    assertEq(ok, false, 'submitted=true with zero questions must not restore /results');
  });

  test('#/results still round-trips (happy path) when submitted AND a question set is present', () => {
    const state = createState();
    state.questions = [{ id: 1 }, { id: 2 }];
    state.submitted = true;
    const ok = applyPath('#/results', state);
    assertTrue(ok, 'submitted + non-empty questions should restore /results');
    assertEq(state.view, 'results');
    assertEq(pathFor(state), '#/results');
  });

  // #/accessibility — a static accessibility statement page with no
  // in-memory dependency (unlike #/test/<n> or #/results, both of which
  // require a sampled question set / submitted run to already exist).
  test('#/accessibility round-trips', () => {
    const state = createState();
    const ok = applyPath('#/accessibility', state);
    assertTrue(ok, '#/accessibility should be restorable');
    assertEq(state.view, 'accessibility');
    assertEq(pathFor(state), '#/accessibility');
  });

  // This is the property that makes the statement deep-linkable and
  // shareable: unlike #/test/<n> and #/results (see the "unrestorable on a
  // cold load" tests above, both of which require state populated by a
  // live session), #/accessibility must restore on a completely fresh
  // state with nothing sampled and nothing submitted — e.g. someone opens
  // the URL directly, or a search engine/screen reader user follows a
  // bookmarked link straight to it.
  test('#/accessibility is restorable on a COLD load — nothing in memory, unlike #/results or #/test/n', () => {
    const state = createState();
    assertEq(state.questions.length, 0, 'fixture precondition: no questions in memory');
    assertEq(state.submitted, false, 'fixture precondition: nothing submitted');
    const ok = applyPath('#/accessibility', state);
    assertTrue(ok, '#/accessibility must restore even with no in-memory session state — that is what makes it deep-linkable/shareable, unlike #/test/n or #/results');
    assertEq(state.view, 'accessibility');
  });

  // #/accessibility takes no argument, so a trailing segment is unknown —
  // same treatment as an unrecognised #/disabilities/<id> or #/legal/<id>.
  // Both halves matter here: returning false alone isn't enough proof, since
  // a caller (main.js's popstate handler) uses the false return to decide
  // to replaceState the junk hash away, but reads state.view (via titleFor)
  // to know what it's replacing the URL WITH. If state.view were left
  // whatever it was before this call instead of falling back to
  // 'accessibility', the caller would replaceState to a URL for one view
  // while rendering a different one.
  test('#/accessibility/<trailing segment> is unrestorable but still falls back to state.view = "accessibility" (matches how disabilities/legal treat an unknown category id)', () => {
    const state = createState();
    const ok = applyPath('#/accessibility/foo', state);
    assertEq(ok, false, '#/accessibility takes no argument — a trailing segment must not be restorable');
    assertEq(state.view, 'accessibility', 'state.view must still fall back to accessibility, not be left at whatever it was before this call');
  });
}
