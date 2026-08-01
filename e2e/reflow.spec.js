// e2e/reflow.spec.js — WCAG 1.4.10 (Reflow) regression coverage for the two
// screens that render styles/app.css's .grid: the question view's jump-to
// nav and the results overview grid. A fixed 10-column grid with a 24px
// per-cell minimum and a 6px gap needs 294px of width; below roughly 378px
// of viewport width (a 320 or 375px phone included), the container inside
// .wrap/.panel is narrower than that, forcing a horizontal scrollbar
// instead of wrapping. jsdom (tests/, `npm test`) never lays out a page —
// its scrollWidth/clientWidth are always 0 — so this is something only a
// real browser can confirm. playwright.config.js's `mobile-320` project
// runs this (and every other) spec at a 320px-wide viewport specifically
// so this can't come back unnoticed on the narrowest common phone width;
// it's also checked here at whatever width each other project uses, so a
// regression at any viewport is caught, not just the narrowest one.

import { test, expect } from '@playwright/test';

async function hasNoHorizontalOverflow(page) {
  return page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth);
}

test('question view grid does not force horizontal scroll', async ({ page }) => {
  await page.goto('/');
  await page.locator('#start').click();
  await expect(page.locator('h1')).toHaveText('Question 1 of 20');
  expect(await hasNoHorizontalOverflow(page)).toBe(true);
});

test('results grid does not force horizontal scroll', async ({ page }) => {
  await page.goto('/');
  await page.locator('#start').click();
  await expect(page.locator('h1')).toHaveText('Question 1 of 20');
  await page.locator('[data-i="19"]').click();
  await expect(page.locator('h1')).toHaveText('Question 20 of 20');
  page.once('dialog', d => d.accept());
  await page.locator('#submit-all').click();
  await expect(page.locator('h1')).toHaveText('Results');
  expect(await hasNoHorizontalOverflow(page)).toBe(true);
});
