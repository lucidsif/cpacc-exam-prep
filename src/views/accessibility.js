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
      <p>Partially conformant means some parts may not fully meet the standard, for two reasons kept separate here.</p>
      <p>First, at least one specific failure is known and unfixed: nothing in this app exposes a busy or pending state to assistive technology while the AI tutor's reply is in flight. <code>aria-busy</code> appears nowhere in this codebase, and a long or failed round trip is indistinguishable from a frozen page. See "Known limitations beyond conformance" below for the detail, and every other known-and-not-fixed item.</p>
      <p>Second, separately, the evidence for full conformance is incomplete even where no failure is known — the largest gap being manual screen reader testing of the current version (see "What has not been verified" below).</p>
      <p>I do not claim the current version meets WCAG 2.2 Level AA. Large parts of it do, by the evidence below; not all of it does, and this is not a rounding-error qualification.</p>

      <h2>What has not been verified</h2>
      <p>This section is the most important part of this statement.</p>

      <h3>Screen reader testing predates the current version</h3>
      <p>The only screen reader ever used against this app is <b>VoiceOver</b>, on an older version — <b>NVDA and JAWS have never been used against it at all.</b> An earlier version of this statement wrongly claimed otherwise; corrected here, not quietly deleted. How systematic that session was, and on which platform, is not characterised — treat it as unverified, not a testing pass.</p>
      <p>Windows screen readers are the gap that matters most: NVDA and JAWS account for most desktop screen reader use, and differ from VoiceOver exactly where this app leans hardest — browse versus focus mode, live-region queuing, and quick-navigation keys. Nothing here is evidence for either.</p>
      <p>Two rounds of accessibility changes have shipped, on 31 July and 1 August 2026; neither has been re-tested with a screen reader. A fresh manual pass is planned but has not happened.</p>
      <p>Everything since is verified by automated tests, plus informal, ad-hoc keyboard checking by the author in one browser: a sanity check, not independent verification, and not screen reader testing.</p>

      <h3>Other open questions</h3>
      <ol>
        <li><b>Browser testing beyond Chromium is automated, not manual.</b> Playwright exercises real Chromium, Firefox, WebKit, and a 320px-viewport profile — a script driving a browser, not a person using the app by hand. None of these engines has been tested with a screen reader.</li>
        <li><b>Reflow at 320px has been checked for the two views known to overflow, not evaluated everywhere.</b> The question view's jump grid and results overview grid used to force horizontal scrolling below about 378px wide; both are fixed and asserted not to force a scrollbar at 320px. Every other route runs at that width too, incidentally, but only these two have an explicit assertion.</li>
        <li><b>Zoom and text spacing.</b> WCAG 1.4.4 (Resize Text) and 1.4.12 (Text Spacing) have not been evaluated on any view.</li>
      </ol>

      <h3>No independent audit</h3>
      <p>No third party has audited this app. All testing described here was performed by the author, who built it.</p>

      <h2>What has been fixed</h2>
      <p>Two rounds of accessibility fixes have shipped, on 31 July and 1 August 2026, covering focus, navigation, screen reader content, keyboard operability, layout, and colour. The full technical record — what changed, why, and how each fix was checked — is in <code>ACCESSIBILITY.md</code>; the commit-by-commit history is in <code>CHANGELOG.md</code>.</p>

      <h2>How this app was evaluated</h2>
      <p>Two automated suites run on every change. A jsdom suite checks DOM structure and ARIA wiring against a simulated document — no painted pixels, no real accessibility tree. A Playwright suite drives real browsers across five configurations (Chromium, Firefox, WebKit, a 320px viewport, and a chat-enabled build), including axe-core scans at two rule levels: zero violations, nothing suppressed.</p>
      <p>Beyond that: informal, ad-hoc keyboard checking by the author, in Chromium only. No screen reader has been used on the current version, and no third party has audited this app.</p>
      <p>Automated scanning, however thorough, catches only a minority of accessibility problems by its nature and is not a substitute for manual or assistive-technology testing. Full detail is in <code>ACCESSIBILITY.md</code>.</p>

      <h2>Technical specifications</h2>
      <p>Accessibility relies on HTML, CSS, and JavaScript.</p>
      <p>JavaScript is required. The app is a client-side single-page application using a hash-based router, and nothing renders with JavaScript disabled.</p>
      <p>The app keeps a list of questions you answered incorrectly so you can review them. On the public deploy, that list is stored in your browser only.</p>
      <p>The AI tutor chat is optional. It only appears when whoever deployed the app has configured a language model provider. AI-generated content carries a visible provenance badge with a confidence level. AI chat responses are generated live and not reviewed before you see them, so check anything important against an authoritative source.</p>

      <h2>Known limitations beyond conformance</h2>
      <ul>
        <li>The human disabilities reference goes beyond CPACC exam scope. This is intentional and labelled as such in the app.</li>
        <li>AI tutor responses are not pre-reviewed. This is by design and disclosed in the app above every chat transcript.</li>
        <li><b>No busy or pending state is exposed to assistive technology while the AI tutor's reply is in flight.</b> <code>aria-busy</code> appears nowhere in this codebase, and nothing stands in for it. A screen reader user who sends a chat message cannot tell the request is in progress, as opposed to stalled, until a reply or error arrives. The request also has no client-side timeout or cancellation, so a non-responding server or model produces permanent silence, not just a long one — a known, unfixed failure, not a gap in evidence.</li>
        <li>Announcements are coalesced on a 100ms timer, per live region — two of the <i>same</i> urgency within that window means only the later one is spoken. The reply and error regions now run independent timers, so a reply and an error can no longer clobber each other, but two same-urgency messages still can; since chat transcripts are silent, a reply that loses that race goes unannounced.</li>
        <li>In WebKit (Safari's engine), the default Tab key only moves focus through form fields, skipping links and buttons — a platform default outside this app's control, not a defect in its own DOM order or tabindex usage. The evidence is Playwright's WebKit on Linux in CI, not a hands-on test of real macOS Safari. The Safari-match is reasoned from Safari's documented default — Tab visits only text fields unless "Full Keyboard Access" is on, or Option+Tab is used — not confirmed against an actual Mac.</li>
        <li>Clicking non-focusable content inside <code>&lt;main&gt;</code> (itself focusable) leaves <code>document.activeElement</code> on <code>&lt;main&gt;</code> in Chromium, Firefox, and WebKit alike, simply because nothing focusable was clicked — not WebKit-specific. WebKit's genuine, narrower difference: it does not focus a <code>&lt;button&gt;</code> on mouse click at all, where Chromium and Firefox do, so a self-disabling button leaves this app's focus-preservation logic landing on <code>&lt;main&gt;</code> instead of the next control. This affects mouse and trackpad users in Safari, including AT users who point rather than tab; keyboard users on WebKit are unaffected. Documented, not engineered around.</li>
      </ul>

      <h2>Feedback</h2>
      <p>I want to hear about accessibility problems with this app. If something does not work for you, tell me what you were trying to do, and what assistive technology or browser you were using.</p>
      <p>This is a personal project maintained by one person, so no response time is promised. Accessibility reports are read, and are prioritised ahead of other bugs.</p>
      ${feedbackContact}

      <h2>Preparation of this statement</h2>
      <p>Prepared on <time datetime="2026-07-31">31 July 2026</time> by Tawsif Ahmed, the author of the app. Last revised <time datetime="2026-08-01">1 August 2026</time>. It reflects the state of the app as of that later date, and has not been reviewed by an external party.</p>
    `;
}
