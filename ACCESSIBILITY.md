# Accessibility statement

This is the accessibility statement for the CPACC Practice Test project.

## Conformance target

**WCAG 2.2 Level AA** across all user-facing views.

## Audit history

Every UI change in this repository was reviewed by an accessibility-lead agent before merging, including these areas:

- Skip link + focusable `<main>`
- Heading hierarchy (one H1 per view, no skipped levels)
- Radio groups using the WAI-ARIA roving-tabindex pattern, with a visible keyboard hint
- Verdict announcements via a single `aria-live="polite"` region (no dueling live regions)
- Revealed radios use `aria-disabled` instead of native `disabled`, so keyboard review still works
- Decorative emoji wrapped in `aria-hidden="true"`
- AI provenance badges via native `<details>`/`<summary>` (no custom disclosure widget)
- Confidence pills use paired color + shape glyph + text (WCAG 1.4.1)
- `prefers-reduced-motion: reduce` honored for scroll behavior
- Color contrast: text ≥ 4.5:1, UI components ≥ 3:1
- Touch target sizes ≥ 24×24 CSS px
- Page-level "About AI in this app" uses a native `<dialog>` with focus return on close
- Mobile-vs-desktop kbd hint adapts via `(pointer: coarse)` so iPhone VoiceOver users don't hear keyboard mechanics

The full accessibility audit and remediation history is captured in the git log under the `fix(a11y):` prefix.

## Test coverage

`tests/views.test.js` (jsdom) asserts the accessibility contracts of every view as machine-checkable invariants. Examples:

- index.html shell has the skip link and focusable `<main>`
- every view has exactly one h1
- the question view's radiogroup, verdict region, submit-answer states, and aria-describedby targets all resolve
- revealed radios use `aria-disabled` not native `disabled`
- the provenance badge has the expected structure (labeled summary, dual-encoded confidence pill, semantic `<dl>` card)
- the AI-info dialog is properly labelled
- decorative emoji are `aria-hidden`

`npm test` must pass green for any PR to merge.

## Known limitations

- **AI live chat responses are not pre-reviewed.** This is by design and clearly labeled in the UI (permanent amber banner above every chat transcript). See `AI_TRANSPARENCY.md` for the full discussion. Chat content quality varies per query; users are explicitly asked to verify against authoritative sources.
- **Cross-device missed-question sync requires the local Node deploy.** The Cloudflare Pages deploy falls back to per-browser `localStorage`. This is a UX limitation, not an a11y limitation, but worth flagging.
- **The 71-condition disabilities reference goes deeper than the CPACC exam tests.** Labeled with "Goes beyond CPACC scope — for deeper study" on both the home card and the page itself.
- **Mermaid diagrams in `ARCHITECTURE.md` are SVG renderings handled inconsistently by screen readers.** Every diagram is paired with a visible plain-text description; the prose is the source of truth.

## Reporting an accessibility issue

Please open an issue using the [accessibility template](.github/ISSUE_TEMPLATE/accessibility.yml).

Accessibility issues are triaged ahead of other bugs.

## Conformance scope

This statement applies to:

- The deployed site at https://cpacc-test-maker.pages.dev
- The source code in this repository as of the latest commit

It does **not** cover:

- The IAAP CPACC Body of Knowledge PDF itself (third-party content)
- Anthropic's chat responses (live AI output, by definition unreviewed)

## Last reviewed

See the latest commit timestamp on this file via `git log ACCESSIBILITY.md`.
