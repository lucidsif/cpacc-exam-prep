# `functions/` — Cloudflare Pages Functions

Three endpoints (only included in the Cloudflare deploy; local dev uses `server.js`):

| File | Method | Path | Purpose |
|---|---|---|---|
| `chat-status.js` | GET | `/chat-status` | Reports `{ enabled, provider, model }` for the configured provider |
| `chat.js` | POST | `/chat` | Per-question chat tutor (receives question context) |
| `chat-general.js` | POST | `/chat-general` | Home-page free-form chat |
| `_lib/llm.js` | — | — | Shared provider-agnostic helper (`anthropic` \| `openai` \| `local`) |
| `_routes.json` | — | — | Routing config that scopes Functions to the chat endpoints only |

## Environment variables

Set as Pages secrets in the Cloudflare dashboard (or with `wrangler pages secret put`):

| Variable | Purpose |
|---|---|
| `LLM_PROVIDER` | `anthropic` \| `openai` \| `local`. If unset, auto-detected: `LLM_BASE_URL` set → `local`, else `ANTHROPIC_API_KEY` → `anthropic`, else `OPENAI_API_KEY` → `openai` |
| `LLM_API_KEY` | Credential. Required for `anthropic` and `openai`, not for `local`. Falls back to `ANTHROPIC_API_KEY` / `OPENAI_API_KEY` |
| `LLM_MODEL` | Optional model id. Falls back to `ANTHROPIC_MODEL` / `OPENAI_MODEL`, then a per-provider default |
| `LLM_BASE_URL` | Optional endpoint override. Any OpenAI-compatible server |
| `LLM_MAX_TOKENS` | Optional answer-budget override. Non-numeric or `<= 0` falls back to the per-provider default |

Per-provider defaults:

| Provider | Base URL | Model | Max tokens |
|---|---|---|---|
| `anthropic` | `https://api.anthropic.com` | `claude-sonnet-4-6` | 1024 |
| `openai` | `https://api.openai.com/v1` | `gpt-4o-mini` | 1024 |
| `local` | `http://127.0.0.1:1234/v1` | `qwen/qwen3.6-35b-a3b` | 3000 |

If nothing usable is configured, `/chat-status` returns `{enabled: false, provider: null, model: null}` and the client hides the chat UI.

⚠️ **`local` cannot work in a deployed Function.** These Functions run on Cloudflare's edge network, not on your machine, so they cannot reach `localhost`, a LAN address, or a Tailscale `100.x` address. `LLM_PROVIDER=local` is for `node server.js` or a local `wrangler pages dev` only — unless `LLM_BASE_URL` points at an endpoint reachable from the public internet.

## Wire formats

- `anthropic` — POST `{baseUrl}/v1/messages`, system prompt as a top-level field, headers `x-api-key` + `anthropic-version: 2023-06-01`.
- `openai` and `local` — POST `{baseUrl}/chat/completions`, system prompt as the first message, `Authorization: Bearer` when a key is present.

Both formats carry the resolved answer budget as `max_tokens`.

Timeouts: 120s for `local` (cold model load), 60s for cloud providers.

## Request flow

```
Browser src/chat.js → fetch('/chat', { body: {...question context...} })
                              ↓
                       functions/chat.js
                              ↓
                    functions/_lib/llm.js
                              ↓
        configured provider (Anthropic / OpenAI / your local server)
                              ↓
              normalised { reply, provider, model }
                              ↓
                       Browser src/chat.js renders the reply
```

Every provider is normalised to the same JSON shape, so the client never branches on vendor. Errors come back as `{ error }` with a real status code: 503 when no provider is configured, 502 when the endpoint is unreachable or returns an empty reply, and the upstream status on an upstream error. An empty reply that also reports truncation (`finish_reason: "length"` for `openai`/`local`, `stop_reason: "max_tokens"` for `anthropic`) is still a 502, but the message names the token limit that was hit and suggests raising `LLM_MAX_TOKENS` or using a non-reasoning model. `<think>…</think>` scratchpads from local reasoning models are stripped from the reply.

See `ARCHITECTURE.md` for a sequence diagram.

## Parity with the local server

`server.js` exposes the same three endpoints plus `/missed` (which is intentionally not included in the Cloudflare deploy — Pages Functions are stateless). It shares this directory's `_lib/llm.js` via a cached dynamic `import()` (it is CommonJS, the helper is an ES module), so both deploy modes run one provider implementation.

If you add a new endpoint here, also add it to `server.js` so local dev has parity. If you only add it to `server.js`, document in the file header why it's local-only.

## Why no `_middleware.js`

Currently there's nothing global to apply. If you add auth, rate limiting, or logging, that's where it would go (see Cloudflare's [Functions middleware docs](https://developers.cloudflare.com/pages/functions/middleware/)).

## Testing the deployed Functions

```bash
# Status
curl https://cpacc-test-maker.pages.dev/chat-status
# → {"enabled":true,"provider":"anthropic","model":"claude-sonnet-4-6"}
# → {"enabled":false,"provider":null,"model":null}  (nothing configured)

# Home tutor
curl -X POST https://cpacc-test-maker.pages.dev/chat-general \
  -H 'content-type: application/json' \
  -d '{"history":[], "userMessage":"Hi, what is universal design?"}'
# → {"reply":"…","provider":"anthropic","model":"claude-sonnet-4-6"}
```

Locally:

```bash
LLM_PROVIDER=anthropic LLM_API_KEY=sk-ant-... npm run dev:cf
LLM_PROVIDER=openai    LLM_API_KEY=sk-...     npm run dev:cf
LLM_PROVIDER=local     LLM_BASE_URL=http://127.0.0.1:1234/v1 npm run dev:cf
```

`local` works under `wrangler pages dev` because that runs on your machine. It will not work once deployed.

Unit tests for the helper live in `tests/llm.test.js`.
