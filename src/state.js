// src/state.js — single mutable state object for the app.
//
// One shared object means views read directly; views never own state.
// All mutations happen via actions defined in src/main.js. View modules
// receive this state via a context object and never mutate it themselves
// (they invoke action callbacks instead).
//
// State shape:
//   mode           — active test mode ("weighted" | "missed" | "bear")
//   questions      — currently sampled questions for this test
//   answers        — map of qid → committed answer letter
//   pending        — map of qid → currently selected radio (pre-submit)
//   revealed       — map of qid → true once user submitted that answer
//   index          — current question index in the test
//   submitted      — true once the user submitted the entire test
//   chats          — per-question discussion chats (id → {open,history})
//   homeChat       — free-form tutor chat on the home page
//   chatEnabled    — true if /chat-status reported enabled at startup
//   flashcards     — flashcards session ({cards,index,flipped}) when active
//   disabilities   — reference view ({view,category}) when active
//   legal          — reference view ({view,category}) when active

export function createState() {
  return {
    mode: 'weighted',
    questions: [],
    answers: {},
    pending: {},
    revealed: {},
    index: 0,
    submitted: false,
    chats: {},
    homeChat: { history: [] },
    chatEnabled: false,
    flashcards: null,
    disabilities: null,
    legal: null,
  };
}

/** Reset state to the home-page default. */
export function resetState(state) {
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
