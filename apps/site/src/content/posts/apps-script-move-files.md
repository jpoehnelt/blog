---
title: "How to Move Files in Google Drive with Apps Script"
description: >-
  DriveApp uses a risky two-step add/remove for moving files. Learn how to use
  the Drive API for atomic file moves.
pubDate: "2026-02-02"
tags:
  - code
  - google
  - google workspace
  - apps script
  - drive api
  - file management
faq:
  - question: Why is DriveApp's move pattern risky?
    answer: >-
      It adds the file to the new folder first, then removes from the old. If
      the second step fails, your file is in multiple folders.
  - question: How do I move files atomically?
    answer: >-
      Use the Drive API update method with addParents and removeParents in a
      single call.
  - question: Does this work with Shared Drives?
    answer: >-
      Yes. Add the supportsAllDrives parameter for Shared Drive compatibility.
---

<script>
  import Snippet from "$lib/components/content/Snippet.svelte";
  import Note from '$lib/components/content/Note.svelte';
</script>

Moving files between folders in Google Drive should be simple. But DriveApp makes you do it in two steps—and if the second step fails, your file ends up in two folders.

[Issue 76201003](https://issuetracker.google.com/76201003) has 78 votes for a proper move method.

## The Problem

```javascript
const file = DriveApp.getFileById(fileId);
const targetFolder = DriveApp.getFolderById(folderId);

targetFolder.addFile(file);           // Step 1: Add to new
file.getParents().next().removeFile(file);  // Step 2: Remove from old (can fail!)
```

If step 2 fails (permissions, timeout, quota), your file now lives in both folders.

## The Solution: Drive API Atomic Move

The Drive API lets you modify parents in a single call:

## Prerequisites

1. Enable the **Drive API** Advanced Service
2. Required scope: `https://www.googleapis.com/auth/drive`

<Snippet src="./snippets/apps-script-move-files/appsscript.json" />

## Basic Move

<Snippet src="./snippets/apps-script-move-files/basic-move.js" />

<Note>

The `fields` parameter specifies which file properties to return. Use `'id,parents'` to confirm the move worked.

</Note>

## Files in Multiple Folders

A file can be in multiple folders (shortcuts aside, this is actual multi-parenting). Here's how to handle that:

<Snippet src="./snippets/apps-script-move-files/multi-parent.js" />

## Shared Drive Support

<Snippet src="./snippets/apps-script-move-files/shared-drives.js" />

## Complete Example: Folder Organizer

<Snippet src="./snippets/apps-script-move-files/organizer.js" />

## What's Next

- [Add Comments to Documents](/posts/apps-script-document-comments) — Drive API comments
- [Free/Busy Queries](/posts/apps-script-free-busy) — Calendar scheduling

## Resources

- [Files.update Reference](https://developers.google.com/drive/api/v3/reference/files/update)
- [Issue 76201003](https://issuetracker.google.com/76201003) — Vote for native support
