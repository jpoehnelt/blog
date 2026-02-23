# Forge's Journal

This journal records critical Ops/Build learnings, specific CI bottlenecks, and platform constraints.

## 2025-02-17 - Supply Chain Security

**Learning:** This repository uses unpinned GitHub Actions (e.g. `cloudflare/wrangler-action@v3`), which poses a supply chain risk and reproducibility issue.
**Action:** Pinned critical actions to full SHA hashes to ensure immutable build dependencies.

## 2026-02-23 - Workflow Consistency

**Learning:** `actions/cache` was unpinned across multiple workflows (`test.yml`, `enrich.yml`, etc.), potentially leading to inconsistent caching behavior and security risks if the `v4` tag moved.
**Action:** Pinned `actions/cache` to a specific SHA (`1bd1e32...`) in all workflows to ensure predictable and secure caching.
