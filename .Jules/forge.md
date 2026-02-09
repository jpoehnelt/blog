# Forge's Journal

This journal records critical Ops/Build learnings, specific CI bottlenecks, and platform constraints.

## 2025-02-17 - Supply Chain Security

**Learning:** This repository uses unpinned GitHub Actions (e.g. `cloudflare/wrangler-action@v3`), which poses a supply chain risk and reproducibility issue.
**Action:** Pinned critical actions to full SHA hashes to ensure immutable build dependencies.

## 2025-02-18 - Inconsistent Action Pinning & Upgrades

**Learning:** While some actions were pinned, others (like `actions/cache` and `release.yml`'s `wrangler-action`) remained unpinned or inconsistent across workflows. Additionally, `create-pull-request` was on version v6, while v7 is available.
**Action:** Pinned all remaining GitHub Actions to specific SHAs across all workflows to ensure consistent security posture. Upgraded `actions/cache` to v4.3.0 and `peter-evans/create-pull-request` to v7.0.11 (latest).
