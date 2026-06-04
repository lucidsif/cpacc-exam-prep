# `src/` — application code

The browser-side app. Loaded as a single ES module via `<script type="module" src="src/main.js">` in `index.html`. No build step.

## Module map

| File | Purpose |
|---|---|
| `main.js` | Entry point. Imports data + provenance, creates state, defines actions, runs the render dispatcher |
| `state.js` | Factory for the single mutable state bag |
| `storage.js` | Missed-question persistence (server probe → localStorage fallback) |
| `chat.js` | `fetch` wrappers for `/chat`, `/chat-general`, `/chat-status` |
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
| `views/chat.js` | Per-question chat fragment (shared by question + results views) |

See [`../ARCHITECTURE.md`](../ARCHITECTURE.md) for the data-flow diagram, render-dispatcher decision tree, and chat-lifecycle sequence diagram.

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
    render(),
    startTest(mode),
    startFlashcards(),
    openDisabilities(),
    openLegal(),
    submitAll(),
    sendHomeChat(),
    clearHomeChat(),
    sendChat(qid),
  }
}
```

Views never mutate `state` directly — they invoke `ctx.actions.*` callbacks defined in `main.js`.

## Adding a new view

1. Create `views/your-view.js` exporting `renderYourView(ctx)`
2. Import it in `main.js` and add a dispatcher branch:
   ```js
   if (state.yourView) return renderYourView(ctx);
   ```
3. Add an action in `main.js` to open the view (sets the appropriate state field, calls `render()`)
4. Add a DOM smoke test in `tests/views.test.js` asserting the view's accessibility contract (one h1, focusable elements have accessible names, etc.)
5. Update `ARCHITECTURE.md`'s render-dispatcher diagram

## Accessibility patterns to preserve

- One `<h1>` per view, no skipped heading levels
- All interactive elements are real `<button>` / `<input>` / etc.
- Decorative emoji wrapped in `<span aria-hidden="true">`
- Live regions only where announcement is the goal — no dueling polite regions
- Radio groups use the WAI-ARIA roving-tabindex pattern (Tab in, Arrow keys within)
- Focus moves to the verdict region after submit, via `requestAnimationFrame(() => v.focus())`
- Use `scrollIntoViewMotionSafe` from `dom.js`, not `scrollIntoView` directly — it honors `prefers-reduced-motion`

The DOM smoke tests in `tests/views.test.js` catch most regressions of these patterns.
