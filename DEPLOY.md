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
   | `ANTHROPIC_API_KEY` | your `sk-ant-…` key | **Encrypted** |
   | `ANTHROPIC_MODEL` *(optional)* | e.g. `claude-opus-4-7` | Plain text |

2. Set them for the **Production** environment (and Preview if you want PR previews to have chat).
3. Trigger a redeploy. Chat will appear in the UI when the `/chat-status` function reports `enabled: true`.

⚠️ **Cost note:** Every visitor to your public deploy can use chat, billed to your Anthropic account. If that's not what you want, either keep chat disabled or [add basic auth via a Pages Function middleware](https://developers.cloudflare.com/pages/functions/middleware/).

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
# In another terminal, if you want chat to work locally:
ANTHROPIC_API_KEY=sk-ant-... npm run dev:cf
```

Visit `http://localhost:8788`.

## Option B — Local Node server (best for LAN cross-device sync)

The original deploy mode. One machine on your network runs `node server.js`; your phone and laptop both hit the LAN URL and share a missed-question list via a server-side `data.json`.

```bash
# 1. (Optional) Enable chat
export ANTHROPIC_API_KEY=sk-ant-...
export ANTHROPIC_MODEL=claude-opus-4-7   # optional

# 2. Start the server
node server.js
```

The server prints both URLs:

```
CPACC test app running:
  Local:  http://localhost:8787
  LAN:    http://192.168.1.42:8787   (open this on your phone — same Wi-Fi)
```

Open the LAN URL on your phone. Both devices read and write the same `data.json` (gitignored). Missed questions sync between them.

⚠️ **Security note:** no auth means anyone on your Wi-Fi can hit the app. Home Wi-Fi: fine. Coffee shop: don't run it without adding a token check in `server.js`.

### Local development tips

- The server serves any file under the project root with a permissive `..`-traversal guard. Nothing fancy.
- Both `/chat` and `/chat-general` proxy to Anthropic identically to the Cloudflare Functions, so the client code doesn't change.
- `data.json` is created on first missed-question write. Delete it to wipe the shared list.

## Comparing the two

|  | Cloudflare Pages | Local Node server |
|---|---|---|
| Hosting cost | Free tier (≥500 builds/mo) | Your laptop's electricity |
| Public access | Yes (HTTPS via CF edge) | LAN only |
| Cross-device missed sync | No | Yes |
| Chat tutor | Yes (env-var gated) | Yes (env-var gated) |
| Best for | Sharing with others, ongoing study | Solo phone + laptop study at home |

You can use both: develop locally, deploy publicly.

## Self-hosting other ways

The static files (`index.html`, `styles/`, `src/`, `data/`) work behind any static host (nginx, Vercel, GitHub Pages, S3, ...). The chat features just need a server that can proxy `POST /chat`, `POST /chat-general`, and serve `GET /chat-status` returning JSON.

Adapter PRs are welcome.
