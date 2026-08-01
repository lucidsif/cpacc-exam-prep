# `tests/` — test suite

Run all tests:

```bash
npm test            # or: node tests/run.js
```

The runner discovers every `*.test.js` file in this directory and calls its exported `run({ test, assertTrue, assertEq })`. The legacy data smoke tests live inline at the top of `run.js`.

Current count: **157/157 passing.**

## What this suite deliberately does not cover

This is a jsdom suite — there's no real browser, no layout engine, no cascade resolution, and no assistive technology in the loop. It cannot and does not verify:

- **Computed styles or contrast ratios.** `styles/app.css` gets exactly one honest check (see the CSS section below): a text-presence guard against deleting the `prefers-reduced-motion` block. Nothing here parses or evaluates CSS as CSS.
- **Actual screen reader announcement.** Tests assert the *markup contract* that should produce a correct announcement (`role`, `aria-live`, `aria-label`, accessible-name sourcing, live-region timing) — not what NVDA/JAWS/VoiceOver actually say.
- **Real focus-ring visibility.** `:focus:not(:focus-visible)` / `:focus-visible` in `app.css` are style rules with no jsdom-testable effect; nothing here confirms a focus ring is actually visible or meets the 3:1 non-text contrast requirement.

Those four things need a real browser and, for the screen-reader case, real assistive technology — see the accessibility checklist and manual test guidance linked from the project's top-level `README.md`/`CONTRIBUTING.md` instead. Three of the four (computed styles/contrast, focus-ring visibility, and — partially — screen-reader-relevant markup via a real accessibility tree) are now covered by the end-to-end suite described below; screen-reader announcement itself still is not, and needs a human with AT, not a script.

## End-to-end tests (e2e/)

```bash
npm run test:e2e            # Playwright — real Chromium, Firefox, and WebKit
```

130 tests across 5 projects — chromium, firefox, webkit, a 320px mobile viewport, and a chat-enabled project — currently 130/130 passing.

The division of labour is the useful thing to remember: **jsdom (`tests/`, above) is for markup and wiring — is the right element there, does it have the right attribute, does the right function get called. Playwright (`e2e/`) is for everything jsdom cannot simulate: layout, paint, computed styles, focus rings, scroll position, real Tab-key order, and a real platform accessibility tree.** Neither one substitutes for the other, and neither one is a screen reader — the current version of this app has not been manually tested with NVDA, JAWS, or VoiceOver; see `ACCESSIBILITY.md`.

| File | Covers |
|---|---|
| `e2e/smoke.spec.js` | Baseline: the app boots and the home route renders |
| `e2e/navigation.spec.js` | Skip link vs. a real `popstate`; click-driven focus landing on `<h1>`; Back/Forward restoring heading, title, and scroll position; a control that disables itself on click not stranding focus on `<body>`; real sequential Tab order from page load — including WebKit's platform-default Tab scope (form fields only, confirmed against `Option+Tab`'s wider set) and WebKit not moving DOM focus onto a clicked `<button>` |
| `e2e/focus-contract.spec.js` | Whether the focus ring actually paints on *programmatic* focus (the app moving focus to a route's `<h1>` by script, not by Tab) in each engine — the one open question in the accessibility statement that only a real browser's `:focus-visible` implementation could answer. Confirms `solid 3px rgb(255, 212, 121)` in Chromium, Firefox, and WebKit alike once the session has seen a real keypress, plus a documented control case showing no ring with zero prior keyboard interaction |
| `e2e/motion-and-live-region.spec.js` | `prefers-reduced-motion` and live-region behaviour against real computed style and real timing, not jsdom's simulated versions of either |
| `e2e/axe.spec.js` | Automated `axe-core` scans against a real accessibility tree, across nine routes and every browser project — both the WCAG-tagged ruleset (`wcag2a`/`wcag2aa`/`wcag22aa`) and axe's `best-practice` ruleset, which is what actually covers heading order and landmarks. With `e2e/axe-chat.spec.js`'s two chat-surface scans, 74 scans total, zero violations. Automated scanning catches a minority of accessibility issues by nature; treat zero violations as "nothing an automated scanner flagged," not as "manually verified" |

`playwright.config.js` runs every spec against three browser projects (chromium, firefox, webkit) — see its own comments for why dropping a browser to make a run green is treated as a bug report, not a config change.

## Layers

| File | Layer | Covers |
|---|---|---|
| `run.js` (inline) | Data smoke | Every dataset is well-formed; IDs unique within and across banks; every dataset exports a `*_PROVENANCE` constant in the IBM FactSheet shape |
| `router.test.js` | Unit | `src/router.js`'s `pathFor`/`applyPath`: every route round-trips; `#/test/<n>` and `#/results` are unrestorable without in-memory state (including the "submitted but zero questions" phantom-results case); out-of-range question numbers clamp; unknown category/jurisdiction ids fall back to the grid; malformed/empty hashes resolve to home; `applyPath`'s narrower contract for app-internal, non-route hashes like `#app` (falls back to home — the "don't navigate away" guard for those lives in `main.js`'s popstate listener, not the router); `#/accessibility` round-trips and, unlike `#/test/n`/`#/results`, is restorable on a cold load with nothing in memory; `#/accessibility/<trailing segment>` returns `false` (unrestorable) while still leaving `state.view` set to `'accessibility'`, matching how an unknown disabilities/legal category id falls back to that section's grid |
| `sampling.test.js` | Unit | `shuffle` is non-mutating + deterministic with injected RNG; `sampleQuestions` returns 20 items in the 8/8/4 domain mix; tops up from the rest of the bank when a domain is short; `sampleMissedQuestions` only returns items in the missed set |
| `scoring.test.js` | Unit | `scoreTest` handles perfect / zero / partial scores; per-domain breakdown math; `domainLabel` strings |
| `storage.test.js` | Unit | Missed-set store with mocked `fetch` and in-memory `localStorage` polyfill — server success, server failure → local fallback, PUT persistence, offline behavior, clear, and the Cloudflare "no server" path that skips network writes |
| `llm.test.js` | Unit | `functions/_lib/llm.js`: provider auto-detection, `LLM_*` env vars with `ANTHROPIC_*` / `OPENAI_*` fallbacks, per-provider defaults, the per-provider token budgets (`local` larger than cloud) and the `LLM_MAX_TOKENS` override, missing-credential errors, the two wire formats (`/v1/messages` vs `/chat/completions`), reply extraction, and `<think>` scratchpad stripping |
| `views.test.js` | DOM smoke (jsdom) | Every view's accessibility contracts, plus full-app-boot (`index.html` + `src/main.js`) coverage of routing, focus management, and the live region |

## DOM smoke tests in detail

`views.test.js` has two kinds of test:

**Single-view mounts** (`makeDom()` + a fake `state`/`actions`/`missed` fixture) render one view module's HTML into jsdom and assert the accessibility invariants that we don't want to regress:

- The `index.html` shell has a skip link and a focusable `<main>`. The home button's accessible name comes from its own visible text ("⌂ Home") — it deliberately carries **no** `aria-label` (one used to duplicate the visible text for no benefit and risked drifting out of sync with it), and the decorative `⌂` glyph is pulled out of the name via `aria-hidden`.
- The skip link and home button live inside `<header>`/`<nav aria-label="Site">`, and `#route-status`/`#route-alert` are siblings of `#app` — not descendants of `<header>` or `<main>` — which is load-bearing: every view render does `app.innerHTML = ...`, and these regions can only survive that by living outside the element being rewritten.
- Every view has exactly one visible (non-sr-only) h1, and the heading outline never skips a level — checked for home/question/results and, since these are exactly the routes that shipped with none, the disabilities and legal **detail** (`{view:'list'}`) pages too.
- Chat messages (`renderChatFragment` in `src/views/chat.js`, and the home-chat panel in `src/views/home.js`) carry a `<b class="msg-role">` speaker label ("You:"/"Tutor:"/"Error:") — the non-color cue for WCAG 1.4.1, since `.msg.user` vs `.msg.assistant` used to differ by only 1.02:1 in luminance. Message content stays `escapeHtml`-escaped; the label itself is not user content and isn't escaped.
- The jump-grid's per-question cell (`renderJumpGrid` in `src/views/question.js`) renders an `aria-hidden` glyph (`✓` answered / `·` unanswered) as the WCAG 1.4.1 non-color cue for the answered/unanswered class distinction — and the glyph does **not** leak into the cell's `aria-label`, which stays exactly `Question N, answered`/`Question N, unanswered`.
- The jump-grid's *current*-question cell carries `aria-current="true"` — exactly one cell at a time, matching `state.index`, and it moves when the index changes. This attribute is load-bearing beyond ARIA: `styles/app.css`'s `.cell[aria-current]` rule is the cell's *only* visual indicator (a WCAG 1.4.1 fix), so losing the attribute silently drops both the AT state and the visual ring at once. Verified by reverting the fix in `src/views/question.js` (removing the `aria-current="true"` ternary) — only this test failed.
- A dedicated regression-guard test for both 1.4.1 fixes above asserts the non-color cue by reading rendered *text content* alone, deliberately never inspecting class names — the original defect was that classes differed while nothing perceivable did, so a test that only checks for a class would pass on a reversion that kept the class but dropped the visible/textual cue.
- The question view's `#choices` is a native `<fieldset>` with a visually-hidden `<legend>` naming the question (implicit `role=group`, not an ARIA `radiogroup` relying on a forgettable `aria-label`); `aria-describedby` resolves to `#kbd-hint`; there are exactly 4 radios. `#verdict` is `tabindex="-1"` but deliberately carries **no** `aria-live` — it's populated in the same `innerHTML` write that creates it, so a live region there would never announce; the verdict is instead spoken through the persistent `#route-status` region via `actions.announce()`.
- Submit-answer is disabled with `aria-describedby` pointing to an sr-only explanation when no choice is selected.
- Submit-all only renders on the last question or after all questions are revealed.
- Once an answer is revealed, `#choices` (the `<fieldset>`) carries native `disabled` — genuinely inert, not just visually so — and the picked/correct state is restored as `.sr-only` text ("Your answer.", "Correct answer.", or "Your answer. Correct.") anyway, since native `disabled` removes the control's *focusability* (not its role/name/checked state, which stay in the accessibility tree per HTML-AAM) and Tab/NVDA focus mode/JAWS forms mode can no longer reach it to pick that signal up by focusing the control.
- The results page has a score readout and per-question review markup.
- The flashcard `#card` is a plain container, not a `<button>` — no `aria-label`/`aria-pressed` (either would swallow the card's own text content) — with an `.sr-only` "Front of card"/"Back of card" indicator and `#flip-card` as the real keyboard control.
- Decorative emoji in the home view all carry `aria-hidden="true"`.
- The provenance badge renders a `<details>` with a `<summary>` whose accessible name comes from its own content (visible label + confidence word + a trailing `.sr-only` disambiguator) rather than an overriding `aria-label`, a dual-encoded confidence pill (color + glyph + text), and a semantic `<dl>` card.
- The chat provenance banner exposes a `data-open-ai-info` trigger.
- The AI-info `<dialog>` is `aria-labelledby` pointing to an existing heading, and has a close button.
- The home and disabilities pages both show a "Goes beyond CPACC scope" scope note.
- `renderAccessibility` (`src/views/accessibility.js`, the `#/accessibility` statement page) has exactly one visible (non-sr-only) h1 and no skipped heading levels — this branch's governing rule, set by the disabilities/legal detail-page fixes above, pinned here too.
- `renderAccessibility`'s Feedback section contains a working `mailto:` link to the real contact address, not the "not yet published" placeholder copy — guards against the `FEEDBACK_CONTACT` constant being reset to `null` and the page silently shipping unreportable.
- `renderHome` links to `#/accessibility` with descriptive text (not "click here"/"read more") — a statement nobody can find is not a feedback mechanism.
- Both chat transcript containers — `#home-log` (`src/views/home.js`) and `#log-<id>` (`renderChatFragment` in `src/views/chat.js`) — carry `role="log"` **and** an explicit `aria-live="off"` together. This pairing looks self-contradictory (`role="log"` implies `aria-live="polite"`) but is deliberate: both transcripts are rebuilt wholesale via `innerHTML` on every render, and replies are announced through `#route-status`/`#route-alert` instead, so `aria-live="off"` is what makes those two regions the deterministic announcement paths rather than leaving double-announcement to chance. (The test's own description string still frames this as "the single deterministic announcement path," written before `#route-alert` existed — see `src/main.js`/`ARCHITECTURE.md` for the current two-region shape; not mine to edit, flagging for whoever owns `tests/views.test.js`.) The test message spells this out so a future reader who deletes the attribute to "fix" the apparent contradiction sees the reasoning in the failure output, not just a red test.

**Full-app boots** (`bootApp()` — real `index.html` + a fresh, cache-busted import of `src/main.js` per test) exercise the router/focus/live-region wiring that no single view owns:

- Clicking through routes (`#start`, `#next`, browser Back) moves focus to the new route's `<h1>` inside `#app`, never leaving it on `<body>` or on bare `#app`.
- Activating the skip link does not change the route (regression: it used to fire a popstate for the non-route `#app` fragment and bounce a mid-test user to home); a direct `popstate` dispatch for `#app` is also asserted not to reset the app to home, independently of whether jsdom fires one on its own the way a real browser would.
- A control that disables itself as a side effect of its own click doesn't drop focus to `<body>`: flashcards' `#prev-card` hands focus to `#next-card`; the question view's `#prev` lands on the route `<h1>` instead, because — unlike the flashcard index — the question index is part of the route, so that navigation always re-targets the `<h1>`.
- `document.title` differs between a reference section's grid (`#/disabilities`) and one of its detail pages (`#/disabilities/<id>`).
- `#route-status` exists as a sibling of `#app` (so it survives `innerHTML` rewrites), is `role="status"`/`aria-live="polite"`, and eventually receives text from `actions.announce()` (which debounces through a 100ms timer per region). That existing test only drives `actions.announce()` through the answer-submit path, though — see the chat-specific tests below.
- Activating the home page's real "Accessibility statement" `<a href="#/accessibility">` link (a genuine click, not a synthesized hash set) actually renders the statement end to end: the `<h1>` reads "Accessibility statement" (not home's), `document.title` is the statement's unique title, and focus lands on that `<h1>`, per this branch's focus contract. This is the one test that proves `src/main.js`'s `render()` dispatcher and `titleFor()` both wire up the `'accessibility'` case — the single-view `renderAccessibility` mount above and `router.test.js`'s `applyPath` tests each prove only one half of that wiring; neither drives a real navigation through `main.js`, so both dispatcher and title cases could be deleted from `main.js` and the suite stayed green without this test (confirmed in a scratch copy).

**Tripwire coverage** (added after an adversarial final-gate review found three fixes on this branch the suite would stay 113/113 green without — the same failure mode that let the original ~20-path focus regression ship). Each of these was verified by temporarily breaking the guarded code in `src/main.js`/`src/views/question.js`, confirming *only* the matching test failed, then restoring the file exactly (no source edit was committed):

- **Chat replies are announced (WCAG 4.1.3).** `sendHomeChat`/`sendChat` in `src/main.js` call `actions.announce()` on both success and failure — the *only* way a chat reply reaches a screen reader, since the transcript (`role="log"`) is created pre-populated inside an `innerHTML` write and never fires `aria-live`. Three fetch-stubbed, full-app-boot tests drive this directly (not through the answer-submit path the older `#route-status` test uses): a successful `sendHomeChat` reply reaches `#route-status` (`aria-live="polite"`); a failed `sendHomeChat` reply reaches the separate `#route-alert` region instead (`role="alert"`, `aria-live="assertive"`), and asserts `#route-status`'s politeness and content are untouched by that failure (previously zero coverage on the assertive path); and `sendChat` (the per-question chat reachable from the results page) also announces a successful reply through `#route-status`. Verified by commenting out all four `announce()` calls in `src/main.js` — exactly these three tests failed, nothing else.
- **Focus restoration by `id`, by `data-*`, and caret position.** `captureFocus`/`restoreFocus` in `src/main.js` re-find the focused control after an in-place re-render, by `id` first and then by one of `RESTORABLE_DATA_ATTRS`, and replay `selectionStart`/`selectionEnd` for text inputs. Two fetch-stubbed, full-app-boot tests drive genuine in-place re-renders via the app's own delayed startup probes (`/missed`, `/chat-status` — held pending with a controllable gate, then resolved mid-test) rather than synthesizing the call: one confirms `#home-input` (found by `id`) keeps focus and that `restoreFocus` replays the captured caret offsets via a `setSelectionRange` prototype spy (`#home-input`'s value isn't part of app state, so the re-rendered input is always empty — the spy asserts the *call*, since the value can't visibly carry a caret position either way); the other confirms a results-page jump-grid cell (found by `data-jump`, just added to `RESTORABLE_DATA_ATTRS` and previously uncovered) keeps focus too. Verified three ways: deleting the `setSelectionRange` call only failed the caret test; removing `'data-jump'` from `RESTORABLE_DATA_ATTRS` only failed the jump-grid test; both left the other's sibling tests (and everything else) green.
- **`nearestFocusableSibling` widening to a whole-cluster disable.** The existing flashcards Prev→Next test only exercises the immediate-parent step of the widened parent → `.panel` → `#app` search. A new test disables home's `#practice-missed` and `#clear-missed` together (both go `disabled` the instant the missed list empties, leaving nothing in their shared `.row` or `.panel`) and asserts focus lands somewhere in `#app`, not `<body>`. Verified by reverting `nearestFocusableSibling` to its old single-parent search and dropping the `moveFocusToRoute()` last-resort fallback — only this test failed; the flashcards test (which only needs the parent step) still passed.

**Empty missed-pool regression coverage** (`fix/a11y-router-focus-contract`): finishing a missed-practice run with everything correct empties the missed set; the results page used to render an enabled "Practice 0 missed again" button whose click called `startTest('missed')`, which sampled zero questions, entered the test view anyway, and crashed `renderQuestion` on `state.questions[state.index]` being `undefined`. Two independent guards were added, each covered by its own test so a revert of either one is caught in isolation (verified by running the suite against the pre-fix `src/views/results.js` and `src/main.js` in a scratch copy — no source edit was committed):

- `renderResults`'s `#retake` carries the *real* `disabled` attribute (not `aria-disabled`, which was deliberately removed elsewhere in this codebase and is pinned not to reappear here) plus `aria-describedby` resolving to an existing `.sr-only` explanation, and a relabeled button text, when `mode: 'missed'` and the missed set is empty. `#back` stays enabled alongside it so the page isn't a dead end.
- A sibling test with a non-empty missed set asserts `#retake` stays enabled with no `aria-describedby`/`retake-help` wiring at all — this is what catches an over-broad fix that disables retake in missed mode unconditionally, independent of the actual count.
- `startTest('missed')` in `src/main.js` refuses to touch `state` when the sampled pool comes back empty: a full-app-boot test with `/missed` stubbed to return no ids confirms the hash stays `#/`, no `#choices` fieldset mounts, home keeps showing, and `#route-status` receives the explanatory announcement. Both real UI entry points to this action (`#practice-missed` on home, `#retake` on results) are themselves disabled at zero missed, so a literal `.click()` never reaches the handler (confirmed: jsdom, like real browsers, does not dispatch `click` through `.click()` on a disabled element) — the test calls `#practice-missed`'s `onclick` handler directly instead, reaching `actions.startTest('missed')` the same way an unguarded button would, to isolate this guard from the UI-level `disabled` attribute covered above.

**`styles/app.css`** gets one test, and it is scoped narrowly on purpose: a text-presence check that the file still contains a `prefers-reduced-motion` block, as a cheap guard against it being deleted outright. It is not a stand-in for verifying `:focus:not(:focus-visible)`, `.cell[aria-current]`, `.cite .linkish`, `::placeholder`, or `.msg-role` as CSS — those either have no jsdom-testable effect or are already covered from the markup side (e.g. `.msg-role` and `.cell[aria-current]`-adjacent markup are asserted in the DOM tests above).

## Writing a new test

1. Create `tests/your-feature.test.js`
2. Export `run({ test, assertTrue, assertEq })` — `async` if you need `await`
3. Inside `run`, call `await test('name', async () => { … })` for each case
4. Use `assertEq(actual, expected, message?)` and `assertTrue(condition, message?)`
5. Run `npm test` — the runner picks up new files automatically

Test files share three globals from the runner: `test`, `assertEq`, `assertTrue`. They are passed as the argument to `run`, not as globals — destructure them in the parameter list.

If your test needs jsdom, see `views.test.js` for the pattern.
