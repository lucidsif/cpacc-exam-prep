# `tests/` — test suite

Run all tests:

```bash
npm test            # or: node tests/run.js
```

The runner discovers every `*.test.js` file in this directory and calls its exported `run({ test, assertTrue, assertEq })`. The legacy data smoke tests live inline at the top of `run.js`.

Current count: **113/113 passing.**

## What this suite deliberately does not cover

This is a jsdom suite — there's no real browser, no layout engine, no cascade resolution, and no assistive technology in the loop. It cannot and does not verify:

- **Computed styles or contrast ratios.** `styles/app.css` gets exactly one honest check (see the CSS section below): a text-presence guard against deleting the `prefers-reduced-motion` block. Nothing here parses or evaluates CSS as CSS.
- **Actual screen reader announcement.** Tests assert the *markup contract* that should produce a correct announcement (`role`, `aria-live`, `aria-label`, accessible-name sourcing, live-region timing) — not what NVDA/JAWS/VoiceOver actually say.
- **Real focus-ring visibility.** `:focus:not(:focus-visible)` / `:focus-visible` in `app.css` are style rules with no jsdom-testable effect; nothing here confirms a focus ring is actually visible or meets the 3:1 non-text contrast requirement.

Those four things need a real browser and, for the screen-reader case, real assistive technology — see the accessibility checklist and manual test guidance linked from the project's top-level `README.md`/`CONTRIBUTING.md` instead.

## Layers

| File | Layer | Covers |
|---|---|---|
| `run.js` (inline) | Data smoke | Every dataset is well-formed; IDs unique within and across banks; every dataset exports a `*_PROVENANCE` constant in the IBM FactSheet shape |
| `router.test.js` | Unit | `src/router.js`'s `pathFor`/`applyPath`: every route round-trips; `#/test/<n>` and `#/results` are unrestorable without in-memory state (including the "submitted but zero questions" phantom-results case); out-of-range question numbers clamp; unknown category/jurisdiction ids fall back to the grid; malformed/empty hashes resolve to home; `applyPath`'s narrower contract for app-internal, non-route hashes like `#app` (falls back to home — the "don't navigate away" guard for those lives in `main.js`'s popstate listener, not the router) |
| `sampling.test.js` | Unit | `shuffle` is non-mutating + deterministic with injected RNG; `sampleQuestions` returns 20 items in the 8/8/4 domain mix; tops up from the rest of the bank when a domain is short; `sampleMissedQuestions` only returns items in the missed set |
| `scoring.test.js` | Unit | `scoreTest` handles perfect / zero / partial scores; per-domain breakdown math; `domainLabel` strings |
| `storage.test.js` | Unit | Missed-set store with mocked `fetch` and in-memory `localStorage` polyfill — server success, server failure → local fallback, PUT persistence, offline behavior, clear, and the Cloudflare "no server" path that skips network writes |
| `llm.test.js` | Unit | `functions/_lib/llm.js`: provider auto-detection, `LLM_*` env vars with `ANTHROPIC_*` / `OPENAI_*` fallbacks, per-provider defaults, the per-provider token budgets (`local` larger than cloud) and the `LLM_MAX_TOKENS` override, missing-credential errors, the two wire formats (`/v1/messages` vs `/chat/completions`), reply extraction, and `<think>` scratchpad stripping |
| `views.test.js` | DOM smoke (jsdom) | Every view's accessibility contracts, plus full-app-boot (`index.html` + `src/main.js`) coverage of routing, focus management, and the live region |

## DOM smoke tests in detail

`views.test.js` has two kinds of test:

**Single-view mounts** (`makeDom()` + a fake `state`/`actions`/`missed` fixture) render one view module's HTML into jsdom and assert the accessibility invariants that we don't want to regress:

- The `index.html` shell has a skip link and a focusable `<main>`. The home button's accessible name comes from its own visible text ("⌂ Home") — it deliberately carries **no** `aria-label` (one used to duplicate the visible text for no benefit and risked drifting out of sync with it), and the decorative `⌂` glyph is pulled out of the name via `aria-hidden`.
- The skip link and home button live inside `<header>`/`<nav aria-label="Site">`, and `#route-status` is a sibling of `#app` — not a descendant of `<header>` or `<main>` — which is load-bearing: every view render does `app.innerHTML = ...`, and `#route-status` can only survive that by living outside the element being rewritten.
- Every view has exactly one visible (non-sr-only) h1, and the heading outline never skips a level — checked for home/question/results and, since these are exactly the routes that shipped with none, the disabilities and legal **detail** (`{view:'list'}`) pages too.
- Chat messages (`renderChatFragment` in `src/views/chat.js`, and the home-chat panel in `src/views/home.js`) carry a `<b class="msg-role">` speaker label ("You:"/"Tutor:"/"Error:") — the non-color cue for WCAG 1.4.1, since `.msg.user` vs `.msg.assistant` used to differ by only 1.02:1 in luminance. Message content stays `escapeHtml`-escaped; the label itself is not user content and isn't escaped.
- The jump-grid's per-question cell (`renderJumpGrid` in `src/views/question.js`) renders an `aria-hidden` glyph (`✓` answered / `·` unanswered) as the WCAG 1.4.1 non-color cue for the answered/unanswered class distinction — and the glyph does **not** leak into the cell's `aria-label`, which stays exactly `Question N, answered`/`Question N, unanswered`.
- A dedicated regression-guard test for both 1.4.1 fixes above asserts the non-color cue by reading rendered *text content* alone, deliberately never inspecting class names — the original defect was that classes differed while nothing perceivable did, so a test that only checks for a class would pass on a reversion that kept the class but dropped the visible/textual cue.
- The question view's `#choices` is a native `<fieldset>` with a visually-hidden `<legend>` naming the question (implicit `role=group`, not an ARIA `radiogroup` relying on a forgettable `aria-label`); `aria-describedby` resolves to `#kbd-hint`; there are exactly 4 radios. `#verdict` is `tabindex="-1"` but deliberately carries **no** `aria-live` — it's populated in the same `innerHTML` write that creates it, so a live region there would never announce; the verdict is instead spoken through the persistent `#route-status` region via `actions.announce()`.
- Submit-answer is disabled with `aria-describedby` pointing to an sr-only explanation when no choice is selected.
- Submit-all only renders on the last question or after all questions are revealed.
- Once an answer is revealed, `#choices` (the `<fieldset>`) carries native `disabled` — genuinely inert, not just visually so — and the picked/correct state is restored as `.sr-only` text ("Your answer.", "Correct answer.", or "Your answer. Correct.") since native `disabled` removes that signal from the accessibility tree.
- The results page has a score readout and per-question review markup.
- The flashcard `#card` is a plain container, not a `<button>` — no `aria-label`/`aria-pressed` (either would swallow the card's own text content) — with an `.sr-only` "Front of card"/"Back of card" indicator and `#flip-card` as the real keyboard control.
- Decorative emoji in the home view all carry `aria-hidden="true"`.
- The provenance badge renders a `<details>` with a `<summary>` whose accessible name comes from its own content (visible label + confidence word + a trailing `.sr-only` disambiguator) rather than an overriding `aria-label`, a dual-encoded confidence pill (color + glyph + text), and a semantic `<dl>` card.
- The chat provenance banner exposes a `data-open-ai-info` trigger.
- The AI-info `<dialog>` is `aria-labelledby` pointing to an existing heading, and has a close button.
- The home and disabilities pages both show a "Goes beyond CPACC scope" scope note.

**Full-app boots** (`bootApp()` — real `index.html` + a fresh, cache-busted import of `src/main.js` per test) exercise the router/focus/live-region wiring that no single view owns:

- Clicking through routes (`#start`, `#next`, browser Back) moves focus to the new route's `<h1>` inside `#app`, never leaving it on `<body>` or on bare `#app`.
- Activating the skip link does not change the route (regression: it used to fire a popstate for the non-route `#app` fragment and bounce a mid-test user to home); a direct `popstate` dispatch for `#app` is also asserted not to reset the app to home, independently of whether jsdom fires one on its own the way a real browser would.
- A control that disables itself as a side effect of its own click doesn't drop focus to `<body>`: flashcards' `#prev-card` hands focus to `#next-card`; the question view's `#prev` lands on the route `<h1>` instead, because — unlike the flashcard index — the question index is part of the route, so that navigation always re-targets the `<h1>`.
- `document.title` differs between a reference section's grid (`#/disabilities`) and one of its detail pages (`#/disabilities/<id>`).
- `#route-status` exists as a sibling of `#app` (so it survives `innerHTML` rewrites), is `role="status"`/`aria-live="polite"`, and eventually receives text from `actions.announce()` (which debounces through a 75ms timer).

**`styles/app.css`** gets one test, and it is scoped narrowly on purpose: a text-presence check that the file still contains a `prefers-reduced-motion` block, as a cheap guard against it being deleted outright. It is not a stand-in for verifying `:focus:not(:focus-visible)`, `.cell[aria-current]`, `.cite .linkish`, `::placeholder`, or `.msg-role` as CSS — those either have no jsdom-testable effect or are already covered from the markup side (e.g. `.msg-role` and `.cell[aria-current]`-adjacent markup are asserted in the DOM tests above).

## Writing a new test

1. Create `tests/your-feature.test.js`
2. Export `run({ test, assertTrue, assertEq })` — `async` if you need `await`
3. Inside `run`, call `await test('name', async () => { … })` for each case
4. Use `assertEq(actual, expected, message?)` and `assertTrue(condition, message?)`
5. Run `npm test` — the runner picks up new files automatically

Test files share three globals from the runner: `test`, `assertEq`, `assertTrue`. They are passed as the argument to `run`, not as globals — destructure them in the parameter list.

If your test needs jsdom, see `views.test.js` for the pattern.
