# Deploy guide

The app supports two deploy modes. Pick whichever matches your needs.

## Option A — Cloudflare Pages (recommended for public hosting)

A static site + serverless Functions for the chat proxy. Free tier covers small personal deploys.

### One-time setup

1. **Fork or push this repo to GitHub** (or GitLab — Pages supports both).
2. In the [Cloudflare dashboard](https://dash.cloudflare.com/), go to **Workers & Pages → Create application → Pages → Connect to Git**.
3. Select your repo. On the build settings page:
   - **Framework preset:** None
   - **Build command:** *(leave blank — no build step)*
   - **Build output directory:** `/`
   - **Root directory:** *(leave blank)*
4. Click **Save and Deploy**. The first deploy will succeed with chat disabled.

### Enabling the chat tutor

Chat is **off by default** on Cloudflare. To enable it:

1. In the Pages project settings → **Environment variables**, add:

   | Variable | Value | Type |
   |---|---|---|
   | `LLM_PROVIDER` | `anthropic` or `openai` | Plain text |
   | `LLM_API_KEY` | your provider key (`sk-ant-…` / `sk-…`) | **Encrypted** |
   | `LLM_MODEL` *(optional)* | e.g. `claude-sonnet-4-6`, `gpt-4o-mini` | Plain text |
   | `LLM_BASE_URL` *(optional)* | endpoint override; must be reachable from the public internet | Plain text |
   | `LLM_MAX_TOKENS` *(optional)* | answer-budget override; defaults to 1024 for the cloud providers | Plain text |

2. Set them for the **Production** environment (and Preview if you want PR previews to have chat).
3. Trigger a redeploy. Chat will appear in the UI when the `/chat-status` function reports `enabled: true`.

If `LLM_PROVIDER` is unset it is auto-detected: `LLM_BASE_URL` set → `local`, else `ANTHROPIC_API_KEY` → `anthropic`, else `OPENAI_API_KEY` → `openai`. `LLM_API_KEY` falls back to `ANTHROPIC_API_KEY` / `OPENAI_API_KEY`, so an existing deploy keeps working untouched.

⚠️ **`LLM_PROVIDER=local` does not work on Cloudflare.** Pages Functions run on Cloudflare's edge network, not on your machine. They cannot reach `localhost`, a LAN address, or a Tailscale `100.x` address. Use `local` only with `node server.js` (Option B), or point `LLM_BASE_URL` at an endpoint that is genuinely reachable from the public internet.

⚠️ **Cost note:** Every visitor to your public deploy can use chat, billed to your configured provider account. If that's not what you want, either keep chat disabled or [add basic auth via a Pages Function middleware](https://developers.cloudflare.com/pages/functions/middleware/).

### What works and what doesn't on Cloudflare

| Feature | Cloudflare Pages |
|---|---|
| Practice tests, flashcards, references | ✅ All work |
| Chat tutor (per-question + home) | ✅ With env var set |
| Missed-question list | ✅ Per-browser (localStorage) |
| **Cross-device missed sync** | ❌ Not supported (would need Workers KV — see issue tracker) |

### Deploying from the CLI (recommended)

Once the Pages project exists, deploys are one command:

```bash
npm install          # one-time: dev deps for tests
npm run deploy       # runs tests → stages dist/ → wrangler pages deploy
```

What `npm run deploy` does:

1. Runs the test suite (`node tests/run.js`) — fails fast if anything is broken
2. Stages a clean `dist/` folder via `scripts/build-dist.sh` — only the files the runtime needs (no `CPACC_BoK.pdf`, no `data.json`, no `tests/`, no `node_modules/`)
3. Runs `wrangler pages deploy dist`

Related scripts:

- `npm run build` — stage `dist/` without deploying (useful before `wrangler pages dev`)
- `npm run deploy:preview` — deploy to a preview branch (won't update production)
- `npm run dev:cf` — local Cloudflare Pages preview at `http://localhost:8788`

### First-time project setup

If the Pages project doesn't exist yet:

```bash
wrangler login   # browser-based OAuth
wrangler pages project create cpacc-test-maker --production-branch=main
npm run deploy
```

Wrangler prints the deployment URL when it finishes (something like `https://cpacc-test-maker.pages.dev`).

### Local preview before deploying

```bash
npm run dev:cf

# If you want chat to work in the local preview, set the provider first:
LLM_PROVIDER=anthropic LLM_API_KEY=sk-ant-... npm run dev:cf
LLM_PROVIDER=openai    LLM_API_KEY=sk-...     npm run dev:cf
LLM_PROVIDER=local     LLM_BASE_URL=http://127.0.0.1:1234/v1 npm run dev:cf
```

`local` works here because `wrangler pages dev` runs on your machine. It will *not* work once the same config is deployed to Cloudflare.

Visit `http://localhost:8788`.

## Option B — Local Node server (best for LAN cross-device sync)

The original deploy mode. One machine on your network runs `node server.js`; your phone and laptop both hit the LAN URL and share a missed-question list via a server-side `data.json`.

```bash
# 1. (Optional) Enable chat — pick one provider

# Anthropic
export LLM_PROVIDER=anthropic
export LLM_API_KEY=sk-ant-...
export LLM_MODEL=claude-sonnet-4-6      # optional

# OpenAI
export LLM_PROVIDER=openai
export LLM_API_KEY=sk-...
export LLM_MODEL=gpt-4o-mini            # optional

# Local model (no key needed)
export LLM_PROVIDER=local
export LLM_BASE_URL=http://127.0.0.1:1234/v1
export LLM_MODEL=qwen/qwen3.6-35b-a3b   # optional
export LLM_MAX_TOKENS=3000              # optional (this is the local default)

# 2. Start the server
node server.js
```

The server prints both URLs:

```
CPACC test app running:
  Local:  http://localhost:8787
  LAN:    http://192.168.1.100:8787  (open this on your phone — same Wi-Fi)
```

Open the LAN URL on your phone. Both devices read and write the same `data.json` (gitignored). Missed questions sync between them.

⚠️ **Security note:** no auth means anyone on your Wi-Fi can hit the app. Home Wi-Fi: fine. Coffee shop: don't run it without adding a token check in `server.js`.

### Local development tips

- The server serves any file under the project root with a permissive `..`-traversal guard. Nothing fancy.
- Both `/chat` and `/chat-general` go through the same `functions/_lib/llm.js` helper the Cloudflare Functions use (`server.js` loads it via a dynamic `import()`), so the two deploy modes behave identically and the client code doesn't change.
- `data.json` is created on first missed-question write. Delete it to wipe the shared list.

## Using a local model

`LLM_PROVIDER=local` points the tutor at any OpenAI-compatible server you run yourself: LM Studio, Ollama, llama.cpp, vLLM. Same wire format as `openai`, with the API key optional.

```bash
export LLM_PROVIDER=local
export LLM_BASE_URL=http://127.0.0.1:1234/v1   # default
export LLM_MODEL=qwen/qwen3.6-35b-a3b          # default
export LLM_MAX_TOKENS=3000                     # default for local
node server.js
```

### The reasoning-model token budget (read this before you debug an empty reply)

Reasoning/thinking-capable local models spend their token budget on hidden reasoning *before* they emit a single visible character. Measured against the default `qwen/qwen3.6-35b-a3b`, a simple question burned roughly 1,300 reasoning tokens on its own. Hand that model a cloud-sized 1024-token budget and it gets truncated mid-thought and returns an empty reply — the request looks successful right up until there's nothing to render.

That's why `local` defaults to 3000 tokens while `anthropic` and `openai` default to 1024. If a bigger or chattier reasoning model still comes back empty, raise `LLM_MAX_TOKENS` (it overrides the per-provider budget; non-numeric or `<= 0` values fall back to the default) or switch to a non-reasoning model. The 502 error text names the limit that was hit, so you don't have to guess.

### Pick a model that's actually right

Small models are confidently wrong, which is worse than slow. `qwen2.5-7b-instruct` — the previous default — listed the four WCAG principles as "Perceivable, Understandable, Robust, and Semantically Correct": it invented one and dropped Operable. The larger default answers correctly. For a study tool, accuracy beats latency.

Notes:

- **This only works when you run the server yourself** (`node server.js`, or `npm run dev:cf` on your own machine). Cloudflare Pages Functions execute on Cloudflare's edge network and cannot reach `localhost`, a LAN address, or a Tailscale `100.x` address. The deployed site can only use a local model if `LLM_BASE_URL` points at an endpoint reachable from the public internet.
- Chat messages never leave your machine or network with `local`. With `anthropic` or `openai`, they are sent to that vendor.
- Local requests get a 120s timeout (cold model load); cloud providers get 60s.
- `<think>…</think>` scratchpads from local reasoning models are stripped before the reply reaches the browser.

## Comparing the two

|  | Cloudflare Pages | Local Node server |
|---|---|---|
| Hosting cost | Free tier (≥500 builds/mo) | Your laptop's electricity |
| Public access | Yes (HTTPS via CF edge) | LAN only |
| Cross-device missed sync | No | Yes |
| Chat tutor | Yes (env-var gated) | Yes (env-var gated) |
| Local model (`LLM_PROVIDER=local`) | No (edge can't reach your network) | Yes |
| Best for | Sharing with others, ongoing study | Solo phone + laptop study at home |

You can use both: develop locally, deploy publicly.

## Self-hosting other ways

The static files (`index.html`, `styles/`, `src/`, `data/`) work behind any static host (nginx, Vercel, GitHub Pages, S3, ...). The chat features just need a server that can proxy `POST /chat`, `POST /chat-general`, and serve `GET /chat-status` returning JSON.

Adapter PRs are welcome.
