// e2e/motion-and-live-region.spec.js — Priority 4 items: two things worth
// confirming in a real browser but lower-stakes than the focus-ring
// question (focus-contract.spec.js) or the manual-check regressions
// (navigation.spec.js).

import { test, expect } from '@playwright/test';

test('prefers-reduced-motion neutralises the .choice transition', async ({ page }) => {
  // styles/app.css: `@media (prefers-reduced-motion: reduce) { * {
  // transition: none !important; } }`. jsdom never computes style, so this
  // media query has literally never been evaluated before this test.
  // .choice (question.js's answer options) is the one element in the app
  // with a real `transition:` declaration outside that override, which is
  // what makes it a meaningful control: asserting "none" on an element that
  // never had a transition to begin with would prove nothing.
  await page.goto('/');
  await page.locator('#start').click();
  const choice = page.locator('.choice').first();
  await expect(choice).toBeVisible();

  const normal = await choice.evaluate(el => getComputedStyle(el).transitionProperty);
  expect(normal).not.toBe('none');

  await page.emulateMedia({ reducedMotion: 'reduce' });
  const reduced = await choice.evaluate(el => getComputedStyle(el).transitionProperty);
  expect(reduced).toBe('none');
});

test('#route-status receives the answer-submit announcement after the 75ms coalescing timer, in a real browser', async ({ page }) => {
  // jsdom already tests this exact path (tests/views.test.js, "#route-status
  // live region exists ... and receives text from announce()"), including
  // the 75ms debounce documented on announce() in src/main.js. What jsdom
  // cannot confirm is that the same timing holds up against a real
  // browser's own event loop and timer scheduling, not a simulated one —
  // this is that same assertion, run for real.
  await page.goto('/');
  await page.locator('#start').click();
  await expect(page.locator('h1')).toHaveText('Question 1 of 20');

  await page.locator('input[name="choice"][value="A"]').check();
  await page.locator('#submit-answer').click();

  const routeStatus = page.locator('#route-status');
  // Web-first assertion: toHaveText polls and auto-waits, which is exactly
  // right for a value that only appears after announce()'s setTimeout(...,
  // 75) fires — no arbitrary waitForTimeout needed here, unlike the
  // deliberately-longer wait in the .choice test above's sibling assertion
  // in tests/views.test.js (jsdom's setTimeout there isn't backed by a real
  // event loop the same way).
  await expect(routeStatus).not.toHaveText('');
  const text = await routeStatus.textContent();
  // Which of the two announce() calls in question.js's submit-answer
  // handler fires depends on whether "A" happened to be correct for this
  // randomly-sampled question — either is a valid, timely announcement.
  expect(text === 'Correct.' || /^Incorrect\. The correct answer is [A-D]\.$/.test(text)).toBe(true);
});
