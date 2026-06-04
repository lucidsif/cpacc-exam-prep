<!--
Thank you for contributing. The checklist below is the bar for merging.
Delete anything that doesn't apply. Add anything that does.
-->

## What

<!-- One or two sentences. What does this PR change? -->

## Why

<!-- The motivation. Linked issue or user problem. -->

## How

<!-- Brief description of the approach. Reviewers should be able to scan this and know where to look. -->

## Checklist

- [ ] Tests pass locally (`npm test`)
- [ ] No new runtime dependencies (devDeps for tests are fine)
- [ ] Commit messages explain *why*, not just *what*
- [ ] Changes touched only files relevant to the stated goal

### If this is a UI change

- [ ] Accessibility checklist applied (see `CONTRIBUTING.md`)
- [ ] Manually verified keyboard-only navigation works on the new/changed view
- [ ] If a new view: assertions added in `tests/views.test.js` for its a11y contract
- [ ] Decorative emoji wrapped in `aria-hidden="true"`
- [ ] Color contrast checked (text ≥ 4.5:1, UI components ≥ 3:1)

### If this adds/changes a question

- [ ] Item id is unique across `data/questions.js` and `data/bear-questions.js`
- [ ] `cite` field references the BoK page or authoritative source
- [ ] All four `why.A`..`why.D` rationales are present
- [ ] If confidence < high, a `flag` field explains the uncertainty

### If this changes AI-touched content

- [ ] Provenance updated to reflect the change (citation, generatedAt, humanReview)
- [ ] If the source bucket changed, the per-item `provenance` override is set
- [ ] `AI_TRANSPARENCY.md` updated if a content category is added/removed

### If this touches the deploy

- [ ] Verified `npm run build` produces a clean `dist/`
- [ ] `wrangler pages dev dist` works locally
- [ ] No copyrighted or personal data added to the deploy
