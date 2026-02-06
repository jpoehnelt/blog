---
title: "When Built-in Services Aren't Enough: A Quick Reference"
description: >-
  A quick reference for when to use Advanced Services instead of built-in Apps
  Script services like DocumentApp, GmailApp, CalendarApp, and DriveApp.
pubDate: "2026-02-02"
tags:
  - code
  - google
  - google workspace
  - apps script
  - advanced services
  - reference
faq:
  - question: What are Apps Script Advanced Services?
    answer: >-
      Advanced Services provide direct access to Google APIs (Docs, Sheets, Drive,
      Calendar, Gmail, etc.) that offer more functionality than built-in services.
  - question: When should I use Advanced Services?
    answer: >-
      When the built-in service (DocumentApp, GmailApp, etc.) doesn't support what
      you need—like table merging, TOC insertion, or free/busy queries.
  - question: How do I enable Advanced Services?
    answer: >-
      In the Apps Script editor, click Services (+), find the API you need,
      and click Add. Then use it with the service name (Docs., Gmail., etc.).
---

<script>
  import Snippet from "$lib/components/content/Snippet.svelte";
  import Note from '$lib/components/content/Note.svelte';
</script>

Google Apps Script's built-in services—`DocumentApp`, `GmailApp`, `CalendarApp`, `DriveApp`—are convenient but limited. When you hit a wall, Advanced Services provide direct API access with more capabilities.

This reference helps you quickly identify when to reach for an Advanced Service.

## Quick Reference Table

| Task | Built-in Service | Limitation | Solution |
|------|------------------|------------|----------|
| [Table borders](/posts/documentapp-table-borders-fix) | `DocumentApp.setAttributes()` | Fails after manual edits | Docs API `updateTableCellStyle` |
| [Table of contents](/posts/apps-script-table-of-contents) | N/A | No method exists | Docs API `insertTableOfContents` |
| [Merge table cells](/posts/apps-script-merge-table-cells) | N/A | No colspan/rowspan | Docs API `mergeTableCells` |
| [Center tables](/posts/apps-script-center-table) | N/A | No alignment method | Docs API `updateTableColumnProperties` |
| [Checkbox lists](/posts/apps-script-checkbox-lists) | `GlyphType` | Returns null for checkboxes | Docs API `BULLET_CHECKBOX` preset |
| [Shared mailbox](/posts/apps-script-delegated-mailbox) | `GmailApp` | Own mailbox only | Gmail API + service account |
| [Inline images](/posts/apps-script-gmail-inline-images) | `GmailApp` | Confusing cid: behavior | GmailApp (correct usage) |
| [Free/busy query](/posts/apps-script-free-busy) | `CalendarApp.getEvents()` | Manual gap calculation | Calendar API `freebusy.query` |
| [Move files](/posts/apps-script-move-files) | `addFile/removeFile` | Two-step, can fail | Drive API `addParents/removeParents` |
| [Document comments](/posts/apps-script-document-comments) | N/A | No method exists | Drive API Comments resource |

## How to Enable Advanced Services

1. Open your Apps Script project
2. Click **Services** (+) in the left sidebar
3. Find the API you need:
   - **Google Docs API** → Use as `Docs.`
   - **Google Sheets API** → Use as `Sheets.`
   - **Google Drive API** → Use as `Drive.`
   - **Calendar API** → Use as `Calendar.`
   - **Gmail API** → Use as `Gmail.`
4. Click **Add**

<Note>

Some Advanced Services require additional OAuth scopes. Add them to your `appsscript.json` manifest file.

</Note>

## Service Comparison

### DocumentApp vs Docs API

| DocumentApp | Docs API |
|-------------|----------|
| High-level, easy to use | Low-level, more verbose |
| Limited table support | Full table styling |
| No TOC, no comments | Full document control |
| Works on active document | Requires document ID |

### GmailApp vs Gmail API

| GmailApp | Gmail API |
|----------|-----------|
| Current user's mailbox only | Any mailbox (with delegation) |
| Simple send/search | Full MIME control |
| Built-in label support | Fine-grained filtering |

### CalendarApp vs Calendar API

| CalendarApp | Calendar API |
|-------------|--------------|
| Event-by-event operations | Batch operations |
| No free/busy query | `freebusy.query` endpoint |
| Simple recurrence | Complex recurrence rules |

### DriveApp vs Drive API

| DriveApp | Drive API |
|----------|-----------|
| Two-step file moves | Atomic moves |
| Limited metadata access | Full file metadata |
| No direct comment access | Comments resource |

## Current Limitations (No Workaround)

These features have **no solution** even with Advanced Services:

| Issue | Feature | Votes | Notes |
|-------|---------|-------|-------|
| [36754517](https://issuetracker.google.com/36754517) | Create/modify drawings | 116 | No Drawings API |
| [240105054](https://issuetracker.google.com/240105054) | Forms rich text | 85 | Forms API limited |
| [36752985](https://issuetracker.google.com/36752985) | Gmail triggers | 91 | Use time-based + search |
| [172154009](https://issuetracker.google.com/172154009) | Linked tables (Docs↔Sheets) | 81 | Not exposed in API |
| [36759757](https://issuetracker.google.com/36759757) | Custom HTTP status codes | 156 | Web Apps return 200 only |

Vote on these issues to help prioritize fixes!

## Series: Filling the Gaps

This post is part of a series on solving Apps Script limitations:

1. **Part 1** (this post) — When to use Advanced Services
2. **Part 2** — Document automation (Docs API)
   - [Table Borders](/posts/documentapp-table-borders-fix)
   - [Table of Contents](/posts/apps-script-table-of-contents)
   - [Merge Table Cells](/posts/apps-script-merge-table-cells)
   - [Center Tables](/posts/apps-script-center-table)
   - [Checkbox Lists](/posts/apps-script-checkbox-lists)
3. **Part 3** — Email automation
   - [Delegated Mailbox](/posts/apps-script-delegated-mailbox)
   - [Inline Images](/posts/apps-script-gmail-inline-images)
4. **Part 4** — Calendar & Drive
   - [Free/Busy Queries](/posts/apps-script-free-busy)
   - [Move Files](/posts/apps-script-move-files)
   - [Document Comments](/posts/apps-script-document-comments)

## Resources

- [Advanced Services Guide](https://developers.google.com/apps-script/guides/services/advanced)
- [Apps Script Reference](https://developers.google.com/apps-script/reference)
- [Issue Tracker](https://issuetracker.google.com/issues?q=componentid:191640) — Report and vote on issues
