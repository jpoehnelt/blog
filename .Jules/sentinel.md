# Security Decisions

## Relaxed CSP for Inline Scripts and Styles

- **Date:** 2024-05-22
- **Decision:** Relaxed the Content Security Policy (CSP) in `apps/site` to allow `'unsafe-inline'` for both scripts and styles.
- **Reasoning:**
  - SvelteKit's `mode: "hash"` was causing issues with legitimate inline styles and scripts, particularly when hashes conflicted with the `'unsafe-inline'` fallback or when scripts were dynamically injected (e.g., GTM).
  - The user explicitly requested to "relax CSP and inline css" to resolve execution blocking issues.
  - Enabling `'unsafe-inline'` ensures that critical CSS inlining (performance optimization) works correctly and that third-party scripts (like Google Tag Manager) can execute without strict hashing requirements.
- **Risks:** This change increases the surface area for XSS attacks, as it permits the execution of any inline script or style. This is a trade-off for functionality and ease of maintenance requested by the user.

## CSP Moved to `app.html`

- **Date:** 2024-05-22
- **Decision:** Moved CSP configuration from `svelte.config.js` to a manual `<meta>` tag in `apps/site/src/app.html`.
- **Reasoning:**
  - Even with `mode: "auto"`, SvelteKit was generating hashes for its own inline scripts (like hydration payloads) and adding them to the CSP header.
  - The presence of *any* hash in the CSP header causes browsers to ignore `'unsafe-inline'`, which broke the relaxed policy we intended.
  - By removing `csp` from `svelte.config.js`, we prevent SvelteKit from generating these hashes, allowing our manual `'unsafe-inline'` policy in `app.html` to take precedence and function correctly.
