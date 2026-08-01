# Accessibility statement

This is the accessibility statement for the CPACC Practice Test project.

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

- **This pass is verified by jsdom unit tests only.** The original defects — skip-link ejection, dropped focus on click-driven navigation, hidden flashcard content, mis-labelled provenance summaries, colour-only signals — were confirmed by hand in headless Chromium; the fixes have not yet been re-confirmed there. Not verified: real browser behaviour generally, actual screen reader announcement (NVDA, JAWS, VoiceOver), focus-ring visibility, and `:focus-visible` matching on a programmatic `.focus()` call in Safari and Firefox.
- **Possible double announcement in chat.** Both chat transcripts use `role="log"`, which carries an implicit `aria-live="polite"`, but are re-rendered wholesale on every reply rather than having the new message appended — so whether the implicit log region announces a new message is inconsistent across screen reader/browser combinations to begin with. Replies and errors are also announced explicitly through `#route-status`. Whether that produces an audible double announcement in practice is unconfirmed and needs testing with real assistive technology.
- **AI live chat responses are not pre-reviewed.** This is by design and clearly labeled in the UI (permanent amber banner above every chat transcript). See `AI_TRANSPARENCY.md` for the full discussion. Chat content quality varies per query; users are explicitly asked to verify against authoritative sources.
- **Cross-device missed-question sync requires the local Node deploy.** The Cloudflare Pages deploy falls back to per-browser `localStorage`. This is a UX limitation, not an a11y limitation, but worth flagging.
- **The 71-condition disabilities reference goes deeper than the CPACC exam tests.** Labeled with "Goes beyond CPACC scope — for deeper study" on both the home card and the page itself.
- **Mermaid diagrams in `ARCHITECTURE.md` are SVG renderings handled inconsistently by screen readers.** Every diagram is paired with a visible plain-text description; the prose is the source of truth.

## Reporting an accessibility issue

Please open an issue using the [accessibility template](.github/ISSUE_TEMPLATE/accessibility.yml).

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
