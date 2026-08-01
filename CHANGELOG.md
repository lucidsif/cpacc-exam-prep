# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html) starting at v0.1.0.

## [Unreleased]

### Fixed — accessibility: focus, skip link, flashcard content, colour-only signals (2026-07-31)

**Critical**

- Skip link (`<a href="#app">`) no longer ejects users mid-test. Activating it fired a `popstate`; the hash router treated `#app` as an unknown route and reset the app to home. The skip link now `preventDefault`s and moves focus directly; the popstate listener also now ignores any hash that isn't `''` or `#/...`, closing off this whole class of accidental-navigation-via-hash-fragment
- Focus tracking for real navigation. Previously focus moved to `<main>` only on Back/Forward — every click-driven navigation replaced `app.innerHTML` and silently dropped focus to `<body>`. `render()` (`src/main.js`) now compares a route key (`[view, index, disabilities category, legal category]`) on every call to tell a real navigation apart from an in-place re-render, and moves focus to the destination route's own `<h1>` on navigation while preserving focus and caret position on in-place re-renders (chat send, card flip, toggle)
- Flashcard content is no longer hidden from screen readers. The card was a `<button>` whose `aria-label` replaced its entire text content, so the tag, front, and back text were never exposed. It's now a plain container; the existing `#flip-card` button remains the sole keyboard control — not a WCAG 2.1.1 keyboard-access regression

**Serious**

- The AI-confidence `<summary>` on every provenance card no longer overrides its own visible label with `aria-label` — that hid the confidence level from screen readers and failed WCAG 2.5.3 (Label in Name) for speech-input users. The visible text is now the accessible name; a disambiguating item label is appended via `.sr-only`
- The disabilities and legal reference detail routes (`#/disabilities/<id>`, `#/legal/<id>`) gained a real, visible `<h1>` — they previously had none, so nothing meaningful ever received focus on navigation into them
- Revealed answer choices are genuinely inert. They previously used `aria-disabled="true"` while remaining natively focusable and operable — a lying disabled state. They're now inside a `<fieldset disabled>`, which is truthfully non-interactive; the "your answer" / "correct answer" state that native `disabled` strips from the accessibility tree is restored as visually-hidden text on the affected choice(s)
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

[Unreleased]: https://github.com/USER/REPO/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/USER/REPO/releases/tag/v0.1.0
