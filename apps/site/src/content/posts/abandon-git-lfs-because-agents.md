---
title: "Why I Ditched Git LFS for my Blog (AI Sandboxes)"
description: "Git LFS seems like a great idea until you try to use it with AI agents, sandboxed environments, or internal proxies. Here is why it fails in Jules and how I migrated back to standard Git."
pubDate: "2026-01-15"
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

Up until recently I had been using git-lfs with [Jules](https://jules.google.com/). In the last couple days, this functionality stopped working and I have decided to ditch git-lfs in favor of standard git.

## The Problem: The Jules "Chicken and Egg"

Jules works by cloning your repository to understand your codebase before it ever runs your custom setup scripts. This creates a fatal loop for LFS-enabled repos.

### 1. The Proxy Conflict

Jules uses an internal proxy (`192.168.0.1:8080`) to cache repository objects and speed up clones. This works perfectly for standard Git objects. However, the **Git LFS Batch API** uses a different protocol. When Jules' automated clone tries to "smudge" (download) LFS files, the proxy often returns an `unexpected EOF` or an authentication error because it doesn't know how to handle the LFS traffic.


### 2. The Hook Lockdown

For security, Jules sets the global Git hooks path to `/dev/null`. Git LFS relies entirely on hooks to trigger the download process during a clone or checkout. When LFS tries to initialize itself, it hits a brick wall because it cannot write its hooks to a read-only bit-bucket.

### 3. The Authentication Loop

Since the clone happens *before* your setup script, you can't inject the necessary credentials or proxy bypasses in time. Your session crashes before it even starts.

## What I tried

I had a script like this:

**THIS DOES NOT WORK**

```bash
# 1. Install LFS & Fix Hook Path
sudo apt-get update && \
  sudo apt-get install -y git-lfs
mkdir -p ~/.git-hooks
git config --global core.hooksPath \
  ~/.git-hooks

# 2. Force LFS to 'Success' without downloading
# This allows Jules' automated clone to complete.
git config --global filter.lfs.smudge "true"
git config --global filter.lfs.process "true"
git lfs install --skip-smudge

# 3. Bypass the Jules Proxy
git config --global --unset-all \
  url.[http://git@192.168.0.1:8080/.insteadOf](http://git@192.168.0.1:8080/.insteadOf)

# 4. Manual authenticated pull
cd /app
git -c url."[https://github.com/](https://github.com/)".insteadOf="" \
    -c lfs.url="[https://github.com/jpoehnelt/blog.git/info/lfs](https://github.com/jpoehnelt/blog.git/info/lfs)" \
    lfs pull
```

This was successful on the Jules environment script page, but like I said above, the timing is wrong. The LFS pull happens *after* the clone, so it doesn't work.

## Abandoning Git LFS

Instead of fighting the environment with complex `git -c` overrides and global "no-op" smudge filters, I decided to **abandon Git LFS entirely.**

My files are small enough to be handled by standard Git. I have a GitHub workflow that optimizes my images and then commits the files to GitHub.

## How to Migrate Back to Standard Git

If you're stuck in LFS hell, here is how you move the files back into your main Git history:

```bash
# 1. Pull everything local
git lfs pull

# 2. Export LFS objects back to standard Git
# (Replace extensions with whatever you were tracking)
git lfs migrate export --everything --include="*.png,*.jpg,*.jpeg,*.gif"

# 3. Cleanup and GC
rm .gitattributes
git add .
git commit -m "chore: Migrate assets to standard Git"
```

Some additional steps that *YOU SHOULD RESEARCH* before running:

```sh
# 4. Rewrite history to keep it lean
# This removes any accidental blobs over 10MB from the history
git filter-repo --strip-blobs-bigger-than 10M

# 5. The "Deep Clean"
git reflog expire --expire=now --all
git gc --prune=now --aggressive
```

<Note>
**Warning:** This rewrites your Git history. You will need to `git push --force` to your origin, and any other collaborators will need to re-clone.
</Note>

## Conclusion

By moving away from LFS, I simplified my stack and made my repo "agent-friendly." Jules can now clone my blog in seconds without a single line of Git configuration in my setup script.
