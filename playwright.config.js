// playwright.config.js — end-to-end / real-browser test configuration.
//
// WHY this suite exists (see e2e/smoke.spec.js and the app's own published
// accessibility statement at src/views/accessibility.js, route
// #/accessibility): the jsdom unit suite (tests/, run via `npm test`) is
// fast and covers DOM structure, ARIA wiring, and focus-restoration logic
// exhaustively — but jsdom never lays out a page, paints a pixel, computes
// a style, or builds a real accessibility tree. It structurally cannot
// answer two things the accessibility statement leaves open:
//   1. Manual keyboard testing was done in Chromium only.
//   2. Whether the focus indicator renders on *programmatic* focus (the
//      app moves focus to each route's <h1> by script on navigation) in
//      Safari (WebKit) and Firefox — :focus-visible behaviour there is
//      browser-dependent and was never checked.
// Running the same specs across chromium, firefox, and webkit is the
// single highest-value thing this suite buys the project. Don't drop a
// browser from the `projects` list below to make CI green — a failure to
// install or run on one engine IS the answer to the open question above,
// and belongs in a bug report, not silently removed from coverage.
//
// This pulls in @playwright/test and @axe-core/playwright as
// devDependencies only. The project's README advertises "zero runtime
// dependencies" — that claim is about the shipped app (see index.html,
// which loads no bundler output, no npm package at runtime), not the dev
// toolchain. jsdom is already a devDependency for the same reason.

import { defineConfig, devices } from '@playwright/test';

const PORT = 8787;
const BASE_URL = `http://localhost:${PORT}`;

export default defineConfig({
  testDir: './e2e',

  // Real browsers are slower and flakier than jsdom by nature (real
  // rendering, real network, real timing) — a small retry budget in CI
  // absorbs that without masking genuine regressions. Locally, retries
  // stay off so a failure is seen on the first try, not the third.
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  forbidOnly: !!process.env.CI,

  reporter: process.env.CI ? [['html', { open: 'never' }], ['list']] : 'list',

  use: {
    baseURL: BASE_URL,
    // Trace + screenshot on failure, not on every run — this suite's
    // whole point is visual/computed-style assertions that are hard to
    // debug from a stack trace alone, so it's worth paying for on the
    // runs that actually fail.
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'off',
    // Deliberately NOT set here: colorScheme, reducedMotion, forcedColors.
    // The app has explicit prefers-reduced-motion handling (styles/app.css)
    // that a later spec may want to exercise deliberately per-test — a
    // global default here would either hide that axis or force every
    // other test to override it.
  },

  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],

  // Starts the same server a developer runs locally (`node server.js`), so
  // `npm run test:e2e` is one command with no manual setup step. No LLM_*
  // env vars are passed, so /chat-status resolves to "disabled" — fine for
  // specs that don't exercise the chat feature; a spec that needs chat
  // enabled should stub the network call rather than depend on a real
  // provider key being present in the environment.
  webServer: {
    command: 'node server.js',
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 30_000,
    env: { PORT: String(PORT) },
  },
});
