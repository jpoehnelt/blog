---
title: "Why DocumentApp Table Borders Stop Working (And How to Fix It)"
description: >-
  DocumentApp's setAttributes() silently fails for table borders after manual edits. 
  Learn how to use the Docs API batchUpdate as a reliable workaround.
pubDate: "2026-02-02"
tags:
  - code
  - google
  - google workspace
  - apps script
  - docs api
  - tables
faq:
  - question: Why do my DocumentApp table borders stop working?
    answer: >-
      DocumentApp's setAttributes() with BORDER_COLOR and BORDER_WIDTH silently fails 
      after a user manually edits table borders in the Google Docs UI. This is a known 
      bug (Issue 36761898) with 63 votes that has existed for years.
  - question: How do I fix table borders in Apps Script?
    answer: >-
      Use the Docs API Advanced Service with batchUpdate and updateTableCellStyle. 
      This provides reliable, granular control over all four borders of each cell.
  - question: What is the Docs API batchUpdate?
    answer: >-
      batchUpdate is a Docs API method that lets you make multiple changes to a document 
      in a single atomic request. It works reliably even on documents that have been 
      manually edited.
---

<script>
  import Snippet from "$lib/components/content/Snippet.svelte";
  import Note from '$lib/components/content/Note.svelte';
</script>

If you've ever tried to style table borders in Google Docs using Apps Script, you might have encountered a frustrating bug: `setAttributes()` with `BORDER_COLOR` and `BORDER_WIDTH` works fine—until someone manually edits the table borders in the UI. After that, your script silently does nothing.

This is a [known issue](https://issuetracker.google.com/36761898) with 63 votes, and it's been around for years.

## The Problem

Here's the code that breaks:

```javascript
// This STOPS WORKING after manual border edits
table.setAttributes({
  [DocumentApp.Attribute.BORDER_COLOR]: '#ff0000',
  [DocumentApp.Attribute.BORDER_WIDTH]: 2
});
```

No error. No warning. Just silent failure.

## Prerequisites

Before using the Docs API solution, you need to:

1. **Enable the Docs API Advanced Service**:
   - Open your Apps Script project
   - Click **Services** (+) in the left sidebar
   - Find **Google Docs API** and click **Add**

2. **Ensure your script has the right scopes**:

<Snippet src="./snippets/documentapp-table-borders-fix/appsscript.json" />

## The Solution: Docs API batchUpdate

The Docs API's `updateTableCellStyle` request works reliably, regardless of manual edits:

<Snippet src="./snippets/documentapp-table-borders-fix/set-borders.js" />

## Finding the Table Start Index

The Docs API uses character indices, not table objects. Here's how to find the table:

<Snippet src="./snippets/documentapp-table-borders-fix/find-table.js" />

## Complete Working Example

Here's a full example that sets red borders on the first table in a document:

<Snippet src="./snippets/documentapp-table-borders-fix/complete-example.js" />

## Bonus: Removing Borders

To remove borders entirely, set them to transparent with zero width:

<Snippet src="./snippets/documentapp-table-borders-fix/remove-borders.js" />

<Note>

The `fields` mask is crucial—it tells the API which properties to update. Without it, you might accidentally clear other styling.

</Note>

## Why This Happens

The DocumentApp service maintains an internal state that can get out of sync with the document's actual state after manual edits. The Docs API reads the document fresh on each call, avoiding this issue.

## What's Next

- [How to Insert a Table of Contents with Apps Script](/posts/apps-script-table-of-contents) — Another DocumentApp limitation solved with the Docs API
- [How to Merge Table Cells in Google Docs](/posts/apps-script-merge-table-cells) — Using `mergeTableCells` for colspan/rowspan

## Resources

- [updateTableCellStyle API Reference](https://developers.google.com/docs/api/reference/rest/v1/documents/request#updatetablecellstylerequest)
- [Enabling Advanced Services](https://developers.google.com/apps-script/guides/services/advanced)
- [Issue 36761898](https://issuetracker.google.com/36761898) — Vote for a native fix
