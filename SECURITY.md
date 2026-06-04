# Security policy

## Supported versions

This project is a single-version personal study tool. Security fixes land on `main` and are deployed to the live Pages site.

## Reporting a vulnerability

If you discover a security issue:

1. **Do not** open a public GitHub issue with exploit details.
2. **Open a private security advisory** via the repository's **Security → Advisories → New draft security advisory** button on GitHub.
3. If you can't access the advisory flow, open a regular issue titled `[security] please contact` with no details, and a maintainer will reach out.

Please include:

- A description of the issue
- Steps to reproduce
- The impact you believe it has
- Any suggested remediation

You can expect an initial response within 7 days.

## Scope

In scope:

- The deployed app at https://cpacc-test-maker.pages.dev
- The Cloudflare Pages Functions in `functions/`
- The local Node server (`server.js`) when run as documented
- The browser-side code in `src/` and `data/`

Out of scope:

- Vulnerabilities in upstream dependencies (please report to the upstream project; this app has no runtime dependencies)
- Findings that require a malicious local server or compromised browser extension
- Findings in user content the operator has self-hosted from a fork

## Known limitations

- The local `node server.js` deploy has **no authentication**. Running it on a network you don't trust will expose the missed-question state and the chat tutor (if `ANTHROPIC_API_KEY` is set) to anyone on the LAN. Documented in `DEPLOY.md` under the security note.
- The Cloudflare deploy is public by default. If chat is enabled, anyone visiting the public URL can use it, billed to the operator's Anthropic account. There is no rate limiting in the bundled Function — add Cloudflare WAF rules or a middleware Function if you self-host.
- Chat input is sent to the Anthropic API per [their privacy policy](https://www.anthropic.com/legal/privacy). Don't paste secrets.
