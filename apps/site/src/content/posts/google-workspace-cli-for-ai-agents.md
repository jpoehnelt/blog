---
title: "Google Workspace CLI: Built for Humans, Optimized for AI Agents"
description: "Announcing the new Google Workspace CLI: one command-line tool for Gmail, Drive, Calendar, Sheets, Docs, Chat, and more—with 50+ skills and agent-friendly workflows."
pubDate: "2026-03-04"
tags:
  - "google workspace"
  - "ai"
  - "agents"
  - "openclaw"
  - "gmail"
  - "rust"
syndicate: true
---

I just launched the [Google Workspace CLI](https://github.com/googleworkspace/cli).

It’s one command-line interface for Google Workspace APIs, designed for humans, but optimized for AI agents.

## Why I built it

I wanted a predictable command hierarchy and structured JSON output so an agent can reliably discover and execute API methods without hand-written wrappers for every endpoint.

The result is a CLI that covers:

- **Every Google Workspace API resource and method** in a clear command hierarchy
- **50+ agent skills**
- **Helper functions and workflows** (for example, `gws gmail +send` and utilities like `gws-sheets-append`)
- **Recipe skills** such as:
  - `recipe-batch-reply-to-emails`
  - `recipe-save-email-attachments`

It’s written in **Rust**.

## Why skills + CLI matter right now (and where MCP fits)

I’m excited about MCP. It’s an important interoperability layer.

But in practice today, **execution quality** is the bottleneck.

- MCP helps tools connect.
- Skills + CLI help agents actually complete multi-step work reliably.

That matters because real workflows are not one API call. They’re chains of actions with state, retries, and side effects.

Think:

1. Read new Gmail messages
2. Draft a response in Docs
3. Store artifacts in Drive
4. Schedule follow-up in Calendar
5. Log status in Sheets

That’s where deterministic commands, structured outputs, and reusable skills deliver value today.

So my framing is: **MCP is critical infrastructure, but skills + CLI are the practical execution layer agents can trust right now.**

## Why Google Workspace is at the center

For many teams, Google Workspace is the operating system of knowledge work:

- **Gmail** is where requests and decisions arrive
- **Calendar** is where commitments live
- **Docs** is where plans and decisions get written
- **Drive** is where files and artifacts move
- **Sheets** is where operations and tracking happen

If an agent can’t act reliably across this graph, it won’t be useful for real work. That’s exactly the problem this CLI is designed to solve.

## Dogfooding with an agent (the fun part)

I had my [OpenClaw](https://github.com/openclaw/openclaw) agent install the CLI and run it through a realistic devrel workflow:

- installed and validated commands
- filed issues and pull requests where it found friction
- produced a friction log
- emailed me a summary via Gmail

That’s exactly the feedback loop I wanted: use the tool with an autonomous workflow, then improve the rough edges quickly.

## Getting started

```bash
npm install -g @googleworkspace/cli
```

Then run commands like:

```bash
gws drive files list --params '{"pageSize": 10}'
gws gmail users messages list --params '{"userId":"me","maxResults":10}'
```

## Links

- GitHub: [googleworkspace/cli](https://github.com/googleworkspace/cli)
- npm: [@googleworkspace/cli](https://www.npmjs.com/package/@googleworkspace/cli)
- OpenClaw: [openclaw/openclaw](https://github.com/openclaw/openclaw)

If you try it, please open an issue (or comment on an existing one) with any friction you hit. That feedback is shaping the project in real time.
