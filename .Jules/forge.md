# Forge's Journal

This journal records critical Ops/Build learnings, specific CI bottlenecks, and platform constraints.

## 2025-02-17 - Supply Chain Security

**Learning:** This repository uses unpinned GitHub Actions (e.g. `cloudflare/wrangler-action@v3`), which poses a supply chain risk and reproducibility issue.
**Action:** Pinned critical actions to full SHA hashes to ensure immutable build dependencies.
## 2026-03-02 - Pinned GitHub Actions to SHAs
**Learning:** The project relies heavily on GitHub Actions. Many actions like actions/cache and cloudflare/wrangler-action were using mutable tags (v4, v3, v6).
**Action:** Always pin GitHub Actions to full SHA hashes for security, as mutable tags can be changed upstream.
