---
title: "Agent Identity for Git Commits"
description: "How to configure AI agents to push commits to GitHub using a separate bot identity without modifying local git configuration."
pubDate: "2026-02-03"
tags:
  - git
  - automation
  - ai
  - github
  - devops
  - code
  - gemini
  - antigravity
  - claude
---

<script>
  import Image from '$lib/components/content/Image.svelte';
</script>

<Image src="agent-identity-git.png" alt="Agent Identity for Git Commits" />

When running multiple AI agents that push to GitHub, you want commits to come from a bot account—not your personal identity. Here's how to do it without modifying your local git config.

## The Problem

AI agents (Gemini, Claude, etc.) run git commands on your behalf. By default, they use your git identity. This makes it hard to distinguish human vs. agent commits, and complicates access control.

## The Solution: Environment Variables

Git reads identity from environment variables, which only affect the current command:

```bash
# At commit time - set author/committer identity
GIT_AUTHOR_NAME="my-bot" \
GIT_AUTHOR_EMAIL="my-bot@users.noreply.github.com" \
GIT_COMMITTER_NAME="my-bot" \
GIT_COMMITTER_EMAIL="my-bot@users.noreply.github.com" \
git commit -m "feat: add feature"

# At push time - use a dedicated SSH key
GIT_SSH_COMMAND="ssh -i ~/.ssh/agent_key -o IdentitiesOnly=yes" \
git push
```

## Setup Steps

1. Create a bot GitHub account (e.g., `yourname-bot`)
2. Generate a dedicated SSH key:

```bash
ssh-keygen -t ed25519 -C "bot@example.com" -f ~/.ssh/agent_key -N ""
```

3. Add the public key to the bot's GitHub account
4. Add the bot as a collaborator to your repos
5. Configure your agents to use these env vars when committing/pushing

## Why This Works

| Scope | Effect |
|-------|--------|
| Your normal terminal | Uses your identity |
| Command with env vars | Uses bot identity |
| Next command | Back to your identity |

Your `~/.gitconfig` and `~/.ssh/config` are never modified. Each command is isolated.

## Git Ownership and Protection Rules

Using a dedicated bot account unlocks standard Git governance features:

- **Write access** — Grant the bot write access only to specific repos, limiting blast radius
- **Branch protection** — Require different review rules for bot PRs vs. human PRs
- **CODEOWNERS** — Exclude the bot from ownership rules, or require human approval for bot changes to critical paths
- **CI skip** — Use `[skip ci]` in bot commits when appropriate, or configure CI to run different workflows for bot authors
- **Audit trail** — Easily filter `git log --author=my-bot` to see all automated changes

This separation of identity means your automation inherits all the same protection mechanisms you use for human contributors.

## Configuring Your Agent

Most AI coding agents support project-level rules via a `.agent/rules/` directory. Create a `git.md` file to instruct your agent:

```markdown
<!-- .agent/rules/git.md -->

## Git Identity

When committing and pushing to GitHub, use the bot identity:

\`\`\`bash
GIT_AUTHOR_NAME="my-bot" \
GIT_AUTHOR_EMAIL="my-bot@users.noreply.github.com" \
GIT_COMMITTER_NAME="my-bot" \
GIT_COMMITTER_EMAIL="my-bot@users.noreply.github.com" \
git commit -m "message"

GIT_SSH_COMMAND="ssh -i ~/.ssh/agent_key -o IdentitiesOnly=yes" \
git push
\`\`\`
```

The agent reads these rules at startup and follows them for all git operations in the project.

**The "proper" approach**: Running agents in fully sandboxed environments (containers, VMs, ephemeral workspaces) with no access to your real credentials, but who has time for that?!