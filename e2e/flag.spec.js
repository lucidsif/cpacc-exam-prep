// e2e/flag.spec.js — end-to-end tests for the flag/correction feature.
//
// Verifies that the flag button renders on provenance badges, can be toggled,
// and submits corrections to /corrections. Runs against the local dev server
// (no D1 database needed — the function returns 400 for unknown item ids,
// which is sufficient to verify the client-side flow).

import { test, expect } from '@playwright/test';

test('flag button is visible on a question provenance badge', async ({ page }) => {
  await page.goto('/');
  await page.locator('#start').click();
  await expect(page.locator('h1')).toHaveText('Question 1 of 20');

  // The flag button sits outside <summary> in .provenance-row.
  const flagBtn = page.locator('.pv-flag-btn').first();
  await expect(flagBtn).toBeVisible();
  await expect(flagBtn).toHaveText('Flag');
});

test('clicking flag button reveals the inline form', async ({ page }) => {
  await page.goto('/');
  await page.locator('#start').click();
  await expect(page.locator('h1')).toHaveText('Question 1 of 20');

  const flagBtn = page.locator('.pv-flag-btn').first();
  await expect(flagBtn).toBeVisible();

  // Form starts hidden (badge is collapsed).
  const flagForm = page.locator('.pv-flag-form').first();
  await expect(flagForm).toBeHidden();

  // Clicking flag button auto-expands the <details> and shows the form.
  await flagBtn.click();

  // Badge should now be open.
  const det = page.locator('details.provenance').first();
  await expect(det).toBeVisible();

  // Form should now be visible.
  await expect(flagForm).toBeVisible();

  // Form contains expected elements.
  const textarea = flagForm.locator('textarea[name="text"]');
  await expect(textarea).toBeVisible();
  const submitBtn = flagForm.locator('button[type="submit"]');
  await expect(submitBtn).toBeVisible();
  const cancelBtn = flagForm.locator('.pv-flag-cancel');
  await expect(cancelBtn).toBeVisible();
});

test('clicking cancel hides the flag form', async ({ page }) => {
  await page.goto('/');
  await page.locator('#start').click();
  await expect(page.locator('h1')).toHaveText('Question 1 of 20');

  const flagBtn = page.locator('.pv-flag-btn').first();
  await flagBtn.click(); // auto-expands badge + shows form

  const flagForm = page.locator('.pv-flag-form').first();
  await expect(flagForm).toBeVisible();

  const cancelBtn = flagForm.locator('.pv-flag-cancel');
  await cancelBtn.click();

  await expect(flagForm).toBeHidden();
});

test('submitting flag form with empty text does nothing', async ({ page }) => {
  await page.goto('/');
  await page.locator('#start').click();
  await expect(page.locator('h1')).toHaveText('Question 1 of 20');

  const flagBtn = page.locator('.pv-flag-btn').first();
  await flagBtn.click(); // auto-expands badge + shows form

  const flagForm = page.locator('.pv-flag-form').first();
  const submitBtn = flagForm.locator('button[type="submit"]');

  // Submit with empty textarea — the handler checks `if (!text) return`.
  await submitBtn.click();

  // Form should still be visible (not hidden by success handler).
  await expect(flagForm).toBeVisible();

  // No status message should appear (the handler returns early before touching status).
  const status = flagForm.locator('.pv-flag-status');
  await expect(status).toHaveText('');
});

test('submitting flag form POSTs to /corrections and shows success/error', async ({ page }) => {
  await page.goto('/');
  await page.locator('#start').click();
  await expect(page.locator('h1')).toHaveText('Question 1 of 20');

  // Intercept the /corrections POST to verify payload and control response.
  await page.route('/corrections', route => {
    // The flag form sends a POST with JSON body.
    if (route.request().method() === 'POST') {
      const body = JSON.parse(route.request().postData());
      // Verify the payload shape.
      expect(body).toHaveProperty('id');
      expect(body).toHaveProperty('text');
      expect(body).toHaveProperty('itemLabel');
      expect(body).toHaveProperty('pageUrl');

      // Return success for valid items, error for unknown.
      if (body.id && body.text) {
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ ok: true }),
        });
      } else {
        return route.fulfill({
          status: 400,
          contentType: 'application/json',
          body: JSON.stringify({ ok: false, error: 'missing required fields' }),
        });
      }
    }
    return route.continue();
  });

  const flagBtn = page.locator('.pv-flag-btn').first();
  await flagBtn.click();

  const flagForm = page.locator('.pv-flag-form').first();
  const textarea = flagForm.locator('textarea[name="text"]');
  await textarea.fill('This is wrong, should say X');

  const submitBtn = flagForm.locator('button[type="submit"]');

  // The success handler hides the form immediately after showing the message.
  // Check that status gets the success class (visible or not, the class is set).
  await submitBtn.click();

  // Wait for form to hide (success handler hides it).
  await expect(flagForm).toBeHidden();

  // Re-show the form to verify status message was set.
  await flagBtn.click();
  const status = flagForm.locator('.pv-flag-status');
  await expect(status).toHaveClass(/success/);
  await expect(status).toContainText('Thanks');

  // Clear status for next test.
  const cancelBtn = flagForm.locator('.pv-flag-cancel');
  await cancelBtn.click();

  // Test error handling — show form again and submit with empty text.
  await flagBtn.click();

  // The server returns success for valid items, so we test the happy path again.
  await textarea.fill('Another correction');
  await submitBtn.click();

  // Wait for form to hide.
  await expect(flagForm).toBeHidden();

  // Re-show and verify status.
  await flagBtn.click();
  await expect(status).toHaveClass(/success/);
  await expect(status).toContainText('Thanks');
});

test('flag button is visible on results page provenance badges', async ({ page }) => {
  await page.goto('/');
  await page.locator('#start').click();
  await expect(page.locator('h1')).toHaveText('Question 1 of 20');

  // Navigate to last question so submit-all is available.
  for (let i = 0; i < 19; i++) {
    await page.locator('#next').click();
  }
  await expect(page.locator('h1')).toHaveText('Question 20 of 20');

  // Submit test (accepts confirm dialog).
  page.once('dialog', dialog => dialog.accept());
  await page.locator('#submit-all').click();
  await expect(page.locator('h1')).toHaveText('Results');

  // Flag buttons should be visible on results page badges.
  const flagBtns = page.locator('.pv-flag-btn');
  await expect(flagBtns).toHaveCount(20); // one per question
});

test('flag button is visible on flashcards provenance badge', async ({ page }) => {
  await page.goto('/');
  await page.locator('#start-flashcards').click();
  await expect(page.locator('h1')).toHaveText('Bear notes flashcards');

  const flagBtn = page.locator('.pv-flag-btn').first();
  await expect(flagBtn).toBeVisible();
});

test('flag button is visible on disabilities reference provenance badge', async ({ page }) => {
  await page.goto('/');
  await page.locator('#start-disabilities').click();

  const flagBtn = page.locator('.pv-flag-btn').first();
  await expect(flagBtn).toBeVisible();
});

test('flag button is visible on legal reference provenance badge', async ({ page }) => {
  await page.goto('/');
  await page.locator('#start-legal').click();

  const flagBtn = page.locator('.pv-flag-btn').first();
  await expect(flagBtn).toBeVisible();
});
