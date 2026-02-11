---
title: "How to Add Comments to Google Docs with Apps Script"
description: >-
  DocumentApp has no comment API. Learn how to use the Drive API Comments
  resource to add, read, and reply to document comments.
pubDate: "2026-02-02"
tags:
  - code
  - google
  - google workspace
  - apps script
  - drive api
  - collaboration
faq:
  - question: Can DocumentApp add comments?
    answer: >-
      No. DocumentApp has no methods for comments. You need the Drive API
      Comments resource.
  - question: Can I add comments at specific locations in a document?
    answer: >-
      Partially. You can quote text that the comment relates to, but precise
      anchoring to character indices requires the Docs API.
  - question: Do comments work on all Drive files?
    answer: >-
      Yes. The Drive API Comments work on Docs, Sheets, Slides, PDFs, and
      other file types that support comments.
---

<script>
  import Snippet from "$lib/components/content/Snippet.svelte";
  import Note from '$lib/components/content/Note.svelte';
</script>

Automating code reviews, document workflows, or feedback collection? You need to add comments programmatically. DocumentApp doesn't support this at all.

[Issue 36763384](https://issuetracker.google.com/36763384) has 203 votes—one of the most requested features.

## The Problem

```javascript
// DocumentApp has NO comment methods
// doc.addComment(); // DOES NOT EXIST
// doc.getComments(); // DOES NOT EXIST
```

## The Solution: Drive API Comments

The Drive API has a Comments resource that works with Docs, Sheets, Slides, and more:

## Prerequisites

1. Enable the **Drive API** Advanced Service
2. Required scope: `https://www.googleapis.com/auth/drive`

<Snippet src="./snippets/apps-script-document-comments/appsscript.json" />

## Adding Simple Comments

<Snippet src="./snippets/apps-script-document-comments/add-comment.js" />

## Reading Comments

<Snippet src="./snippets/apps-script-document-comments/read-comments.js" />

## Replying to Comments

<Snippet src="./snippets/apps-script-document-comments/reply-comment.js" />

<Note>

The `quotedFileContent` field links the comment to specific text in the document. The text must exist exactly as written for the anchor to work.

</Note>

## Complete Example: Automated Review

<Snippet src="./snippets/apps-script-document-comments/review-bot.js" />

## Limitations

What you **can't do** with the Drive API:

- Precise character-level anchoring (requires combining with Docs API)
- Adding suggestions (different from comments)
- Modifying existing comments you didn't create

## What's Next

- [Move Files in Drive](/posts/apps-script-move-files) — Atomic file operations
- [Why Table Borders Stop Working](/posts/documentapp-table-borders-fix) — Docs API workarounds

## Resources

- [Comments Resource Reference](https://developers.google.com/drive/api/v3/reference/comments)
- [Issue 36763384](https://issuetracker.google.com/36763384) — Vote for native support
