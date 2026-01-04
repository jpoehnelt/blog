## 2024-05-24 - CSP Implementation in SvelteKit Static Adapter
**Vulnerability:** Missing Content Security Policy (CSP) allowed potential XSS and data injection attacks.
**Learning:** SvelteKit's `adapter-static` combined with `kit.csp` in `svelte.config.js` requires specific handling for inline scripts. The `auto` or `hash` mode only works for scripts SvelteKit controls. Scripts in `app.html` are NOT hashed automatically.
**Prevention:** To enable strict CSP with hashes:
1. Move inline scripts from `app.html` to `<svelte:head>` in a layout component (e.g., `+layout.svelte`).
2. Configure `kit.csp` with `mode: 'hash'`.
3. Whitelist external domains explicitly in `directives`.

## 2025-05-27 - Path Traversal in Build Scripts
**Vulnerability:** Build scripts processing user-controlled or external input (like Markdown files with snippet references) can be vulnerable to path traversal if they blindly resolve relative paths.
**Learning:** Functions like `path.resolve` will dutifully resolve `../../` to break out of the intended directory. Even in build scripts, inputs should be treated as potentially malicious, especially if the repository accepts external contributions.
**Prevention:** Always verify that the resolved path stays within the expected root directory using `path.relative(root, resolvedPath)` and checking that it does not start with `..`.
