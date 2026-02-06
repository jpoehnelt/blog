---
title: "How to Create Checkbox Lists in Google Docs with Apps Script"
description: >-
  DocumentApp.GlyphType doesn't support checkboxes. Learn how to create checkbox
  lists using the Docs API BULLET_CHECKBOX preset.
pubDate: "2026-02-02"
tags:
  - code
  - google
  - google workspace
  - apps script
  - docs api
  - lists
faq:
  - question: Why does GlyphType return null for checkboxes?
    answer: >-
      DocumentApp.GlyphType was created before Google Docs added checkbox lists.
      The enum was never updated to include checkboxes.
  - question: How do I create checkbox lists with Apps Script?
    answer: >-
      Use the Docs API createParagraphBullets request with bulletPreset set to
      BULLET_CHECKBOX.
  - question: Can I check/uncheck boxes programmatically?
    answer: >-
      Yes. Use updateParagraphStyle with the checkedListItem style property.
---

<script>
  import Snippet from "$lib/components/content/Snippet.svelte";
  import Note from '$lib/components/content/Note.svelte';
</script>

Google Docs added checkbox lists, but DocumentApp never caught up. `GlyphType` includes `BULLET`, `HOLLOW_BULLET`, and `SQUARE_BULLET`—but checkboxes return `null`.

[Issue 36762366](https://issuetracker.google.com/36762366) has 104 votes for proper checkbox support. Here's how to work around it.

## The Problem

```javascript
// Limited built-in options
const glyphType = paragraph.getGlyphType();
// Returns: BULLET, HOLLOW_BULLET, SQUARE_BULLET, NUMBER, etc.

// But for checkboxes:
const checkboxGlyph = checkboxItem.getGlyphType(); // null
```

No getter, no setter—checkboxes are invisible to DocumentApp.

## Prerequisites

1. Enable the **Docs API** Advanced Service
2. Required scope: `https://www.googleapis.com/auth/documents`

<Snippet src="./snippets/apps-script-checkbox-lists/appsscript.json" />

## Creating Checkbox Lists

Use the Docs API `BULLET_CHECKBOX` preset:

<Snippet src="./snippets/apps-script-checkbox-lists/create-checkbox-list.js" />

## All Available Bullet Presets

The Docs API offers many presets:

```javascript
// Bullet types
'BULLET_DISC_CIRCLE_SQUARE'
'BULLET_DIAMONDX_ARROW3D_SQUARE'
'BULLET_CHECKBOX'      // ☑ Checkboxes!
'BULLET_ARROW_DIAMOND_DISC'
'BULLET_STAR_CIRCLE_SQUARE'
'BULLET_ARROW3D_CIRCLE_SQUARE'
'BULLET_LEFTTRIANGLE_DIAMOND_DISC'
'BULLET_DIAMONDX_HOLLOWDIAMOND_SQUARE'
'BULLET_DIAMOND_CIRCLE_SQUARE'

// Numbered types
'NUMBERED_DECIMAL_ALPHA_ROMAN'
'NUMBERED_DECIMAL_ALPHA_ROMAN_PARENS'
'NUMBERED_DECIMAL_NESTED'
'NUMBERED_UPPERALPHA_ALPHA_ROMAN'
'NUMBERED_UPPERROMAN_UPPERALPHA_DECIMAL'
'NUMBERED_ZERODECIMAL_ALPHA_ROMAN'
```

## Toggling Checkbox State

<Snippet src="./snippets/apps-script-checkbox-lists/toggle-checkbox.js" />

<Note>

The `checkedListItem` property only affects paragraphs that are already checkbox list items. It has no effect on regular text or other list types.

</Note>

## Complete Example: To-Do List Manager

<Snippet src="./snippets/apps-script-checkbox-lists/todo-example.js" />

## What's Next

- [Why Table Borders Stop Working](/posts/documentapp-table-borders-fix) — Another DocumentApp limitation
- [How to Access Delegated Mailboxes](/posts/apps-script-delegated-mailbox) — Gmail API with service accounts

## Resources

- [Bullet Presets Reference](https://developers.google.com/docs/api/reference/rest/v1/documents/request#bulletpreset)
- [Issue 36762366](https://issuetracker.google.com/36762366) — Vote for native support
