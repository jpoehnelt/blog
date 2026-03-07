---
title: "The MCP Abstraction Tax"
description: "Every layer from App to API to MCP loses fidelity. An exploration of what gets lost and why it matters for enterprise APIs."
pubDate: "2026-03-06"
tags:
  - ai
  - cli
  - mcp
  - agents
  - code
faq:
  - question: What is the abstraction tax?
    answer: Every layer between the user's intent and the API — from the app to the protocol to the tool definition — loses fidelity. MCP adds a layer. That layer costs you expressiveness, and the cost compounds with complex APIs.
  - question: Where does fidelity loss happen with MCP?
    answer: Tool signatures either become unwieldy (exposing the full payload) or lossy (hiding it behind simplified abstractions). Neither option preserves the full expressiveness of the underlying API.
  - question: How do skills approach the same problem differently?
    answer: Skills are loaded on demand. The agent discovers what it needs at runtime instead of paying the token cost for every tool definition upfront. This shifts the tradeoff from upfront fidelity loss to incremental context cost.
  - question: Is one approach better than the other?
    answer: They optimize for different things. MCP optimizes for discoverability and standardization. CLIs with skills optimize for fidelity and flexibility. The interesting question is what each one costs you.
---

<script>
  import Note from '$lib/components/content/Note.svelte';
  import Tldr from '$lib/components/content/Tldr.svelte';
</script>

<Tldr>

- Every layer — Data → API → MCP — introduces an **abstraction tax**.
- Humans need simplified abstractions to manage cognitive load. **LLMs can navigate a complex CLI** via `--help` and call precise APIs in seconds.
- MCP and CLIs optimize for **different things**. Understanding what each one costs you is more useful than picking a winner.
- For complex enterprise APIs, the fidelity loss at each layer **compounds** in ways that matter.

</Tldr>

My [last post](/posts/rewrite-your-cli-for-ai-agents) argued that CLIs need to be redesigned for AI agents. That post was about *how* to build. This one is about what happens at the boundaries — the fidelity you lose every time you add a layer between an agent and an API.

A conversation about building an MCP server for a complex enterprise CRM crystallized something I'd been feeling but hadn't articulated: **every protocol layer between an agent and an API is a tax on fidelity.** The tax is sometimes worth paying. But you should understand what you're giving up at each layer, because the costs compound — especially with complex enterprise APIs. Others have explored this from different angles — Jeremiah Lowin's [Code Mode](https://www.jlowin.dev/blog/fastmcp-3-1-code-mode) makes the case that most MCP servers treat agents like humans rather than leveraging their ability to write code. I want to focus on a related but distinct problem: what happens to fidelity when the API underneath is already hostile.

## The Abstraction Stack

Consider the layers between an agent's intent and a CRM opportunity record:

```
  Agent Intent: "Update the probability on the ACME corp deal"
       │
       ▼
  ┌─────────────┐
  │  MCP Tool   │  ← abstraction tax
  │  Definition │
  └──────┬──────┘
         │
  ┌──────▼──────┐
  │  REST API   │  ← abstraction tax
  │  (CRM)      │
  └──────┬──────┘
         │
  ┌──────▼──────┐
  │  Data       │  ← the actual thing
  │  (Storage)  │
  └─────────────┘
```

Each layer is an abstraction. Each abstraction loses something. The fidelity loss starts before MCP even enters the picture — the REST API is itself an imperfect projection of the underlying data model. A CRM's internal object representation is richer than what the standard REST API exposes. MCP adds another layer on top of that.

The question at each layer is whether what you gain — discoverability, safety, standardization — is worth what you lose.

But for complex enterprise APIs, the math changes.

## The Two-Path Problem

When you build an MCP server for an enterprise API like a mature CRM, you face a choice:

**Path 1: Constrained tools.** You expose a handful of high-level operations — `create_account`, `update_opportunity`, `add_contact`. These are easy for models to call, fit comfortably in a context window, and provide a clean developer experience. But they're lossy. The CRM's `bulkUpdate` API accepts dozens of request types with deeply nested relationships and custom fields. You can't express "update the stage on 50 opportunities, recalculate their custom revenue formulas, and reassign the related tasks to the new account owner" through `update_opportunity`.

**Path 2: Full surface.** You expose every API method as a tool with its full request schema. This preserves fidelity but explodes the context window. A full-featured enterprise CLI covers dozens of services with hundreds of commands mapping directly to the underlying APIs. Loading all of those tool definitions into an MCP context at once would consume a meaningful fraction of an agent's reasoning capacity — and most of them would be irrelevant to any given task.

Neither path is great. The first is too limited. The second is too expensive. And every team building an MCP server for a large API surface hits this same wall.

## Why the APIs Are Hostile

This isn't just a protocol problem. It's an API problem. Enterprise CRM APIs were designed for human developers who would read docs, understand the complex data model, and carefully construct requests. They have sharp edges — opaque relationship identifiers, polymorphic custom fields, deeply nested JSON structures, missing capabilities for operations that feel basic. I covered the input hardening side of this in my [previous post](/posts/rewrite-your-cli-for-ai-agents). The point here is that these APIs are not friendly to AI agents, and forcing agents through a simplified MCP abstraction on top of an already-unfriendly API compounds the fidelity loss.

## Skills Manage Context, Not Just Commands

This is the insight that drove a more sophisticated CLI architecture and the [Skills approach](https://github.com/anthropics/anthropic-cookbook/blob/main/misc/prompt_caching.md): **you don't need to load everything at once.**

A CLI with 700+ commands doesn't present all 700 in the system prompt. The agent starts with `--help`, discovers the service, runs `crm schema opportunities.bulkUpdate`, and gets exactly the schema it needs — at runtime, on demand, paid for only when relevant.

Skills — markdown files containing task-specific documentation, prompt instructions, and CLI usage patterns — extend this further. Each `SKILL.md` file is a self-contained unit of agent knowledge:

```
skills/
├── crm-opportunities/SKILL.md           # Core opportunity operations
├── crm-opportunities-advanced/SKILL.md  # Custom fields, bulk updates
```

The agent loads `crm-opportunities` when it needs to manage opportunities. It loads `crm-opportunities-advanced` only when the task requires bulk updates. The context cost scales with the task, not with the API surface.

MCP doesn't have this mechanism natively. Every tool definition is loaded upfront — what Lowin calls the ["dictionary problem"](https://www.jlowin.dev/blog/fastmcp-3-1-code-mode), where all tool definitions travel with every message. Some clients support enabling and disabling tools, and some are exploring tool search — but these are client-side features, not protocol guarantees. If you're building an MCP server, you can't assume the client will be smart about context management.

## The Layering Insight

A more sophisticated approach: the MCP server exposes a meta-tool — something like `discover_tools` or `enable_service` — that lets the agent dynamically expand its available tool set as the conversation evolves. The agent starts with a minimal surface and pulls in capabilities as needed.

```
Agent: "I need to work with CRM opportunities"
  → calls discover_tools(service: "opportunities")
  → server registers opportunity tools
  → agent now has opportunity capabilities
```

This isn't standardized in MCP today, but the ecosystem is converging on it. FastMCP 3.1 recently shipped a two-stage discovery pattern using `Search` and `GetSchemas` meta-tools to solve this exact problem. It trades one upfront context cost (all tools loaded at startup) for a small per-request cost (the discover call) plus targeted context (only the tools that matter).

<Note>

This server-side workaround highlights a growing tension. As MCP clients get smarter about native tool search and selective loading, baking stateful discovery logic into the server may eventually conflict with the client. It's a delicate balance between helping the agent now and fighting the client later.

</Note>

## The Fidelity Spectrum

What emerges is a spectrum, not a binary. Each approach occupies a different point on the fidelity-vs-accessibility curve:

- **MCP (constrained tools)** — high accessibility, lower fidelity. The agent discovers capabilities through structured definitions. The cost: you can only express what the tool author anticipated.
- **MCP (full surface)** — high fidelity in theory, but the context cost makes it impractical. The agent has access to everything but can reason about almost none of it.
- **CLI + Skills** — high fidelity, moderate accessibility. The agent navigates `--help` and loads context on demand. The cost: it requires a CLI that was designed for this pattern.
- **Raw API with client libraries** — maximum fidelity, lowest guardrails. The agent writes code directly against the API.

These aren't competing approaches. They're different points on the same curve, optimizing for different constraints. The interesting question isn't which one is "best" — it's understanding what you lose at each point and whether that loss matters for your use case.

## What This Means in Practice

A few observations from sitting with this:

**The MCP layer is only as good as the API underneath.** If the API is hostile to AI agents — positional indexes, opaque identifiers, missing capabilities — no amount of MCP abstraction fixes that. The abstraction tax compounds: an unfriendly API wrapped in a lossy protocol is doubly frustrating.

**MCP interfaces can evolve faster than APIs.** They don't carry the same stability guarantees. This is an advantage — you can ship, learn what agents actually struggle with, and iterate. The fidelity loss is tolerable if the iteration speed is high.

**Testing with agents reveals different failure modes than testing with humans.** Define a user journey, hand it to an agent with your MCP server enabled, and watch where it breaks. The friction points are often surprising — agents struggle with things humans find trivial, and breeze through things humans find tedious.

**Context management is a shared responsibility.** MCP clients are getting smarter — tool search, selective loading, dynamic registration. Building an overly constrained server to solve a context problem that the client might already handle can leave users frustrated. But assuming the client will be smart about it is also risky.

## Where This Goes

MCP and CLIs aren't competing. They're different answers to the same question: how much fidelity are you willing to trade for accessibility? MCP will get better at context management — tool search, dynamic registration, lazy loading. CLIs will get better at structured invocation — MCP transports, typed schemas, safety rails.

The abstraction tax won't disappear. But understanding where you're paying it — and what you're getting in return — is the difference between a tool that serves agents well and one that just looks like it does.
