# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html) starting at v0.1.0.

## [Unreleased]

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
