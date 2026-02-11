---
title: "How to Merge Table Cells in Google Docs with Apps Script"
description: >-
  DocumentApp can create tables but can't merge cells. Learn how to use the Docs API 
  mergeTableCells request for colspan and rowspan functionality.
pubDate: "2026-02-02"
tags:
  - code
  - google
  - google workspace
  - apps script
  - docs api
  - tables
faq:
  - question: Can DocumentApp merge table cells?
    answer: >-
      No. DocumentApp has no setColSpan() or setRowSpan() method. You need the Docs API
      with the mergeTableCells request.
  - question: How do I merge cells in Apps Script?
    answer: >-
      Create the table first, get its start index, then use Docs.Documents.batchUpdate
      with a mergeTableCells request specifying the cell range to merge.
  - question: Can I unmerge cells with Apps Script?
    answer: >-
      Yes. Use the unmergeTableCells request with the same tableRange structure.
---

<script>
  import Snippet from "$lib/components/content/Snippet.svelte";
  import Note from '$lib/components/content/Note.svelte';
</script>

Creating invoices, reports, or any professional document often requires merged table cells for headers that span multiple columns. DocumentApp can create tables, but that's where it stops—there's no way to merge cells.

[Issue 36764858](https://issuetracker.google.com/36764858) has 70 votes requesting this feature. Here's how to do it now with the Docs API.

## The Problem

DocumentApp provides no colspan or rowspan:

```javascript
const table = body.appendTable([
  ['A', 'B', 'C'],
  ['D', 'E', 'F']
]);
// table.getCell(0, 0).setColSpan(2); // DOES NOT EXIST
```

## Prerequisites

1. Enable the **Docs API** Advanced Service in your Apps Script project
2. Required scopes:

<Snippet src="./snippets/apps-script-merge-table-cells/appsscript.json" />

## The Two-Step Process

Merging cells requires:
1. Create the table (DocumentApp or Docs API)
2. Get the table's start index
3. Merge cells with the Docs API

<Snippet src="./snippets/apps-script-merge-table-cells/merge-cells.js" />

## Finding the Table Start Index

<Snippet src="./snippets/apps-script-merge-table-cells/find-table.js" />

## Complete Example: Invoice Header

Create a professional invoice with a merged header row:

<Snippet src="./snippets/apps-script-merge-table-cells/invoice-example.js" />

<Note>

When merging cells, the content of the top-left cell is preserved. Content from other merged cells is deleted.

</Note>

## Unmerging Cells

To split merged cells back into individual cells:

<Snippet src="./snippets/apps-script-merge-table-cells/unmerge-cells.js" />

## Understanding Table Cell Locations

The Docs API uses a specific structure for addressing cells:

```javascript
{
  tableStartLocation: { index: 123 },  // Char index where table starts
  rowIndex: 0,                          // 0-based row number
  columnIndex: 0                        // 0-based column number
}
```

The `rowSpan` and `columnSpan` in `tableRange` specify how many cells to include, not the final merged size.

## What's Next

- [How to Center a Table](/posts/apps-script-center-table) — Another missing DocumentApp feature
- [Why Table Borders Stop Working](/posts/documentapp-table-borders-fix) — Reliable border styling

## Resources

- [mergeTableCells API Reference](https://developers.google.com/docs/api/reference/rest/v1/documents/request#mergetablecellsrequest)
- [Issue 36764858](https://issuetracker.google.com/36764858) — Vote for native support
