# Contributing to CPACC Practice Test

Thanks for your interest. This project is small and pragmatic — you can read every file in one sitting. Here's what you need to know.

**Also read:**
- [`ARCHITECTURE.md`](ARCHITECTURE.md) — how the code fits together
- [`AI_TRANSPARENCY.md`](AI_TRANSPARENCY.md) — how AI is labeled in the UI and why
- [`DEPLOY.md`](DEPLOY.md) — Cloudflare Pages + local Node deploy guides

## Code of conduct

Be kind. We're studying accessibility — practice it in interactions, too.

## Project layout

```
test-maker/
├── index.html              # Page shell — skip link, home button, <main>, script tag
├── server.js               # Node http server: serves the app, /chat proxy, /missed persistence
├── styles/app.css          # All styles, organized into commented sections
├── src/
│   ├── main.js             # Entry: imports data + modules, defines actions, runs the render loop
│   ├── state.js            # The shared mutable state object factory
│   ├── router.js           # Pure hash path <-> state mapping (Back/Forward support)
│   ├── storage.js          # Missed-question persistence (server + localStorage)
│   ├── chat.js             # Fetch wrappers for the chat endpoints
│   ├── sampling.js         # Pure: shuffle, sampleQuestions, sampleMissedQuestions
│   ├── scoring.js          # Pure: scoreTest, domainLabel
│   ├── dom.js              # Tiny helpers: escapeHtml, scrollIntoViewMotionSafe
│   └── views/
│       ├── home.js         # Home page (test launchers, home chat)
│       ├── question.js     # Per-question practice view + jump grid
│       ├── results.js      # Final results + per-question review
│       ├── flashcards.js   # Bear-notes flashcards
│       ├── disabilities.js # Human-disabilities reference
│       ├── legal.js        # History/laws/standards reference
│       ├── accessibility.js # Accessibility statement (#/accessibility)
│       └── chat.js         # Per-question chat fragment (shared)
├── data/
│   ├── questions.js        # Main CPACC bank
│   ├── bear-questions.js   # Bear-notes-derived bank
│   ├── bear-flashcards.js  # Bear-notes flashcards
│   ├── disabilities.js     # 71 conditions × 9 categories
│   └── legal.js            # 61 laws/standards × 7 jurisdictions (53 rendered — see the cpacc filter in src/views/legal.js)
└── tests/
    ├── run.js              # Test runner — discovers + runs every *.test.js
    ├── sampling.test.js    # Unit tests for the sampling module
    ├── scoring.test.js     # Unit tests for scoring
    ├── storage.test.js     # Unit tests for missed-set persistence (mocked fetch)
    ├── llm.test.js         # Unit tests for provider resolution + per-provider wire format
    ├── router.test.js      # Unit tests for the hash-path <-> state router
    └── views.test.js       # jsdom DOM tests asserting view accessibility contracts
```

## Running locally

```bash
# 1. (Optional) For the chat tutor, pick one provider:
export LLM_PROVIDER=anthropic && export LLM_API_KEY=sk-ant-...
export LLM_PROVIDER=openai    && export LLM_API_KEY=sk-...
export LLM_PROVIDER=local     && export LLM_BASE_URL=http://127.0.0.1:1234/v1   # no key needed

# 2. Start the server:
node server.js
```

`LLM_MODEL` is optional; each provider has a default. `local` is any OpenAI-compatible server you run yourself (LM Studio, Ollama, llama.cpp, vLLM) and works only under `node server.js` or a local `wrangler pages dev` — never on the deployed Cloudflare site, whose Functions run on the edge and cannot reach your network. Full matrix in [`DEPLOY.md`](DEPLOY.md).

The server prints both the local and LAN URLs on startup. Open the LAN URL on your phone to test cross-device.

**Runtime dependencies: none.** The runtime is plain Node + browser.

**Dev dependencies (tests only):**

```bash
npm install
```

Installs `jsdom` for the DOM smoke tests, plus `@playwright/test` and `@axe-core/playwright` for the end-to-end suite (real Chromium/Firefox/WebKit). `package-lock.json` is committed, so `npm ci` gives a reproducible install with the pinned integrity hash.

**Prerequisite:** Node.js ≥ 18 (CI pins Node 20; `jsdom` 24 needs ≥ 18).

## Running tests

```bash
node tests/run.js
# or
npm test
```

Expect to see "131/131 passed" (or whatever the current count is). Every PR must keep tests green.

There's also an end-to-end suite that a jsdom run can't cover — real layout, computed styles, focus rings, Tab order, and `axe-core` scans against a real accessibility tree:

```bash
npm run test:e2e   # Playwright — real Chromium, Firefox, and WebKit
```

See [`tests/README.md`](tests/README.md#end-to-end-tests-e2e) for what it covers and the jsdom/e2e division of labour.

## Adding a new practice question

1. Open `data/questions.js` (main bank) or `data/bear-questions.js` (notes-derived bank).
2. Append a new item using the shape below. IDs must be unique across both banks (the smoke tests will fail if they collide).

```js
{
  id: 9999,
  domain: 1,                    // 1 | 2 | 3 (per the CPACC BoK)
  type: "application",          // "recall" | "application" | "analysis"
  q: "Question text…",
  choices: { A: "…", B: "…", C: "…", D: "…" },
  answer: "B",
  why: { A: "why wrong…", B: "why right…", C: "…", D: "…" },
  cite: "BoK p.42"
}
```

3. Run `node tests/run.js` to verify your addition is well-formed.

## Accessibility expectations

This app targets **WCAG 2.2 AA** and is **partially conformant** — see [`ACCESSIBILITY.md`](ACCESSIBILITY.md) for the full conformance statement and known limitations (manual screen reader testing of the current version is the biggest open gap). Every PR that touches UI must preserve:

- Semantic HTML before ARIA (`<button>`, `<input>`, `<h1..h6>`, `<main>`)
- One H1 per view; H2 sub-headings; no skipped levels
- Visible focus indicator on every focusable element (3px amber via `--focus-ring`)
- Color contrast: text ≥ 4.5:1; UI components ≥ 3:1
- Information never conveyed by color alone (icons paired with text where status matters)
- Skip link → focusable `<main>`
- Answer choices are native `<input type="radio">` elements grouped in a `<fieldset>`/`<legend>` — no roving-tabindex pattern, no custom tabindex management; Tab into the group and Arrow keys within it are the browser's native radio-group behavior
- Live regions only where announcement is the goal — no dueling polite regions
- Decorative emoji wrapped in `<span aria-hidden="true">`
- `prefers-reduced-motion: reduce` honored for scroll behavior

The DOM tests in `tests/views.test.js` enforce many of these contracts. Add an assertion when introducing a new pattern.

## Pull request checklist

- [ ] `node tests/run.js` passes
- [ ] No new runtime dependencies (devDeps for tests are fine)
- [ ] Changes touched only files relevant to the stated goal
- [ ] If you added or modified a view, run through the app keyboard-only (Tab + arrow keys + Enter) and confirm focus order
- [ ] If you added new strings, run through a quick screen-reader pass (VoiceOver on macOS: Cmd+F5)
- [ ] Commit messages explain *why*, not just *what*

## Filing an issue

Use the issue templates in `.github/ISSUE_TEMPLATE/`:

- **Bug** (`bug.yml`) — something broken
- **Wrong answer** (`wrong-answer.yml`) — a question's marked answer or rationale is incorrect
- **Accessibility** (`accessibility.yml`) — keyboard, screen reader, contrast, or other a11y bugs (these get triaged first)

There's no template for proposing a new question — see "Adding a new practice question" above and open a PR directly.

## License

By contributing you agree your contributions are licensed under the MIT License (see `LICENSE`).
