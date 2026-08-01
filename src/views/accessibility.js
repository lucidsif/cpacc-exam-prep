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
      <p>Manual screen reader testing was done in the past on desktop and mobile, using NVDA, JAWS, and VoiceOver. That testing was done on an older version of the app.</p>
      <p>On 31 July 2026 a large set of accessibility changes shipped, altering focus behaviour, heading structure, live region announcements, flashcard markup, and the answer choice controls. None of it has been re-tested with a screen reader. A fresh manual pass is planned but has not happened yet.</p>
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
      <p>A substantial accessibility remediation shipped on 31 July 2026.</p>

      <h3>Focus and navigation</h3>
      <ul>
        <li>Focus now moves to the visible page heading on every navigation (previously only on browser Back and Forward, so roughly twenty click-driven paths dropped focus to the top of the document).</li>
        <li>In-place updates such as sending a chat message, flipping a flashcard, or changing flashcards with Prev/Next/Shuffle now keep your focus and text cursor position instead of leaving it on a control that no longer exists.</li>
        <li>A focused control that becomes unreachable mid-re-render (an answer radio, an AI-provenance disclosure triangle, or a plain link — none of which carry a stable id) no longer drops focus to <code>&lt;body&gt;</code>. It is now re-found by its position in the page and, failing that, handed to the nearest live control nearby, rather than being silently lost.</li>
        <li>The "Skip to main content" link used to eject you from a test in progress back to the home page and no longer does.</li>
        <li>The individual disability pages and individual law and standard pages had no page heading at all and both now have a visible one.</li>
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
      </ul>

      <h3>Controls</h3>
      <ul>
        <li>After revealing an answer, the answer choices claimed to be disabled but still responded to arrow keys, moving the selection away from the graded answer. They are now genuinely disabled.</li>
        <li>Unsent text typed into a chat box used to be silently destroyed if any other in-place update redrew the page — for example, opening a second question's chat while the first still had a draft in progress. Drafts now survive a re-render.</li>
      </ul>

      <h3>Layout and target size</h3>
      <ul>
        <li>The jump-to grid on the question view and the results overview grid forced horizontal scrolling on phone-width screens (WCAG 1.4.10, Reflow) — fixed with a narrower-viewport layout, and checked at a 320px viewport specifically (see "How this app was evaluated").</li>
        <li>The current-question indicator in that same grid is drawn with <code>box-shadow</code>, which Windows High Contrast / <code>forced-colors</code> mode strips — it now has an explicit outline in that mode so the indicator does not silently disappear for users who rely on it. This is the only indicator in the app built on <code>box-shadow</code> alone; every other colour-only state cue already uses <code>border-color</code>, which <code>forced-colors</code> mode does not strip.</li>
      </ul>

      <h3>Colour, motion, and focus visibility</h3>
      <ul>
        <li>Four places used colour as the only way to tell states apart and all four now have a second cue (chat speaker labels, a glyph marking answered questions in the jump grid, a visible ring on the current question, an underline on the "About AI" link).</li>
        <li>Reduced motion preferences are honoured.</li>
        <li>Browsers without <code>:focus-visible</code> support now get a genuine fallback: a base <code>:focus</code> rule paints the ring unconditionally, and an <code>@supports</code> block narrows that down to keyboard-ish focus only in engines that do support <code>:focus-visible</code>. (A version of this existed before with only the narrowing half present, which meant a non-supporting engine matched neither rule and silently lost the ring entirely — not a working fallback.)</li>
        <li>Separately: every navigation in this app moves focus to the destination heading by script, not by a keypress, and <code>:focus-visible</code>'s own keyboard-modality detection does not reliably treat script-driven focus as "keyboard-ish" the same way in every engine. That used to leave a pointer-only user — switch device, eye-tracking, sip-and-puff, magnifier — landing on script-moved focus with no visible ring and nothing to Tab onward from that they could see. A dedicated class applied at the moment of that move now paints the same ring unconditionally, independent of <code>:focus-visible</code>'s own heuristic, so this holds even in a fresh session that has never pressed a key. This was verified in Chromium, Firefox, and WebKit (see "How this app was evaluated").</li>
      </ul>

      <h2>How this app was evaluated</h2>
      <dl>
        <dt>Automated testing</dt>
        <dd>Two automated suites run on every change, well over 150 tests between them. A jsdom suite (151 tests) checks DOM structure and ARIA wiring against a simulated document, including regression tests written specifically for the focus behaviour, the skip link, and the colour-only state indicators, so those bugs cannot come back unnoticed — but a simulated document does not paint pixels, compute a real style, or build a real accessibility tree. A separate end-to-end suite (below) drives real browsers and covers exactly that gap.</dd>
        <dt>Automated cross-browser testing</dt>
        <dd>An end-to-end suite (Playwright), 126 tests, runs against five configurations: real Chromium, Firefox, and WebKit (Safari's engine) at a default viewport; a fourth Chromium configuration at a 320px viewport (the narrowest common phone width); and a fifth configuration against a server started with the AI tutor chat enabled, for the chat surface specifically. This is what confirmed the focus ring question above: on programmatic focus (the app moving focus to a heading by script, not by pressing Tab), every configuration paints a solid 3px amber outline — including in a fresh, mouse-only session that has never pressed a key, which used to be the one case with no ring at all. The same suite ran automated accessibility scans (axe-core) at two different tag levels against the four non-chat configurations, plus two further scans against the chat-enabled configuration: 74 scans total, zero violations, with no rule suppressed or narrowed to force a pass. The first tag level (<code>wcag2a</code>/<code>wcag2aa</code>/<code>wcag22aa</code>) matches this app's stated conformance target and runs against nine routes in each of the four non-chat configurations (36 scans); the second (<code>best-practice</code>) is what actually backs this statement's heading-order and landmark claims — axe-core tags rules like <code>heading-order</code>, <code>landmark-one-main</code>, and <code>landmark-unique</code> best-practice rather than to any WCAG success criterion, so the first tag level alone would never run them, and it runs against the same nine routes in the same four configurations (another 36 scans). The remaining two scans open the AI tutor's chat panel on the home page and an opened per-question chat transcript on the results page, against the dedicated chat-enabled configuration — a gap this statement used to leave open and not disclose. Not scanned by any of this: the "About AI in this app" dialog, which stays closed (<code>display:none</code>) throughout every scan, and the question view's own disabled-fieldset "revealed answer" state (as opposed to the results page's different markup for the same information), because the scanned test-question route is captured before any answer is submitted. All of this is automated behavioural testing: a script driving a real browser, not a person using the app, and a real accessibility tree without a real screen reader reading it. Automated scanning also only catches a minority of accessibility issues by its nature; it is not a substitute for manual or assistive-technology testing. Two behavioural differences this testing found in WebKit are documented in "Known limitations beyond conformance" below.</dd>
        <dt>Manual keyboard testing, Chromium only</dt>
        <dd>The skip link keeps you on the current page mid-test, focus lands on the page heading after navigation, browser Back and Forward restore the correct heading and page title, focus survives controls that disable themselves, and deep links work.</dd>
        <dt>Colour contrast audit</dt>
        <dd>Every text and non-text colour pair in the stylesheet was computed, along with all 16 category accent colours. All pass WCAG 1.4.3 and 1.4.11 at Level AA. Lowest text contrast measured is 6.04:1 against a 4.5:1 requirement. This is a source-level audit of the stylesheet, not a rendered-page audit.</dd>
        <dt>Manual screen reader testing</dt>
        <dd>Done previously, on an older version. Not repeated since 31 July 2026.</dd>
      </dl>

      <h2>Technical specifications</h2>
      <p>Accessibility relies on HTML, CSS, and JavaScript.</p>
      <p>JavaScript is required — the app is a client-side single-page application using a hash-based router, and nothing renders with JavaScript disabled. The app keeps a list of questions you answered incorrectly so you can review them; on the public deploy this is stored in your browser only. The AI tutor chat is optional and only appears when whoever deployed the app has configured a language model provider; AI-generated content carries a visible provenance badge with a confidence level, and AI chat responses are generated live and not reviewed before you see them, so check anything important against an authoritative source.</p>

      <h2>Known limitations beyond conformance</h2>
      <ul>
        <li>The human disabilities reference goes beyond CPACC exam scope. This is intentional and labelled as such in the app.</li>
        <li>AI tutor responses are not pre-reviewed. This is by design and disclosed in the app above every chat transcript.</li>
        <li><b>No busy or pending state is exposed to assistive technology while the AI tutor's reply is in flight.</b> <code>aria-busy</code> appears nowhere in this codebase, and nothing else stands in for it — a screen reader user who sends a chat message has no way to tell the request is still in progress, as opposed to stalled, until a reply or error is announced. This is worse than it sounds: the request has no client-side timeout or cancellation, so if the server or the configured model never responds, the silence is permanent, not just long. This is a known, unfixed failure, not a gap in evidence.</li>
        <li>The sticky anchor bar on the disabilities and legal reference pages uses a fixed 60px <code>scroll-margin-top</code> so a focused item clears it. Measured directly: on the jurisdiction with the most entries ("Timeline / History", 26 items), the anchor bar itself wraps to roughly 390px tall — more than six times the offset it's supposed to compensate for — so a focused item on that page can still land underneath it (WCAG 2.4.11, Focus Not Obscured). Every other jurisdiction and disability category has few enough anchors that this has not been observed to be a problem in practice, but it has not been fixed for the one that does.</li>
        <li>Announcements are coalesced on a 100ms timer, per live region: if two announcements of the <i>same</i> urgency (both replies, or both errors) land within 100ms of each other, only the later one is spoken. The reply region and the error region now run fully independent timers, so a reply and an error can no longer clobber each other the way two same-urgency messages still can. Because the chat transcripts themselves are silent, a reply that loses that race is not announced at all.</li>
        <li>In WebKit (Safari's engine), the default Tab key only moves focus through form fields, skipping links and buttons entirely. The evidence for this is Playwright's WebKit engine running on Linux in continuous integration, not a hands-on test of real macOS Safari — nothing in this repository demonstrates the latter. The conclusion that this matches a real Safari platform default, rather than a Linux-build quirk, is reasoned from Safari's documented behaviour (Tab visits only text fields and lists unless "Full Keyboard Access" is turned on, or the user presses Option+Tab for one wider pass) — it is not confirmed against an actual Mac. Either way this is a platform default outside this app's control, not a defect in its own DOM order or tabindex usage, but the distinction between "tested on Safari" and "tested on Linux WebKit, reasoned about Safari" is one this statement should not blur.</li>
        <li>Clicking non-focusable content inside <code>&lt;main&gt;</code> — which is itself focusable — leaves <code>document.activeElement</code> on <code>&lt;main&gt;</code> rather than moving it anywhere. This happens in Chromium, Firefox, and WebKit alike (verified across all three); it is not a WebKit-specific behaviour, it is simply that nothing focusable was clicked. WebKit's genuine, narrower difference is that it extends this to <code>&lt;button&gt;</code> clicks too: Chromium and Firefox do focus a button on mouse click, but WebKit does not, so when a clicked button disables itself as part of handling that click, this app's focus-preservation logic finds WebKit's substitute focus location (the <code>&lt;main&gt;</code> landmark) instead of the button, and lands there instead of on the next logical control. This affects anyone clicking with a mouse or trackpad in Safari — including AT users who point rather than tab — and does not affect keyboard users on WebKit, since Tab/Enter activation focuses the control correctly there. This is this app's own fallback reacting to a platform quirk, not an immovable platform limit, so a more targeted fix may be possible later; for now it is documented rather than engineered around.</li>
      </ul>

      <h2>Feedback</h2>
      <p>We want to hear about accessibility problems with this app. If something does not work for you, tell us what you were trying to do and what assistive technology or browser you were using.</p>
      <p>We aim to respond to accessibility reports within one week. Accessibility issues are triaged ahead of other bugs.</p>
      ${feedbackContact}

      <h2>Preparation of this statement</h2>
      <p>Prepared on <time datetime="2026-07-31">31 July 2026</time> by Tawsif Ahmed, the author of the app. It reflects the state of the app as of that date and has not been reviewed by an external party.</p>
    `;
}
