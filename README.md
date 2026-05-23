# CPACC Practice Test

[![CI](https://github.com/USER/REPO/actions/workflows/ci.yml/badge.svg)](https://github.com/USER/REPO/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![WCAG 2.2 AA](https://img.shields.io/badge/WCAG-2.2%20AA-blue.svg)](#accessibility)

Single-page web app for studying the **IAAP CPACC Body of Knowledge (Oct 2023, v4.0)**. Includes weighted practice tests, study flashcards, a comprehensive human-disabilities reference, a history/laws/standards reference, and an optional Claude-powered tutor chat.

## What's in it

- **Weighted practice test** — 20 questions drawn from a curated CPACC bank, matched to the BoK domain mix (40 / 40 / 20)
- **Bear notes practice** — 20 questions drawn from a separate bank generated from the user's personal `#cpacc` / `#a11y/*` study notes
- **Missed-question practice** — focused review of items missed in any prior session (shared across devices via the server)
- **Bear notes flashcards** — 50 dense study cards distilled from the notes, with prevalence, lists, and key facts
- **Human disabilities reference** — 71 conditions across 9 categories (visual, auditory, speech, motor, neurological, cognitive, psychological, multiple, other), with description, key facts, and accessibility solutions
- **History, laws & standards reference** — 51 CPACC-relevant items grouped by jurisdiction (UN, EU, USA, Canada, Other Nations, Technical Standards, Timeline)
- **Per-question chat tutor** — discuss any practice question with Claude, with the question and BoK rationale provided as context
- **Home-page chat tutor** — free-form CPACC chat from the home page

The app is accessible (**WCAG 2.2 AA conformant** — see _Accessibility_ section).

## Files

| File | Contents |
|---|---|
| `index.html` | The app (single page; all UI and state) |
| `styles/app.css` | All styles, organized into commented sections |
| `server.js` | Minimal Node server: serves the app, proxies chat to the Anthropic API, persists missed-questions |
| `data/questions.js` | Main CPACC question bank, tagged with domain, type, and BoK page citation |
| `data/bear-questions.js` | Question bank generated from the user's Bear-app `#cpacc` / `#a11y/*` notes |
| `data/bear-flashcards.js` | Dense study flashcards distilled from the same notes |
| `data/disabilities.js` | Human-disabilities reference dataset |
| `data/legal.js` | History, laws, and standards reference dataset |
| `tests/run.js` | Node-based smoke tests validating every data file |
| `CPACC_BoK.pdf` | Source document (from accessibilityassociation.org) |

## Run

```bash
# Required only if you want chat tutor features
export ANTHROPIC_API_KEY=sk-ant-...

# Optional: pick a model (default: claude-sonnet-4-6)
export ANTHROPIC_MODEL=claude-opus-4-7

node server.js
```

On startup the server prints the URLs it's reachable at:

```
CPACC test app running:
  Local:  http://localhost:8787
  LAN:    http://192.168.1.42:8787   (open this on your phone — same Wi-Fi)
```

Open `Local:` on your computer and `LAN:` on your phone — both devices share the same missed-questions list.

Without an API key, all features work except the chat tutor.

## Tests

```bash
node tests/run.js
```

Validates that every data file (`questions.js`, `bear-questions.js`, `bear-flashcards.js`, `disabilities.js`, `legal.js`) loads, has expected structure, and has unique IDs. No external dependencies.

## Phone access & shared missed list

- The server binds to all interfaces, so any device on the same Wi-Fi can open the LAN URL.
- Missed questions are persisted server-side in `data.json` (gitignored). Both desktop and phone read/write that file, so a question you miss on one device shows up in the missed list on the other.
- The app uses native ES modules, so it must be served over `http://` (run `node server.js`). Opening `index.html` directly via `file://` is no longer supported — browsers block module loading from the file scheme.

**Security note:** no auth means anyone on the same Wi-Fi can hit your app. Home Wi-Fi: fine. Public Wi-Fi: don't run it without adding a token.

## Sampling

Each weighted practice test draws 20 questions matched to the BoK domain mix:

- Domain 1 (Disabilities & AT) — **40%** → 8 questions
- Domain 2 (Accessibility & UD) — **40%** → 8 questions
- Domain 3 (Standards, Laws & Mgmt) — **20%** → 4 questions

Bear practice tests use the same sampling against the Bear bank. Retakes reshuffle.

## Real exam vs this app

The actual CPACC exam is **100 multiple-choice questions in 2 hours** (~72 sec/question, ~70% pass). This app is a study tool, not a length-accurate mock.

## Growing the question banks

Append items to `CPACC_BANK` in `data/questions.js` or `BEAR_BANK` in `data/bear-questions.js`. Each item:

```js
{
  id: 99,
  domain: 1,                      // 1 | 2 | 3
  type: "application",            // "recall" | "application" | "analysis"
  q: "Question text…",
  choices: { A: "…", B: "…", C: "…", D: "…" },
  answer: "B",
  why: { A: "why wrong…", B: "why right…", C: "…", D: "…" },
  cite: "BoK p.42"
}
```

Item IDs across both banks must be unique. The smoke tests in `tests/run.js` will fail if they collide.

## Accessibility

The app targets **WCAG 2.2 AA conformance**. Highlights:

- All interactive elements are real `<button>` / `<input>` elements (no clickable `<div>`s) — keyboard accessible (SC 2.1.1, 4.1.2)
- Visible focus indicator on every focusable element (SC 2.4.7) — 3px solid amber ring (`--focus-ring`)
- `Skip to main content` link (SC 2.4.1)
- Headings use a proper hierarchy (`<h1>` page / `<h2>` panels / `<h3>` items) (SC 1.3.1, 2.4.6)
- Question choices are wrapped in `role="radiogroup"` with a label (SC 1.3.1)
- Chat logs use `role="log"` + `aria-live="polite"` so screen readers announce new messages (SC 4.1.3)
- Verdict (correct/incorrect) uses `aria-live="polite"` and includes a ✓/✗ marker, not color alone (SC 1.4.1, 4.1.3)
- Border color (`--border`) hits ≥3:1 contrast against all panel backgrounds (SC 1.4.11)
- Target sizes ≥24×24 CSS px (SC 2.5.8)
- `scroll-margin-top` prevents the sticky anchor bar from obscuring focused items (SC 2.4.11)
- Decorative emoji are `aria-hidden="true"` so they don't pollute the accessible name (SC 1.1.1)
- All form inputs have accessible labels (SC 3.3.2)

## Origin of the Bear-derived content

`bear-questions.js`, `bear-flashcards.js`, and parts of `disabilities.js` / `legal.js` were generated from the original author's personal Bear study notes tagged `#cpacc` and `#a11y/*`. The content is paraphrased and reorganized; raw notes are not in this repo.
