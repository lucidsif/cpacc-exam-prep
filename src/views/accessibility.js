// src/views/accessibility.js — accessibility statement (static content, no state).
//
// Unlike disabilities.js/legal.js this view has no category/list sub-state:
// it's one static page, so applyPath() in router.js treats "#/accessibility"
// as always restorable and there's nothing to add to state.js beyond the
// `view` union entry.

import { escapeHtml } from '../dom.js';

// TODO(author): once this repository has a public git remote, set
// ISSUES_URL below to its issues URL (e.g.
// 'https://github.com/<owner>/<repo>/issues'). That one assignment is the
// only change needed — the paragraph below renders the second reporting
// channel automatically the moment this is non-null. Do not invent a URL
// before the remote exists.
const ISSUES_URL = null;
const FEEDBACK_CONTACT = 'tawsif@perenniala11y.com';

/**
 * Render the accessibility statement page into ctx.app.
 * @param {{ app: HTMLElement }} ctx
 */
export function renderAccessibility(ctx) {
  const { app } = ctx;

  const feedbackContact = FEEDBACK_CONTACT
    ? `<p>Report accessibility issues to <a href="mailto:${escapeHtml(FEEDBACK_CONTACT)}">${escapeHtml(FEEDBACK_CONTACT)}</a>.${ISSUES_URL
        ? ` A public issue tracker is also available at <a href="${escapeHtml(ISSUES_URL)}">${escapeHtml(ISSUES_URL)}</a>.`
        : ' Email is the only reporting channel today; a public issue tracker will be added as a second channel once one exists.'}</p>`
    : `<p>A public contact route for accessibility feedback is not yet published. This section will be updated once one exists.</p>`;

  app.innerHTML = `
      <h1>Accessibility statement</h1>
      <div class="sub">Last reviewed <time datetime="2026-08-01">1 August 2026</time>.</div>
      <p>This statement describes how accessible the CPACC Practice Test is, what has been tested, and what has not. It is written to be checked, not to reassure.</p>

      <h2>What this statement applies to</h2>
      <p>Applies to the CPACC Practice Test web app at <a href="https://cpacc-test-maker.pages.dev">cpacc-test-maker.pages.dev</a>, including all views: home, weighted practice tests, Bear-notes practice, missed-question review, flashcards, the human disabilities reference, the history and laws reference, results pages, and the optional AI tutor chat.</p>
      <p>It does not apply to:</p>
      <ul>
        <li>The IAAP CPACC Body of Knowledge itself (third-party content published elsewhere).</li>
        <li>Responses generated live by the AI tutor (produced by whichever language model the operator configured, not written or reviewed in advance).</li>
        <li>Copies of this app deployed by other people, which may have been modified.</li>
      </ul>

      <h2>Conformance status</h2>
      <dl>
        <dt>Target standard</dt>
        <dd>Web Content Accessibility Guidelines (WCAG) 2.2, Level AA (<a href="https://www.w3.org/TR/WCAG22/">w3.org/TR/WCAG22</a>).</dd>
        <dt>Status</dt>
        <dd>Partially conformant with WCAG 2.2 Level AA.</dd>
      </dl>
      <p>Partially conformant means some parts may not fully meet the standard, for two different reasons that this statement keeps separate rather than blurring together.</p>
      <p>First, at least one specific failure is known and, as of this writing, unfixed: nothing in this app exposes a busy or pending state to assistive technology while the AI tutor's reply is in flight — no <code>aria-busy</code>, no loading announcement, nothing (<code>aria-busy</code> appears nowhere in this codebase). A screen reader user who sends a chat message gets no indication that anything is happening until the reply or error is announced; a long or failed round trip is indistinguishable from a frozen page. See "Known limitations beyond conformance" below for this and every other known-and-not-fixed item, named rather than folded into vague language.</p>
      <p>Second, separately from that, the evidence needed to claim full conformance is incomplete even where no specific failure is known — several kinds of evidence are still missing, starting with manual screen reader testing of the current version. See "What has not been verified" below for the rest.</p>
      <p>We do not claim the current version meets WCAG 2.2 Level AA. Large parts of it do, by the evidence in "How this app was evaluated" below, but not all of it, and this is not a rounding-error qualification.</p>

      <h2>What has not been verified</h2>
      <p>This section is the most important part of this statement.</p>

      <h3>Screen reader testing predates the current version</h3>
      <p>The only screen reader ever used against this app is <b>VoiceOver</b>, and that was on an older version. <b>NVDA and JAWS have never been used against this app at any point</b> — an earlier version of this statement said they had, which was wrong, and it is corrected here rather than quietly deleted. How systematic that VoiceOver session was, and on which platform, is not characterised, so treat it as unverified rather than as a testing pass.</p>
      <p>Windows screen readers are the gap that matters most. NVDA and JAWS together account for the large majority of desktop screen reader use, and they differ from VoiceOver in exactly the areas this app leans on hardest — browse versus focus mode, how live regions are queued and interrupted, and quick-navigation keys. Nothing on this page should be read as evidence about how this app behaves in either of them.</p>
      <p>Two rounds of accessibility changes have shipped: a large first pass on 31 July 2026 altering focus behaviour, heading structure, live region announcements, flashcard markup, and the answer choice controls, and a second pass on 1 August 2026 that fixed several defects a follow-up audit found in the first pass itself (see "What has been fixed" below). Neither round has been re-tested with a screen reader. A fresh manual pass is planned but has not happened yet.</p>
      <p>Everything in "What has been fixed" below is therefore verified by automated tests, plus manual keyboard testing of the focus and navigation work specifically, in one browser. Not by a screen reader user.</p>

      <h3>Other open questions</h3>
      <ol>
        <li><b>Browser testing beyond Chromium is automated, not manual.</b> An automated test suite (Playwright) exercises real Chromium, Firefox, WebKit (Safari's engine), and a 320px-viewport Chromium profile — including confirming that the focus ring on programmatic focus renders in all of them, and now does so even in a fresh, mouse-only session with no prior keyboard input (see "How this app was evaluated"). That is a script driving a real browser, not a person using the app by hand, and none of these engines or viewports has been tested with a screen reader.</li>
        <li><b>Reflow at 320px has been checked for the two views known to overflow, not evaluated everywhere.</b> WCAG 1.4.10 (Reflow): the question view's jump grid and the results overview grid were the two places this app was known to force horizontal scrolling below about 378px wide. Both are now fixed and both are specifically asserted not to force a horizontal scrollbar at a 320px viewport, the narrowest common phone width. Every other route also runs at that width as an incidental side effect of the test suite, but only these two have an explicit reflow assertion — the rest have not had reflow specifically checked.</li>
        <li><b>Zoom and text spacing.</b> WCAG 1.4.4 (Resize Text) and 1.4.12 (Text Spacing) have not been evaluated on any view.</li>
      </ol>

      <h3>No independent audit</h3>
      <p>No third party has audited this app. All testing described here was performed by the author, who built it.</p>

      <h2>What has been fixed</h2>
      <p>A substantial accessibility remediation shipped on 31 July 2026, and a second round of fixes — mostly correcting defects a follow-up audit found in that first round, plus one correction to how this statement itself described a fix — shipped on 1 August 2026.</p>

      <h3>Focus and navigation</h3>
      <ul>
        <li>Focus now moves to the visible page heading on every navigation (previously only on browser Back and Forward, so roughly twenty click-driven paths dropped focus to the top of the document).</li>
        <li>In-place updates such as sending a chat message, flipping a flashcard, or changing flashcards with Prev/Next/Shuffle now keep your focus and text cursor position instead of leaving it on a control that no longer exists.</li>
        <li>A focused control that becomes unreachable mid-re-render (an answer radio, an AI-provenance disclosure triangle, or a plain link — none of which carry a stable id) no longer drops focus to <code>&lt;body&gt;</code>. It is now re-found by its position in the page and, failing that, handed to the nearest live control nearby, rather than being silently lost.</li>
        <li>The "Skip to main content" link used to eject you from a test in progress back to the home page and no longer does.</li>
        <li>The individual disability pages and individual law and standard pages had no page heading at all and both now have a visible one.</li>
        <li>A regression in the focus-restoration logic itself: <code>restoreFocus()</code> called <code>.focus()</code> and declared success without checking whether focus actually landed. <code>.focus()</code> is a spec-legal no-op — not an error — on an element whose <code>tabindex="-1"</code> had been applied imperatively (as route navigation and the results/disabilities/legal jump targets all do) and had just been erased by the same re-render's <code>innerHTML</code> write. This silently dropped focus to <code>&lt;body&gt;</code> on every route it hit; it now verifies where focus actually landed before declaring success.</li>
      </ul>

      <h3>Screen reader content</h3>
      <ul>
        <li>Flashcard content was entirely hidden from screen readers because the whole card was a button whose label replaced its contents; card content is now real text with a separate flip button.</li>
        <li>Changing flashcards with Prev, Next, or Shuffle was silent — only flipping a card announced anything. All three now announce the new card's content.</li>
        <li>AI provenance badges hid their own visible label and confidence level for the same reason and are fixed.</li>
        <li>Chat replies and errors are now announced through a live region that survives the page being redrawn.</li>
        <li>Chat transcripts are explicitly marked non-live (<code>aria-live="off"</code>), so that dedicated region is intended to be the only path a reply or error is announced through, rather than leaving open whether the transcript itself would also announce it.</li>
        <li>Chat transcripts are a scrollable region taller than its content; it is now keyboard-focusable (<code>tabindex="0"</code>) so keyboard users can scroll it without a pointer.</li>
        <li>Landmark regions were added and each page sets its own page title.</li>
        <li>The sticky anchor bar on the disabilities and legal reference pages is now a single, unified scrollable region: <code>role="group"</code>, an <code>aria-label</code>, and <code>tabindex="0"</code> all live on the same element, rather than split across nested elements (which only reliably computed an accessible name in one browser engine). This is a keyboard-operability robustness improvement, not the closure of a live automated-tooling finding — the bar already contains up to 26 focusable anchor buttons of its own, so axe's scrollable-region-focusable check already passed here.</li>
      </ul>

      <h3>Controls</h3>
      <ul>
        <li>After revealing an answer, the answer choices claimed to be disabled but still responded to arrow keys, moving the selection away from the graded answer. They are now genuinely disabled.</li>
        <li>Unsent text typed into a chat box used to be silently destroyed if any other in-place update redrew the page — for example, opening a second question's chat while the first still had a draft in progress. Drafts now survive a re-render.</li>
        <li>The AI-provenance disclosure (a <code>&lt;details&gt;</code> element) on the results page used to collapse on every in-place re-render — a chat reply landing, for instance — closing a citations list a screen-reader user could be in the middle of reading. Its open/closed state is now tracked explicitly and survives re-renders.</li>
        <li>Two pieces of help text could go stale and actively mislead: one could resurface telling a user to select a choice to enable Submit, after a choice was already selected and Submit was already enabled; another kept telling users to press a Submit button that revealing the answer had already removed. Both are now kept in sync with the actual state instead of being one-shot changes to the page.</li>
        <li>The "About AI in this app" dialog's close fallback used to focus the page's main landmark with no visible ring if its original trigger was no longer on the page; it now lands on the route's own heading, with a ring, like every other script-driven focus move in the app.</li>
      </ul>

      <h3>Layout and target size</h3>
      <ul>
        <li>The jump-to grid on the question view and the results overview grid forced horizontal scrolling on phone-width screens (WCAG 1.4.10, Reflow) — fixed with a narrower-viewport layout, and checked at a 320px viewport specifically (see "How this app was evaluated").</li>
        <li>The current-question indicator in that same grid is drawn with <code>box-shadow</code>, which Windows High Contrast / <code>forced-colors</code> mode strips — it now has an explicit outline in that mode so the indicator does not silently disappear for users who rely on it. This is the only indicator in the app built on <code>box-shadow</code> alone; every other colour-only state cue already uses <code>border-color</code>, which <code>forced-colors</code> mode does not strip.</li>
        <li>The controls this app checked directly against WCAG 2.5.8 (Target Size Minimum) — the jump-grid cells, the anchor-bar buttons, and the per-question "Discuss this question with the AI tutor" toggles — all meet the 24×24 CSS px floor. The toggles were suspected of falling short from a static reading of the stylesheet alone (13px font-size implies roughly a 20px line height), but measured live in a real browser they were already at 24.8px before any change here, because a more specific rule elsewhere in the stylesheet overrides that font-size. The stylesheet now states the 24×24 floor on those toggles directly instead of leaving it dependent on that interaction being noticed. This is not the same claim as "every interactive element in the app meets 2.5.8" — it does not; only the controls named above were checked. See "What has not been verified" and <code>ACCESSIBILITY.md</code> for the exact scope.</li>
        <li>The sticky anchor bar on the disabilities and legal reference pages used to obscure the very item a user had just jumped to (WCAG 2.4.11, Focus Not Obscured). Its fixed 60px <code>scroll-margin-top</code> assumed the bar above it always stayed short; measured directly, it wraps to as much as 389px tall at a 1280px-wide viewport and 1015px tall at 320px wide on the reference jurisdiction with the most entries — and this was not confined to that one worst case: it covered the focused item in 14 of 16 measured route/viewport combinations, on the disabilities reference as well as the legal one. The bar's height is now capped and the item spacing that has to clear it is set to match that cap exactly, so the two stay coupled by construction rather than by whichever anchor list happened to fit when someone last measured it.</li>
      </ul>

      <h3>Colour, motion, and focus visibility</h3>
      <ul>
        <li>Four places used colour as the only way to tell states apart and all four now have a second cue (chat speaker labels, a glyph marking answered questions in the jump grid, a visible ring on the current question, and an underline on both places the "About AI in this app" trigger appears — the home page, and, as of a second pass, the AI-provenance banner too). The provenance-banner trigger was found, after the first pass, to still be rendering visually identical to its surrounding sentence — not merely low-contrast, indistinguishable — because a more specific pre-existing rule was silently overriding its colour and underline. Automated scanning could not have caught this: axe's link-in-text-block check only fires on <code>&lt;a&gt;</code> elements, and this trigger is a <code>&lt;button&gt;</code>.</li>
        <li>Reduced motion preferences are honoured.</li>
        <li>Browsers without <code>:focus-visible</code> support now get a genuine fallback: a base <code>:focus</code> rule paints the ring unconditionally, and an <code>@supports</code> block narrows that down to keyboard-ish focus only in engines that do support <code>:focus-visible</code>. (A version of this existed before with only the narrowing half present, which meant a non-supporting engine matched neither rule and silently lost the ring entirely — not a working fallback.)</li>
        <li>Every script-driven focus move in this app — route navigation, plus five others added in a second pass (the post-answer result region, the results jump grid, and both reference pages' scroll-to-item targets) — gets its visible ring from one dedicated CSS class, applied by script at the moment focus moves and removed again on blur. That ring does not come from the browser's own <code>:focus-visible</code> keyboard-modality heuristic, which is an engine-specific guess about whether the user is "in a keyboard session" and does not treat script-driven focus the same way in every engine. Measured directly in Chromium, Firefox, and WebKit: for the five newer focus destinations, <code>document.activeElement.matches(':focus-visible')</code> is false in every engine and every session state tested, so the dedicated class is the only reason those rings paint. For route navigation specifically, <code>:focus-visible</code> does independently measure true in one tested scenario — a real keypress establishing keyboard modality before a keyboard-driven activation triggers the navigation — but the same tests prove the identical ring paints just as reliably in a cold, mouse-only session where <code>:focus-visible</code> measures false throughout, which is the actual point: the dedicated class, not the browser's heuristic, is what every one of these six focus destinations depends on. Before this was fixed, a pointer-only user — switch device, eye-tracking, sip-and-puff, magnifier — landing on any of these focus targets got no visible ring and nothing to Tab onward from that they could see. This was verified in Chromium, Firefox, and WebKit (see "How this app was evaluated").</li>
      </ul>

      <h2>How this app was evaluated</h2>
      <dl>
        <dt>Automated testing</dt>
        <dd>Two automated suites run on every change, well over 150 tests between them. A jsdom suite (157 tests) checks DOM structure and ARIA wiring against a simulated document, including regression tests written specifically for the focus behaviour, the skip link, and the colour-only state indicators, so those bugs cannot come back unnoticed — but a simulated document does not paint pixels, compute a real style, or build a real accessibility tree. A separate end-to-end suite (below) drives real browsers and covers exactly that gap.</dd>
        <dt>Automated cross-browser testing</dt>
        <dd>An end-to-end suite (Playwright), 130 tests, runs against five configurations: real Chromium, Firefox, and WebKit (Safari's engine) at a default viewport; a fourth Chromium configuration at a 320px viewport (the narrowest common phone width); and a fifth configuration against a server started with the AI tutor chat enabled, for the chat surface specifically. This is what confirmed the focus ring question above: on programmatic focus (the app moving focus to a heading by script, not by pressing Tab), every configuration paints a solid 3px amber outline — including in a fresh, mouse-only session that has never pressed a key, which used to be the one case with no ring at all. The same suite ran automated accessibility scans (axe-core) at two different tag levels against the four non-chat configurations, plus two further scans against the chat-enabled configuration: 74 scans total, zero violations, with no rule suppressed or narrowed to force a pass. The first tag level (<code>wcag2a</code>/<code>wcag2aa</code>/<code>wcag22aa</code>) matches this app's stated conformance target and runs against nine routes in each of the four non-chat configurations (36 scans); the second (<code>best-practice</code>) is what actually backs this statement's heading-order and landmark claims — axe-core tags rules like <code>heading-order</code>, <code>landmark-one-main</code>, and <code>landmark-unique</code> best-practice rather than to any WCAG success criterion, so the first tag level alone would never run them, and it runs against the same nine routes in the same four configurations (another 36 scans). The remaining two scans open the AI tutor's chat panel on the home page and an opened per-question chat transcript on the results page, against the dedicated chat-enabled configuration — a gap this statement used to leave open and not disclose. Not scanned by any of this: the "About AI in this app" dialog, which stays closed (<code>display:none</code>) throughout every scan, and the question view's own disabled-fieldset "revealed answer" state (as opposed to the results page's different markup for the same information), because the scanned test-question route is captured before any answer is submitted. All of this is automated behavioural testing: a script driving a real browser, not a person using the app, and a real accessibility tree without a real screen reader reading it. Automated scanning also only catches a minority of accessibility issues by its nature; it is not a substitute for manual or assistive-technology testing. Two behavioural differences this testing found in WebKit are documented in "Known limitations beyond conformance" below.</dd>
        <dt>Manual keyboard testing, Chromium only</dt>
        <dd>The skip link keeps you on the current page mid-test, focus lands on the page heading after navigation, browser Back and Forward restore the correct heading and page title, focus survives controls that disable themselves, and deep links work.</dd>
        <dt>Colour contrast audit</dt>
        <dd>Every text and non-text colour pair in the stylesheet was computed, along with all 16 category accent colours. Every pair that WCAG 1.4.3 and 1.4.11 apply to passes, with real headroom — lowest text contrast measured is 6.04:1 against a 4.5:1 requirement. One pair falls under that threshold and is disclosed rather than silently omitted from the count: disabled buttons render at 50% opacity, which composites to roughly 2.77–2.94:1 depending on what sits behind them. WCAG 1.4.3 and 1.4.11 both explicitly exempt inactive user-interface components, so this is not a conformance failure — but it is a pair that does not pass, and "every pair passes" would be wrong without this caveat. This is a source-level audit of the stylesheet, not a rendered-page audit.</dd>
        <dt>Manual screen reader testing</dt>
        <dd>Done previously, on an older version. Not repeated since — neither the 31 July nor the 1 August changes have been tested this way.</dd>
      </dl>

      <h2>Technical specifications</h2>
      <p>Accessibility relies on HTML, CSS, and JavaScript.</p>
      <p>JavaScript is required — the app is a client-side single-page application using a hash-based router, and nothing renders with JavaScript disabled. The app keeps a list of questions you answered incorrectly so you can review them; on the public deploy this is stored in your browser only. The AI tutor chat is optional and only appears when whoever deployed the app has configured a language model provider; AI-generated content carries a visible provenance badge with a confidence level, and AI chat responses are generated live and not reviewed before you see them, so check anything important against an authoritative source.</p>

      <h2>Known limitations beyond conformance</h2>
      <ul>
        <li>The human disabilities reference goes beyond CPACC exam scope. This is intentional and labelled as such in the app.</li>
        <li>AI tutor responses are not pre-reviewed. This is by design and disclosed in the app above every chat transcript.</li>
        <li><b>No busy or pending state is exposed to assistive technology while the AI tutor's reply is in flight.</b> <code>aria-busy</code> appears nowhere in this codebase, and nothing else stands in for it — a screen reader user who sends a chat message has no way to tell the request is still in progress, as opposed to stalled, until a reply or error is announced. This is worse than it sounds: the request has no client-side timeout or cancellation, so if the server or the configured model never responds, the silence is permanent, not just long. This is a known, unfixed failure, not a gap in evidence.</li>
        <li>Announcements are coalesced on a 100ms timer, per live region: if two announcements of the <i>same</i> urgency (both replies, or both errors) land within 100ms of each other, only the later one is spoken. The reply region and the error region now run fully independent timers, so a reply and an error can no longer clobber each other the way two same-urgency messages still can. Because the chat transcripts themselves are silent, a reply that loses that race is not announced at all.</li>
        <li>In WebKit (Safari's engine), the default Tab key only moves focus through form fields, skipping links and buttons entirely. The evidence for this is Playwright's WebKit engine running on Linux in continuous integration, not a hands-on test of real macOS Safari — nothing in this repository demonstrates the latter. The conclusion that this matches a real Safari platform default, rather than a Linux-build quirk, is reasoned from Safari's documented behaviour (Tab visits only text fields and lists unless "Full Keyboard Access" is turned on, or the user presses Option+Tab for one wider pass) — it is not confirmed against an actual Mac. Either way this is a platform default outside this app's control, not a defect in its own DOM order or tabindex usage, but the distinction between "tested on Safari" and "tested on Linux WebKit, reasoned about Safari" is one this statement should not blur.</li>
        <li>Clicking non-focusable content inside <code>&lt;main&gt;</code> — which is itself focusable — leaves <code>document.activeElement</code> on <code>&lt;main&gt;</code> rather than moving it anywhere. This happens in Chromium, Firefox, and WebKit alike (verified across all three); it is not a WebKit-specific behaviour, it is simply that nothing focusable was clicked. WebKit's genuine, narrower difference is that it extends this to <code>&lt;button&gt;</code> clicks too: Chromium and Firefox do focus a button on mouse click, but WebKit does not, so when a clicked button disables itself as part of handling that click, this app's focus-preservation logic finds WebKit's substitute focus location (the <code>&lt;main&gt;</code> landmark) instead of the button, and lands there instead of on the next logical control. This affects anyone clicking with a mouse or trackpad in Safari — including AT users who point rather than tab — and does not affect keyboard users on WebKit, since Tab/Enter activation focuses the control correctly there. This is this app's own fallback reacting to a platform quirk, not an immovable platform limit, so a more targeted fix may be possible later; for now it is documented rather than engineered around.</li>
      </ul>

      <h2>Feedback</h2>
      <p>We want to hear about accessibility problems with this app. If something does not work for you, tell us what you were trying to do and what assistive technology or browser you were using.</p>
      <p>This is a personal project maintained by one person, so no response time is promised. Accessibility reports are read and are prioritised ahead of other bugs.</p>
      ${feedbackContact}

      <h2>Preparation of this statement</h2>
      <p>Prepared on <time datetime="2026-07-31">31 July 2026</time> by Tawsif Ahmed, the author of the app, and last revised <time datetime="2026-08-01">1 August 2026</time>. It reflects the state of the app as of that later date and has not been reviewed by an external party.</p>
    `;
}
