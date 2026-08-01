// src/views/accessibility.js — accessibility statement (static content, no state).
//
// Unlike disabilities.js/legal.js this view has no category/list sub-state:
// it's one static page, so applyPath() in router.js treats "#/accessibility"
// as always restorable and there's nothing to add to state.js beyond the
// `view` union entry.

import { escapeHtml } from '../dom.js';

// TODO(author): email is live. GitHub issues is the intended second channel
// but the repo has no remote yet and isn't public, so there's no URL to
// publish. Once it's pushed and public, add a second <p> below pointing at
// the issues URL (e.g. https://github.com/<owner>/<repo>/issues).
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
      <div class="sub">Last reviewed <time datetime="2026-07-31">31 July 2026</time>.</div>
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
      <p>Everything in "What has been fixed" below is therefore verified by automated tests and by manual keyboard testing in one browser. Not by a screen reader user.</p>

      <h3>Other open questions</h3>
      <ol>
        <li><b>No Safari or Firefox testing at all.</b> Everything manual described in this statement was checked in Chromium. Safari and Firefox have not been exercised for anything — the focus-ring question below is one specific case of this, not the only one.</li>
        <li><b>Focus ring on programmatic focus outside Chromium.</b> When you navigate, focus is moved to the heading by script rather than by pressing Tab. The focus indicator is confirmed visible in Chromium. Whether it renders in Safari and Firefox on a programmatic focus move has not been checked.</li>
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
        <dd>Over 120 automated tests against a simulated DOM, including regression tests written specifically for the focus behaviour, the skip link, and the colour-only state indicators, so those bugs cannot come back unnoticed. A simulated DOM does not paint pixels or build a real accessibility tree, so these tests cannot tell you what a screen reader will say.</dd>
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
      </ul>

      <h2>Feedback</h2>
      <p>We want to hear about accessibility problems with this app. If something does not work for you, tell us what you were trying to do and what assistive technology or browser you were using.</p>
      <p>We aim to respond to accessibility reports within one week. Accessibility issues are triaged ahead of other bugs.</p>
      ${feedbackContact}

      <h2>Preparation of this statement</h2>
      <p>Prepared on <time datetime="2026-07-31">31 July 2026</time> by Tawsif Ahmed, the author of the app. It reflects the state of the app as of that date and has not been reviewed by an external party.</p>
    `;
}
