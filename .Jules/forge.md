# Forge's Journal

This journal records critical Ops/Build learnings, specific CI bottlenecks, and platform constraints.

## 2025-02-17 - Supply Chain Security

**Learning:** This repository uses unpinned GitHub Actions (e.g. `cloudflare/wrangler-action@v3`), which poses a supply chain risk and reproducibility issue.
**Action:** Pinned critical actions to full SHA hashes to ensure immutable build dependencies.
## 2024-05-18 - Pin GitHub Actions by SHA
**Learning:** Pinning GitHub Actions to full SHA hashes protects against mutable tags and supply chain attacks.
**Action:** Always use the full commit SHA when defining `uses:` in GitHub Actions workflows.
