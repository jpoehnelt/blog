## 2024-05-24 - CSP Implementation in SvelteKit Static Adapter
**Vulnerability:** Missing Content Security Policy (CSP) allowed potential XSS and data injection attacks.
**Learning:** SvelteKit's `adapter-static` combined with `kit.csp` in `svelte.config.js` requires specific handling for inline scripts. The `auto` or `hash` mode only works for scripts SvelteKit controls. Scripts in `app.html` are NOT hashed automatically.
**Prevention:** To enable strict CSP with hashes:
1. Move inline scripts from `app.html` to `<svelte:head>` in a layout component (e.g., `+layout.svelte`).
2. Configure `kit.csp` with `mode: 'hash'`.
3. Whitelist external domains explicitly in `directives`.
