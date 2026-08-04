// e2e/smoke.spec.js — proves the Playwright harness itself works, in a
// real browser, across all three configured engines (chromium, firefox,
// webkit — see playwright.config.js for why all three matter here).
//
// This is deliberately NOT an accessibility spec. It only asserts things
// jsdom (tests/, `npm test`) structurally cannot: that the page actually
// laid out (an element with non-zero rendered dimensions) and that a
// route change works against a real browser's URL/history, not a
// simulated DOM. The substantive accessibility specs — focus rings on
// programmatic focus, :focus-visible across engines, etc. — are a
// separate piece of work; see the accessibility statement at
// src/views/accessibility.js (route #/accessibility) for what's still
// open.

import { test, expect } from '@playwright/test';

test('app boots, renders a laid-out h1, and navigates to a route', async ({ page }) => {
  await page.goto('/');

  const h1 = page.locator('h1');
  await expect(h1).toHaveText('CPACC Prep');

  // A real layout box — this is the thing jsdom cannot give us. jsdom's
  // getBoundingClientRect() always returns zeros; a real browser lays the
  // page out, so a non-zero box here proves this ran in an actual
  // rendering engine, not a simulated one.
  const box = await h1.boundingBox();
  expect(box).not.toBeNull();
  expect(box.width).toBeGreaterThan(0);
  expect(box.height).toBeGreaterThan(0);

  // Navigate to one route via a real link click (not a scripted
  // location.hash assignment) and confirm both the URL and the new
  // page's heading updated — proves routing, not just initial render.
  await page.getByRole('link', { name: 'Accessibility statement' }).click();
  await expect(page).toHaveURL(/#\/accessibility$/);
  await expect(page.locator('h1')).toHaveText('Accessibility statement');
});
