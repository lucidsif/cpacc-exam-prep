# `tests/` — test suite

Run all tests:

```bash
npm test            # or: node tests/run.js
```

The runner discovers every `*.test.js` file in this directory and calls its exported `run({ test, assertTrue, assertEq })`. The legacy data smoke tests live inline at the top of `run.js`.

## Layers

| File | Layer | Covers |
|---|---|---|
| `run.js` (inline) | Data smoke | Every dataset is well-formed; IDs unique within and across banks; every dataset exports a `*_PROVENANCE` constant in the IBM FactSheet shape |
| `sampling.test.js` | Unit | `shuffle` is non-mutating + deterministic with injected RNG; `sampleQuestions` returns 20 items in the 8/8/4 domain mix; tops up from the rest of the bank when a domain is short; `sampleMissedQuestions` only returns items in the missed set |
| `scoring.test.js` | Unit | `scoreTest` handles perfect / zero / partial scores; per-domain breakdown math; `domainLabel` strings |
| `storage.test.js` | Unit | Missed-set store with mocked `fetch` and in-memory `localStorage` polyfill — server success, server failure → local fallback, PUT persistence, offline behavior, clear, and the Cloudflare "no server" path that skips network writes |
| `views.test.js` | DOM smoke (jsdom) | Every view's accessibility contracts |

## DOM smoke tests in detail

`views.test.js` mounts each view's HTML into jsdom and asserts the accessibility invariants that we don't want to regress:

- The `index.html` shell has a skip link, a focusable `<main>`, and a labelled home button.
- Every view has exactly one h1.
- The question view's radiogroup has `aria-describedby` resolving to an existing element; the verdict region is `tabindex="-1"` + `aria-live="polite"`; there are exactly 4 radios.
- Submit-answer is disabled with `aria-describedby` pointing to an sr-only explanation when no choice is selected.
- Submit-all only renders on the last question or after all questions are revealed.
- Revealed radios use `aria-disabled="true"`, not native `disabled` (so keyboard review still works).
- The results page has a score readout and per-question review markup.
- Decorative emoji in the home view all carry `aria-hidden="true"`.
- The provenance badge renders a `<details>` with a labelled summary, a dual-encoded confidence pill (color + glyph + text), and a semantic `<dl>` card.
- The chat provenance banner exposes a `data-open-ai-info` trigger.
- The AI-info `<dialog>` is `aria-labelledby` pointing to an existing heading, and has a close button.
- The home and disabilities pages both show a "Goes beyond CPACC scope" scope note.

## Writing a new test

1. Create `tests/your-feature.test.js`
2. Export `run({ test, assertTrue, assertEq })` — `async` if you need `await`
3. Inside `run`, call `await test('name', async () => { … })` for each case
4. Use `assertEq(actual, expected, message?)` and `assertTrue(condition, message?)`
5. Run `npm test` — the runner picks up new files automatically

Test files share three globals from the runner: `test`, `assertEq`, `assertTrue`. They are passed as the argument to `run`, not as globals — destructure them in the parameter list.

If your test needs jsdom, see `views.test.js` for the pattern.
