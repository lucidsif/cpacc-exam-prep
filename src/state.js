// src/state.js — single mutable state object for the app.
//
// One shared object means views read directly; views never own state.
// All mutations happen via actions defined in src/main.js. View modules
// receive this state via a context object and never mutate it themselves
// (they invoke action callbacks instead).
//
// State shape:
//   view           — current screen ("home" | "test" | "results" | "flashcards" | "disabilities" | "legal" | "accessibility")
//   mode           — active test mode ("weighted" | "missed" | "bear")
//   questions      — currently sampled questions for this test
//   answers        — map of qid → committed answer letter
//   pending        — map of qid → currently selected radio (pre-submit)
//   revealed       — map of qid → true once user submitted that answer
//   index          — current question index in the test
//   submitted      — true once the user submitted the entire test
//   chats          — per-question discussion chats (id → {open,history,draft})
//   homeChat       — free-form tutor chat on the home page ({history,draft})
//   chatEnabled    — true/false once /chat-status resolves at startup; null
//                    means "not yet probed" (treated as falsy by views)
//   flashcards     — flashcards session ({cards,index,flipped}) when active
//   disabilities   — reference view ({view,category}) when active
//   legal          — reference view ({view,category}) when active
//
// `view` is explicit rather than inferred from data presence so that
// navigating back to home doesn't require destroying `questions` — an
// in-progress test survives in memory and Forward can resume it
// (see src/router.js).
//
// `draft` (on homeChat and on each chats[id] entry) holds text the user has
// typed but not yet sent. Every chat input renders with no value attribute
// at all previously, so any in-place re-render (a chat reply landing, a
// sibling chat toggle, the chatEnabled/missed-set boot probes) silently
// wiped out whatever was mid-typed — the view had nowhere to read it back
// from. Backing it here means a re-render can restore exactly what was
// there; views set it on `oninput` and clear it right before handing off to
// the actual send action.

export function createState() {
  return {
    view: 'home',
    mode: 'weighted',
    questions: [],
    answers: {},
    pending: {},
    revealed: {},
    index: 0,
    submitted: false,
    chats: {},
    homeChat: { history: [], draft: '' },
    chatEnabled: null,
    flashcards: null,
    disabilities: null,
    legal: null,
  };
}

/** Reset state to the home-page default. */
export function resetState(state) {
  state.view = 'home';
  state.questions = [];
  state.answers = {};
  state.pending = {};
  state.revealed = {};
  state.index = 0;
  state.submitted = false;
  state.chats = {};
  state.flashcards = null;
  state.disabilities = null;
  state.legal = null;
}
