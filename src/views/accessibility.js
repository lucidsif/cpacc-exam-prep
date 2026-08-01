// src/views/accessibility.js — accessibility statement (static content, no state).
//
// Unlike disabilities.js/legal.js this view has no category/list sub-state:
// it's one static page, so applyPath() in router.js treats "#/accessibility"
// as always restorable and there's nothing to add to state.js beyond the
// `view` union entry.
//
// A note on the prose, for anyone editing it: this page went through a
// plain-language pass that split long sentences and led each block with its
// conclusion before its evidence. The hedges, attributions, and scope limits
// are load-bearing — "the author states" vs "was verified", "informal
// checking" vs "testing", "reasoned from Safari's documented behaviour, not
// confirmed against an actual Mac". Shorten sentences freely; do not shorten
// a qualifier away. Where a sentence is still long, it is long on purpose.

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
        : ' Email is the only reporting channel today. A public issue tracker will be added as a second channel once one exists.'}</p>`
    : `<p>A public contact route for accessibility feedback is not yet published. This section will be updated once one exists.</p>`;

  app.innerHTML = `
      <h1>Accessibility statement</h1>
      <div class="sub">Last reviewed <time datetime="2026-08-01">1 August 2026</time>.</div>
      <p>This statement describes how accessible the CPACC Practice Test is, what has been tested, and what has not. It is written to be checked, not to reassure.</p>

      <h2>In short</h2>
      <ul>
        <li>This app targets WCAG 2.2 Level AA. It does not fully meet that target yet.</li>
        <li>One known fault is not fixed. While the AI tutor is working on a reply, nothing tells a screen reader that anything is happening.</li>
        <li>The largest gap is missing evidence rather than a known fault. No screen reader has been used on the current version, and NVDA and JAWS have never been used at all.</li>
        <li>Most of the evidence here comes from automated tests. Very little comes from a person using the app by hand, and none from a screen reader on the current version.</li>
        <li>No third party has audited this app. The author built it and did all the testing described here.</li>
        <li>If something does not work for you, please tell me. See "Feedback" below.</li>
      </ul>
      <p>The rest of this page gives the detail, and the evidence behind each of those points.</p>

      <h2>What this statement applies to</h2>
      <p>This statement applies to the CPACC Practice Test web app at <a href="https://cpacc-test-maker.pages.dev">cpacc-test-maker.pages.dev</a>. It covers all views: home, weighted practice tests, Bear-notes practice, missed-question review, flashcards, the human disabilities reference, the history and laws reference, results pages, and the optional AI tutor chat.</p>
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
      <p>Partially conformant means some parts may not fully meet the standard. There are two different reasons for that, and this statement keeps them separate rather than blurring them together.</p>
      <p>First, at least one specific failure is known, and as of this writing it is unfixed. Nothing in this app exposes a busy or pending state to assistive technology while the AI tutor's reply is in flight — no <code>aria-busy</code>, no loading announcement, nothing. (<code>aria-busy</code> appears nowhere in this codebase.) A screen reader user who sends a chat message gets no indication that anything is happening until the reply or error is announced. A long or failed round trip is indistinguishable from a frozen page. See "Known limitations beyond conformance" below for this and every other known-and-not-fixed item, named rather than folded into vague language.</p>
      <p>Second, and separately from that, the evidence needed to claim full conformance is incomplete even where no specific failure is known. Several kinds of evidence are still missing. The first is manual screen reader testing of the current version. See "What has not been verified" below for the rest.</p>
      <p>I do not claim the current version meets WCAG 2.2 Level AA. Large parts of it do, by the evidence in "How this app was evaluated" below. Not all of it does, and this is not a rounding-error qualification.</p>

      <h2>What has not been verified</h2>
      <p>This section is the most important part of this statement.</p>

      <h3>Screen reader testing predates the current version</h3>
      <p>The only screen reader ever used against this app is <b>VoiceOver</b>, and that was on an older version. <b>NVDA and JAWS have never been used against this app at any point.</b> An earlier version of this statement said they had. That was wrong, and it is corrected here rather than quietly deleted. How systematic that VoiceOver session was, and on which platform, is not characterised, so treat it as unverified rather than as a testing pass.</p>
      <p>Windows screen readers are the gap that matters most. NVDA and JAWS together account for the large majority of desktop screen reader use. They also differ from VoiceOver in exactly the areas this app leans on hardest: browse versus focus mode, how live regions are queued and interrupted, and quick-navigation keys. Nothing on this page should be read as evidence about how this app behaves in either of them.</p>
      <p>Two rounds of accessibility changes have shipped. The first, on 31 July 2026, was a large pass altering focus behaviour, heading structure, live region announcements, flashcard markup, and the answer choice controls. The second, on 1 August 2026, fixed several defects a follow-up audit found in the first pass itself (see "What has been fixed" below). Neither round has been re-tested with a screen reader. A fresh manual pass is planned but has not happened yet.</p>
      <p>Everything in "What has been fixed" below is therefore verified by automated tests, plus informal manual keyboard checking of the focus and navigation work in one browser. That keyboard checking was ad-hoc rather than a systematic pass against a written test plan. Treat it as a sanity check that the automated evidence is not obviously wrong, not as independent verification in its own right. Not tested by a screen reader user.</p>

      <h3>Other open questions</h3>
      <ol>
        <li><b>Browser testing beyond Chromium is automated, not manual.</b> An automated test suite (Playwright) exercises real Chromium, Firefox, WebKit (Safari's engine), and a 320px-viewport Chromium profile. It confirms that the focus ring on programmatic focus renders in all of them, and now does so even in a fresh, mouse-only session with no prior keyboard input (see "How this app was evaluated"). But that is a script driving a real browser, not a person using the app by hand. None of these engines or viewports has been tested with a screen reader.</li>
        <li><b>Reflow at 320px has been checked for the two views known to overflow, not evaluated everywhere.</b> WCAG 1.4.10 (Reflow): the question view's jump grid and the results overview grid were the two places this app was known to force horizontal scrolling below about 378px wide. Both are now fixed, and both are specifically asserted not to force a horizontal scrollbar at a 320px viewport, the narrowest common phone width. Every other route also runs at that width, as an incidental side effect of the test suite. But only these two have an explicit reflow assertion — the rest have not had reflow specifically checked.</li>
        <li><b>Zoom and text spacing.</b> WCAG 1.4.4 (Resize Text) and 1.4.12 (Text Spacing) have not been evaluated on any view.</li>
      </ol>

      <h3>No independent audit</h3>
      <p>No third party has audited this app. All testing described here was performed by the author, who built it.</p>

      <h2>What has been fixed</h2>
      <p>A substantial accessibility remediation shipped on 31 July 2026. A second round of fixes shipped on 1 August 2026. That second round mostly corrected defects a follow-up audit found in the first round, plus one correction to how this statement itself described a fix.</p>

      <h3>Focus and navigation</h3>
      <ul>
        <li>Focus now moves to the visible page heading on every navigation. Previously it did so only on browser Back and Forward, so roughly twenty click-driven paths dropped focus to the top of the document.</li>
        <li>In-place updates such as sending a chat message, flipping a flashcard, or changing flashcards with Prev/Next/Shuffle now keep your focus and text cursor position, instead of leaving it on a control that no longer exists.</li>
        <li>A focused control that becomes unreachable mid-re-render no longer drops focus to <code>&lt;body&gt;</code>. (An answer radio, an AI-provenance disclosure triangle, or a plain link — none of which carry a stable id.) It is now re-found by its position in the page and, failing that, handed to the nearest live control nearby, rather than being silently lost.</li>
        <li>The "Skip to main content" link used to eject you from a test in progress back to the home page, and no longer does.</li>
        <li>The individual disability pages and individual law and standard pages had no page heading at all. Both now have a visible one.</li>
        <li>A regression in the focus-restoration logic itself: <code>restoreFocus()</code> called <code>.focus()</code> and declared success without checking whether focus actually landed. <code>.focus()</code> is a spec-legal no-op — not an error — on an element whose <code>tabindex="-1"</code> had been applied imperatively and had just been erased by the same re-render's <code>innerHTML</code> write. Route navigation and the results/disabilities/legal jump targets all apply <code>tabindex</code> that way. This silently dropped focus to <code>&lt;body&gt;</code> on every route it hit. It now verifies where focus actually landed before declaring success.</li>
      </ul>

      <h3>Screen reader content</h3>
      <ul>
        <li>Flashcard content was entirely hidden from screen readers, because the whole card was a button whose label replaced its contents. Card content is now real text with a separate flip button.</li>
        <li>Changing flashcards with Prev, Next, or Shuffle was silent — only flipping a card announced anything. All three now announce the new card's content.</li>
        <li>AI provenance badges hid their own visible label and confidence level for the same reason, and are fixed.</li>
        <li>Chat replies and errors are now announced through a live region that survives the page being redrawn.</li>
        <li>Chat transcripts are explicitly marked non-live (<code>aria-live="off"</code>). That dedicated region is therefore intended to be the only path a reply or error is announced through, rather than leaving open whether the transcript itself would also announce it.</li>
        <li>Chat transcripts sit in a fixed-height box that scrolls once a conversation grows past it. That box is now keyboard-focusable (<code>tabindex="0"</code>), so a keyboard user can scroll back through the conversation without a pointer. (An earlier version of this line said the box was "taller than its content", which is backwards — a box taller than its content would not scroll at all.)</li>
        <li>Landmark regions were added, and each page sets its own page title.</li>
        <li>The sticky anchor bar on the disabilities and legal reference pages is now a single, unified scrollable region. Its <code>role="group"</code>, <code>aria-label</code>, and <code>tabindex="0"</code> all live on the same element, rather than split across nested elements — which only reliably computed an accessible name in one browser engine. This is a keyboard-operability robustness improvement, not the closure of a live automated-tooling finding: the bar already contains up to 26 focusable anchor buttons of its own, so axe's scrollable-region-focusable check already passed here.</li>
      </ul>

      <h3>Controls</h3>
      <ul>
        <li>After revealing an answer, the answer choices claimed to be disabled but still responded to arrow keys, moving the selection away from the graded answer. They are now genuinely disabled.</li>
        <li>Unsent text typed into a chat box used to be silently destroyed if any other in-place update redrew the page — for example, opening a second question's chat while the first still had a draft in progress. Drafts now survive a re-render.</li>
        <li>The AI-provenance disclosure (a <code>&lt;details&gt;</code> element) on the results page used to collapse on every in-place re-render, a chat reply landing for instance. That closed a citations list a screen-reader user could be in the middle of reading. Its open/closed state is now tracked explicitly and survives re-renders.</li>
        <li>Two pieces of help text could go stale and actively mislead. One could resurface telling a user to select a choice to enable Submit, after a choice was already selected and Submit was already enabled. The other kept telling users to press a Submit button that revealing the answer had already removed. Both are now kept in sync with the actual state, instead of being one-shot changes to the page.</li>
        <li>The "About AI in this app" dialog's close fallback used to focus the page's main landmark with no visible ring, if its original trigger was no longer on the page. It now lands on the route's own heading, with a ring, like every other script-driven focus move in the app.</li>
      </ul>

      <h3>Layout and target size</h3>
      <ul>
        <li>The jump-to grid on the question view and the results overview grid forced horizontal scrolling on phone-width screens (WCAG 1.4.10, Reflow). Both are fixed with a narrower-viewport layout, and checked at a 320px viewport specifically (see "How this app was evaluated").</li>
        <li>The current-question indicator in that same grid is drawn with <code>box-shadow</code>, which Windows High Contrast / <code>forced-colors</code> mode strips. It now has an explicit outline in that mode, so the indicator does not silently disappear for users who rely on it. This is the only indicator in the app built on <code>box-shadow</code> alone; every other colour-only state cue already uses <code>border-color</code>, which <code>forced-colors</code> mode does not strip.</li>
        <li>
          <p>The controls this app checked directly against WCAG 2.5.8 (Target Size Minimum) all meet the 24×24 CSS px floor: the jump-grid cells, the anchor-bar buttons, and the per-question "Discuss this question with the AI tutor" toggles.</p>
          <p>The toggles were suspected of falling short from a static reading of the stylesheet alone, where a 13px font-size implies roughly a 20px line height. But measured live in a real browser, they were already at 24.8px before any change here, because a more specific rule elsewhere in the stylesheet overrides that font-size. The stylesheet now states the 24×24 floor on those toggles directly, instead of leaving it dependent on that interaction being noticed.</p>
          <p>This is not the same claim as "every interactive element in the app meets 2.5.8" — it does not; only the controls named above were checked. See "What has not been verified" and <code>ACCESSIBILITY.md</code> for the exact scope.</p>
        </li>
        <li>
          <p>The sticky anchor bar on the disabilities and legal reference pages used to obscure the very item a user had just jumped to (WCAG 2.4.11, Focus Not Obscured). Its fixed 60px <code>scroll-margin-top</code> assumed the bar above it always stayed short.</p>
          <p>Measured directly, that bar wraps to as much as 389px tall at a 1280px-wide viewport, and 1015px tall at 320px wide, on the reference jurisdiction with the most entries. This was not confined to that one worst case: it covered the focused item in 14 of 16 measured route/viewport combinations, on the disabilities reference as well as the legal one.</p>
          <p>The bar's height is now capped, and the item spacing that has to clear it is set to match that cap exactly. The two therefore stay coupled by construction, rather than by whichever anchor list happened to fit when someone last measured it.</p>
        </li>
      </ul>

      <h3>Colour, motion, and focus visibility</h3>
      <ul>
        <li>
          <p>Four places used colour as the only way to tell states apart, and all four now have a second cue. The four are: chat speaker labels; a glyph marking answered questions in the jump grid; a visible ring on the current question; and an underline on both places the "About AI in this app" trigger appears. Those two places are the home page and, as of a second pass, the AI-provenance banner too.</p>
          <p>The provenance-banner trigger was found, after the first pass, to still be rendering visually identical to its surrounding sentence — not merely low-contrast, indistinguishable — because a more specific pre-existing rule was silently overriding its colour and underline. Automated scanning could not have caught this: axe's link-in-text-block check only fires on <code>&lt;a&gt;</code> elements, and this trigger is a <code>&lt;button&gt;</code>.</p>
        </li>
        <li>Reduced motion preferences are honoured.</li>
        <li>Browsers without <code>:focus-visible</code> support now get a genuine fallback. A base <code>:focus</code> rule paints the ring unconditionally, and an <code>@supports</code> block narrows that down to keyboard-ish focus only, in engines that do support <code>:focus-visible</code>. A version of this existed before with only the narrowing half present, which meant a non-supporting engine matched neither rule and silently lost the ring entirely — not a working fallback.</li>
        <li>
          <p>Every script-driven focus move in this app gets its visible ring from one dedicated CSS class, applied by script at the moment focus moves and removed again on blur. That covers route navigation, plus five others added in a second pass: the post-answer result region, the results jump grid, both reference pages' scroll-to-item targets, and the fallback used when the "About AI in this app" dialog closes and the control that opened it is no longer on the page.</p>
          <p>That ring does not come from the browser's own <code>:focus-visible</code> keyboard-modality heuristic. That heuristic is an engine-specific guess about whether the user is "in a keyboard session", and it does not treat script-driven focus the same way in every engine.</p>
          <p>Measured directly in Chromium, Firefox, and WebKit: for the five newer focus destinations, <code>document.activeElement.matches(':focus-visible')</code> is false in every engine and every session state tested. So the dedicated class is the only reason those rings paint.</p>
          <p>For route navigation specifically, <code>:focus-visible</code> does independently measure true in one tested scenario — a real keypress establishing keyboard modality before a keyboard-driven activation triggers the navigation. But the same tests prove the identical ring paints just as reliably in a cold, mouse-only session, where <code>:focus-visible</code> measures false throughout. That is the actual point: the dedicated class, not the browser's heuristic, is what every one of these six focus destinations depends on.</p>
          <p>Before this was fixed, a pointer-only user — switch device, eye-tracking, sip-and-puff, magnifier — landing on any of these focus targets got no visible ring, and nothing to Tab onward from that they could see. This was verified in Chromium, Firefox, and WebKit (see "How this app was evaluated").</p>
        </li>
      </ul>

      <h2>How this app was evaluated</h2>
      <dl>
        <dt>Automated testing</dt>
        <dd>Two automated suites run on every change, well over 150 tests between them. A jsdom suite (157 tests) checks DOM structure and ARIA wiring against a simulated document. It includes regression tests written specifically for the focus behaviour, the skip link, and the colour-only state indicators, so those bugs cannot come back unnoticed. But a simulated document does not paint pixels, compute a real style, or build a real accessibility tree. A separate end-to-end suite (below) drives real browsers and covers exactly that gap.</dd>
        <dt>Automated cross-browser testing</dt>
        <dd>
          <p>An end-to-end suite (Playwright), 130 tests, runs against five configurations. Three are real Chromium, Firefox, and WebKit (Safari's engine) at a default viewport. A fourth is Chromium at a 320px viewport, the narrowest common phone width. A fifth runs against a server started with the AI tutor chat enabled, for the chat surface specifically.</p>
          <p>This is what confirmed the focus ring question above. On programmatic focus — the app moving focus to a heading by script, not by pressing Tab — every configuration paints a solid 3px amber outline. That includes a fresh, mouse-only session that has never pressed a key, which used to be the one case with no ring at all.</p>
          <p>The same suite ran automated accessibility scans (axe-core) at two different tag levels against the four non-chat configurations, plus two further scans against the chat-enabled configuration: 74 scans total, zero violations, with no rule suppressed or narrowed to force a pass.</p>
          <p>The first tag level (<code>wcag2a</code>/<code>wcag2aa</code>/<code>wcag22aa</code>) matches this app's stated conformance target. It runs against nine routes in each of the four non-chat configurations — 36 scans. The second (<code>best-practice</code>) is what actually backs this statement's heading-order and landmark claims: axe-core tags rules like <code>heading-order</code>, <code>landmark-one-main</code>, and <code>landmark-unique</code> best-practice rather than to any WCAG success criterion, so the first tag level alone would never run them. It runs against the same nine routes in the same four configurations — another 36 scans. The remaining two scans open the AI tutor's chat panel on the home page, and an opened per-question chat transcript on the results page, against the dedicated chat-enabled configuration. That is a gap this statement used to leave open and not disclose.</p>
          <p>Two things are not scanned by any of this. The "About AI in this app" dialog stays closed (<code>display:none</code>) throughout every scan. And the question view's own disabled-fieldset "revealed answer" state is not scanned either, because the scanned test-question route is captured before any answer is submitted. (The results page carries different markup for the same information.)</p>
          <p>All of this is automated behavioural testing: a script driving a real browser, not a person using the app, and a real accessibility tree without a real screen reader reading it. Automated scanning also only catches a minority of accessibility issues by its nature; it is not a substitute for manual or assistive-technology testing. Two behavioural differences this testing found in WebKit are documented in "Known limitations beyond conformance" below.</p>
        </dd>
        <dt>Informal manual keyboard checking, Chromium only</dt>
        <dd>Ad-hoc, by the author, not a systematic pass against a written test plan — the behaviours below were checked by hand at some point, not all of them every time something changed. The skip link keeps you on the current page mid-test, focus lands on the page heading after navigation, browser Back and Forward restore the correct heading and page title, focus survives controls that disable themselves, and deep links work. The automated suites above are the stronger evidence for all of these; this is a sanity check on top, not independent verification.</dd>
        <dt>Colour contrast audit</dt>
        <dd>
          <p>Every text and non-text colour pair in the stylesheet was computed, along with all 16 category accent colours. Every pair that WCAG 1.4.3 and 1.4.11 apply to passes, with real headroom: the lowest text contrast measured is 6.04:1, against a 4.5:1 requirement.</p>
          <p>One pair falls under that threshold, and is disclosed here rather than silently omitted from the count. Disabled buttons render at 50% opacity, which composites to roughly 2.77–2.94:1 depending on what sits behind them. WCAG 1.4.3 and 1.4.11 both explicitly exempt inactive user-interface components, so this is not a conformance failure. But it is a pair that does not pass, and "every pair passes" would be wrong without this caveat.</p>
          <p>This is a source-level audit of the stylesheet, not a rendered-page audit.</p>
        </dd>
        <dt>Manual screen reader testing</dt>
        <dd>Done previously, on an older version. Not repeated since — neither the 31 July nor the 1 August changes have been tested this way.</dd>
      </dl>

      <h2>Technical specifications</h2>
      <p>Accessibility relies on HTML, CSS, and JavaScript.</p>
      <p>JavaScript is required. The app is a client-side single-page application using a hash-based router, and nothing renders with JavaScript disabled.</p>
      <p>The app keeps a list of questions you answered incorrectly so you can review them. On the public deploy, that list is stored in your browser only.</p>
      <p>The AI tutor chat is optional. It only appears when whoever deployed the app has configured a language model provider. AI-generated content carries a visible provenance badge with a confidence level. AI chat responses are generated live and not reviewed before you see them, so check anything important against an authoritative source.</p>

      <h2>Known limitations beyond conformance</h2>
      <ul>
        <li>The human disabilities reference goes beyond CPACC exam scope. This is intentional and labelled as such in the app.</li>
        <li>AI tutor responses are not pre-reviewed. This is by design and disclosed in the app above every chat transcript.</li>
        <li><b>No busy or pending state is exposed to assistive technology while the AI tutor's reply is in flight.</b> <code>aria-busy</code> appears nowhere in this codebase, and nothing else stands in for it. A screen reader user who sends a chat message has no way to tell the request is still in progress, as opposed to stalled, until a reply or error is announced. This is worse than it sounds: the request has no client-side timeout or cancellation, so if the server or the configured model never responds, the silence is permanent, not just long. This is a known, unfixed failure, not a gap in evidence.</li>
        <li>Announcements are coalesced on a 100ms timer, per live region. If two announcements of the <i>same</i> urgency (both replies, or both errors) land within 100ms of each other, only the later one is spoken. The reply region and the error region now run fully independent timers, so a reply and an error can no longer clobber each other — but two same-urgency messages still can. And because the chat transcripts themselves are silent, a reply that loses that race is not announced at all.</li>
        <li>
          <p>In WebKit (Safari's engine), the default Tab key only moves focus through form fields, skipping links and buttons entirely.</p>
          <p>Be precise about the evidence for that. It is Playwright's WebKit engine running on Linux in continuous integration, not a hands-on test of real macOS Safari; nothing in this repository demonstrates the latter. The conclusion that this matches a real Safari platform default, rather than a Linux-build quirk, is reasoned from Safari's documented behaviour — Tab visits only text fields and lists unless "Full Keyboard Access" is turned on, or the user presses Option+Tab for one wider pass. It is not confirmed against an actual Mac.</p>
          <p>Either way, this is a platform default outside this app's control, not a defect in its own DOM order or tabindex usage. But the distinction between "tested on Safari" and "tested on Linux WebKit, reasoned about Safari" is one this statement should not blur.</p>
        </li>
        <li>
          <p>Clicking non-focusable content inside <code>&lt;main&gt;</code> — which is itself focusable — leaves <code>document.activeElement</code> on <code>&lt;main&gt;</code> rather than moving it anywhere. This happens in Chromium, Firefox, and WebKit alike (verified across all three). It is not a WebKit-specific behaviour; it is simply that nothing focusable was clicked.</p>
          <p>WebKit's genuine, narrower difference is that it extends this to <code>&lt;button&gt;</code> clicks too. Chromium and Firefox do focus a button on mouse click, but WebKit does not. So when a clicked button disables itself as part of handling that click, this app's focus-preservation logic finds WebKit's substitute focus location — the <code>&lt;main&gt;</code> landmark — instead of the button, and lands there instead of on the next logical control.</p>
          <p>This affects anyone clicking with a mouse or trackpad in Safari, including AT users who point rather than tab. It does not affect keyboard users on WebKit, since Tab/Enter activation focuses the control correctly there.</p>
          <p>This is this app's own fallback reacting to a platform quirk, not an immovable platform limit, so a more targeted fix may be possible later. For now it is documented rather than engineered around.</p>
        </li>
      </ul>

      <h2>Feedback</h2>
      <p>I want to hear about accessibility problems with this app. If something does not work for you, tell me what you were trying to do, and what assistive technology or browser you were using.</p>
      <p>This is a personal project maintained by one person, so no response time is promised. Accessibility reports are read, and are prioritised ahead of other bugs.</p>
      ${feedbackContact}

      <h2>Preparation of this statement</h2>
      <p>Prepared on <time datetime="2026-07-31">31 July 2026</time> by Tawsif Ahmed, the author of the app. Last revised <time datetime="2026-08-01">1 August 2026</time>. It reflects the state of the app as of that later date, and has not been reviewed by an external party.</p>
    `;
}
