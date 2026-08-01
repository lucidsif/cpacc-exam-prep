# Accessibility statement

This is the accessibility statement for the CPACC Practice Test project.

This file is the developer-facing engineering record: what was audited, how, and what's still open. The public, user-facing conformance statement is `src/views/accessibility.js` (route `#/accessibility`) — that page is what a visitor reads and is authoritative for them; this file is authoritative for contributors on process and history. If the two ever disagree, that's a bug in one of them, not a difference of audience.

## Conformance target

**WCAG 2.2 Level AA** across all user-facing views.

This is the project's target, backed by code review and the automated checks below — not an independent audit by an assistive-technology user. See "Known limitations" for exactly what that gap covers.

## Audit history

Every UI change in this repository was reviewed by an accessibility-lead agent before merging, including these areas:

- Skip link intercepts its own click (`preventDefault` + explicit focus move) instead of relying on the native `href="#app"` hash jump. That jump used to fire a `popstate` the hash router couldn't resolve to a route, which reset the whole app to home if you pressed "Skip to main content" mid-test.
- Focus contract: real navigation (including Back/Forward) moves focus to the destination route's own visible `<h1>`. Every view renders exactly one, verified across all 23 view-states (home, test, results, flashcards, accessibility, the disabilities grid, the legal grid, 9 disability categories, and 7 legal jurisdictions). So the code's defensive fallback to `<main>`, for a view that somehow renders none, has never actually been exercised. An in-place re-render — chat send, flashcard flip, a toggle — preserves focus and caret position instead of dropping it to `<body>`. See "Focus contract" below. (A comment at `src/main.js`'s `moveFocusToRoute()` says "25". `src/main.js` is outside this file's ownership, so that discrepancy is reported rather than silently corrected here. 23 is the count that a natural enumeration of the app's routes actually produces.)
- Two persistent, static live regions carry the submit verdict, chat replies/errors, and the "that page isn't available" popstate fallback message: `#route-status` (`role="status"`, always polite) and `#route-alert` (`role="alert"`, always assertive). Both are siblings of `<main>`, so they survive `innerHTML` rewrites. `announce()` picks which region to write into, rather than mutating one region's `aria-live` per call — nothing obliges assistive tech to re-read a region's politeness after it's already registered, and `role="status"` combined with `aria-live="assertive"` would be self-contradictory. Both regions auto-clear a few seconds after being set, so a reply doesn't sit there permanently.
- Heading hierarchy (one H1 per view, no skipped levels) — including the disabilities/legal detail routes, which previously rendered no heading at all.
- Answer choices are native `<input type="radio">` elements inside a `<fieldset>`/`<legend>`. Once revealed, the fieldset is natively `disabled`, so review state is genuinely non-interactive — instead of the previous `aria-disabled`, which claimed to be disabled but wasn't. Native `disabled` does *not* remove a radio's role, name, or `checked` state from the accessibility tree (per HTML-AAM). What it removes is **focusability**: Tab, NVDA focus mode, and JAWS forms mode/quick-nav can no longer reach the control at all. The per-choice "your answer" / "correct answer" state is restored as visually-hidden text on the affected choice anyway, so it's conveyed through ordinary reading order rather than depending on focus reaching a control that's no longer tabbable.
- Flashcard content (tag, front/back text) is ordinary navigable text. It's no longer swallowed whole into a `<button>`'s accessible name via `aria-label`. The card is a plain container, and the existing `#flip-card` button is the sole keyboard control, so this is not a WCAG 2.1.1 keyboard-access regression.
- AI provenance `<summary>` takes its accessible name from its own visible content, not an overriding `aria-label` (WCAG 2.5.3 Label in Name) — a disambiguating item label is appended via `.sr-only` instead.
- Decorative emoji wrapped in `aria-hidden="true"`.
- AI provenance badges via native `<details>`/`<summary>` (no custom disclosure widget).
- Confidence pills use paired color + shape glyph + text (WCAG 1.4.1).
- Chat speaker identity, the question jump grid's answered state, the current-question cell, and the "About AI" trigger were all fixed for WCAG 1.4.1 Use of Colour after a full contrast audit — see "Colour and contrast" below.
- `prefers-reduced-motion: reduce` honored for scroll behavior and, as of this pass, CSS transitions.
- Color contrast: text ≥ 4.5:1, UI components ≥ 3:1 — see "Colour and contrast" below for the full audit result.
- Jump-grid cells (`.cell`), anchor-bar buttons, and the per-question chat toggles (`.toggle`) meet ≥ 24×24 CSS px target size (WCAG 2.5.8). This was not audited across every interactive element. See "Known limitations", and the public statement's "Layout and target size" section, which names the same three control types and the same scope.
- Page-level "About AI in this app" uses a native `<dialog>` with focus return on close, now handling both the button-click close path and native Escape dismissal.
- Mobile-vs-desktop kbd hint adapts via `(pointer: coarse)` so iPhone VoiceOver users don't hear keyboard mechanics.

The full accessibility audit and remediation history is captured in the git log under the `fix(a11y):` prefix.

## Focus contract

`render(opts)` in `src/main.js` computes a route key (`[view, question index, disabilities category, legal category]`) on every call and compares it to the key from the previous render. A changed key means a real navigation — focus moves to the destination's `<h1>`. An unchanged key means an in-place re-render. There, the control that was focused before the DOM was replaced is re-found and refocused, with caret position restored for text inputs. If that control became `disabled` by the same re-render (e.g. Prev at the first flashcard, or a radio inside a just-`disabled` fieldset), focus falls back to the nearest focusable sibling. Views can also request an explicit target (`render({ focus: '#flip-card' })`) for cases the route key can't infer.

**The governing rule: the element that receives route focus must be visible.** An earlier attempt used a `.sr-only` `<h1>` on the disabilities/legal detail routes; it was rejected in review because sighted keyboard users landed on an invisible element with no visible indication of where focus went. `.sr-only` is for supplementary text, never a focus target.

## Colour and contrast

A full audit computed the contrast ratio of every text and non-text colour pair used in the app. **Every pair WCAG 1.4.3 (text) and 1.4.11 (non-text) apply to passes**, with real headroom — the lowest text ratio measured is 6.04:1, and all 16 category accent colours pass as UI-component boundaries.

One pair does not pass, and is disclosed rather than folded silently into "every pair". `button:disabled { opacity: 0.5 }` composites to roughly 2.77–2.94:1 depending on what's behind it, under the 4.5:1/3:1 thresholds. WCAG 1.4.3 and 1.4.11 both explicitly exempt inactive user-interface components, so this is not a conformance failure. But it is a real pair under threshold, and "every pair was computed, all pass" would have implied none was.

The audit's actual findings were four **1.4.1 Use of Colour** failures — information conveyed by hue alone, with no other channel — all now fixed:

- Chat speaker identity was hue-only, at a 1.02:1 luminance delta — now has visible "You:" / "Tutor:" / "Error:" labels.
- The question jump grid's answered/unanswered state was a 1.04:1 delta — now has a `✓` / `·` glyph.
- The current-question jump-grid cell had no visual indicator at all — now has a visible inset ring.
- The "About AI in this app" trigger was visually indistinguishable from surrounding body text — now accent-coloured with an underline. There are two instances of this trigger: `home.js`, and the AI-provenance banner in `provenance.js`. The first pass fixed only the `home.js` one. Measured afterward, the provenance-banner instance still rendered in the banner's own text colour at regular weight — identical to its surrounding sentence, not merely low-contrast. The cause was `button.linkish`'s `color: inherit; font: inherit` (specificity 0,1,1) silently beating the intended rule (0,1,0). Re-selectored to `button.pv-info-link` to win on source order. Axe could not have caught this: `link-in-text-block` only fires on `<a>` elements, and this trigger is a `<button>`.

## Test coverage

`tests/views.test.js` (jsdom) and `tests/router.test.js` assert the accessibility contracts of every view as machine-checkable invariants. Examples:

- index.html shell has the skip link, home button, focusable `<main>`, and the `#route-status`/`#route-alert` live regions as siblings of `#app`.
- every view has exactly one h1, including the disabilities/legal detail routes.
- the question view's fieldset, verdict region, submit-answer states, and aria-describedby targets all resolve.
- revealed choices sit inside a `disabled` fieldset, with per-choice "your answer" / "correct answer" state restored as visually-hidden text.
- the provenance badge has the expected structure (visible-content-named summary, dual-encoded confidence pill, semantic `<dl>` card).
- the AI-info dialog is properly labelled.
- decorative emoji are `aria-hidden`.
- click- and popstate-driven navigation move focus to the route's `<h1>`, never `<body>` or a bare `#app`.
- activating the skip link, and a raw `popstate` for a non-route hash, don't reset the app to home.
- `#route-status` (`role="status"`) and `#route-alert` (`role="alert"`) both exist and receive text from `announce()`, routed by its `assertive` option.

`npm test` must pass green for any PR to merge.

**This verifies the contracts above in jsdom only.** jsdom does not render, paint, or build a real accessibility tree, and it doesn't drive a screen reader. See "Known limitations" for what that leaves unconfirmed.

## Known limitations

- **Informal manual keyboard/focus checking in real (non-headless) Chromium was done against the running app.** Scope this correctly: it was ad-hoc, by the author, in one browser — not a systematic pass against a written test plan, and not necessarily repeated after every subsequent change. An earlier version of this bullet said it "has confirmed the fixes below", which claimed more than the process supports. The automated suites are the real evidence for these behaviours; this was a sanity check alongside them.

  The specific things looked at:

  - The skip link, activated mid-test at `#/test/2`, leaves `location.hash` unchanged and moves focus into `#app`. It previously reset the app to home.
  - Clicking Start then Next moves focus to the route's `<h1>` ("Question 1 of 20", then "Question 2 of 20"), not `<body>`.
  - Browser Back and Forward restore the correct `<h1>` and `document.title`, with scroll reset to 0.
  - On flashcards, focusing `#prev-card` at card 2 and activating it disables that button and moves focus to `#next-card`, not `<body>`.
  - Submitting an answer writes "Incorrect. The correct answer is B." into `#route-status`, the choices `<fieldset>` is genuinely `disabled`, and no `aria-disabled` exists anywhere in the DOM.
  - Browser Back after "Back to start" does not restore a phantom results page. It announces the "that page isn't available" popstate fallback.
  - `#/disabilities/visual` deep-links correctly, with a visible `<h1>` and an h1→h2→h3 outline.
  - The focus ring on the programmatically-focused route `<h1>` computes to `solid 3px rgb(255, 212, 121)` with a 2px offset. See the note below.

  On that last item: an initial check with no prior real input showed no ring at all. The app moves focus by script on *every* navigation, so a pointer-only user — switch device, eye-tracking, sip-and-puff, magnifier — could land on route focus with no visible indicator at all, and have nothing to Tab onward from that they could actually see. **This is treated as a real defect, not expected behaviour to shrug off.** It is fixed by a `.route-focus` class in `styles/app.css`, applied by `moveFocusToRoute()` in `src/main.js` and removed on blur, which paints the same outline unconditionally — regardless of whether the browser's own `:focus-visible` keyboard-modality heuristic happens to match. See "Focus contract" and the `e2e/focus-contract.spec.js` entry below for what `:focus-visible` itself measures in each scenario. It is not the mechanism the ring depends on, in any of them.

  The deployed production build at https://cpacc-test-maker.pages.dev was separately smoke-tested: landmarks present, `#route-status` a sibling of `<main>`, skip link holds the route, and `#/legal/usa` deep-links to one visible `<h1>` with a unique title. **This was Chromium-only, manual, one-off verification** — the automated Playwright suite below now repeats and extends the focus-ring part of this check across all three engines, on every run.
- **The focus-ring question is now resolved by an automated cross-browser suite, not just Chromium — and the gap it surfaced is fixed, not just documented.** `e2e/focus-contract.spec.js` (Playwright) exercises the same programmatic-focus scenario above — the app moving focus to a route's `<h1>` by script on navigation — in Chromium, Firefox, and WebKit. It does so via two independent navigation paths: `#start`, a `<button>`, and the "Accessibility statement" `<a href>` link.

  In the "WITH prior keyboard interaction" tests, a real keypress has occurred earlier in the session, and a keyboard-driven activation (a real `Enter` keypress, not a synthetic click) triggers the navigation. There, `document.activeElement.matches(':focus-visible')` measures `true`, and the computed style is `outlineStyle: 'solid'`, `outlineWidth: '3px'`, `outlineColor: 'rgb(255, 212, 121)'` in all three engines — matching the Chromium result above exactly.

  A separate "WITHOUT prior keyboard interaction" test uses a fresh, mouse-only session that never presses a key before clicking `#start`. That test used to be the control case, proving the ring's *absence* was expected `:focus-visible` behaviour. It now instead **verifies the fix for that gap**. `moveFocusToRoute()` applies a `.route-focus` class to whatever it focuses, and `styles/app.css`'s `.route-focus` rule paints the same 3px amber ring unconditionally, independent of `:focus-visible`'s input-modality heuristic. So the test now asserts `outlineStyle: 'solid'`, `outlineWidth: '3px'`, `outlineColor: 'rgb(255, 212, 121)'`, **and explicitly asserts `matchesFocusVisible === false`**, in that zero-prior-input state, in all three engines. Run four times with zero flake.

  This closes two things at once: the "Focus ring on programmatic focus outside Chromium" open question that used to live in `src/views/accessibility.js`, and the pointer-only-user gap that question's own control case had been quietly documenting rather than fixing.
  <br>**Correction to how this mechanism was described here and in the public statement:** the wording above, and previously the public statement's, said the ring rendered "once a real key has been pressed earlier in the session." That framed `:focus-visible` keyboard-modality matching as the cause of the ring. It is not.

  The ring comes entirely from `.route-focus:focus`, which is applied and painted the same way whether or not `:focus-visible` matches. The "WITHOUT prior keyboard interaction" test above proves exactly that, by asserting the ring paints while `:focus-visible` is simultaneously `false`.

  `:focus-visible` also happens to measure `true` in the specific "WITH prior keyboard interaction" scenario above. That is a genuine, separately-true fact about that scenario — a real keypress followed by a keyboard-driven activation of a *natively focusable* control, a `<button>` or `<a>`. But it is incidental to the ring, not its source, and it does not generalize. A second pass (below) extended the same `.route-focus:focus` mechanism to four more script-driven focus moves, which land on non-natively-focusable, `tabindex="-1"` targets. Measured there, `:focus-visible` is `false` regardless of prior keyboard use, in every engine tested.

  One mechanism, one CSS rule, six focus destinations. `:focus-visible` is irrelevant to all of them. It happens to also match on two of them under one specific precondition, which is worth knowing but is not what this app depends on.
- **Cross-browser coverage now exists, but it is automated behavioural testing, not manual testing, and not screen reader testing.** `e2e/navigation.spec.js`, `e2e/motion-and-live-region.spec.js`, `e2e/smoke.spec.js`, `e2e/reflow.spec.js`, `e2e/focus-contract.spec.js`, and `e2e/axe.spec.js` run a 32-test Playwright suite against each of four configurations (chromium, firefox, webkit, and a 320px-viewport `mobile-320` profile) against a real `node server.js` instance, plus `e2e/axe-chat.spec.js` (2 tests) against a fifth, chat-enabled configuration — 130 tests total. This confirms real-browser behaviour that jsdom cannot: layout, computed style, real focus/Tab handling, scroll position, and a real accessibility tree. It does not confirm what a screen reader announces, in any of these configurations. No human clicked through the app in Safari or Firefox to do this. See the next point for what's still open.
- **Automated axe-core scans: zero violations. 74 scans across nine routes, four viewport/engine configurations, and two tag levels, with no rules suppressed. A gap that used to exist here — both the best-practice heading/landmark rules and the entire chat surface — has since been closed, and what's still genuinely not scanned is named below.** `e2e/axe.spec.js` runs `@axe-core/playwright` twice against each of nine routes: home, a test question, results, flashcards, the disabilities grid and a detail route, the legal grid and a detail route, and the statement page itself. The first run uses tags `wcag2a`, `wcag2aa`, `wcag22aa`, matching the app's WCAG 2.2 AA target. The second uses tag `best-practice`.

  That second scan is what actually backs the heading-hierarchy and one-h1-per-view claims elsewhere in this document against axe-core, in addition to the jsdom contract tests in `tests/views.test.js`. axe-core tags `heading-order`, `page-has-heading-one`, `empty-heading`, `landmark-one-main`, `landmark-unique`, and `region` as `best-practice` rather than to any WCAG success criterion, so the first tag set alone would never have run them. This repository's own history is the reason that distinction is called out explicitly rather than assumed obvious.

  Both scans run against all four non-chat Playwright configurations (chromium, firefox, webkit, and a 320px-viewport `mobile-320` profile) — 9 routes × 4 configurations × 2 tag sets = 72 scans. Separately, `e2e/axe-chat.spec.js` runs two further scans (home with the chat panel visible, and results with a per-question chat transcript open) against a fifth configuration whose server is started with `LLM_PROVIDER=local`, so `state.chatEnabled` is `true` there. The chat surface used to have zero axe coverage. It now has some — though only two of many possible chat states, not for example an error message or a multi-turn transcript. 72 + 2 = 74 scans total, zero violations, no rule disabled or narrowed anywhere in the suite or its config.

  Still not scanned by any of this: the "About AI in this app" `<dialog>`, which stays closed (`display:none`) throughout every scan, and the question view's own disabled-fieldset "revealed answer" state. The scanned test-question route is captured before any answer is submitted, so that markup has never been axe-scanned. (The results page carries different markup for the same information.)

  More generally, automated scanning is real evidence, but it structurally only catches a minority of accessibility defects. Things like task completion, cognitive load, and correct screen-reader phrasing are outside what any automated scanner can check. It is not a substitute for manual or AT testing, and is not treated as one anywhere in this document or the public statement.
- **Two WebKit-specific behavioural differences found and documented, not engineered around:**
  - **WebKit's default Tab key visits only form fields, skipping links and buttons — but the test evidence for this is Linux CI, not macOS.** `e2e/navigation.spec.js` ("real Tab order from page load") confirms plain `Tab` from a fresh page load never leaves `<body>` on the home route (there's no text field there), while `Alt+Tab` visits `#skip-link` → `#home-btn` → into `#app`, in DOM order.

    Be precise about where that evidence comes from. That test runs against Playwright's WebKit engine, and `.github/workflows/ci.yml` runs it on `ubuntu-latest` — a Linux WebKit build with no macOS keyboard settings to read. The key the test presses (`Alt+Tab`) is also not the same key as macOS's `Option+Tab`, which the test's own comment describes. Nothing in this repository demonstrates a real Safari-on-macOS test.

    The conclusion that this matches real macOS Safari's default with "Full Keyboard Access" off is reasoned from Safari's documented behaviour, not confirmed against an actual Mac. It is still the most likely explanation, and still a platform default the app has no way to override rather than a defect in this app's DOM order or tabindex usage. But that is an inference from documentation, not a finding from a hands-on test. Chromium and Firefox both visit the full set on plain `Tab`.
  - **WebKit does not move DOM focus onto a `<button>` as a result of a mouse click.** `e2e/navigation.spec.js` ("a control that disables itself on activation does not strand focus on `<body>`") traces this. Clicking `#next-card` on flashcards leaves `document.activeElement` wherever it already was in WebKit, because the click never focused the button at all. WebKit shifts focus to the nearest focusable *ancestor* of the click point instead, which here is `<main id="app" tabindex="-1">`.

    `captureFocus()` in `src/main.js` trusts `document.activeElement` as ground truth for "what the user had focused" going into a re-render. It has no way to know WebKit already substituted `#app` for the actually-clicked button, so it captures `{id: 'app'}`, and `restoreFocus()` correctly — by its own logic — refocuses `#app`. The `nearestFocusableSibling()` fallback that would have found `#next-card` never runs, because `restoreFocus()` never gets far enough to need it.

    Net effect: a mouse-only WebKit user who disables `#prev-card` this way lands on the `<main>` landmark instead of `#next-card`. That is a real, less-precise landing spot than Chromium/Firefox produce. It is still a live, in-document, non-`<body>` location, so the specific "focus destroyed on `<body>`" bug this code exists to prevent does not recur. Keyboard users on WebKit are unaffected, because Tab/Enter activation does focus the control there (see the previous point).

    **Decision: document this, do not build a WebKit-specific workaround for it.** `captureFocus()` has no reliable way to distinguish "WebKit silently retargeted this click" from "the user genuinely had `#app` focused" without browser-sniffing, and browser-sniffing focus logic is a worse trade than a documented, narrowly-scoped gap.
- **Still not verified: any manual screen reader testing of the current version — and NVDA and JAWS have never been used against this app at all.** VoiceOver is the only screen reader that has ever been pointed at this app, on an older version, and how systematic that was is not characterised. An earlier version of this file and of the published statement claimed NVDA, JAWS, and VoiceOver had all been run against an older version. That was false, and is corrected here rather than silently removed, because a wrong claim about testing evidence is the specific failure this document exists to prevent.

  Playwright cannot drive a screen reader, so none of the automated coverage above touches this gap. It remains the single largest open item. The Windows side of it has no evidence behind it whatsoever — NVDA and JAWS are the large majority of desktop screen reader use, and the two that differ most from VoiceOver on browse-vs-focus mode, live-region queuing, and quick-nav keys.
- **Reflow (WCAG 1.4.10) has been fixed and checked for the two views known to overflow, not evaluated everywhere; zoom and text spacing remain unevaluated.** The question view's jump grid and the results overview grid (`styles/app.css`'s `.grid`, a fixed 10-column layout) forced horizontal scrolling below roughly 378px wide. `styles/app.css` now collapses to 5 columns under a 480px media query, and `e2e/reflow.spec.js` asserts zero horizontal document overflow on both of those routes specifically, run at a 320px viewport (the `mobile-320` Playwright project) as well as every other configured viewport. No other route has an equivalent explicit assertion — the rest of the app runs at 320px too, as an incidental side effect of the whole suite running there, but nothing checks it for reflow specifically. WCAG 1.4.4 (Resize Text) and 1.4.12 (Text Spacing) have not been checked on any view at all.
- **The 20 "Discuss this question with the AI tutor" toggle buttons (`.toggle` in `styles/app.css`) were investigated for a possible WCAG 2.5.8 (Target Size Minimum) failure and found NOT to be one, though they are now additionally hardened.** Static reading of `.toggle { font-size: 13px; ... }` alone suggested a computed height around 20px, below the 24px minimum. Measured live in a real browser, the actual rendered height was already 24.8px — passing — before any change here. The button in `results.js` always carries `class="toggle linkish"`, and `button.linkish { font: inherit }` (specificity 0,1,1) beats `.toggle`'s `font-size: 13px` (specificity 0,1,0), so the button inherits the 16px/1.55 body font rather than using 13px at all.

  `styles/app.css` now also adds `display:inline-flex; align-items:center; min-height:24px; min-width:24px` directly to `.toggle`, so the 24×24 floor no longer depends on that specificity interaction being noticed.

  Recorded here as a lesson, not a defect. A claim built on static CSS reading alone, without checking cascade order against every class actually present on the element in the rendered markup, is exactly the kind of unverified claim this document exists to prevent. Inventing a failure that isn't real is not the safer direction to err in.

  Separately, `styles/app.css`'s own header comment (line 20) still claims "cells, anchors, and pills" all meet target size. `.pill` is a `<span>`, not an interactive control at all, so that line still conflates "meets target size" with "isn't a target." This is a real, unfixed inaccuracy in the stylesheet's own comment, independent of the toggle-button correction above.
- **Chat announcement path is now explicit, not implicit.** Both chat transcripts (`#home-log` in `src/views/home.js`, `#log-${q.id}` in `src/views/chat.js`) carry an explicit `aria-live="off"`, which overrides `role="log"`'s implicit `aria-live="polite"` per the ARIA spec. Replies and errors are announced through `#route-status` via `announce()`, which is the single intended announcement path; the transcripts are silent by design. That resolves the double-announcement question at the spec level. But it is a spec-level guarantee, not one confirmed by a screen reader — no AT testing has been done on the current version (see the previous point). It also has its own known limitation: each region's announcer coalesces on a 100ms timer, last-message-wins, so a reply can be silently dropped if another announcement of the *same* politeness lands in that window.

  `#route-status` and `#route-alert` now have fully independent timers, so this no longer applies across politeness levels — a queued polite announcement and an assertive one can no longer clobber each other. But two polite (or two assertive) announcements landing within 100ms of each other still can. See `src/views/accessibility.js` for the user-facing disclosure of that race.
- **No busy or pending state is exposed to assistive technology during an AI tutor round trip, and this is a known, unfixed failure rather than a gap in evidence.** `aria-busy` appears nowhere in this codebase (verified by grep), and nothing else stands in for it. A screen reader user who sends a chat message gets no indication that a request is in flight until the reply or error is announced. `src/chat.js`'s `fetch()` calls set no timeout and no `AbortController`, so if the configured model or the server never responds, that silence has no upper bound — it is not just a slow announcement, it can be a permanent one. This affects both `sendHomeMessage` and `sendQuestionMessage`.
- **The sticky reference-page anchor bar's `scroll-margin-top` was a fixed 60px, which was not tall enough for most jurisdictions and categories, not just the one previously singled out (WCAG 2.4.11, Focus Not Obscured) — this is now fixed, not still open.** The original disclosure here (and in `src/views/accessibility.js`) claimed only `#/legal/timeline` was affected, and that "every other jurisdiction and disability category has few enough anchors that this has not been observed to be a problem in practice."

  A direct 16-route × 3-viewport sweep falsified that. 14 of 16 measured route/viewport combinations had the anchor bar covering the focused heading, on the disabilities reference as well as the legal one — not a one-jurisdiction edge case. `#/legal/timeline` (26 anchors) was the worst measured case, at 389px tall at a 1280px-wide viewport and 1015px tall at 320px wide — as much as 158% of the viewport itself. Even `#/disabilities/cognitive`, the smallest-anchor-count category sampled, still buried the heading at narrow viewports.

  `styles/app.css` now caps `.dis-anchor-bar` at `max-height: 30vh`, with `overflow-y: auto` so the overflow is still reachable. It sets `.dis-item`'s `scroll-margin-top` to `calc(30vh + 16px)` — the same source, so the two values cannot drift apart the way a hand-picked 60px constant eventually did. Spot-checked post-fix on the worst-case route: the bar's own height cap plus the matching scroll-margin means clearing is guaranteed by construction, not by re-measuring after every content change.

  Separately, the bar's `role="group"`, `aria-label`, and `tabindex="0"` were consolidated onto the one scrollable element instead of split across nested elements. This is a keyboard-operability robustness fix, not the closure of a live axe `scrollable-region-focusable` violation — that rule was never actually failing here, since the bar already contains up to 26 focusable anchor buttons of its own.
- **The published focus-ring fix above covered route navigation only; a second pass extended the identical `.route-focus:focus` mechanism to four more script-driven focus moves, and fixed a separate regression in the restoration logic that had been silently dropping focus to `<body>`.** Measured in a cold, mouse-only session, all four of the post-answer result region (`#verdict`), the results jump grid, and both reference pages' scroll-to-item targets painted no outline at all in Chromium, Firefox, and WebKit alike, before this pass. That is the same defect the route-navigation fix above addressed, just not yet extended past route navigation.

  All four now go through `focusWithVisibleRing()` (`src/dom.js`), which mirrors `moveFocusToRoute()`'s own class-add/focus/blur-remove sequence. Confirmed solid 3px `rgb(255, 212, 121)` in all three engines afterward, with `document.activeElement.matches(':focus-visible')` measuring `false` in every engine regardless of prior keyboard use. Unlike route navigation, none of these four ever gets an assist from the browser's own heuristic, so the dedicated class is the *only* reason the ring paints on them.

  Separately, `restoreFocus()` (`src/main.js`) called `.focus()` and returned as though it had succeeded, without checking `document.activeElement` afterward. `.focus()` is a spec-legal no-op — not an error — on an element whose `tabindex="-1"` was applied imperatively and had just been erased by the same re-render's `innerHTML` write. That is exactly the state the re-found route `<h1>` (and the jump/anchor targets above) were in on every call.

  This silently dropped focus to `<body>` on every route it hit. Both existing positional-fallback regression tests happened to use natively-focusable elements (a radio, a `<summary>`), so `.focus()` succeeded there and the bug stayed invisible — until this pass checked the return state directly instead of trusting the call.
- **Two pieces of state and help text could silently go stale.** The AI-provenance disclosure (`<details class="provenance">`) collapsed on every in-place re-render — a chat reply landing while a screen-reader user was mid-way through its citations list would close that list under them. It was the one piece of user-set UI state not yet backed in `src/state.js` (chat drafts, chat-open, and flashcard-flip state already were); now tracked as `state.expandedProvenance`. Separately, `#submit-help` ("Select a choice to enable Submit answer") was keyed only on `revealed`. The code that removes it once a choice is picked runs in a handler that deliberately does not re-render. So any later render with a pending answer resurrected the hint — even though a choice was selected and Submit was already enabled — from a `<span>` nothing else referenced. `#kbd-hint` had the mirror problem: it kept telling users to press Submit after revealing the answer had already removed that button. Both are now computed from live state (`revealed || pending`) on every render, instead of being one-shot DOM patches.
- **AI live chat responses are not pre-reviewed.** This is by design and clearly labeled in the UI (permanent amber banner above every chat transcript). See `AI_TRANSPARENCY.md` for the full discussion. Chat content quality varies per query; users are explicitly asked to verify against authoritative sources.
- **Cross-device missed-question sync requires the local Node deploy.** The Cloudflare Pages deploy falls back to per-browser `localStorage`. This is a UX limitation, not an a11y limitation, but worth flagging.
- **The 71-condition disabilities reference goes deeper than the CPACC exam tests.** Labeled with "Goes beyond CPACC scope — for deeper study" on both the home card and the page itself.
- **Mermaid diagrams in `ARCHITECTURE.md` are SVG renderings handled inconsistently by screen readers.** Every diagram is paired with a visible plain-text description; the prose is the source of truth.

## Reporting an accessibility issue

The public reporting channel is the one in the accessibility statement (`src/views/accessibility.js`): email to `tawsif@perenniala11y.com`. That email address always works, regardless of the repository's publication state, and is the reliable fallback if the channel below isn't reachable for you.

The [accessibility issue template](.github/ISSUE_TEMPLATE/accessibility.yml) is the intended format for contributors once this repository has a public git remote. Check whether one exists before pointing an outside user at it. As of this file's last edit it did not, which made the template unreachable for anyone outside this machine. If you're reading this after the project has been pushed, that caveat no longer applies, and the issue template is a reachable channel too.

Accessibility issues are prioritised ahead of other bugs. This is a one-person project, so no response time is promised.

## Conformance scope

This statement applies to:

- The deployed site at https://cpacc-test-maker.pages.dev.
- The source code in this repository as of the latest commit.

It does **not** cover:

- The IAAP CPACC Body of Knowledge PDF itself (third-party content).
- Chat tutor responses from the configured LLM provider (live AI output, by definition unreviewed).

## Last reviewed

See the latest commit timestamp on this file via `git log ACCESSIBILITY.md`.
