# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html) starting at v0.1.0.

## [Unreleased]

### Fixed — pre-publication audit: accessibility defects, server hardening, and claims the code did not support (2026-08-01)

A six-part audit — accessibility, front-end quality, security/privacy, and documentation accuracy — ahead of the first public push. The documentation findings mattered more than the code findings: a reader who catches one false claim stops trusting the rest, and this repo's whole pitch is a statement written to be checked.

Accessibility defects, all reproduced before being fixed:

- Unsent chat text was silently destroyed by any in-place re-render. Neither input rendered a `value` and no draft lived in state, so `app.innerHTML` discarded it — and the focus contract then restored the caret to offset 0 of the now-empty field, actively signalling that nothing was wrong. Two-click repro, no network needed. Drafts are now backed in `src/state.js`
- Focus dropped to `<body>` for every control carrying neither an `id` nor one of `RESTORABLE_DATA_ATTRS` — the answer radios, all 20 provenance `<summary>` elements, the AI-info buttons, and plain links. `restoreFocus()` could not distinguish "removed by this render" from "never keyable". It now falls back to a positional index chain from `#app`, validated by `tagName`, which closes the class without anyone having to keep an attribute list in sync forever
- Programmatic focus painted no visible ring. Since the app moves focus by script on *every* navigation, a pointer-only user — switch device, eye tracking, sip-and-puff, magnifier — was relocated to an invisible position and tabbed onward from somewhere they could not see. This had previously been assessed as expected `:focus-visible` behaviour rather than a defect; that assessment was wrong. Fixed via `.route-focus:focus`, written with the `:focus` attached because the bare class loses the specificity contest against `:focus:not(:focus-visible) { outline: none }` and silently does nothing
- The `:focus-visible` fallback the statement claimed did not exist — the stylesheet had the suppressor half of the two-rule pattern with no base rule, which is CSS error recovery, not a fallback. The base rule now exists, `@supports`-narrowed
- The jump grid forced horizontal scrolling: ten fixed columns needing 294px inside a ~234px container. It failed on an ordinary phone, not just at 400% zoom, on the two most-used screens. Now drops to five columns under 480px; measured 0px overflow at 320px and 375px
- No `@media (forced-colors: active)` block existed at all, and the current-question indicator was a `box-shadow` — stripped in forced-colors mode, so the colour-independence fix evaporated for exactly the users most likely to need it
- Flashcard Prev/Next/Shuffle replaced the card silently; the results page signalled the picked answer by colour alone; 20 controls shared each of four identical accessible names; Enter submitted mid-IME-composition, so CJK input could not complete a word; and the scrollable chat transcripts were unreachable by keyboard (axe `scrollable-region-focusable`, Level A)
- The live region was split into two static regions — `#route-status` (polite) and `#route-alert` (assertive) — rather than mutating politeness on an already-registered region, which nothing obliges assistive tech to re-read. Coalescing moved 75ms → 100ms and both regions now auto-clear, so a full reply no longer sits permanently in a `<div>` outside every landmark

Server and supply chain:

- `server.js` served any readable file under root while binding `0.0.0.0`. `GET /.git/config`, `GET /data.json`, and — because a `.pdf` MIME type is registered — the copyrighted IAAP Body of Knowledge PDF were all downloadable by anyone on the same Wi-Fi. The gitignore discipline that keeps that PDF out of history did nothing at runtime. Now denied by path rule
- A sibling-directory prefix bypass in the path check (`startsWith(ROOT)` with no separator), and unbounded request bodies with no cap on `history` or `userMessage` before forwarding to a paid API
- Added a CSP and hardening headers, served locally and copied into `dist/`
- Local dev and production were sending *structurally different* conversations to the LLM — one fabricated a user turn plus an assistant acknowledgement, the other embedded context in the system prompt, and the general-chat personas had drifted apart by a sentence. Extracted `functions/_lib/prompts.js` and added a test that greps all three callers so it cannot fork again

Claims the code did not support:

- `CONTRIBUTING.md` flatly claimed WCAG 2.2 AA conformance, contradicting the public statement's "partially conformant"; it also described a WAI-ARIA roving-tabindex pattern that has never existed in this codebase
- The premise that native `disabled` removes a node from the accessibility tree is false — per HTML-AAM it keeps role, name, and `checked`; what it removes is *focusability*. It appeared in seven places, including a comment two lines above the code emitting `checked`
- The WebKit findings were attributed to real macOS Safari; the evidence is Playwright's WebKit on Linux CI, which has no macOS keyboard settings to read. The `<main>`-landing behaviour was also presented as WebKit-specific when it occurs in all three engines
- Heading and landmark structure was presented as axe-backed, but every rule that would back it is tagged `best-practice` in axe-core and was excluded by the tag filter. The entire chat surface had zero axe coverage because CI ran with no LLM provider configured
- `USER/REPO` template placeholders sat at the bottom of this file; the legal reference count was stated three different wrong ways (it is 61 in the dataset, 53 rendered, across 7 jurisdictions)
- `data/README.md` now addresses whether question text paraphrased from IAAP's copyrighted BoK is ours to MIT-license — the one publication-risk argument the repo had not answered

Testing and release gate:

- jsdom 131 → 151; end-to-end 60 → 126 across five projects, adding a 320px viewport project and a chat-enabled project. axe now also runs its `best-practice` ruleset — 74 scans total
- `npm run deploy` now gates on the e2e suite; it previously shipped on jsdom alone, so a release could go out with every axe scan failing

Known limitations are named in the statement rather than omitted: no `aria-busy`/pending state during chat round trips (and no timeout or `AbortController`, so a hung request is permanent silence), `<details open>` lost on re-render, a 60px `scroll-margin-top` against a measured ~389px sticky anchor bar on `#/legal/timeline`, and no screen reader testing of the current version.

### Added — Playwright end-to-end suite across chromium, firefox, and webkit (2026-08-01)

- `e2e/` (Playwright): 20 scenarios run against real Chromium, Firefox, and WebKit — 60 tests total, four full runs with zero flake. Covers real layout, computed styles, Tab order, scroll position, and, via `@axe-core/playwright`, automated accessibility scans against a real accessibility tree — none of which the jsdom suite (`tests/`) can check
- `e2e/focus-contract.spec.js` resolves the accessibility statement's previously-open question about whether the focus ring renders on programmatic focus outside Chromium: all three engines paint `solid 3px rgb(255, 212, 121)` once the session has seen one real keypress, via two independent navigation paths (a button and a link). A paired control test with no prior keypress confirms no ring in any of the three, ruling out "the ring is just always there" as an alternate explanation
- `e2e/axe.spec.js` runs axe-core (`wcag2a`/`wcag2aa`/`wcag22aa` tags, matching the app's WCAG 2.2 AA target) across nine routes in all three engines — 27 scans, zero violations, no rule suppressed or narrowed
- `e2e/navigation.spec.js` documents two real WebKit-only behavioural differences, neither engineered around: WebKit's default Tab key visits only form fields, skipping links and buttons (matches real macOS Safari with Full Keyboard Access off — a platform default, not an app defect); and WebKit does not move DOM focus onto a `<button>` on mouse click, so a control that disables itself on click leaves this app's focus-preservation logic landing on the `<main>` landmark instead of the intended sibling control — affects mouse/trackpad users on WebKit only, keyboard users there are unaffected
- `src/views/accessibility.js`, `ACCESSIBILITY.md`, `README.md`, and `tests/README.md` updated to match: the "no Safari/Firefox testing at all" and "focus ring outside Chromium" open questions in the public statement are resolved or reworded, the new cross-browser and axe evidence is disclosed as automated behavioural testing (not manual, not assistive-technology testing), and both WebKit findings are documented in both the public statement and `ACCESSIBILITY.md`. The screen-reader gap — no AT testing of the current version — remains the statement's single most prominent disclosure and is unchanged by any of the above; Playwright cannot drive a screen reader

**Amended 2026-08-01:** the counts and one finding above describe the suite as it stood when written; the audit entry at the top of this section superseded them the same day. The suite is now 126 tests across five projects (adding a 320px viewport and a chat-enabled project) with 74 axe scans including axe's `best-practice` ruleset — not 60 tests, 27 scans, and WCAG-tagged rules only. More importantly, the paired control test described above ("confirms no ring in any of the three, ruling out 'the ring is just always there'") has been **inverted**: the missing ring on programmatic focus was reclassified from expected `:focus-visible` behaviour to a real defect affecting pointer-only assistive-technology users, and `e2e/focus-contract.spec.js` now asserts the ring *does* render without prior keyboard interaction. The reasoning in the original bullet was sound for keyboard users and wrong for everyone who points.

### Changed — repo hygiene ahead of first push (2026-07-31)

First push makes all commits public and permanent, so this closes out the things that only matter once strangers can clone the repo.

- `CPACC_BoK.pdf` (the copyrighted IAAP Body of Knowledge) stripped from all 33 commits with `git filter-repo` — it was present in the initial commit, so deleting it going forward would have done nothing for anyone who clones full history. It's now gitignored, along with any other root-level PDF, and stays on disk locally for citation work only
- `data/questions.js`'s per-question citation comments pointed at "the BoK PDF in this folder," which was already wrong and would have dangled once the PDF stopped shipping. The comment now names the source and says where to get it instead of implying the repo bundles it
- A real LAN IP used as a copy-paste example was scrubbed from two docs; `.wrangler/` local state is now gitignored
- `package-lock.json` is committed — it was sitting under a stale gitignore comment about Bear-database backup files, which is not what a lockfile is. A public repo wants a pinned lockfile so contributors get reproducible installs and jsdom gets a pinned integrity hash
- An audit of all 33 commits found no secrets, no committed `data.json`, no verbatim BoK reproduction in the question banks, and no bundled third-party assets

### Added — public accessibility statement at `#/accessibility` (2026-07-31)

- New route `#/accessibility` (`src/views/accessibility.js`), linked from home, with the same visible-`<h1>` and focus contract as every other route. It states plainly that manual screen reader testing predates the focus/colour fixes below and hasn't been redone, lists what has and hasn't been checked, and gives a real reporting address via `mailto:`. It does not claim conformance
- `#/accessibility/<anything>` is rejected like any other unknown sub-path, matching the existing category/jurisdiction fallback behaviour
- Reconciling the new statement against `ACCESSIBILITY.md` surfaced that the doc contradicted itself about whether Chromium verification had happened. `ACCESSIBILITY.md` now names the specific Chromium checks performed and states plainly that no screen reader and no Safari/Firefox testing has happened
- README's "WCAG 2.2 AA conformant" claim corrected to "targets, partially conformant"; the badge relabelled to match
- Follow-up polish from the final-gate review: README's accessibility-issue guidance pointed readers at the GitHub issue template, but the repo has no remote yet, so that template isn't a reachable channel for anyone outside this machine. It now names the working contact email and scopes the template as contributor-only guidance. `ACCESSIBILITY.md` gained the zoom/reflow/text-spacing gap the public statement already disclosed. The statement's claim that fixes were verified "by automated tests and by manual keyboard testing" read distributively but keyboard testing never touched the colour-only cues, provenance badge naming, or reduced motion — now scoped to the focus and navigation work only

### Fixed — empty missed-pool crash, chat live-region ambiguity (2026-07-31)

- Finishing a missed-question practice run with everything correct cleanly empties the missed set, so results still offered "Practice 0 missed again." Clicking it sampled an empty pool, entered the test view with zero questions, and `question.js` dereferenced `undefined`. Guarded at both layers: `results.js` disables `#retake` with an `aria-describedby` explanation when there's nothing left to retake, and `startTest` samples into a local variable first and bails with an `announce()` rather than touching state
- Chat transcripts (`role="log"`) now carry an explicit `aria-live="off"` alongside it. `role="log"` implies a polite live region on its own, so leaving the attribute off had silently kept that implicit behavior rather than removed it, while replies were also announced through `#route-status` — the pairing risked a double announcement. Explicit `off` makes `#route-status` the single, deterministic announcement path

**Amended 2026-08-01:** "the single, deterministic announcement path" was true when written. `#route-status` has since been joined by a second static region, `#route-alert` (`role="alert"`, assertive), so announcements now route to one of *two* deterministic paths by politeness rather than one — see the render/announce architecture entry below and `ARCHITECTURE.md`/`ACCESSIBILITY.md` for the current shape. The double-announcement problem this bullet fixed is unaffected by that change.

### Fixed — residual focus-restoration gaps from adversarial review (2026-07-31)

Follow-up to the focus-contract repair below, from an adversarial final-gate review that found the headline bug still surviving at boundaries the first pass missed.

- `nearestFocusableSibling` only searched a disabled control's immediate parent, so a control cluster that disables as a unit could still strand focus on `<body>` — e.g. home's `#practice-missed` and `#clear-missed`, which share a `.row` and both disable together the instant the missed list empties. The search now widens progressively — parent → nearest `.panel` → `#app` — bounded there so it can't wander to the skip link or home button outside `<main>`; if even `#app` has nothing focusable, it falls back to the route's own heading instead of leaving focus on the removed node
- `data-jump` was missing from `RESTORABLE_DATA_ATTRS`, so the results page's jump-grid cells were invisible to `captureFocus()` and lost focus on any in-place re-render (e.g. a chat reply landing while the user had tabbed to a jump cell)
- `isFocusable()` now checks `:disabled` instead of `el.disabled`. `el.disabled` only reflects a control's own attribute, so a radio inside a `<fieldset disabled>` (how revealed answer choices render) reported `false` even though `.focus()` on it is a silent no-op; `:disabled` matches the real inherited state, including the spec's `<legend>` exception a hand-rolled `closest('fieldset[disabled]')` check would get wrong
- Three regression tripwires added for fixes from the focus-contract repair below that this review found could be reverted with the suite staying fully green — the same blindness that let the original bugs ship: chat replies reaching `#route-status` on both the success and assertive-error paths (as of this writing; see the 2026-08-01 amendment above — the assertive path now reaches the separate `#route-alert` region instead), `aria-current` on the current jump-grid cell (which doubles as its only visual indicator via `.cell[aria-current]`), and focus/caret restoration driven through the app's own real async startup probes rather than test-side focus poking

### Fixed — accessibility: focus, skip link, flashcard content, colour-only signals (2026-07-31)

**Critical**

- Skip link (`<a href="#app">`) no longer ejects users mid-test. Activating it fired a `popstate`; the hash router treated `#app` as an unknown route and reset the app to home. The skip link now `preventDefault`s and moves focus directly; the popstate listener also now ignores any hash that isn't `''` or `#/...`, closing off this whole class of accidental-navigation-via-hash-fragment
- Focus tracking for real navigation. Previously focus moved to `<main>` only on Back/Forward — every click-driven navigation replaced `app.innerHTML` and silently dropped focus to `<body>`. `render()` (`src/main.js`) now compares a route key (`[view, index, disabilities category, legal category]`) on every call to tell a real navigation apart from an in-place re-render, and moves focus to the destination route's own `<h1>` on navigation while preserving focus and caret position on in-place re-renders (chat send, card flip, toggle)
- Flashcard content is no longer hidden from screen readers. The card was a `<button>` whose `aria-label` replaced its entire text content, so the tag, front, and back text were never exposed. It's now a plain container; the existing `#flip-card` button remains the sole keyboard control — not a WCAG 2.1.1 keyboard-access regression

**Serious**

- The AI-confidence `<summary>` on every provenance card no longer overrides its own visible label with `aria-label` — that hid the confidence level from screen readers and failed WCAG 2.5.3 (Label in Name) for speech-input users. The visible text is now the accessible name; a disambiguating item label is appended via `.sr-only`
- The disabilities and legal reference detail routes (`#/disabilities/<id>`, `#/legal/<id>`) gained a real, visible `<h1>` — they previously had none, so nothing meaningful ever received focus on navigation into them
- Revealed answer choices are genuinely inert. They previously used `aria-disabled="true"` while remaining natively focusable and operable — a lying disabled state. They're now inside a `<fieldset disabled>`, which is truthfully non-interactive. Native `disabled` doesn't strip a radio's role, name, or `checked` state from the accessibility tree (per HTML-AAM) — what it removes is *focusability*, so Tab, NVDA focus mode, and JAWS forms mode/quick-nav can no longer reach the control at all. The "your answer" / "correct answer" state is restored as visually-hidden text on the affected choice(s) anyway, so it's conveyed through ordinary reading order rather than depending on focus reaching a control that's no longer tabbable
- Chat replies and errors are now announced through the app's persistent `#route-status` region. Both transcripts (`role="log"`) had no reliable live-region mechanism for content appended mid-session — see the Known limitations note in `ACCESSIBILITY.md` about the resulting double-announcement risk
- `router.js`'s `#/results` restorability check now requires a non-empty question set, not just `submitted` — previously Back after "Back to start" could restore a results page reading "0 / 0 (0%)"

### Changed — colour and use-of-colour audit (2026-07-31)

A full contrast audit computed every text and non-text colour pair in the app. **All WCAG 1.4.3 (text) and 1.4.11 (non-text) pairs pass**, with real headroom — lowest text ratio 6.04:1, all 16 category accent colours pass as UI-component boundaries. The audit's actual findings were four **1.4.1 Use of Colour** failures (hue as the only channel), now fixed:

- Chat speaker identity was hue-only at a 1.02:1 luminance delta — added visible "You:" / "Tutor:" / "Error:" labels
- The jump grid's answered/unanswered state was a 1.04:1 delta — added a `✓` / `·` glyph
- The current-question jump-grid cell had no visual indicator at all — added an inset ring
- The "About AI in this app" trigger was indistinguishable from body text — now accent-coloured with an underline

### Added — focus/announce architecture (2026-07-31)

- `render(opts)` in `src/main.js` — no-arg calls auto-detect navigation vs. in-place re-render via a route key; `render({ focus: '#selector' })` targets a specific element explicitly (used by the flashcard flip control and the results per-question chat toggle)
- `captureFocus()` / `restoreFocus()` — re-find the previously-focused control by `id` or a `data-*` attribute after `app.innerHTML` is replaced, and restore text-input caret position. Falls back to the nearest focusable sibling when the original control became `disabled` by the same re-render
- `announce(msg, { assertive })` — writes to `#route-status`, a persistent `role="status"` region that's a sibling of `<main>` (survives `innerHTML` rewrites). Coalesces rapid calls with a 75ms `setTimeout` rather than `requestAnimationFrame` — see the in-code comment for why rAF drops a repeated identical message

**Amended 2026-08-01:** this description matched the code as of 2026-07-31. Since then, `#route-status` gained a sibling region, `#route-alert` (`role="alert"`, assertive) — `announce({ assertive })` now picks between the two static regions instead of writing only to `#route-status` — and the coalescing delay changed from 75ms to 100ms. See `ARCHITECTURE.md` and `ACCESSIBILITY.md` for the current mechanism, including the corrected explanation of *why* the clear-then-set pattern works (it's `aria-relevant`'s `"additions text"` default, not "aria-live only speaks on a change").

### Notes

- The governing rule behind all of the above: **the element that receives route focus must be visible.** An earlier attempt used a `.sr-only` `<h1>` on the reference detail routes; rejected because sighted keyboard users landed on an invisible element with no visible indication of where focus went. `.sr-only` is for supplementary text, never a focus target
- These fixes are verified by jsdom unit tests only. The original defects were confirmed by hand in headless Chromium; the fixes have not yet been re-confirmed there. Real browser behaviour generally, actual screen reader announcement (NVDA/JAWS/VoiceOver), focus-ring visibility, and `:focus-visible` matching on programmatic focus in Safari and Firefox remain unverified. See `ACCESSIBILITY.md`

### Added — browser Back/Forward navigation (2026-07-31)

- `src/router.js` — pure hash-path <-> state mapping (`pathFor`, `applyPath`), no DOM or history API, fully unit-testable
- Explicit `state.view` field (`'home' | 'test' | 'results' | 'flashcards' | 'disabilities' | 'legal'`) replacing the old infer-the-screen-from-data-presence dispatch in `render()`. Back to home no longer has to destroy `state.questions`, so an in-progress test survives in memory and Forward resumes it with answers intact
- Route table: `#/`, `#/test/<n>` (question index IS in the path), `#/results`, `#/flashcards`, `#/disabilities[/<id>]`, `#/legal[/<id>]`
- `document.title` now updates per view so Back/Forward is distinguishable in history and announced by screen readers
- Focus moves to `<main>` on any popstate-driven render, so keyboard/screen-reader users aren't stranded on a node `innerHTML` just replaced
- `tests/router.test.js` — 19 tests covering round-tripping every route, unrestorable cold-load paths, unknown category/jurisdiction fallback, out-of-range question clamping, and malformed/empty hashes
- A full-app jsdom test in `tests/views.test.js` asserting Back/Forward push/restore the right hash and move focus to `<main>`

### Notes

- Flashcard index, `flipped` state, chat open/closed, and answer selections are deliberately NOT in the URL — flashcard advance is a study action on a freshly-shuffled deck, not navigation, and 60 cards in history would make Back useless for leaving the deck
- `#/test/<n>` and `#/results` can't be reconstructed from a URL alone (the question set is sampled at runtime and answers live only in memory); a cold load or a stale history entry after reload falls back to home via `history.replaceState` rather than showing a URL that lies about what's on screen
- The home button's confirm-before-leaving dialog is unchanged: it still calls `resetState()` and destroys the in-progress test, which is a real (if now avoidable) loss of progress, so the warning stays accurate. Browser Back is the new non-destructive way to step out of a test

### Fixed — de-vendored chat-status copy (2026-07-31)

- Home-page "Chat tutor: disabled" copy still told users to set `ANTHROPIC_API_KEY`, left over from before the provider-agnostic adapter (7e7b04e / 0d9dae2). Now reads: set `LLM_PROVIDER` and `LLM_API_KEY`, works with Anthropic, OpenAI, or a local OpenAI-compatible server
- Stale code comment in `src/main.js` naming `ANTHROPIC_API_KEY` specifically, made provider-neutral

### Added — provider-agnostic chat tutor (2026-07-30)

- `functions/_lib/llm.js` — one helper, three interchangeable backends (`anthropic`, `openai`, `local`), selected with `LLM_PROVIDER`
- `LLM_API_KEY`, `LLM_MODEL`, `LLM_BASE_URL` env vars. Provider is auto-detected when `LLM_PROVIDER` is unset (`LLM_BASE_URL` → `local`, else `ANTHROPIC_API_KEY` → `anthropic`, else `OPENAI_API_KEY` → `openai`)
- `local` support for any OpenAI-compatible server you run yourself (LM Studio, Ollama, llama.cpp, vLLM); no API key required, 120s timeout for cold model loads
- `LLM_MAX_TOKENS` env var — overrides the per-provider answer budget. Non-numeric or `<= 0` values fall back to the provider default (1024 for `anthropic` and `openai`, 3000 for `local`)
- `tests/llm.test.js` — 18 tests covering provider resolution, the per-provider token budgets and their `LLM_MAX_TOKENS` override, per-provider wire format, and reply extraction

### Changed

- **Breaking (API):** `/chat` and `/chat-general` now return a normalised `{ reply, provider, model }` for every provider instead of the raw Anthropic envelope. Errors return `{ error }` with a real status code (503 not configured, 502 unreachable or empty, upstream status on upstream error)
- **Breaking (API):** `GET /chat-status` now returns `{ enabled, provider, model }` instead of `{ enabled }`. `provider` and `model` are `null` when nothing is configured
- `server.js` loads the shared helper via a cached dynamic `import()` instead of keeping its own inline Anthropic call, so the local Node server and the Cloudflare Pages Functions run one provider implementation
- `<think>…</think>` scratchpads from local reasoning models are stripped from the reply
- Default `local` model is now `qwen/qwen3.6-35b-a3b` (was `qwen2.5-7b-instruct`). The 7B model was confidently wrong in testing — it gave the four WCAG principles as "Perceivable, Understandable, Robust, and Semantically Correct", inventing one and dropping Operable. The larger model answers correctly
- `local` now gets a 3000-token answer budget instead of the cloud-sized 1024. Reasoning-capable models spend the budget on hidden thinking before any visible text (~1,300 reasoning tokens for a simple question), so 1024 truncated them into an empty reply
- An empty reply that also reports truncation (`finish_reason: "length"`, or `stop_reason: "max_tokens"` on Anthropic) now returns an error naming the token limit that was hit and suggesting `LLM_MAX_TOKENS` or a non-reasoning model, instead of the generic "returned an empty reply". Still HTTP 502
- Docs updated throughout for provider-neutral setup. `AI_TRANSPARENCY.md` now documents where chat messages go per provider, including that `local` keeps them off any third-party vendor

### Removed

- `functions/_lib/anthropic.js` — replaced by `functions/_lib/llm.js`

### Notes

- Existing `ANTHROPIC_API_KEY` / `ANTHROPIC_MODEL` (and `OPENAI_API_KEY` / `OPENAI_MODEL`) setups keep working unchanged as fallbacks
- `LLM_PROVIDER=local` is not usable on the deployed Cloudflare site: Pages Functions run on Cloudflare's edge network and cannot reach `localhost`, a LAN address, or a Tailscale `100.x` address. Use it with `node server.js`, or point `LLM_BASE_URL` at a publicly reachable endpoint
- The bundled question banks, flashcards, and reference data are unchanged and remain authored by Claude Sonnet 4.6, as recorded in each file's `*_PROVENANCE` constant

## [0.1.0] — 2026-06-04

First open-source release. The app went from a single 858-line `index.html` to a modular, documented, tested, and deployed codebase.

### Added — content

- 75-item main CPACC question bank (`data/questions.js`) authored from the IAAP CPACC Body of Knowledge (Oct 2023, v4.0)
- 59-item Bear-notes-derived practice bank (`data/bear-questions.js`)
- 50 study flashcards distilled from Bear notes (`data/bear-flashcards.js`)
- Human disabilities reference: 71 conditions across 9 categories (`data/disabilities.js`)
- History / laws / standards reference: 51 CPACC-relevant items across 7 jurisdictions (`data/legal.js`)
- Optional Claude-powered chat tutor (per-question + home-page)

### Added — UX

- Per-question explicit submit flow with locked-after-reveal radios
- "Submit test and see score" button visually distinct from per-question submit; only renders on the last question or after all are revealed
- Missed-question focused-practice mode (persists per-browser via localStorage; cross-device on local LAN deploy via server-side `data.json`)
- Home-page "About AI in this app" footer link → modal explainer
- Jump-grid keyboard navigation with `aria-current` on the active cell
- Per-section emoji icons on the home page
- Device-aware keyboard hint above radio groups (drops the kbd sentence on touch devices via `@media (pointer: coarse)`)
- "Goes beyond CPACC scope — for deeper study" label on the Human disabilities reference

### Added — AI transparency

- IBM-style provenance badges on every AI-touched piece of content
- Three content buckets: AI-authored from primary source (high), AI-derived from author's notes (medium), AI live response (variable)
- Confidence pills use paired color + shape glyph + text (WCAG 1.4.1)
- Native `<details>` disclosure for the per-item provenance card (semantic, zero-JS, mobile-friendly)
- Native `<dialog>` for the page-level "About AI in this app" explainer with focus return on close
- Permanent banner above every chat transcript: "AI live response — not pre-reviewed"
- `*_PROVENANCE` constants exported by every data file in the IBM AI FactSheet shape
- Comprehensive `AI_TRANSPARENCY.md` long-form companion to the in-app dialog

### Added — accessibility

- WCAG 2.2 AA conformance across all views
- Skip link → focusable `<main>`
- Radio groups use the WAI-ARIA roving-tabindex pattern with a visible hint
- Single polite `aria-live` verdict region per view (no dueling live regions)
- Revealed radios use `aria-disabled` instead of native `disabled` so keyboard review still works
- Decorative emoji wrapped in `<span aria-hidden="true">`
- `prefers-reduced-motion: reduce` honored for `scrollIntoView`
- 3px amber focus ring on all focusable elements
- Border color hits ≥3:1 contrast (`--border: #708098`)
- `ACCESSIBILITY.md` statement listing the conformance target, audit history, known limitations, and reporting flow

**Amended 2026-08-01:** two claims in this entry didn't hold up. "WCAG 2.2 AA conformance across all views" was corrected to "targets WCAG 2.2 AA, partially conformant" — see the 2026-07-31 entry above, `README.md`, and `ACCESSIBILITY.md`. "Radio groups use the WAI-ARIA roving-tabindex pattern" was never accurate: this codebase has always used native `<input type="radio">` elements grouped in a `<fieldset>`/`<legend>`, relying on the browser's native radio-group Tab/Arrow-key behavior — there is no roving-tabindex pattern here and never was (see `src/README.md`, `CONTRIBUTING.md`). Left the original bullets above as written rather than editing them in place, so this entry still reflects what was actually claimed at the time.

### Added — architecture

- Modular ES-module codebase under `src/` and `data/` (replaced a 700-line inline IIFE)
- Single mutable state factory in `src/state.js`
- Render dispatcher in `src/main.js`; views never mutate state directly
- IBM-style provenance UI module in `src/provenance.js`
- Storage module with server probe + localStorage fallback
- Chat module with fetch wrappers for both `/chat` and `/chat-general`

### Added — deploy

- Cloudflare Pages support via `functions/chat.js`, `functions/chat-general.js`, `functions/chat-status.js`
- `wrangler.toml` for `wrangler pages dev` local preview
- `scripts/build-dist.sh` stages a clean `dist/` (excludes `CPACC_BoK.pdf`, `data.json`, `tests/`, `node_modules/`)
- `npm run deploy` runs tests → builds → ships in one command
- Live at https://cpacc-test-maker.pages.dev (chat disabled by default — env-var-gated)

### Added — tests

- 56 tests covering: data-file structure + uniqueness + provenance shape; sampling logic with injected RNG; scoring math; missed-set persistence (mocked fetch + localStorage polyfill); jsdom DOM tests asserting accessibility contracts of every view
- `tests/run.js` discovers and runs every `*.test.js`
- GitHub Actions CI runs the suite on every push and PR

### Added — docs

- `README.md` multi-audience entrypoint
- `ARCHITECTURE.md` with four Mermaid diagrams (paired with plain-text descriptions)
- `AI_TRANSPARENCY.md` long-form provenance doc
- `DEPLOY.md` Cloudflare Pages + local Node guides
- `CONTRIBUTING.md` PR checklist
- `ACCESSIBILITY.md` accessibility statement
- `SECURITY.md` responsible disclosure policy
- `SUPPORT.md` getting-help routing
- `CODE_OF_CONDUCT.md` Contributor Covenant 2.1
- `LICENSE` MIT
- Per-directory READMEs in `data/`, `src/`, `tests/`, `functions/`
- Issue templates: bug, accessibility, wrong-answer
- Pull request template

Note: this repository has no git remote and no `v0.1.0` tag yet, so the `[Unreleased]`/`[0.1.0]` headers above are plain text, not links. Compare/release links will be added here once the project is pushed and tagged.
