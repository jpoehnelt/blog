---
title: "Use Git LFS with Jules"
description: "Learn how to configure Git LFS within the Jules environment by bypassing internal proxies and resolving hook path conflicts."
pubDate: "2026-01-15"
tags:
  - git-lfs
  - jules
  - devops
  - automation
  - google
  - gemini
  - git
  - ai
  - code
faq:
  - question: Why does `git lfs install` fail with `/dev/null` errors?
    answer: Jules sets the global Git hooks path to `/dev/null` for security. LFS needs a writable directory to initialize its hooks.
  - question: Why is Git LFS trying to connect to `192.168.0.1`?
    answer: Jules uses an internal proxy for repo caching. While this works for standard Git objects, it often lacks the logic to handle the LFS Batch API, leading to authentication or EOF errors.
  - question: Do I need to run `git lfs pull` every time?
    answer: Only if your setup script skips the smudge filter. Skipping the smudge during the initial clone is the most reliable way to prevent the environment from crashing before your configuration script can run.
---

<script>
  import Snippet from "$lib/components/content/Snippet.svelte";
  import Note from '$lib/components/content/Note.svelte';
  import Image from '$lib/components/content/Image.svelte';
</script>

If you are using **Jules**, ([https://jules.google.com](https://jules.google.com)), to automate tasks on a repository that uses **Git LFS** (Large File Storage), you’ve likely run into a frustrating loop of "Smudge filter failed" or "unexpected EOF" errors.

The issue stems from how Jules manages its environment: it uses a custom global Git configuration to route traffic through an internal proxy and disables Git hooks by pointing them to `/dev/null`. This breaks the standard Git LFS workflow.

## The Problem

When Jules clones your repo, it happens **before** your setup script runs. If your repo has LFS files (like the high-res images for my race reports), Git tries to download them immediately. This fails because:

1.  **Proxy Interference**: The internal proxy (`192.168.0.1:8080`) doesn't always know how to handle LFS Batch API requests.
2.  **Missing Hooks**: Git LFS can't initialize because Jules has locked the hooks path to a read-only bit-bucket.

## The Solution

To fix this, we need to take control of the LFS process by skipping the initial download and manually routing the LFS traffic around the internal proxy.

### 1. Install and Unblock Hooks

First, we install `git-lfs` and point the `hooksPath` to a writable directory so the LFS initialization actually succeeds.

### 2. Bypass the Proxy

We need to unset the `insteadOf` rules that Jules injects. This forces Git to talk directly to GitHub (or your provider) rather than the local proxy.

### 3. Manual Pull

Finally, we explicitly set the LFS URL and pull the objects once the environment is properly configured.

## The Setup Script

Add this to your Jules environment configuration script to get LFS working reliably:

<Snippet src="./snippets/jules-git-lfs-setup-environment.sh" />

<Note>

 By setting `filter.lfs.smudge` to skip, you ensure that the git clone command only pulls the pointer files. The heavy lifting is done in the final `git lfs pull` step after the network configuration is cleaned up.
 
 </Note>

And success!

<Image src="jules-git-lfs-environment-success.png" alt="Jules Git LFS Environment Success" />

Here is the full output of the setup script. Jules caches the snapshots of the environment to speed up the build process.

```
+ sudo mkdir /app
+ sudo chown 1001 /app
+ git config --global core.hooksPath /dev/null
+ git config --global --add url.http://git@192.168.0.1:8080/.insteadOf https://github.com/
+ git config --global --add url.http://git@192.168.0.1:8080/.insteadOf git@github.com:
+ git clone --depth 1 --shallow-submodules --recurse-submodules https://github.com/jpoehnelt/blog -b main /app
Cloning into '/app'...
Updating files: 100% (2322/2322), done.
+ cd /app
+ sudo apt-get update
Hit:1 http://us-central1.gce.archive.ubuntu.com/ubuntu noble InRelease
Get:2 http://us-central1.gce.archive.ubuntu.com/ubuntu noble-updates InRelease [126 kB]
...
Get:27 http://us-central1.gce.archive.ubuntu.com/ubuntu noble-security/multiverse amd64 Components [158 B]
Get:28 https://download.docker.com/linux/ubuntu noble/stable amd64 Packages [50.1 kB]
Get:29 https://ppa.launchpadcontent.net/git-core/ppa/ubuntu noble/main amd64 Packages [2994 B]
Fetched 14.6 MB in 2s (9144 kB/s)
Reading package lists...
+ sudo apt-get install -y git-lfs
Reading package lists...
Building dependency tree...
Reading state information...
The following packages were automatically installed and are no longer required:
  bridge-utils dns-root-data dnsmasq-base netcat-openbsd ubuntu-fan
Use 'sudo apt autoremove' to remove them.
The following NEW packages will be installed:
  git-lfs
0 upgraded, 1 newly installed, 0 to remove and 89 not upgraded.
Need to get 3944 kB of archives.
After this operation, 11.7 MB of additional disk space will be used.
Get:1 http://us-central1.gce.archive.ubuntu.com/ubuntu noble-updates/universe amd64 git-lfs amd64 3.4.1-1ubuntu0.3 [3944 kB]
debconf: unable to initialize frontend: Dialog
debconf: (Dialog frontend will not work on a dumb terminal, an emacs shell buffer, or without a controlling terminal.)
debconf: falling back to frontend: Readline
debconf: unable to initialize frontend: Readline
debconf: (This frontend requires a controlling tty.)
debconf: falling back to frontend: Teletype
dpkg-preconfigure: unable to re-open stdin: 
Fetched 3944 kB in 0s (17.3 MB/s)
Selecting previously unselected package git-lfs.
(Reading database ... 83926 files and directories currently installed.)
Preparing to unpack .../git-lfs_3.4.1-1ubuntu0.3_amd64.deb ...
Unpacking git-lfs (3.4.1-1ubuntu0.3) ...
Setting up git-lfs (3.4.1-1ubuntu0.3) ...
+ mkdir -p /home/jules/.git-hooks
+ git config --global core.hooksPath /home/jules/.git-hooks
+ git config --global filter.lfs.smudge 'git-lfs smudge --skip -- %f'
+ git lfs install
Updated Git hooks.
Git LFS initialized.
+ git config --global --unset-all url.http://git@192.168.0.1:8080/.insteadOf
+ cd /app
+ git config lfs.url https://github.com/jpoehnelt/blog.git/info/lfs
+ git config lfs.https://github.com/jpoehnelt/blog.git/info/lfs.locksverify false
+ git lfs pull
```

See [https://jules.google/docs/environment/](https://jules.google/docs/environment/) for more information.

## Conclusion

Jules is a powerful tool for automating repository maintenance(especially with the scheduled and suggested sessions), but its aggressive proxying can be a hurdle for LFS-heavy projects like my blog. By unsetting the `insteadOf` rules and providing a valid hooks path, you can ensure your assets—whether they are data models or race photos—are available for your agents to work with.

