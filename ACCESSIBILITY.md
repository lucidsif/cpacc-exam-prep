# Accessibility statement

This is the accessibility statement for the CPACC Practice Test project.

This file is the developer-facing engineering record: what was audited, how, and what's still open. The public, user-facing conformance statement is `src/views/accessibility.js` (route `#/accessibility`) — that page is what a visitor reads and is authoritative for them; this file is authoritative for contributors on process and history. If the two ever disagree, that's a bug in one of them, not a difference of audience.

## Conformance target

**WCAG 2.2 Level AA** across all user-facing views.

This is the project's target, backed by code review and the automated checks below — not an independent audit by an assistive-technology user. See "Known limitations" for exactly what that gap covers.

## Audit history

Every UI change in this repository was reviewed by an accessibility-lead agent before merging, including these areas:

- Skip link intercepts its own click (`preventDefault` + explicit focus move) instead of relying on the native `href="#app"` hash jump — that jump used to fire a `popstate` the hash router couldn't resolve to a route, which reset the whole app to home if you pressed "Skip to main content" mid-test
- Focus contract: real navigation (including Back/Forward) moves focus to the destination route's own visible `<h1>` (falling back to `<main>` for the few views without one); an in-place re-render — chat send, flashcard flip, a toggle — preserves focus and caret position instead of dropping it to `<body>`. See "Focus contract" below
- A persistent `#route-status` live region (a sibling of `<main>`, so it survives `innerHTML` rewrites) carries the submit verdict, chat replies/errors, and the "that page isn't available" popstate fallback message
- Heading hierarchy (one H1 per view, no skipped levels) — including the disabilities/legal detail routes, which previously rendered no heading at all
- Answer choices are native `<input type="radio">` elements inside a `<fieldset>`/`<legend>`; once revealed, the fieldset is natively `disabled`, so review state is genuinely non-interactive instead of the previous `aria-disabled`, which claimed to be disabled but wasn't. The per-choice "your answer" / "correct answer" state that native `disabled` removes from the accessibility tree is restored as visually-hidden text on the affected choice
- Flashcard content (tag, front/back text) is ordinary navigable text — it's no longer swallowed whole into a `<button>`'s accessible name via `aria-label`. The card is a plain container; the existing `#flip-card` button is the sole keyboard control, so this is not a WCAG 2.1.1 keyboard-access regression
- AI provenance `<summary>` takes its accessible name from its own visible content, not an overriding `aria-label` (WCAG 2.5.3 Label in Name) — a disambiguating item label is appended via `.sr-only` instead
- Decorative emoji wrapped in `aria-hidden="true"`
- AI provenance badges via native `<details>`/`<summary>` (no custom disclosure widget)
- Confidence pills use paired color + shape glyph + text (WCAG 1.4.1)
- Chat speaker identity, the question jump grid's answered state, the current-question cell, and the "About AI" trigger were all fixed for WCAG 1.4.1 Use of Colour after a full contrast audit — see "Colour and contrast" below
- `prefers-reduced-motion: reduce` honored for scroll behavior and, as of this pass, CSS transitions
- Color contrast: text ≥ 4.5:1, UI components ≥ 3:1 — see "Colour and contrast" below for the full audit result
- Touch target sizes ≥ 24×24 CSS px
- Page-level "About AI in this app" uses a native `<dialog>` with focus return on close, now handling both the button-click close path and native Escape dismissal
- Mobile-vs-desktop kbd hint adapts via `(pointer: coarse)` so iPhone VoiceOver users don't hear keyboard mechanics

The full accessibility audit and remediation history is captured in the git log under the `fix(a11y):` prefix.

## Focus contract

`render(opts)` in `src/main.js` computes a route key (`[view, question index, disabilities category, legal category]`) on every call and compares it to the key from the previous render. A changed key means a real navigation — focus moves to the destination's `<h1>`. An unchanged key means an in-place re-render — the control that was focused before the DOM was replaced is re-found and refocused, with caret position restored for text inputs, falling back to the nearest focusable sibling if that control became `disabled` by the same re-render (e.g. Prev at the first flashcard, or a radio inside a just-`disabled` fieldset). Views can also request an explicit target (`render({ focus: '#flip-card' })`) for cases the route key can't infer.

**The governing rule: the element that receives route focus must be visible.** An earlier attempt used a `.sr-only` `<h1>` on the disabilities/legal detail routes; it was rejected in review because sighted keyboard users landed on an invisible element with no visible indication of where focus went. `.sr-only` is for supplementary text, never a focus target.

## Colour and contrast

A full audit computed the contrast ratio of every text and non-text colour pair used in the app. **All WCAG 1.4.3 (text) and 1.4.11 (non-text) pairs pass**, with real headroom — the lowest text ratio measured is 6.04:1, and all 16 category accent colours pass as UI-component boundaries.

The audit's actual findings were four **1.4.1 Use of Colour** failures — information conveyed by hue alone, with no other channel — all now fixed:

- Chat speaker identity was hue-only, at a 1.02:1 luminance delta — now has visible "You:" / "Tutor:" / "Error:" labels
- The question jump grid's answered/unanswered state was a 1.04:1 delta — now has a `✓` / `·` glyph
- The current-question jump-grid cell had no visual indicator at all — now has a visible inset ring
- The "About AI in this app" trigger was visually indistinguishable from surrounding body text — now accent-coloured with an underline

## Test coverage

`tests/views.test.js` (jsdom) and `tests/router.test.js` assert the accessibility contracts of every view as machine-checkable invariants. Examples:

- index.html shell has the skip link, home button, focusable `<main>`, and a `#route-status` live region that's a sibling of `#app`
- every view has exactly one h1, including the disabilities/legal detail routes
- the question view's fieldset, verdict region, submit-answer states, and aria-describedby targets all resolve
- revealed choices sit inside a `disabled` fieldset, with per-choice "your answer" / "correct answer" state restored as visually-hidden text
- the provenance badge has the expected structure (visible-content-named summary, dual-encoded confidence pill, semantic `<dl>` card)
- the AI-info dialog is properly labelled
- decorative emoji are `aria-hidden`
- click- and popstate-driven navigation move focus to the route's `<h1>`, never `<body>` or a bare `#app`
- activating the skip link, and a raw `popstate` for a non-route hash, don't reset the app to home
- `#route-status` exists, is `role="status"`, and receives text from `announce()`

`npm test` must pass green for any PR to merge.

**This verifies the contracts above in jsdom only.** jsdom does not render, paint, or build a real accessibility tree, and it doesn't drive a screen reader. See "Known limitations" for what that leaves unconfirmed.

## Known limitations

- **Manual keyboard/focus testing in real (non-headless) Chromium has confirmed the fixes below, against the running app.** Specifically: the skip link, activated mid-test at `#/test/2`, leaves `location.hash` unchanged and moves focus into `#app` (it previously reset the app to home); clicking Start then Next moves focus to the route's `<h1>` ("Question 1 of 20", then "Question 2 of 20"), not `<body>`; browser Back and Forward restore the correct `<h1>` and `document.title`, with scroll reset to 0; on flashcards, focusing `#prev-card` at card 2 and activating it disables that button and moves focus to `#next-card`, not `<body>`; submitting an answer writes "Incorrect. The correct answer is B." into `#route-status`, the choices `<fieldset>` is genuinely `disabled`, and no `aria-disabled` exists anywhere in the DOM; browser Back after "Back to start" does not restore a phantom results page, it announces the "that page isn't available" popstate fallback; `#/disabilities/visual` deep-links correctly with a visible `<h1>` and an h1→h2→h3 outline; and the focus ring on the programmatically-focused route `<h1>` computes to `solid 3px rgb(255, 212, 121)` with a 2px offset once the browser is in keyboard modality (an initial check with no prior real input showed no ring — expected `:focus-visible` behaviour, not a defect — and a genuine keypress made it render). The deployed production build at https://cpacc-test-maker.pages.dev was separately smoke-tested: landmarks present, `#route-status` a sibling of `<main>`, skip link holds the route, and `#/legal/usa` deep-links to one visible `<h1>` with a unique title. **This was Chromium-only, manual, one-off verification** — the automated Playwright suite below now repeats and extends the focus-ring part of this check across all three engines, on every run.
- **The focus-ring question is now resolved by an automated cross-browser suite, not just Chromium.** `e2e/focus-contract.spec.js` (Playwright) exercises the same programmatic-focus scenario above — the app moving focus to a route's `<h1>` by script on navigation — in Chromium, Firefox, and WebKit, via two independent navigation paths (`#start`, a `<button>`, and the "Accessibility statement" `<a href>` link). In all three engines, once a real keypress has occurred earlier in the session, `document.activeElement.matches(':focus-visible')` is `true` and the computed style is `outlineStyle: 'solid'`, `outlineWidth: '3px'`, `outlineColor: 'rgb(255, 212, 121)'` — matching the Chromium result above exactly. A paired control test in all three engines, with zero prior keyboard interaction in the session, confirms no ring (`matchesFocusVisible: false`, `outlineStyle: 'none'`) — this is expected `:focus-visible`/input-modality behaviour, not an engine difference, and rules out "no ring at all" as an alternate explanation for the earlier Chromium false negative. Run four times with zero flake. This closes the "Focus ring on programmatic focus outside Chromium" open question that used to live in `src/views/accessibility.js`.
- **Cross-browser coverage now exists, but it is automated behavioural testing, not manual testing, and not screen reader testing.** `e2e/navigation.spec.js`, `e2e/motion-and-live-region.spec.js`, `e2e/smoke.spec.js`, and `e2e/axe.spec.js` run the same 20-scenario Playwright suite (60 executions: 20 tests × 3 engines — chromium, firefox, webkit) against a real `node server.js` instance. This confirms real-browser behaviour (layout, computed style, real focus/Tab handling, scroll position, a real accessibility tree) that jsdom cannot; it does not confirm what a screen reader announces, in any of the three engines, and no human clicked through the app in Safari or Firefox to do this. See the next point for what's still open.
- **Automated axe-core scans: zero violations, nine routes, all three engines, no rules suppressed.** `e2e/axe.spec.js` runs `@axe-core/playwright` with tags `wcag2a`, `wcag2aa`, `wcag22aa` (matching the app's WCAG 2.2 AA target) against home, a test question, results, flashcards, the disabilities grid and a detail route, the legal grid and a detail route, and the statement page itself — 9 routes × 3 engines = 27 scans, zero violations, no rule disabled or narrowed anywhere in the suite or its config. Automated scanning is real evidence, but it structurally only catches a minority of accessibility defects (things like task completion, cognitive load, and correct screen-reader phrasing are outside what any automated scanner can check) — it is not a substitute for manual or AT testing, and is not treated as one anywhere in this document or the public statement.
- **Two WebKit-specific behavioural differences found and documented, not engineered around:**
  - **WebKit's default Tab key visits only form fields, skipping links and buttons.** `e2e/navigation.spec.js` ("real Tab order from page load") confirms plain `Tab` from a fresh page load never leaves `<body>` on the home route (there's no text field there), while `Option+Tab` (macOS's "temporarily widen focusable set" gesture) visits `#skip-link` → `#home-btn` → into `#app`, in DOM order. This matches real macOS Safari's default with "Full Keyboard Access" off — a platform default the app has no way to override, not a defect in this app's DOM order or tabindex usage. Chromium and Firefox both visit the full set on plain `Tab`.
  - **WebKit does not move DOM focus onto a `<button>` as a result of a mouse click.** `e2e/navigation.spec.js` ("a control that disables itself on activation does not strand focus on `<body>`") traces this: clicking `#next-card` on flashcards leaves `document.activeElement` wherever it already was in WebKit, because the click never focused the button at all — WebKit shifts focus to the nearest focusable *ancestor* of the click point instead, which here is `<main id="app" tabindex="-1">`. `captureFocus()` in `src/main.js` trusts `document.activeElement` as ground truth for "what the user had focused" going into a re-render; it has no way to know WebKit already substituted `#app` for the actually-clicked button, so it captures `{id: 'app'}`, and `restoreFocus()` correctly (by its own logic) refocuses `#app` — the `nearestFocusableSibling()` fallback that would have found `#next-card` never runs, because `restoreFocus()` never gets far enough to need it. Net effect: a mouse-only WebKit user who disables `#prev-card` this way lands on the `<main>` landmark instead of `#next-card` — a real, less-precise landing spot than Chromium/Firefox produce, though still a live, in-document, non-`<body>` location, so the specific "focus destroyed on `<body>`" bug this code exists to prevent does not recur. Keyboard users on WebKit are unaffected, because Tab/Enter activation does focus the control there (see the previous point). **Decision: document this, do not build a WebKit-specific workaround for it** — `captureFocus()` has no reliable way to distinguish "WebKit silently retargeted this click" from "the user genuinely had `#app` focused" without browser-sniffing, and browser-sniffing focus logic is a worse trade than a documented, narrowly-scoped gap.
- **Still not verified: any manual screen reader testing of the current version.** NVDA, JAWS, and VoiceOver were run against an older version of the app, before this pass (see "Audit history" above) — not the current one. Playwright cannot drive a screen reader, so none of the automated coverage above touches this gap; it remains the single largest open item, unchanged by everything else on this page.
- **Zoom, reflow, and text spacing have not been evaluated on any view.** WCAG 1.4.4 (Resize Text), 1.4.10 (Reflow), and 1.4.12 (Text Spacing) have not been checked.
- **Chat announcement path is now explicit, not implicit.** Both chat transcripts (`#home-log` in `src/views/home.js`, `#log-${q.id}` in `src/views/chat.js`) carry an explicit `aria-live="off"`, which overrides `role="log"`'s implicit `aria-live="polite"` per the ARIA spec. Replies and errors are announced through `#route-status` via `announce()`, which is the single intended announcement path; the transcripts are silent by design. That resolves the double-announcement question at the spec level, but it is a spec-level guarantee, not one confirmed by a screen reader — no AT testing has been done on the current version (see the previous point) — and it has its own known limitation: `announce()` coalesces on a 75ms timer, last-message-wins, so a reply can be silently dropped if another announcement lands in that window. See `src/views/accessibility.js` for the user-facing disclosure of that race.
- **AI live chat responses are not pre-reviewed.** This is by design and clearly labeled in the UI (permanent amber banner above every chat transcript). See `AI_TRANSPARENCY.md` for the full discussion. Chat content quality varies per query; users are explicitly asked to verify against authoritative sources.
- **Cross-device missed-question sync requires the local Node deploy.** The Cloudflare Pages deploy falls back to per-browser `localStorage`. This is a UX limitation, not an a11y limitation, but worth flagging.
- **The 71-condition disabilities reference goes deeper than the CPACC exam tests.** Labeled with "Goes beyond CPACC scope — for deeper study" on both the home card and the page itself.
- **Mermaid diagrams in `ARCHITECTURE.md` are SVG renderings handled inconsistently by screen readers.** Every diagram is paired with a visible plain-text description; the prose is the source of truth.

## Reporting an accessibility issue

The public reporting channel is the one in the accessibility statement (`src/views/accessibility.js`): email to `tawsif@perenniala11y.com`. This repository has no git remote and is not published anywhere, so the [accessibility issue template](.github/ISSUE_TEMPLATE/accessibility.yml) is not a reachable channel for anyone outside this machine right now — don't point outside users at it.

For contributors working in this repo directly, the template is still the intended format once the project has a public remote; use it locally in the meantime if that's useful for tracking.

Accessibility issues are triaged ahead of other bugs.

## Conformance scope

This statement applies to:

- The deployed site at https://cpacc-test-maker.pages.dev
- The source code in this repository as of the latest commit

It does **not** cover:

- The IAAP CPACC Body of Knowledge PDF itself (third-party content)
- Chat tutor responses from the configured LLM provider (live AI output, by definition unreviewed)

## Last reviewed

See the latest commit timestamp on this file via `git log ACCESSIBILITY.md`.
