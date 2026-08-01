# CPACC Practice Test

**Live: [https://cpacc-test-maker.pages.dev](https://cpacc-test-maker.pages.dev)**

[![Live on Cloudflare Pages](https://img.shields.io/badge/live-cpacc--test--maker.pages.dev-orange)](https://cpacc-test-maker.pages.dev)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![WCAG 2.2 AA target](https://img.shields.io/badge/WCAG-2.2%20AA%20target-blue.svg)](#accessibility)
[![Zero deps](https://img.shields.io/badge/runtime-zero%20deps-success)](#zero-runtime-dependencies)
[![AI transparency](https://img.shields.io/badge/AI%20transparency-IBM%20FactSheet%20style-9cf)](AI_TRANSPARENCY.md)

A study tool for the **IAAP Certified Professional in Accessibility Core Competencies (CPACC)** credential.

- Weighted practice tests matched to the BoK domain mix (40 / 40 / 20)
- Bear-notes-derived practice + flashcards (if you, like the author, take notes in Bear)
- Missed-question focused review
- 71-condition human disabilities reference with prevalence + accessibility solutions
- 53-item history / laws / standards reference in CPACC scope (61 total in the underlying dataset — see [`data/README.md`](data/README.md))
- Optional AI chat tutor (per-question and free-form), backed by Anthropic, OpenAI, or a local model you run yourself
- **Every AI-touched piece of content carries an [IBM-style provenance badge](AI_TRANSPARENCY.md) with confidence + sources + limitations.**

> Built for myself, opened up because it might help others. The audience is intentionally mixed — solo students, a11y professionals (rightly skeptical of AI), AI folks curious about accessibility, and experienced a11y engineers who'd want to fix things. Each group's needs shaped a different part of the project.

---

## Who this is for

| If you are | Start here |
|---|---|
| **Studying for CPACC yourself** | [Run it locally](#run-it-locally), then read [How sampling works](#how-sampling-works) |
| **An a11y professional curious about the AI claims** | Read [`AI_TRANSPARENCY.md`](AI_TRANSPARENCY.md) first — every content bucket, source, review status, and limitation is documented. Then [`ACCESSIBILITY.md`](ACCESSIBILITY.md) for the conformance statement. |
| **An a11y engineer who wants to audit / contribute** | Skim [`ARCHITECTURE.md`](ARCHITECTURE.md), then [`CONTRIBUTING.md`](CONTRIBUTING.md) and [`src/README.md`](src/README.md) |
| **Deploying your own copy** | [`DEPLOY.md`](DEPLOY.md) — Cloudflare Pages (recommended) or local Node |
| **AI-curious, not an a11y specialist** | Read the [AI section](#how-ai-is-used) below, then poke around |
| **Reporting a security issue** | [`SECURITY.md`](SECURITY.md) |
| **Asking a support question** | [`SUPPORT.md`](SUPPORT.md) |

---

## Run it locally

**Prerequisite:** Node.js ≥ 18 (CI runs Node 20; `jsdom` 24 requires ≥ 18, and the LLM helper's use of `AbortSignal.timeout` requires ≥ 16.14).

Two deploy modes (full instructions in [`DEPLOY.md`](DEPLOY.md)):

### Quick local

```bash
# (Optional) Enable the chat tutor. Pick one provider:

# Anthropic
export LLM_PROVIDER=anthropic
export LLM_API_KEY=sk-ant-...

# OpenAI
export LLM_PROVIDER=openai
export LLM_API_KEY=sk-...

# A local OpenAI-compatible server (LM Studio, Ollama, llama.cpp, vLLM) — no key needed
export LLM_PROVIDER=local
export LLM_BASE_URL=http://127.0.0.1:1234/v1
export LLM_MODEL=qwen/qwen3.6-35b-a3b

node server.js
```

`LLM_MODEL` is optional everywhere; each provider has a default (`claude-sonnet-4-6`, `gpt-4o-mini`, `qwen/qwen3.6-35b-a3b`). `LLM_MAX_TOKENS` is optional too — it overrides the per-provider answer budget (1024 for the cloud providers, 3000 for `local`, which needs room for a reasoning model's hidden thinking tokens). Existing `ANTHROPIC_API_KEY` / `OPENAI_API_KEY` setups keep working without changes.

The server prints both URLs on startup:

```
CPACC test app running:
  Local:  http://localhost:8787
  LAN:    http://192.168.1.100:8787  (open this on your phone — same Wi-Fi)
```

Open `Local:` on your laptop and `LAN:` on your phone — both share the same missed-questions list via a server-side `data.json`.

Without a configured provider, everything works *except* the chat tutor.

`LLM_PROVIDER=local` only works when *you* are running the server (`node server.js`, or `npm run dev:cf` on your own machine). Cloudflare Pages Functions execute on Cloudflare's edge network and cannot reach `localhost`, a LAN address, or a Tailscale `100.x` address. See [`DEPLOY.md`](DEPLOY.md#using-a-local-model).

### Cloudflare Pages (public deploy)

The author's deploy lives at **https://cpacc-test-maker.pages.dev** (chat currently disabled).

For your own deploy, see [`DEPLOY.md`](DEPLOY.md#option-a--cloudflare-pages-recommended-for-public-hosting). Once set up, `npm run deploy` stages, tests, and ships in one command.

---

## How AI is used

**Short version:** every AI-touched piece of content has a visible badge near it that tells you exactly what generated it, what it was trained on / cited from, whether a human reviewed it, and how much you should trust it.

**Three categories, three labels:**

| Category | What it is | Confidence | Examples |
|---|---|---|---|
| 🤖 **AI-authored from BoK** | Claude wrote it directly from a citable primary source; author reviewed against the citation | High | Main practice questions (`data/questions.js`), laws & standards reference |
| 🤖 **AI-derived from author's notes** | Claude generated it from the author's personal study notes (one step removed from primary sources) | Medium | Bear-notes practice bank, flashcards, disabilities reference |
| 🤖 **AI live response** | The configured provider answers your chat message in real time; not pre-reviewed | Variable | Per-question chat tutor, home-page tutor chat |

Click any badge in the app to see the full provenance card (source, model, generated date, human review, confidence, limitations). The home-page footer has an **"About AI in this app"** link that opens the page-level explainer.

**The long version:** [`AI_TRANSPARENCY.md`](AI_TRANSPARENCY.md). Read it. Especially if you're skeptical — that's the audience it's written for.

---

## What's in it

| Feature | Detail |
|---|---|
| Weighted practice test | 20 questions per session, weighted to BoK domain mix (8 / 8 / 4) |
| Bear-notes practice | Same format, separate bank from author's notes |
| Missed-question practice | Focused review; missed list persists per-browser (and cross-device on the LAN deploy) |
| Bear-notes flashcards | 50 dense study cards distilled from notes |
| Human disabilities reference | 71 conditions × 9 categories, prevalence + accessibility solutions |
| History / laws / standards | 53 CPACC-relevant items × 7 jurisdictions shown in the app (61 total in `data/legal.js`; 8 are kept in the dataset but excluded from rendering), plus a timeline view |
| Per-question chat tutor | Click "Discuss this question with the AI tutor" — gets question + BoK rationale as context |
| Home-page chat tutor | Free-form CPACC chat |
| Accessibility | Targets WCAG 2.2 AA, partially conformant; see the in-app [Accessibility statement](https://cpacc-test-maker.pages.dev/#/accessibility) and [Accessibility](#accessibility) below |

---

## How sampling works

Each weighted practice test draws 20 questions matched to the BoK domain mix:

- Domain 1 (Disabilities & AT) — **40%** → 8 questions
- Domain 2 (Accessibility & UD) — **40%** → 8 questions
- Domain 3 (Standards, Laws & Mgmt) — **20%** → 4 questions

Bear practice uses the same sampling against the Bear bank. Retakes reshuffle.

The actual CPACC exam is **100 multiple-choice questions in 2 hours** (~72 sec/question, ~70% pass). This app is a study tool, not a length-accurate mock.

---

## Accessibility

Targets **WCAG 2.2 AA**. Notable contracts (enforced by `tests/views.test.js`):

- Semantic HTML before ARIA (`<button>`, real `<input>`, `<h1>`–`<h6>`, `<main>`)
- Skip link → `<main tabindex="-1">` for keyboard users
- Browser Back/Forward, and every click-driven navigation, move focus to the destination route's own `<h1>` and update `document.title`; in-place re-renders (chat send, card flip, a toggle) preserve focus and caret position instead
- Skip link intercepts its own click so it can't be misread as an unknown route and bounce you back to home mid-test
- One H1 per view, H2 sub-headings, no skipped levels
- Visible focus indicator on every focusable element (3px amber)
- Color contrast: text ≥ 4.5:1, UI components ≥ 3:1 — audited across every pair in the app, see [`ACCESSIBILITY.md`](ACCESSIBILITY.md)
- Color never the sole channel (confidence pills pair color + shape + text; chat speaker identity, the jump grid, and the current-question cell all have a non-color cue too)
- Answer choices are native radio inputs in a `<fieldset>`; visible hint adapts to touch vs keyboard via `(pointer: coarse)`; revealed choices sit in a genuinely-`disabled` fieldset, not a lying `aria-disabled`
- Announcements (verdict, chat replies/errors) go through one of two persistent, static live regions that survive DOM rewrites — `#route-status` (polite) or `#route-alert` (assertive), picked by `announce()` rather than mutated per call
- Decorative emoji `aria-hidden="true"`
- `prefers-reduced-motion: reduce` honored for scroll behavior
- AI provenance disclosure uses native `<details>`/`<summary>` (zero JS, mobile-friendly, implicit `aria-expanded`)
- AI-info dialog is a native `<dialog>` with focus return on close

Beyond the jsdom contracts above, an end-to-end suite (`npm run test:e2e`, Playwright) drives the app in real Chromium, Firefox, and WebKit — real layout, real computed styles, real focus rings, real Tab order, and automated `axe-core` scans against a real accessibility tree, none of which jsdom can check. See [`ACCESSIBILITY.md`](ACCESSIBILITY.md) for what it found, including two documented WebKit-specific behavioural differences, and for what's still open (manual screen reader testing of the current version is the biggest gap and remains undone).

Every UI change in this repo went through accessibility-lead review before merging. See [`CONTRIBUTING.md`](CONTRIBUTING.md#accessibility-expectations) if you want to contribute.

---

## Zero runtime dependencies

The runtime is plain browser + plain Node + Cloudflare Workers runtime. No bundler, no transpiler, no React, no Vue. You can read every file in one sitting. That's the point.

```bash
node server.js   # works out of the box, no install
```

The only dependencies are `jsdom`, `@playwright/test`, and `@axe-core/playwright` for the test suites — and only if you want to run tests:

```bash
npm install      # dev dependencies only
npm test         # jsdom suite
npm run test:e2e # Playwright suite (real browsers)
```

---

## Project layout

```
test-maker/
├── index.html                 # Page shell — skip link, home button, <main>, script tag
├── styles/app.css             # All styles, organized into 10 commented sections
├── server.js                  # Local Node http server: static files + /chat + /missed
├── functions/                 # Cloudflare Pages Functions
│   ├── chat.js                #  POST /chat (per-question)
│   ├── chat-general.js        #  POST /chat-general (home tutor)
│   ├── chat-status.js         #  GET /chat-status
│   ├── _lib/llm.js            #  shared provider-agnostic LLM helper (anthropic | openai | local)
│   └── _routes.json
├── src/
│   ├── main.js                # Entry: wires data + state + actions + render loop
│   ├── state.js               # Single mutable state factory
│   ├── router.js              # Pure hash-path <-> state mapping (Back/Forward)
│   ├── storage.js             # Missed-set persistence (server + localStorage fallback)
│   ├── chat.js                # Fetch wrappers for the chat endpoints
│   ├── sampling.js            # Pure: shuffle, sampleQuestions, sampleMissedQuestions
│   ├── scoring.js             # Pure: scoreTest, domainLabel
│   ├── provenance.js          # IBM-style AI transparency badge + dialog
│   ├── dom.js                 # Tiny helpers: escapeHtml, scrollIntoViewMotionSafe
│   └── views/
│       ├── home.js            # Home (test launchers + home chat)
│       ├── question.js        # Practice question + jump grid
│       ├── results.js         # Final score + per-question review + chats
│       ├── flashcards.js      # Bear flashcards
│       ├── disabilities.js    # Disabilities reference
│       ├── legal.js           # Laws & standards reference
│       ├── accessibility.js   # Accessibility statement (#/accessibility)
│       └── chat.js            # Per-question chat fragment (shared)
├── data/
│   ├── questions.js           # Main CPACC bank + CPACC_BANK_PROVENANCE
│   ├── bear-questions.js      # Bear-derived bank + BEAR_BANK_PROVENANCE
│   ├── bear-flashcards.js     # Flashcards + BEAR_FLASHCARDS_PROVENANCE
│   ├── disabilities.js        # 71 conditions × 9 categories + DISABILITIES_PROVENANCE
│   └── legal.js               # 61 laws/standards × 7 jurisdictions (53 rendered, see cpacc filter in src/views/legal.js) + LEGAL_PROVENANCE
├── tests/
│   ├── run.js                 # Runner — discovers + executes every *.test.js
│   ├── sampling.test.js       # Unit tests for sampling logic
│   ├── scoring.test.js        # Unit tests for scoring
│   ├── storage.test.js        # Unit tests for missed-set persistence
│   ├── llm.test.js            # Unit tests for provider resolution + wire formats
│   ├── router.test.js         # Unit tests for the hash-path <-> state router
│   └── views.test.js          # jsdom DOM tests for view accessibility contracts
├── e2e/                        # Playwright: real Chromium/Firefox/WebKit
│   ├── smoke.spec.js
│   ├── navigation.spec.js     # Tab order, click-driven focus, Back/Forward
│   ├── focus-contract.spec.js # Focus-ring-on-programmatic-focus, per engine
│   ├── motion-and-live-region.spec.js
│   └── axe.spec.js            # axe-core scans across every route
├── playwright.config.js       # e2e config: 3 browser projects, retries in CI
├── ARCHITECTURE.md            # How the code fits together
├── AI_TRANSPARENCY.md         # Detailed AI provenance and limitations doc
├── DEPLOY.md                  # Cloudflare Pages + local Node deploy guides
├── CONTRIBUTING.md            # How to contribute (a11y expectations, PR checklist)
├── LICENSE                    # MIT
└── package.json               # devDeps only (jsdom, Playwright, axe-core)
```

---

## Tests

```bash
npm install      # one-time: pulls jsdom, Playwright, and axe-core
npm test         # jsdom suite — runs everything, no browser needed
```

Expect 151+ passing.

The jsdom suite is intentionally split into layers:

- **Data smoke** (inline) — every dataset is well-formed, IDs unique, provenance present
- **Unit tests** — `sampling`, `scoring`, `storage` (mocked fetch + localStorage), `llm` (provider resolution + per-provider wire format), `router` (hash-path ↔ state round-tripping and fallbacks)
- **DOM smoke** — `views` (jsdom) asserts the accessibility contracts of every view

`tests/views.test.js` is the regression guard. If you change a view, every contract there must still hold.

There's also an end-to-end suite for what jsdom structurally can't check:

```bash
npm run test:e2e   # Playwright — real Chromium, Firefox, and WebKit
```

126 tests across 5 projects — chromium, firefox, webkit, a 320px mobile viewport, and a chat-enabled project — covering real layout, computed styles, focus rings, Tab order, scroll position, horizontal-overflow (reflow) checks, and automated `axe-core` accessibility scans against a real accessibility tree. See [`tests/README.md`](tests/README.md#end-to-end-tests-e2e) for the jsdom/e2e division of labour, and [`ACCESSIBILITY.md`](ACCESSIBILITY.md) for what it found.

---

## Contributing

PRs welcome. The bar:

1. Tests pass (`npm test`)
2. Any UI change goes through the accessibility checklist (see [`CONTRIBUTING.md`](CONTRIBUTING.md#accessibility-expectations))
3. Commit messages explain *why*, not just *what*

If you're correcting a wrong answer, use the [Wrong answer issue template](.github/ISSUE_TEMPLATE/wrong-answer.yml) to give the maintainer the source they need to verify.

If you find an accessibility issue, please report it — those get triaged first. Email [tawsif@perenniala11y.com](mailto:tawsif@perenniala11y.com), the channel disclosed in the in-app [accessibility statement](https://cpacc-test-maker.pages.dev/#/accessibility). This repo has no public git remote yet, so the [accessibility issue template](.github/ISSUE_TEMPLATE/accessibility.yml) isn't a reachable channel for anyone outside this machine — it's the intended contributor format once the project has one.

---

## Why does this exist

I built it to study. I opened it because (a) someone else might find it useful, (b) experienced a11y folks would have valid feedback, and (c) I wanted a public, auditable example of how to integrate AI into a study tool *without* hiding the AI provenance behind a vague label.

The code, the AI choices, the tests, and the docs are all answerable to that goal. If something doesn't measure up, please open an issue or send a PR.

---

## License

MIT — see [`LICENSE`](LICENSE).

Not affiliated with or endorsed by IAAP. CPACC is a trademark of the International Association of Accessibility Professionals.
