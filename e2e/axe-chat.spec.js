// e2e/axe-chat.spec.js — axe coverage for the chat surface, which the rest
// of this suite never sees. Every other project in playwright.config.js
// runs against a server started with no LLM_* env vars, so /chat-status
// resolves `configured: false`, state.chatEnabled stays false, and
// home.js:95 / results.js:56 render nothing at all — the entire chat
// surface (transcripts, inputs, the results-page toggle, provenance
// banners) has zero axe coverage. This file is scoped (via
// playwright.config.js's 'chat' project, testMatch) to run against a
// SECOND server that sets LLM_PROVIDER=local, which makes chatEnabled
// resolve true with no API key and no reachable endpoint required — no
// spec here sends an actual chat message, so that's fine.

import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const AXE_TAGS = ['wcag2a', 'wcag2aa', 'wcag22aa'];

async function runAxe(page) {
  return new AxeBuilder({ page }).withTags(AXE_TAGS).analyze();
}

function describeViolations(violations) {
  return violations
    .map(v => `[${v.id}] (${v.impact}) ${v.description} — ${v.nodes.length} node(s): ${v.nodes.map(n => n.target.join(' ')).join(', ')}`)
    .join('\n');
}

test('home (#/) with the chat panel rendered has zero automated accessibility violations', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.chat')).toBeVisible();
  const results = await runAxe(page);
  expect(results.violations, describeViolations(results.violations)).toEqual([]);
});

test('results page with a chat transcript open has zero automated accessibility violations', async ({ page }) => {
  await page.goto('/');
  await page.locator('#start').click();
  await expect(page.locator('h1')).toHaveText('Question 1 of 20');
  await page.locator('[data-i="19"]').click();
  await expect(page.locator('h1')).toHaveText('Question 20 of 20');
  page.once('dialog', d => d.accept());
  await page.locator('#submit-all').click();
  await expect(page.locator('h1')).toHaveText('Results');

  const toggle = page.locator('.toggle').first();
  await expect(toggle).toBeVisible();
  await toggle.click();
  await expect(page.locator('.chat').first()).toBeVisible();

  const results = await runAxe(page);
  expect(results.violations, describeViolations(results.violations)).toEqual([]);
});
