---
title: "How to Center a Table in Google Docs with Apps Script"
description: >-
  DocumentApp has no table alignment property. Learn how to center tables using
  the Docs API's updateTableColumnProperties request.
pubDate: "2026-02-02"
tags:
  - code
  - google
  - google workspace
  - apps script
  - docs api
  - tables
faq:
  - question: Can DocumentApp center a table?
    answer: >-
      No. There's no setAlignment() method for tables. You need the Docs API
      to modify table column properties.
  - question: How do I center a table with Apps Script?
    answer: >-
      Use the Docs API updateTableColumnProperties request with widthType set to
      EVENLY_DISTRIBUTED. This centers the table horizontally.
---

<script>
  import Snippet from "$lib/components/content/Snippet.svelte";
  import Note from '$lib/components/content/Note.svelte';
</script>

Tables in Google Docs default to left alignment, stretching to the page margins. DocumentApp doesn't provide any method to change this—no `setAlignment()` for tables at all.

[Issue 36765133](https://issuetracker.google.com/36765133) has 115 votes for this feature. Here's the Docs API workaround.

## The Problem

```javascript
const table = body.appendTable(data);
// table.setAlignment(DocumentApp.HorizontalAlignment.CENTER); // DOES NOT EXIST
```

## Prerequisites

1. Enable the **Docs API** Advanced Service
2. Required scope: `https://www.googleapis.com/auth/documents`

<Snippet src="./snippets/apps-script-center-table/appsscript.json" />

## The Solution

Use `updateTableColumnProperties` to control table width and alignment:

<Snippet src="./snippets/apps-script-center-table/center-table.js" />

<Note>

Setting `widthType` to `EVENLY_DISTRIBUTED` tells the table to distribute column widths evenly and not stretch to page margins, effectively centering smaller tables.

</Note>

## Fixed Width Tables

For more precise control, set specific column widths:

<Snippet src="./snippets/apps-script-center-table/fixed-width.js" />

## Complete Example

<Snippet src="./snippets/apps-script-center-table/complete-example.js" />

## What's Next

- [How to Merge Table Cells](/posts/apps-script-merge-table-cells) — Another table limitation solved
- [How to Create Checkbox Lists](/posts/apps-script-checkbox-lists) — Using Docs API bullet presets

## Resources

- [updateTableColumnProperties API Reference](https://developers.google.com/docs/api/reference/rest/v1/documents/request#updatetablecolumnpropertiesrequest)
- [Issue 36765133](https://issuetracker.google.com/36765133) — Vote for native support
