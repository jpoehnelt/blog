---
title: "OpenClaw webhook lock ledger pattern for reliable agent orchestration"
description: "How to prevent duplicate agent runs from webhook storms using hierarchical lock keys, prefix conflict checks, leases, and a local work ledger."
pubDate: "2026-02-27"
tags:
  - openclaw
  - webhooks
  - automation
  - agents
  - github
  - cloudflare
  - reliability
  - distributed-systems
  - devops
---

Webhooks are great until they are *too great*.

If you connect GitHub events to AI agents, you quickly run into event bursts:

- multiple `pull_request.synchronize` updates in a short window
- `issue_comment` + `pull_request_review` for the same PR
- retries and duplicate deliveries

Without coordination, you can accidentally launch multiple agents for the same unit of work.

This post documents the lock pattern I implemented with OpenClaw to make webhook-driven agent workflows reliable.

## Problem statement

I wanted this behavior:

1. Receive GitHub webhooks in near real-time.
2. Trigger OpenClaw immediately.
3. Guarantee only one active worker per logical scope (repo, PR, or event).
4. Keep state local (source of truth), not just labels on GitHub.

## Architecture

I used a small Node receiver in front of OpenClaw:

1. **GitHub → receiver** (Cloudflare tunnel)
2. Receiver verifies `X-Hub-Signature-256`
3. Receiver dedupes by `X-GitHub-Delivery`
4. Receiver writes/updates local work ledger and queue
5. Worker acquires lock lease and forwards to OpenClaw `/hooks/wake`

OpenClaw docs for hooks:

- https://docs.openclaw.ai/automation/webhook
- https://docs.openclaw.ai/cli/webhooks

## Core idea: hierarchical lock keys

Instead of a single static lock key format, use a hierarchy:

- `github:repo:owner/name`
- `github:repo:owner/name:pr:123`
- `github:repo:owner/name:pr:123:event:pull_request_review.submitted`

Then define conflicts with a simple prefix rule:

- `a === b` OR
- `a` starts with `b + ":"` OR
- `b` starts with `a + ":"`

This gives flexible lock scopes:

- **repo scope** for broad maintenance jobs
- **item scope** (`pr` / `issue`) for normal workflows
- **event scope** for fine-grained parallelism

## Local ledger schema

I track each work item locally with fields like:

- `work_key`
- `lock_key`
- `status` (`queued|running|done|failed`)
- `lease_expires_at_ms`
- `attempts`
- `pending` (coalesced updates while running)
- `last_event_id`, `last_event_type`, `last_action`

I also keep:

- a delivery dedupe map (`event_id -> timestamp`)
- a queue of pending work
- an append-only JSONL audit log

## Lease-based execution

The worker loop is intentionally strict:

1. pick next queued item whose lock key does not conflict with active leases
2. mark running + set lease expiration
3. execute one run
4. mark done/failed
5. if updates arrived while running (`pending=true`), requeue once

This handles webhook storms without spinning up duplicate work for the same PR.

## Why local state beats labels

I still like labels as UX signals (`ai:in-progress`, `ai:blocked`), but they are not a good coordination primitive:

- labels can drift
- retries can race
- cleanup can be forgotten

Local ledger first, labels second.

## OpenClaw-specific implementation details

I used OpenClaw `/hooks/wake` with token auth and immediate mode:

```json
{ "text": "[GitHub] pull_request_review:approved owner/repo#123", "mode": "now" }
```

The receiver is managed with `launchd` and exposes:

- `/healthz`
- `/status`

`/status` returns queue depth, active locks, lock policy, and recent item states.

## Redis upgrade for TTL-driven coordination

After running this pattern for real churn, I moved lock coordination to Redis for better lease semantics:

- `LOCK_BACKEND=redis`
- lock leases with `SET NX PX`
- delivery dedupe keys with TTL
- per-prefix state + version counters for stale-work detection

I kept the local JSONL audit log for durable debugging and postmortems.

## Volatile work profile (heavy churn)

For high-churn queues, the best strategy is cheap cancellation over completion:

- `VOLATILE_MODE=true`
- `VOLATILE_DEBOUNCE_MS=60000`
- `VOLATILE_MAX_STALENESS_MS=1800000`
- `VOLATILE_STREAM_MAXLEN=1000`
- `PREFIX_STATE_TTL_MS=86400000`

In this mode:

- each enqueue bumps `version:<prefix>`
- workers re-check version on lock acquisition
- stale jobs are marked `obsolete`
- queue discipline keeps latest work for a prefix

## CLI operations for lock/queue visibility

As this grew beyond a webhook-only flow, I consolidated operations into one CLI:

- `node scripts/work-lock-cli.mjs status --queue`
- `node scripts/work-lock-cli.mjs tail -n 100`
- `node scripts/work-lock-cli.mjs events github:repo:owner/name:pr:123`
- `node scripts/work-lock-cli.mjs acquire github:repo:owner/name:pr:123 --owner justin --ttl-ms 120000`
- `node scripts/work-lock-cli.mjs release github:repo:owner/name:pr:123 --owner justin`

This made it much easier to inspect queue state, lock conflicts, and churn without hopping between files and Redis commands.

## Config knobs that matter

These controls made tuning easy:

- `LOCK_SCOPE_DEFAULT=pr`
- `LOCK_SCOPE_BY_EVENT=pull_request=pr,pull_request_review=event,workflow_run=repo`
- `MAX_CONCURRENCY=1` (start conservative)
- `LEASE_MS=600000`
- `DEDUPE_TTL_MS=1800000`
- `LOCK_BACKEND=redis`

## Takeaways

If you are wiring webhooks to agents, treat this as a distributed-systems problem, not just an integration task.

The pattern that worked for me:

- hierarchical lock keys
- prefix conflict checks
- lease-based workers
- local ledger as source of truth
- external system metadata (labels/comments) as optional mirrors

This has made OpenClaw webhook automation much more predictable under real event load.
