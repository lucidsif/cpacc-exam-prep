# `functions/` — Cloudflare Pages Functions

Three endpoints (only included in the Cloudflare deploy; local dev uses `server.js`):

| File | Method | Path | Purpose |
|---|---|---|---|
| `chat-status.js` | GET | `/chat-status` | Reports whether `ANTHROPIC_API_KEY` is configured |
| `chat.js` | POST | `/chat` | Per-question chat tutor (receives question context) |
| `chat-general.js` | POST | `/chat-general` | Home-page free-form chat |
| `_lib/anthropic.js` | — | — | Shared helper for calling the Anthropic Messages API |
| `_routes.json` | — | — | Routing config that scopes Functions to the chat endpoints only |

## Environment variables

Set as Pages secrets in the Cloudflare dashboard (or with `wrangler pages secret put`):

- `ANTHROPIC_API_KEY` — required for chat. If absent, `/chat-status` returns `{enabled: false}` and the client hides the chat UI.
- `ANTHROPIC_MODEL` — optional. Defaults to `claude-sonnet-4-6`.

## Request flow

```
Browser src/chat.js → fetch('/chat', { body: {...question context...} })
                              ↓
                       functions/chat.js
                              ↓
                  functions/_lib/anthropic.js
                              ↓
                  Anthropic Messages API (api.anthropic.com)
                              ↓
                       Pass-through response
                              ↓
                       Browser src/chat.js renders the reply
```

See `ARCHITECTURE.md` for a sequence diagram.

## Parity with the local server

`server.js` exposes the same three endpoints plus `/missed` (which is intentionally not included in the Cloudflare deploy — Pages Functions are stateless).

If you add a new endpoint here, also add it to `server.js` so local dev has parity. If you only add it to `server.js`, document in the file header why it's local-only.

## Why no `_middleware.js`

Currently there's nothing global to apply. If you add auth, rate limiting, or logging, that's where it would go (see Cloudflare's [Functions middleware docs](https://developers.cloudflare.com/pages/functions/middleware/)).

## Testing the deployed Functions

```bash
# Status
curl https://cpacc-test-maker.pages.dev/chat-status
# → {"enabled":true}  (if ANTHROPIC_API_KEY is set)

# Home tutor
curl -X POST https://cpacc-test-maker.pages.dev/chat-general \
  -H 'content-type: application/json' \
  -d '{"history":[], "userMessage":"Hi, what is universal design?"}'
```

Locally:

```bash
npm run dev:cf
# In another terminal:
ANTHROPIC_API_KEY=sk-ant-... npm run dev:cf
```
