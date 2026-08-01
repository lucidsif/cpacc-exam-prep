// src/views/home.js — home page (test/flashcard/reference launchers + home chat).

import { escapeHtml } from '../dom.js';
import { TEST_SIZE } from '../sampling.js';
import { renderChatProvenanceBanner } from '../provenance.js';

// WCAG 1.4.1: speaker identity must not rely on bubble color alone.
// This visible label is the non-color cue; see styles/app.css .msg-role.
const ROLE_LABELS = { user: 'You:', assistant: 'Tutor:', error: 'Error:' };

/**
 * Render the home page into ctx.app and wire its event handlers.
 * @param {{
 *   app: HTMLElement,
 *   state: object,
 *   data: {CPACC_BANK:Array, BEAR_BANK:Array, BEAR_FLASHCARDS:Array, DISABILITIES:object, LEGAL:object},
 *   missed: {get():Set<number>, clear():Promise<void>},
 *   actions: {
 *     startTest(mode:string):void,
 *     startFlashcards():void,
 *     openDisabilities():void,
 *     openLegal():void,
 *     sendHomeChat():Promise<void>,
 *     clearHomeChat():void,
 *     render():void,
 *   }
 * }} ctx
 */
export function renderHome(ctx) {
  const { app, state, data, missed, actions } = ctx;
  const bank = data.CPACC_BANK || [];
  const counts = { 1: 0, 2: 0, 3: 0 };
  for (const q of bank) counts[q.domain]++;
  const bearBank = data.BEAR_BANK || [];
  const bearCounts = { 1: 0, 2: 0, 3: 0 };
  for (const q of bearBank) bearCounts[q.domain]++;
  const missedCount = missed.get().size;

  app.innerHTML = `
      <h1>CPACC Practice Test</h1>
      <div class="sub">Bank: ${bank.length} items (D1:${counts[1]} · D2:${counts[2]} · D3:${counts[3]}). Items reference the IAAP CPACC Body of Knowledge (Oct 2023, v4.0).</div>
      <div class="panel">
        <h2 class="qmeta"><span class="qmeta-emoji" aria-hidden="true">🎯</span> Weighted practice test</h2>
        <div class="qtext">${TEST_SIZE} questions drawn at random, weighted to the BoK mix (40% / 40% / 20%).</div>
        <div class="row">
          <button id="start">Start ${TEST_SIZE}-question test</button>
          <span class="pill">D1: 8 · D2: 8 · D3: 4</span>
        </div>
      </div>
      <div class="panel">
        <h2 class="qmeta"><span class="qmeta-emoji" aria-hidden="true">📓</span> Bear notes practice</h2>
        <div class="qtext">${TEST_SIZE} questions drawn from your Bear notes (#cpacc/practice + #a11y/* study notes), weighted to the BoK mix.</div>
        <div class="row">
          <button id="start-bear" ${bearBank.length === 0 ? 'disabled' : ''}>Start ${Math.min(TEST_SIZE, bearBank.length)}-question Bear test</button>
          <span class="pill">Bank: ${bearBank.length} (D1:${bearCounts[1]} · D2:${bearCounts[2]} · D3:${bearCounts[3]})</span>
        </div>
      </div>
      <div class="panel">
        <h2 class="qmeta"><span class="qmeta-emoji" aria-hidden="true">🔁</span> Missed-question practice</h2>
        <div class="qtext">${missedCount === 0
          ? 'No missed questions yet. Take a test: items you get wrong will be saved here for focused practice.'
          : `You have <b>${missedCount}</b> missed question${missedCount===1?'':'s'} saved. Each one you get right in a missed-practice session drops off the list; each one you miss again stays.`}</div>
        <div class="row">
          <button id="practice-missed" ${missedCount === 0 ? 'disabled' : ''}>Practice ${Math.min(TEST_SIZE, missedCount)} missed</button>
          <button class="secondary" id="clear-missed" ${missedCount === 0 ? 'disabled' : ''}>Clear missed list</button>
        </div>
      </div>
      <div class="panel">
        <h2 class="qmeta"><span class="qmeta-emoji" aria-hidden="true">🃏</span> Bear notes flashcards</h2>
        <div class="qtext">${(data.BEAR_FLASHCARDS || []).length} study cards distilled from your notes: dense reference info with stats, lists, and key facts.</div>
        <div class="row">
          <button id="start-flashcards" ${(data.BEAR_FLASHCARDS || []).length === 0 ? 'disabled' : ''}>Study flashcards</button>
          <span class="pill">${(data.BEAR_FLASHCARDS || []).length} cards</span>
        </div>
      </div>
      <div class="panel">
        <h2 class="qmeta"><span class="qmeta-emoji" aria-hidden="true">♿</span> Human disabilities reference</h2>
        <div class="qtext">Browse ${(data.DISABILITIES?.items || []).length} disabilities organized into ${(data.DISABILITIES?.categories || []).length} categories, with images, prevalence, key facts, and accessibility solutions.</div>
        <p class="scope-note"><span class="scope-icon" aria-hidden="true">ℹ️</span> <span><b>Goes beyond CPACC scope</b>: for deeper study.</span></p>
        <div class="row">
          <button id="start-disabilities" ${!data.DISABILITIES ? 'disabled' : ''}>Open disabilities reference</button>
        </div>
      </div>
      <div class="panel">
        <h2 class="qmeta"><span class="qmeta-emoji" aria-hidden="true">⚖️</span> History, laws & standards</h2>
        <div class="qtext">Browse ${(data.LEGAL?.items || []).filter(i => i.cpacc !== false).length} CPACC-relevant laws, conventions, standards, and milestones organized by jurisdiction.</div>
        <div class="row">
          <button id="start-legal" ${!data.LEGAL ? 'disabled' : ''}>Open legal reference</button>
        </div>
      </div>
      <div class="cite">Real CPACC exam: 100 multiple-choice questions in 2 hours, ~70% pass. (Per IAAP exam info, not from the BoK itself.)</div>
      <div class="cite"><button type="button" class="linkish" data-open-ai-info aria-haspopup="dialog"><span aria-hidden="true">🤖</span> About AI in this app</button>: provenance, confidence levels, and limitations of every content type.</div>
      <div class="cite">Chat tutor: ${state.chatEnabled === null ? 'checking availability…' : state.chatEnabled ? 'enabled.' : 'disabled. Optional: set <code>LLM_PROVIDER</code> and <code>LLM_API_KEY</code>, then run via <code>node server.js</code>. Works with Anthropic, OpenAI, or a local OpenAI-compatible server.'}</div>
      <div class="cite"><a href="#/accessibility">Accessibility statement</a>: conformance status, what's been tested, and what hasn't.</div>
      ${state.chatEnabled ? `
      <div class="panel">
        <h2 class="qmeta"><span class="qmeta-emoji" aria-hidden="true">💬</span> Ask the CPACC tutor</h2>
        <div class="qtext" style="font-size:14px;color:var(--muted);margin-bottom:10px">Free-form chat: ask about disabilities, laws, WCAG, UD principles, anything CPACC-related.</div>
        <div class="chat">
          ${renderChatProvenanceBanner()}
          <!--
            aria-live="off" here is deliberate, not an oversight — see the
            matching comment above renderChatFragment() in chat.js for the
            full reasoning. Short version: role="log" implies
            aria-live="polite" even with no explicit attribute; this
            transcript is rebuilt wholesale via innerHTML on every render;
            and every reply/error already gets announced explicitly through
            announce() — #route-status for the reply, #route-alert for the
            assertive error case (see sendHomeChat in main.js). Two live
            paths to the same message is an ambiguity we don't want, so this
            explicit override makes the region silent on its own and leaves
            announce()'s regions as the single announcement path. Do NOT
            delete this attribute to reconcile it with role="log" — that is
            what reintroduces the ambiguity. role="log" is kept for its
            navigational semantics; only the implicit live behaviour is off.
          -->
          <!--
            tabindex="0": styles/app.css caps this log at max-height:320px
            with overflow-y:auto, making it a scrollable region. With no
            tabindex it's reachable only by dragging a scrollbar thumb — a
            keyboard-only or screen-reader user has no way to scroll back
            through history at all once it overflows (axe's
            scrollable-region-focusable, wcag2a/wcag211, a Level A failure,
            not a nicety). aria-label already gives it a real accessible
            name, so this makes it a proper, announced Tab stop rather than
            an unlabelled one.
          -->
          <div class="log" id="home-log" role="log" aria-live="off" aria-label="Chat conversation" tabindex="0">${state.homeChat.history.map(m => `<div class="msg ${escapeHtml(m.role)}"><b class="msg-role">${ROLE_LABELS[m.role] || ''}</b>${escapeHtml(m.content)}</div>`).join('') || `<div class="msg assistant"><b class="msg-role">${ROLE_LABELS.assistant}</b>Hi, ask me anything CPACC-related.</div>`}</div>
          <div class="chat-input">
            <label for="home-input" class="sr-only">Ask the tutor a question</label>
            <input type="text" id="home-input" placeholder="Type a question and press Enter..." value="${escapeHtml(state.homeChat.draft || '')}" />
            <button class="small" id="home-send">Send</button>
            ${state.homeChat.history.length ? `<button class="small secondary" id="home-clear">Clear</button>` : ''}
          </div>
        </div>
      </div>` : ''}
    `;

  document.getElementById('start').onclick = () => actions.startTest('weighted');
  const flashBtn = document.getElementById('start-flashcards');
  if (flashBtn) flashBtn.onclick = actions.startFlashcards;
  const disBtn = document.getElementById('start-disabilities');
  if (disBtn) disBtn.onclick = actions.openDisabilities;
  const legalBtn = document.getElementById('start-legal');
  if (legalBtn) legalBtn.onclick = actions.openLegal;
  const bearBtn = document.getElementById('start-bear');
  if (bearBtn) bearBtn.onclick = () => actions.startTest('bear');
  document.getElementById('practice-missed').onclick = () => actions.startTest('missed');
  // sendHomeChat (main.js) reads the input's live DOM value directly and
  // clears that DOM node — it has no way to know about state.homeChat.draft,
  // which is what actually survives a re-render (see state.js). So the
  // draft has to be cleared here, right before handing off to the send
  // action, or the next render would redraw the just-sent text right back
  // into the box. Same reasoning as the per-question chat in results.js.
  const homeSend = document.getElementById('home-send');
  if (homeSend) homeSend.onclick = () => { state.homeChat.draft = ''; actions.sendHomeChat(); };
  const homeInput = document.getElementById('home-input');
  if (homeInput) {
    homeInput.oninput = (e) => { state.homeChat.draft = e.target.value; };
    homeInput.onkeydown = (e) => {
      // isComposing is true while an IME candidate (CJK input) is still
      // being chosen — that Enter confirms the candidate, it isn't the
      // user asking to send. Without this guard the first Enter of any
      // Japanese/Chinese/Korean message submits a half-typed word.
      if (e.key === 'Enter' && !e.isComposing) { state.homeChat.draft = ''; actions.sendHomeChat(); }
    };
  }
  const homeClear = document.getElementById('home-clear');
  if (homeClear) homeClear.onclick = actions.clearHomeChat;
  document.getElementById('clear-missed').onclick = async () => {
    if (confirm(`Clear all ${missedCount} missed questions?`)) {
      await missed.clear();
      actions.render();
    }
  };
}
