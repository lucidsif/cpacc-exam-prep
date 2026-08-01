// e2e/focus-contract.spec.js — settles the accessibility statement's single
// published open question (src/views/accessibility.js, "Other open
// questions" #2): does the focus indicator render on *programmatic* focus
// — the app moves focus to each route's <h1> by script on every navigation
// (moveFocusToRoute() in src/main.js) — in Safari (WebKit) and Firefox, not
// just the Chromium session the statement says was manually checked?
//
// styles/app.css:
//   :focus:not(:focus-visible) { outline: none; }
//   :focus-visible { outline: 3px solid var(--focus-ring); outline-offset: 2px; }
//   .route-focus { outline: 3px solid var(--focus-ring); outline-offset: 2px; }
// --focus-ring is #ffd479, i.e. rgb(255, 212, 121).
//
// Whether a script-focused element matches :focus-visible is a heuristic
// each rendering engine implements on its own — there is no single spec
// algorithm all three follow identically, and jsdom (tests/, `npm test`)
// has no notion of focus modality or computed style at all, so this is
// something only a real browser can answer for the "WITH prior keyboard
// interaction" block below. The "WITHOUT" block no longer depends on that
// heuristic at all: moveFocusToRoute() (src/main.js) applies a
// `route-focus` class to whatever it focuses by script, and that class
// paints the ring unconditionally — fixing the case a pointer-only/AT
// user (switch device, eye-tracking, sip-and-puff, magnifier) hits on
// every single navigation, since they never press a key to establish
// keyboard modality first.
//
// CRITICAL METHODOLOGY NOTE — read before changing anything below:
// A freshly-launched Playwright page has never received a real input
// event, so the browser starts in *no* focus modality. A first manual
// check against Chromium in exactly that state found NO ring on a
// script-focused element — not because Chromium fails to paint one on
// programmatic focus, but because nothing had yet told the browser this
// was a keyboard session. Sending one genuine keypress first
// (page.keyboard.press — a real KeyboardEvent, not synthetic dispatch) put
// the session into keyboard modality; the *same* script-focused element
// then matched :focus-visible and painted `solid 3px rgb(255, 212, 121)`
// with a 2px offset. Skip the keypress and every browser below reproduces
// that false negative — it would look like a real cross-engine bug but is
// actually a test-harness artifact. Every "the ring should render" test
// below does a real keypress before navigating, for exactly this reason.
// The "no prior keyboard interaction" test is kept too, on purpose — now
// as the fix verification for the cold mouse-only session, not a
// documented defect control — not an oversight, and not something to
// delete because it "looks redundant" next to the block above.
//
// Both describe blocks run identically on all three configured engines
// (see playwright.config.js's `projects` list) — nothing here is
// browser-specific by intent. If a browser's actual result diverges from
// another's, that divergence must show up as a different assertion result
// per project, not be paved over.

import { test, expect } from '@playwright/test';

const FOCUS_RING = 'rgb(255, 212, 121)'; // --focus-ring: #ffd479

async function focusRingOf(locator) {
  return locator.evaluate(el => {
    const cs = getComputedStyle(el);
    return {
      matchesFocusVisible: el.matches(':focus-visible'),
      outlineStyle: cs.outlineStyle,
      outlineWidth: cs.outlineWidth,
      outlineColor: cs.outlineColor,
    };
  });
}

test.describe('focus ring on programmatic focus — WITH prior keyboard interaction', () => {
  test('Start button (click-through nav) lands on a ring-painted <h1>', async ({ page }) => {
    await page.goto('/');

    // Real keypress establishes keyboard modality for the whole session
    // before any navigation happens. It lands on the skip link (see
    // navigation.spec.js for the full tab-order contract) — that landing
    // spot is incidental here; the only thing that matters is that a
    // genuine KeyboardEvent has now occurred.
    await page.keyboard.press('Tab');

    // Move programmatic focus onto the Start button, then activate it with
    // a real Enter keypress — a locator.focus() placement plus a genuine
    // key event, not a synthetic click. This also sidesteps the WebKit-only
    // Tab quirk documented in navigation.spec.js (plain Tab does not visit
    // buttons/links there by default), which is irrelevant to what this
    // spec is testing: the ring on the *destination* of a script-driven
    // focus move, not how the user's Tab key reached the trigger control.
    await page.locator('#start').focus();
    await page.keyboard.press('Enter');

    // startTest() in src/main.js sets state.view = 'test' and calls
    // render(); render()'s isNavigation branch calls moveFocusToRoute(),
    // which does target.focus() on the new <h1> — entirely by script.
    const h1 = page.locator('h1');
    await expect(h1).toHaveText('Question 1 of 20');

    const ring = await focusRingOf(h1);
    expect(ring.matchesFocusVisible).toBe(true);
    expect(ring.outlineStyle).toBe('solid');
    expect(ring.outlineWidth).toBe('3px');
    expect(ring.outlineColor).toBe(FOCUS_RING);
  });

  test('a link-driven route change (Accessibility statement) also lands on a ring-painted <h1>', async ({ page }) => {
    // Second, independent navigation path (a real <a href> rather than a
    // <button>) so this isn't just proving the result for one control.
    await page.goto('/');
    await page.keyboard.press('Tab');

    const link = page.getByRole('link', { name: 'Accessibility statement' });
    await link.focus();
    await page.keyboard.press('Enter');

    const h1 = page.locator('h1');
    await expect(h1).toHaveText('Accessibility statement');

    const ring = await focusRingOf(h1);
    expect(ring.matchesFocusVisible).toBe(true);
    expect(ring.outlineStyle).toBe('solid');
    expect(ring.outlineWidth).toBe('3px');
    expect(ring.outlineColor).toBe(FOCUS_RING);
  });
});

test.describe('focus ring on programmatic focus — WITHOUT prior keyboard interaction (fix verification)', () => {
  test('a mouse-only session, with zero prior key events, still paints the ring on the script-focused <h1>', async ({ page }) => {
    await page.goto('/');
    // Deliberately no keyboard.press() anywhere above this line: this page
    // has not received a single real input event of any kind before the
    // click below — the "no focus modality established yet" scenario
    // described in the module doc comment above. Before the fix, a
    // script-focused element in this exact state matched neither browser
    // default focus styling nor :focus-visible, so pointer-only/AT users
    // (switch device, eye-tracking, sip-and-puff, screen magnifier) who
    // never press a key got no visible indicator at all after any
    // navigation. moveFocusToRoute() (src/main.js) now adds a `route-focus`
    // class to whatever it focuses (removed on blur), and
    // styles/app.css's `.route-focus` rule paints the same 3px amber ring
    // unconditionally — independent of the :focus-visible heuristic this
    // describe block's sibling above depends on. This test is kept, not
    // deleted, as the explicit regression check for that: a future change
    // that makes this diverge from the "WITH keyboard interaction" tests
    // above is the signal the fix broke, not something to quietly drop.
    await page.locator('#start').click();

    const h1 = page.locator('h1');
    await expect(h1).toHaveText('Question 1 of 20');
    await expect(h1).toHaveClass(/route-focus/);

    const ring = await focusRingOf(h1);
    expect(ring.outlineStyle).toBe('solid');
    expect(ring.outlineWidth).toBe('3px');
    expect(ring.outlineColor).toBe(FOCUS_RING);
  });
});
