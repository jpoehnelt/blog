---
title: "Abandon Git LFS because AI Agents"
description: "Git LFS causes fatal errors in AI agents like Jules due to proxy conflicts and hook limitations. Learn why I abandoned LFS and migrated back to standard Git."
pubDate: "2026-01-16"
tags:
  - git-lfs
  - jules
  - automation
  - devops
  - git
  - ai
  - google
  - sandbox
  - code
  - security
---

<script>
  import Note from '$lib/components/content/Note.svelte';
</script>

Up until recently I had been using git-lfs with [Jules](https://jules.google.com/), Google's AI-assisted coding environment. In the last couple of days, this functionality stopped working and I have decided to ditch git-lfs in favor of standard git.

## The Problem: Git LFS vs. The Sandbox

This isn't just a Jules problem; it’s a **sandbox problem**. Whether you are using Jules, **Project IDX**, or a strict CI/CD pipeline like **Cloud Build**, the result is often the same: Git LFS fails in subtle, infuriating ways.

The issue stems from a fundamental conflict between how Git LFS operates and how secure, containerized environments are architected. A "Chicken and Egg" scenario is created where the environment controls the clone before your custom setup scripts can ever run.

### 1. The Proxy Conflict (Batch API Mismatch)

Most corporate environments and cloud IDEs use an internal transparent proxy to cache repository objects and speed up clones.

**Example: Jules** uses an internal proxy (`192.168.0.1:8080`) which works perfectly for standard Git objects. However, the **Git LFS Batch API** uses a different protocol. When the automated clone tries to "smudge" (download) LFS files, the proxy often returns an `unexpected EOF` or an authentication error because it doesn't know how to handle the LFS traffic.

This isn't unique to Jules; many corporate proxies choke on the REST API traffic or fail to pass the correct NTLM/Kerberos headers.

### 2. The Security Feature: Hook Lockdown

The most fatal issue is likely a **security feature, not a bug**. Git LFS relies entirely on **Git hooks** (`post-checkout`, `post-commit`) to trigger the "smudge" filter that replaces pointer files with actual binaries.

However, hooks are a notorious vector for **Remote Code Execution (RCE)**.

- **CVE-2020-27955**: A critical RCE in LFS allowed malicious repos to execute arbitrary code via `git.bat` on Windows.
- **CVE-2025-48384**: Similar hook-based vulnerabilities continue to surface.

Because of this risk, secure sandboxes (like Jules, Cloud Build, and strict Github Actions runners) often default to a locked-down configuration:

```bash
git config --global core.hooksPath /dev/null
```

This effectively neuters Git LFS. When the environment clones your repo, the LFS hooks are silently ignored. You end up with a working directory full of tiny pointer files instead of your assets, or the clone process hangs indefinitely trying to initialize hooks it cannot write.

## Abandoning Git LFS

I tried fighting the environment with complex overrides, `skip-smudge` flags, and manual `lfs pull` scripts, but it was a losing battle. The mental overhead of debugging proxy chains and hook permissions in every new environment wasn't worth it.

I decided to **abandon Git LFS entirely.** My files (mostly blog images) are small enough to be handled by standard Git, and the reliability of a standard `git clone` is unbeatable.

## How to Migrate Back to Standard Git

If you're stuck in this trap, here is how you move the files back into your main Git history using [git-filter-repo](https://github.com/newren/git-filter-repo):

```bash
# 1. Pull everything local (on a machine where LFS still works!)
git lfs pull

# 2. Export LFS objects back to standard Git
git lfs migrate export --everything --include="*.png,*.jpg,*.jpeg,*.gif"

# 3. Cleanup
rm .gitattributes
git add .
git commit -m "chore: migrate assets to standard Git"
```

<Note>

**Warning:** This rewrites your Git history. You will need to `git push --force` to your origin, and any other collaborators will need to re-clone.

</Note>

## Conclusion

By moving away from LFS, I simplified my stack and made my repo "agent-friendly." Jules (and any other sandbox) can now clone my blog in seconds without a single line of Git configuration in my setup script.
