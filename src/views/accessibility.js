// src/views/accessibility.js — accessibility statement (static content, no state).
//
// Unlike disabilities.js/legal.js this view has no category/list sub-state:
// it's one static page, so applyPath() in router.js treats "#/accessibility"
// as always restorable and there's nothing to add to state.js beyond the
// `view` union entry.

import { escapeHtml } from '../dom.js';

// TODO(author): email is the working feedback channel. GitHub issues is the
// intended second channel, but the repo/owner name isn't finalized yet, so
// there's no URL to publish. Once the repo exists, add a second <p> below
// pointing at its issues URL (e.g. https://github.com/<owner>/<repo>/issues).
const FEEDBACK_CONTACT = 'tawsif@perenniala11y.com';

/**
 * Render the accessibility statement page into ctx.app.
 * @param {{ app: HTMLElement }} ctx
 */
export function renderAccessibility(ctx) {
  const { app } = ctx;

  const feedbackContact = FEEDBACK_CONTACT
    ? `<p>Report accessibility issues to <a href="mailto:${escapeHtml(FEEDBACK_CONTACT)}">${escapeHtml(FEEDBACK_CONTACT)}</a>. A public issue tracker will be added as a second reporting channel once this project is published.</p>`
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
      <p>Partially conformant means some parts may not fully meet the standard. Here that is not because specific failures are known and unfixed. It is because the evidence needed to claim full conformance is incomplete. Several kinds of evidence are still missing, starting with manual screen reader testing of the current version — see "What has not been verified" below for the rest.</p>
      <p>We believe the current version meets WCAG 2.2 Level AA. We are not claiming that it does, because we have not finished checking.</p>

      <h2>What has not been verified</h2>
      <p>This section is the most important part of this statement.</p>

      <h3>Screen reader testing predates the current version</h3>
      <p>Manual screen reader testing was done in the past on desktop and mobile, using NVDA, JAWS, and VoiceOver. That testing was done on an older version of the app.</p>
      <p>On 31 July 2026 a large set of accessibility changes shipped, altering focus behaviour, heading structure, live region announcements, flashcard markup, and the answer choice controls. None of it has been re-tested with a screen reader. A fresh manual pass is planned but has not happened yet.</p>
      <p>Everything in "What has been fixed" below is therefore verified by automated tests, plus manual keyboard testing of the focus and navigation work specifically, in one browser. Not by a screen reader user.</p>

      <h3>Other open questions</h3>
      <ol>
        <li><b>Browser testing beyond Chromium is automated, not manual.</b> An automated test suite (Playwright) now exercises Chromium, Firefox, and WebKit (Safari's engine) — including confirming that the focus ring on programmatic focus renders correctly in all three (see "How this app was evaluated"). That is a script driving a real browser, not a person using the app by hand, and none of the three engines has been tested with a screen reader.</li>
        <li><b>Zoom, reflow, and text spacing.</b> WCAG 1.4.4 (Resize Text), 1.4.10 (Reflow), and 1.4.12 (Text Spacing) have not been evaluated on any view.</li>
      </ol>

      <h3>No independent audit</h3>
      <p>No third party has audited this app. All testing described here was performed by the author, who built it.</p>

      <h2>What has been fixed</h2>
      <p>A substantial accessibility remediation shipped on 31 July 2026.</p>

      <h3>Focus and navigation</h3>
      <ul>
        <li>Focus now moves to the visible page heading on every navigation (previously only on browser Back and Forward, so roughly twenty click-driven paths dropped focus to the top of the document).</li>
        <li>In-place updates such as sending a chat message or flipping a flashcard now keep your focus and text cursor position.</li>
        <li>The "Skip to main content" link used to eject you from a test in progress back to the home page and no longer does.</li>
        <li>The individual disability pages and individual law and standard pages had no page heading at all and both now have a visible one.</li>
      </ul>

      <h3>Screen reader content</h3>
      <ul>
        <li>Flashcard content was entirely hidden from screen readers because the whole card was a button whose label replaced its contents; card content is now real text with a separate flip button.</li>
        <li>AI provenance badges hid their own visible label and confidence level for the same reason and are fixed.</li>
        <li>Chat replies and errors are now announced through a live region that survives the page being redrawn.</li>
        <li>Chat transcripts are explicitly marked non-live (<code>aria-live="off"</code>), so that dedicated region is intended to be the only path a reply or error is announced through, rather than leaving open whether the transcript itself would also announce it.</li>
        <li>Landmark regions were added and each page sets its own page title.</li>
      </ul>

      <h3>Controls</h3>
      <p>After revealing an answer, the answer choices claimed to be disabled but still responded to arrow keys, moving the selection away from the graded answer. They are now genuinely disabled.</p>

      <h3>Colour and motion</h3>
      <ul>
        <li>Four places used colour as the only way to tell states apart and all four now have a second cue (chat speaker labels, a glyph marking answered questions in the jump grid, a visible ring on the current question, an underline on the "About AI" link).</li>
        <li>Reduced motion preferences are honoured.</li>
        <li>A fallback focus indicator was added for browsers without <code>:focus-visible</code> support.</li>
      </ul>

      <h2>How this app was evaluated</h2>
      <dl>
        <dt>Automated testing</dt>
        <dd>Two automated suites run on every change, well over 150 tests between them. A jsdom suite checks DOM structure and ARIA wiring against a simulated document, including regression tests written specifically for the focus behaviour, the skip link, and the colour-only state indicators, so those bugs cannot come back unnoticed — but a simulated document does not paint pixels, compute a real style, or build a real accessibility tree. A separate end-to-end suite (below) drives real browsers and covers exactly that gap.</dd>
        <dt>Automated cross-browser testing</dt>
        <dd>An end-to-end suite (Playwright) drives real Chromium, Firefox, and WebKit (Safari's engine) — 60 tests, run four times with zero flake. This is what confirmed the focus ring question above: on programmatic focus (the app moving focus to a heading by script, not by pressing Tab), all three engines paint a solid 3px amber outline once a real key has been pressed earlier in the session, via two independent navigation paths (a button and a link). The same suite ran automated accessibility scans (axe-core, covering the automated parts of WCAG 2.0, 2.1, and 2.2 at A and AA) across nine routes in all three engines — 27 checks, zero violations, with no rule suppressed or narrowed to force a pass. All of this is automated behavioural testing: a script driving a real browser, not a person using the app, and a real accessibility tree without a real screen reader reading it. Automated scanning also only catches a minority of accessibility issues by its nature; it is not a substitute for manual or assistive-technology testing. Two behavioural differences this testing found in WebKit are documented in "Known limitations beyond conformance" below.</dd>
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
        <li>Announcements are coalesced on a short timer: if two land within about 75 milliseconds of each other, only the later one is spoken. Because the chat transcripts themselves are silent, a reply that loses that race is not announced at all.</li>
        <li>In WebKit (Safari's engine), the default Tab key only moves focus through form fields, skipping links and buttons entirely. This was confirmed to match real macOS Safari with "Full Keyboard Access" turned off. It is a platform default outside this app's control, not a defect in it — Safari users who turn on Full Keyboard Access, or press Option+Tab, get the same tab order every other browser gives by default.</li>
        <li>In WebKit, clicking a button with a mouse does not move DOM focus onto that button the way Chromium and Firefox do. When a clicked control disables itself as part of handling that click, this app's focus-preservation logic reads WebKit's substitute focus location (the surrounding page landmark) instead of the button, so focus lands there rather than on the next logical control. This affects anyone clicking with a mouse or trackpad in Safari — including AT users who point rather than tab — and does not affect keyboard users on WebKit, since Tab/Enter activation focuses the control correctly there. Unlike the Tab-key default above, this is this app's own fallback reacting to a platform quirk, not an immovable platform limit, so a more targeted fix may be possible later; for now it is documented rather than engineered around.</li>
      </ul>

      <h2>Feedback</h2>
      <p>We want to hear about accessibility problems with this app. If something does not work for you, tell us what you were trying to do and what assistive technology or browser you were using.</p>
      <p>We aim to respond to accessibility reports within one week. Accessibility issues are triaged ahead of other bugs.</p>
      ${feedbackContact}

      <h2>Preparation of this statement</h2>
      <p>Prepared on <time datetime="2026-07-31">31 July 2026</time> by Tawsif Ahmed, the author of the app. It reflects the state of the app as of that date and has not been reviewed by an external party.</p>
    `;
}
