# Architecture

A one-sitting tour of how the app fits together. Aimed at contributors who want to add a feature, fix a bug, or just understand the codebase before opening a PR.

## Design constraints

1. **Zero runtime dependencies.** The browser loads native ES modules; the local server is plain `node:http`. Cloudflare Pages Functions use the Workers runtime — also no `npm install` needed.
2. **No build step.** What you commit is what runs.
3. **WCAG 2.2 AA, audited.** Every UI change goes through the accessibility-lead review before merging (see `CONTRIBUTING.md`).
4. **AI provenance is visible.** No content is shown without an inline provenance badge (or, for live chat, a permanent banner). See `AI_TRANSPARENCY.md`.

These constraints are what keep the project readable for new contributors. Please respect them, or open an issue arguing for a change before sending a PR that breaks them.

## High-level data flow

```
                    ┌──────────────────────┐
                    │      index.html      │  ← page shell (skip link,
                    │  loads src/main.js   │     home button, <main>)
                    └──────────┬───────────┘
                               │ <script type="module">
                               ▼
                    ┌──────────────────────┐
                    │       main.js        │  ← imports data + provenance,
                    │  • creates state     │     defines actions, runs the
                    │  • defines actions   │     render dispatcher.
                    │  • render() loop     │
                    └────┬────────┬────────┘
                         │        │
                         ▼        ▼
              ┌──────────────┐  ┌──────────────┐
              │   state.js   │  │  storage.js  │ ← missed-set persistence
              │ (mutable     │  │ (server +    │   (server fallback to
              │  bag)        │  │  localStorage)│   localStorage on CF)
              └──────────────┘  └──────────────┘
                         │
                         ▼
        ┌────────────────────────────────────────────┐
        │            src/views/* render funcs        │
        │  home   question   results   flashcards    │
        │  disabilities   legal   chat (fragment)    │
        └────────────────────────────────────────────┘
                         │
                         ▼ data input
              ┌──────────────────────────┐
              │  data/*.js (ES modules)  │
              │  + *_PROVENANCE constants│
              └──────────────────────────┘
```

## The render loop

```js
function render() {
  // wire the home button (lives outside <main>)
  // …
  if (state.legal)          return renderLegal(ctx);
  if (state.disabilities)   return renderDisabilities(ctx);
  if (state.flashcards)     return renderFlashcards(ctx);
  if (state.submitted)      return renderResults(ctx);
  if (state.questions.length === 0) return renderHome(ctx);
  return renderQuestion(ctx);
}
```

Every state mutation calls `render()` again. The dispatcher decides which view applies based on the state shape. This is intentionally simple — there is no router, no virtual DOM, no reactive framework.

## State

A single mutable object created in `src/state.js`. Views never own state; they receive it via `ctx.state` and never mutate it directly — they invoke `ctx.actions.*` callbacks defined in `main.js` that mutate state and call `render()`.

```js
{
  mode:           // "weighted" | "missed" | "bear"
  questions:      // sampled questions for the current test
  answers:        // qid → "A"|"B"|"C"|"D" (committed)
  pending:        // qid → choice (selected but not submitted)
  revealed:       // qid → true once user has seen the answer
  index:          // current question index
  submitted:      // true once test is finalized
  chats:          // per-question chats { qid → {open, history} }
  homeChat:       // home-page chat { history: [...] }
  chatEnabled:    // true if /chat-status reported enabled
  flashcards:     // { cards, index, flipped } when active
  disabilities:   // { view, category } when active
  legal:          // { view, category } when active
}
```

## Views

Each view is a function `renderX(ctx)` that:

1. Builds an HTML string for the entire screen
2. Writes it into `ctx.app.innerHTML` (the `<main>` element)
3. Wires event listeners on the new DOM nodes

There is no diffing — every render replaces the entire `<main>` contents. This is fast enough for the scale (1 question = ~5 KB of HTML) and keeps the code obvious.

When a re-render would lose focus on something the user is interacting with (e.g. the verdict region after Submit answer), the view explicitly captures and restores focus with `requestAnimationFrame(() => el.focus())`.

## Accessibility patterns

The accessibility contracts live in `src/views/*` and `styles/app.css`. Some highlights:

- **Skip link → `<main tabindex="-1">`** so keyboard users skip past the home button.
- **Radio groups** use the WAI-ARIA roving-tabindex pattern (Tab enters, Arrow keys move within). A visible hint above the group explains the pattern for users who don't know it. The hint adapts via `@media (pointer: coarse)` to drop the keyboard sentence on touch devices.
- **Verdict announcement** uses a single `<div id="verdict" tabindex="-1" aria-live="polite">` that receives focus on submit. Only one polite live region per view (a11y-lead caught a "dueling live regions" bug in the original monolith).
- **Revealed radios** use `aria-disabled="true"` not native `disabled` — keyboard users can still navigate to review their choices.
- **`prefers-reduced-motion`** is honored in `scrollIntoViewMotionSafe()` (used by the results jump grid and reference anchor bars).
- **Decorative emoji** are wrapped in `<span aria-hidden="true">` everywhere.
- **AI provenance badges** use native `<details>/<summary>` for zero-JS disclosure. Confidence pills use a paired color + shape glyph + text to satisfy WCAG 1.4.1 (Use of Color).

## Provenance

Every dataset exports a `*_PROVENANCE` constant alongside the data. `src/provenance.js` exports:

- `renderProvenanceBadge(prov, itemLabel)` — inline badge with collapsible card
- `renderChatProvenanceBanner()` — static banner above chat transcripts
- `renderAiInfoDialog()` + `installAiInfoDialog()` — the page-level "About AI in this app" modal

See `AI_TRANSPARENCY.md` for the full rationale and per-bucket details.

## Server / Functions

Two parallel server implementations cover the two deploy modes:

| Endpoint | Local (`server.js`) | Cloudflare (`functions/`) |
|---|---|---|
| `GET /chat-status` | inline handler | `functions/chat-status.js` |
| `POST /chat` | inline handler | `functions/chat.js` |
| `POST /chat-general` | inline handler | `functions/chat-general.js` |
| `GET/PUT/DELETE /missed` | inline handler with `data.json` | **not deployed** |

The shared Anthropic call lives in `functions/_lib/anthropic.js` for the CF Functions; `server.js` has its own inline copy because it's CommonJS and the Functions are ESM.

## Tests

```bash
node tests/run.js   # or: npm test
```

The runner discovers every `tests/*.test.js` and calls its exported `run({ test, assertTrue, assertEq })`. Test layers:

| Layer | Files |
|---|---|
| Data smoke tests (inline in `run.js`) | every dataset is well-formed, IDs unique, provenance present |
| Unit tests | `sampling.test.js`, `scoring.test.js`, `storage.test.js` |
| DOM smoke tests (jsdom) | `views.test.js` — asserts every view's accessibility contracts |

54+ tests as of writing; every PR should keep this green.

## Things that look weird and aren't

- **`window.X = ...` in index.html?** Gone. The Phase 2 refactor switched to ES modules. If you find old code referencing `window.CPACC_BANK`, it's a regression — file a bug.
- **No package.json scripts beyond `test` and `start`?** Intentional. No bundler, no linter, no formatter — the goal is readability over tooling.
- **Two server implementations?** Yes — one for local Node dev, one for Cloudflare Functions. They behave identically for the chat endpoints. The local one *also* supports cross-device missed-sync via `data.json`.
- **`<details>` instead of a custom disclosure widget?** Per accessibility-lead recommendation — native semantics + zero JS + works on mobile + has implicit `aria-expanded`. The default disclosure triangle is suppressed via CSS so we can render our own chevron.

## Where to add things

| New feature | Likely files to touch |
|---|---|
| New question | `data/questions.js` (or `data/bear-questions.js`) — append item, ID must be unique across both banks |
| New view | `src/views/new.js` + add a dispatcher branch in `main.js` |
| New chat endpoint | `functions/foo.js` + add a handler in `server.js` for local parity |
| New a11y contract | a `tests/views.test.js` assertion |
| New provenance category | edit `src/provenance.js` (`CONFIDENCE` map, `renderProvenanceBadge`) |
