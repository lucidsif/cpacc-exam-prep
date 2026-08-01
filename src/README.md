# `src/` — application code

The browser-side app. Loaded as a single ES module via `<script type="module" src="src/main.js">` in `index.html`. No build step.

## Module map

| File | Purpose |
|---|---|
| `main.js` | Entry point. Imports data + provenance, creates state, defines actions, runs the render dispatcher |
| `state.js` | Factory for the single mutable state bag |
| `router.js` | Pure hash-path <-> state mapping (Back/Forward), no DOM or history API |
| `storage.js` | Missed-question persistence (server probe → localStorage fallback) |
| `chat.js` | `fetch` wrappers for `/chat`, `/chat-general`, `/chat-status`. Vendor-neutral: the server normalises every provider to `{ reply, provider, model }` |
| `sampling.js` | Pure: `shuffle`, `sampleQuestions`, `sampleMissedQuestions`. RNG injectable for tests |
| `scoring.js` | Pure: `scoreTest`, `domainLabel` |
| `provenance.js` | IBM-style AI transparency badge + page-level dialog |
| `dom.js` | Tiny helpers: `escapeHtml`, `scrollIntoViewMotionSafe` |
| `views/home.js` | Home page (test launchers + home chat) |
| `views/question.js` | Practice-question view + jump grid |
| `views/results.js` | Final results + per-question review + chats |
| `views/flashcards.js` | Bear-notes flashcards |
| `views/disabilities.js` | Human disabilities reference |
| `views/legal.js` | History / laws / standards reference |
| `views/accessibility.js` | Accessibility statement (`#/accessibility`) |
| `views/chat.js` | Per-question chat fragment (shared by question + results views) |

See [`../ARCHITECTURE.md`](../ARCHITECTURE.md) for the data-flow diagram, render-dispatcher decision tree, and chat-lifecycle sequence diagram.

## Nothing here is vendor-specific

`chat.js` reads `data.reply` on success and `data.error` on failure, and treats `/chat-status`'s `enabled` flag as the only gate on rendering the chat UI. Which backend answers (`anthropic`, `openai`, or a `local` model server) is a server-side concern resolved in [`../functions/_lib/llm.js`](../functions/_lib/llm.js). If you add UI that names the model, read it from `/chat-status`'s `provider` / `model` fields rather than hard-coding a vendor.

## View pattern

Every view exports a function `renderX(ctx)` that:

1. Builds an HTML string for the entire screen
2. Writes it to `ctx.app.innerHTML`
3. Wires event listeners on the new DOM nodes

`ctx` is a bag with:

```js
{
  app,                       // <main> element
  state,                     // mutable state object
  data,                      // { CPACC_BANK, BEAR_BANK, ... }
  provenance,                // { CPACC_BANK: {...}, ... }
  provenanceForQuestion(q),  // looks up the right provenance per question
  missed,                    // missed-set store
  actions: {                 // ctx.actions.*() mutates state and re-renders
    render(opts),             // opts.focus?: CSS selector, or 'route' to force route-h1 focus
    startTest(mode),
    startFlashcards(),
    openDisabilities(),
    openLegal(),
    submitAll(),
    sendHomeChat(),
    clearHomeChat(),
    sendChat(qid),
    announce(msg, opts),      // opts.assertive?: bool — writes to #route-status (polite) or #route-alert (assertive)
  }
}
```

Views never mutate `state` directly — they invoke `ctx.actions.*` callbacks defined in `main.js`.

## Adding a new view

1. Create `views/your-view.js` exporting `renderYourView(ctx)`
2. Import it in `main.js` and add a `case` to the render dispatcher's `switch (state.view)` (see `ARCHITECTURE.md`'s "The render loop"):
   ```js
   case 'yourView': renderYourView(ctx); break;
   ```
3. Add an action in `main.js` to open the view (sets `state.view = 'yourView'`, calls `render()`) — also add `'yourView'` to `router.js` if it needs a URL route
4. Add a DOM smoke test in `tests/views.test.js` asserting the view's accessibility contract (one h1, focusable elements have accessible names, etc.)
5. Update `ARCHITECTURE.md`'s render-dispatcher diagram

## Accessibility patterns to preserve

- One `<h1>` per view, no skipped heading levels — and it must be a real, visible heading; a route's focus target is that `<h1>`, and `.sr-only` is never acceptable for it (see `ACCESSIBILITY.md`'s "Focus contract")
- All interactive elements are real `<button>` / `<input>` / etc. Answer choices are native radios grouped in a `<fieldset>`/`<legend>` — there is no roving-tabindex pattern in this codebase, and never was; Tab/Arrow-key behavior within the group is the browser's native radio-group handling. Once revealed, the fieldset is natively `disabled` (not `aria-disabled`), so review state is genuinely non-interactive. Per HTML-AAM, native `disabled` does *not* remove a radio's role, name, or `checked` state from the accessibility tree — what it removes is **focusability**, so Tab, NVDA focus mode, and JAWS forms mode/quick-nav can no longer reach the control at all. Restore the per-choice "your answer" / "correct answer" state as visually-hidden text on the label anyway, so it's conveyed through ordinary reading order and doesn't depend on focus reaching a control that's no longer tabbable
- Decorative emoji wrapped in `<span aria-hidden="true">`
- Don't reach for a per-view `aria-live` region for something a user action just triggered — use `ctx.actions.announce(msg, { assertive? })` instead, which writes to one of two persistent, static regions (siblings of `<main>`, survive `innerHTML` rewrites): `#route-status` (polite, the default) or `#route-alert` (assertive, when `{ assertive: true }`). A region created and populated in the same `innerHTML` write never announces
- Most in-place re-renders (chat send, a toggle) don't need any focus-handling code at all — `render()` itself captures and restores focus/caret around the DOM swap. Reach for `render({ focus: '#selector' })` only when you want an explicit target the automatic capture/restore wouldn't produce, and `requestAnimationFrame(() => el.focus())` only for a control that had no focus before the click (e.g. the verdict region after Submit answer). See `ARCHITECTURE.md`'s "The render loop"
- Use `scrollIntoViewMotionSafe` from `dom.js`, not `scrollIntoView` directly — it honors `prefers-reduced-motion`

The DOM smoke tests in `tests/views.test.js` catch most regressions of these patterns.
