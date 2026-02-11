---
title: "How to Insert a Table of Contents with Apps Script"
description: >-
  DocumentApp has no method to insert a Table of Contents. After 12 years of requests,
  here's how to do it with the Docs API.
pubDate: "2026-02-02"
tags:
  - code
  - google
  - google workspace
  - apps script
  - docs api
  - document automation
faq:
  - question: Can you insert a Table of Contents with Apps Script?
    answer: >-
      Not with DocumentApp. You need to use the Docs API Advanced Service with
      the insertTableOfContents request.
  - question: How do I refresh an existing Table of Contents in Apps Script?
    answer: >-
      Delete the existing TOC element and insert a new one at the same position.
      The new TOC will automatically reflect current headings.
  - question: What index should I use to insert the TOC?
    answer: >-
      Use index 1 to insert at the beginning of the document, or find a specific
      paragraph's startIndex to insert after that element.
---

<script>
  import Snippet from "$lib/components/content/Snippet.svelte";
  import Note from '$lib/components/content/Note.svelte';
</script>

For **12 years**, developers have been requesting a way to insert a Table of Contents in Google Docs using Apps Script. [Issue 36758222](https://issuetracker.google.com/36758222) has 278 votes—making it one of the most requested features.

The built-in DocumentApp service still doesn't support this. But the Docs API does.

## The Problem

There's no DocumentApp method for TOC management:

```javascript
// THIS DOES NOT EXIST
DocumentApp.getActiveDocument().insertTableOfContents();
```

## Prerequisites

1. **Enable the Docs API Advanced Service**:
   - Click **Services** (+) in the Apps Script editor
   - Add **Google Docs API**

2. **Required scopes**:

<Snippet src="./snippets/apps-script-table-of-contents/appsscript.json" />

## Inserting a Table of Contents

The Docs API provides an `insertTableOfContents` request:

<Snippet src="./snippets/apps-script-table-of-contents/insert-toc.js" />

## Refreshing an Existing TOC

When headings change, you need to refresh the TOC. This requires deleting and recreating it:

<Snippet src="./snippets/apps-script-table-of-contents/refresh-toc.js" />

<Note>

The TOC is automatically populated based on Heading 1, Heading 2, etc. paragraphs in your document. You don't need to provide the entries manually.

</Note>

## Complete Example: TOC Manager Add-on

Here's a full example with a custom menu for TOC management:

<Snippet src="./snippets/apps-script-table-of-contents/complete-example.js" />

## Finding the Right Insertion Point

If you want to insert the TOC after a specific heading or paragraph:

<Snippet src="./snippets/apps-script-table-of-contents/find-insertion-point.js" />

## What's Next

- [Why DocumentApp Table Borders Stop Working](/posts/documentapp-table-borders-fix) — Another Docs API workaround
- [How to Merge Table Cells](/posts/apps-script-merge-table-cells) — Creating complex table layouts

## Resources

- [insertTableOfContents API Reference](https://developers.google.com/docs/api/reference/rest/v1/documents/request#inserttableofcontentsrequest)
- [Document Structure Concepts](https://developers.google.com/docs/api/concepts/structure)
- [Issue 36758222](https://issuetracker.google.com/36758222) — Vote for native support
