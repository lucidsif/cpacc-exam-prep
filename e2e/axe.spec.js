// e2e/axe.spec.js — automated axe-core scans against every route, in a real
// browser with a real accessibility tree. jsdom cannot build one at all
// (there's no layout, no computed style, no platform accessibility API to
// query), so this is the one thing in the whole suite that most directly
// answers "does this pass automated accessibility checks", as opposed to
// "is the DOM wired the way we intended it to be".
//
// Tag level: wcag2a + wcag2aa + wcag22aa — matches the standard the app's
// own accessibility statement targets (WCAG 2.2 Level AA; see
// src/views/accessibility.js).
//
// If a route ever produces a violation here, the fix is to report it (see
// this file's own describe block below and the task that produced it) or
// fix the underlying markup — never to add the rule to a disabled list to
// force the run green. A suppressed violation in an accessibility tool's
// own test suite is worse than no test at all.

import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const AXE_TAGS = ['wcag2a', 'wcag2aa', 'wcag22aa'];

async function runAxe(page) {
  return new AxeBuilder({ page }).withTags(AXE_TAGS).analyze();
}

// Human-readable failure message so a violation shows up in the test
// output as something actionable, not just "expected [] to equal [...]".
function describeViolations(violations) {
  return violations
    .map(v => `[${v.id}] (${v.impact}) ${v.description} — ${v.nodes.length} node(s): ${v.nodes.map(n => n.target.join(' ')).join(', ')}`)
    .join('\n');
}

test('home (#/) has zero automated accessibility violations', async ({ page }) => {
  await page.goto('/');
  const results = await runAxe(page);
  expect(results.violations, describeViolations(results.violations)).toEqual([]);
});

test('a test question (#/test/1) has zero automated accessibility violations', async ({ page }) => {
  await page.goto('/');
  await page.locator('#start').click();
  await expect(page.locator('h1')).toHaveText('Question 1 of 20');
  const results = await runAxe(page);
  expect(results.violations, describeViolations(results.violations)).toEqual([]);
});

test('results (#/results) has zero automated accessibility violations', async ({ page }) => {
  await page.goto('/');
  await page.locator('#start').click();
  await expect(page.locator('h1')).toHaveText('Question 1 of 20');

  // Reach results the fastest honest way: jump straight to the last
  // question via the jump grid, then submit. Most questions stay
  // unanswered, which triggers the "N question(s) still unanswered" native
  // confirm() in submitAllBtn's onclick (src/views/question.js) — accept it
  // like a real user clicking through, rather than dodging it.
  await page.locator('[data-i="19"]').click();
  await expect(page.locator('h1')).toHaveText('Question 20 of 20');
  page.once('dialog', d => d.accept());
  await page.locator('#submit-all').click();
  await expect(page.locator('h1')).toHaveText('Results');

  const results = await runAxe(page);
  expect(results.violations, describeViolations(results.violations)).toEqual([]);
});

test('flashcards (#/flashcards) has zero automated accessibility violations', async ({ page }) => {
  await page.goto('/');
  await page.locator('#start-flashcards').click();
  await expect(page.locator('h1')).toHaveText('Bear notes flashcards');
  const results = await runAxe(page);
  expect(results.violations, describeViolations(results.violations)).toEqual([]);
});

test('disabilities category grid (#/disabilities) has zero automated accessibility violations', async ({ page }) => {
  await page.goto('/#/disabilities');
  await expect(page.locator('h1')).toBeVisible();
  const results = await runAxe(page);
  expect(results.violations, describeViolations(results.violations)).toEqual([]);
});

test('a disabilities category list (#/disabilities/visual) has zero automated accessibility violations', async ({ page }) => {
  await page.goto('/#/disabilities/visual');
  await expect(page.locator('h1')).toBeVisible();
  const results = await runAxe(page);
  expect(results.violations, describeViolations(results.violations)).toEqual([]);
});

test('legal jurisdiction grid (#/legal) has zero automated accessibility violations', async ({ page }) => {
  await page.goto('/#/legal');
  await expect(page.locator('h1')).toBeVisible();
  const results = await runAxe(page);
  expect(results.violations, describeViolations(results.violations)).toEqual([]);
});

test('a legal jurisdiction list (#/legal/usa) has zero automated accessibility violations', async ({ page }) => {
  await page.goto('/#/legal/usa');
  await expect(page.locator('h1')).toBeVisible();
  const results = await runAxe(page);
  expect(results.violations, describeViolations(results.violations)).toEqual([]);
});

test('accessibility statement (#/accessibility) has zero automated accessibility violations', async ({ page }) => {
  await page.goto('/#/accessibility');
  await expect(page.locator('h1')).toHaveText('Accessibility statement');
  const results = await runAxe(page);
  expect(results.violations, describeViolations(results.violations)).toEqual([]);
});

// Second scan, tagged `best-practice` — a DIFFERENT axe-core tag from the
// wcag2a/wcag2aa/wcag22aa scan above. heading-order, page-has-heading-one,
// empty-heading, landmark-one-main, landmark-unique, and region are all
// tagged `best-practice`, not any wcag2*/wcag22aa tag, so the scan above
// never runs them — even though the app's own accessibility statement and
// README lean on exactly these properties (one <h1> per page, unique
// landmarks) as tested claims. This scan is what actually backs that.
const BEST_PRACTICE_TAGS = ['best-practice'];

async function runBestPracticeAxe(page) {
  return new AxeBuilder({ page }).withTags(BEST_PRACTICE_TAGS).analyze();
}

test.describe('best-practice axe rules (heading order, landmarks) — not covered by the scan above', () => {
  test('home (#/) has zero best-practice violations', async ({ page }) => {
    await page.goto('/');
    const results = await runBestPracticeAxe(page);
    expect(results.violations, describeViolations(results.violations)).toEqual([]);
  });

  test('a test question (#/test/1) has zero best-practice violations', async ({ page }) => {
    await page.goto('/');
    await page.locator('#start').click();
    await expect(page.locator('h1')).toHaveText('Question 1 of 20');
    const results = await runBestPracticeAxe(page);
    expect(results.violations, describeViolations(results.violations)).toEqual([]);
  });

  test('results (#/results) has zero best-practice violations', async ({ page }) => {
    await page.goto('/');
    await page.locator('#start').click();
    await expect(page.locator('h1')).toHaveText('Question 1 of 20');
    await page.locator('[data-i="19"]').click();
    await expect(page.locator('h1')).toHaveText('Question 20 of 20');
    page.once('dialog', d => d.accept());
    await page.locator('#submit-all').click();
    await expect(page.locator('h1')).toHaveText('Results');
    const results = await runBestPracticeAxe(page);
    expect(results.violations, describeViolations(results.violations)).toEqual([]);
  });

  test('flashcards (#/flashcards) has zero best-practice violations', async ({ page }) => {
    await page.goto('/');
    await page.locator('#start-flashcards').click();
    await expect(page.locator('h1')).toHaveText('Bear notes flashcards');
    const results = await runBestPracticeAxe(page);
    expect(results.violations, describeViolations(results.violations)).toEqual([]);
  });

  test('disabilities category grid (#/disabilities) has zero best-practice violations', async ({ page }) => {
    await page.goto('/#/disabilities');
    await expect(page.locator('h1')).toBeVisible();
    const results = await runBestPracticeAxe(page);
    expect(results.violations, describeViolations(results.violations)).toEqual([]);
  });

  test('a disabilities category list (#/disabilities/visual) has zero best-practice violations', async ({ page }) => {
    await page.goto('/#/disabilities/visual');
    await expect(page.locator('h1')).toBeVisible();
    const results = await runBestPracticeAxe(page);
    expect(results.violations, describeViolations(results.violations)).toEqual([]);
  });

  test('legal jurisdiction grid (#/legal) has zero best-practice violations', async ({ page }) => {
    await page.goto('/#/legal');
    await expect(page.locator('h1')).toBeVisible();
    const results = await runBestPracticeAxe(page);
    expect(results.violations, describeViolations(results.violations)).toEqual([]);
  });

  test('a legal jurisdiction list (#/legal/usa) has zero best-practice violations', async ({ page }) => {
    await page.goto('/#/legal/usa');
    await expect(page.locator('h1')).toBeVisible();
    const results = await runBestPracticeAxe(page);
    expect(results.violations, describeViolations(results.violations)).toEqual([]);
  });

  test('accessibility statement (#/accessibility) has zero best-practice violations', async ({ page }) => {
    await page.goto('/#/accessibility');
    await expect(page.locator('h1')).toHaveText('Accessibility statement');
    const results = await runBestPracticeAxe(page);
    expect(results.violations, describeViolations(results.violations)).toEqual([]);
  });
});
