# CPACC Practice Test

Single-page web app with a question bank grounded in the **IAAP CPACC Body of Knowledge (Oct 2023, v4.0)**, plus an optional per-question chat tutor powered by the Anthropic API.

## Files

- `index.html` — the app (start → 20 random questions → graded results → per-question chat)
- `questions.js` — bank of CPACC-style items, each tagged with domain, type, and BoK page citation
- `server.js` — minimal Node server: serves the app and proxies chat to the Anthropic API
- `CPACC_BoK.pdf` — the source document (downloaded from accessibilityassociation.org)

## Run

```bash
# Required only if you want the per-question chat feature
export ANTHROPIC_API_KEY=sk-ant-...

# Optional: pick a model (default: claude-sonnet-4-6)
export ANTHROPIC_MODEL=claude-opus-4-7

node server.js
```

On startup the server prints the URLs it's reachable at, e.g.:

```
CPACC test app running:
  Local:  http://localhost:8787
  LAN:    http://192.168.1.42:8787   (open this on your phone — same Wi-Fi)
```

Open the `Local:` URL on this Mac, and the `LAN:` URL on your phone's browser. Both devices share the same missed-questions list (see below).

Without an API key, the test still works — only the "Discuss this question" chat is disabled.

## Phone access & shared missed list

- The server binds to all interfaces, so any device on the same Wi-Fi can open the LAN URL — no passcode, no API key on the phone.
- Missed questions are persisted server-side in `data.json` (in this folder). Both Mac and phone read/write that file, so a question you miss on one device shows up in the missed list on the other.
- If you open `index.html` directly via `file://` (no server), the app still works but falls back to per-browser `localStorage` for the missed list.

**Security note:** no auth means anyone on the same Wi-Fi can hit your app and missed list. Home Wi-Fi: fine. Coffee shop: don't run it there without adding a token.

## Sampling

Each test draws 20 questions weighted to the BoK domain mix:

- Domain 1 (Disabilities & AT) — **40%** → 8 questions
- Domain 2 (Accessibility & UD) — **40%** → 8 questions
- Domain 3 (Standards, Laws & Mgmt) — **20%** → 4 questions

Retakes reshuffle the bank.

## Real exam vs this app

The actual CPACC exam is **100 multiple-choice questions in 2 hours** (~72 sec/question, ~70% pass). This app is a study tool, not a length-accurate mock.

## Growing the bank

Append items to `window.CPACC_BANK` in `questions.js`. Each item:

```js
{
  id: 99,
  domain: 1,                      // 1 | 2 | 3
  type: "application",            // "recall" | "application" | "analysis"
  q: "Question text…",
  choices: { A: "…", B: "…", C: "…", D: "…" },
  answer: "B",
  why: { A: "why wrong…", B: "why right…", C: "…", D: "…" },
  cite: "BoK p.42"                // page in CPACC_BoK.pdf
}
```
