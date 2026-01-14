---
title: "Currentonly Scopes in Google Apps Script"
description: "Learn about the @OnlyCurrentDoc annotation and currentonly scopes
  in Google Apps Script.  Understand why and how to use them, along with their
  critical limitations regarding  Advanced Services and external APIs."
pubDate: "2026-01-06"
tags:
  - "google"
  - "google workspace"
  - "apps script"
  - "security"
  - "scopes"
  - "code"
faq:
  - question: "What is the `currentonly` scope in Apps Script?"
    answer: "It restricts a script's access to only the currently active file
      (document, spreadsheet, form, or presentation) rather than all files in
      the user's Drive."
  - question: "How do I enable `currentonly` scope?"
    answer:
      "Add the `/** @OnlyCurrentDoc */` JSDoc annotation at the top of your
      script file, or manually add the `.currentonly` scope URL to your
      `appsscript.json` manifest."
  - question: "Why am I getting 'Script does not have permission' errors?"
    answer:
      "If you use `currentonly`, you cannot access other files using methods
      like `openById` or `openByUrl`. You can only use `getActiveSpreadsheet()`,
      `getActiveDocument()`, etc."
  - question: "Does `currentonly` work with Advanced Google Services?"
    answer:
      "No. Advanced Services (like the Sheets API v4 enabled in 'Services')
      require their own full scopes and do not support `currentonly`."
  - question: "Can I use `UrlFetchApp` with `currentonly`?"
    answer: "No. If your script makes external requests, it needs the
      `https://www.googleapis.com/auth/script.external_request` scope, which is
      separate from `currentonly`."
---

<script>
  import Note from '$lib/components/content/Note.svelte';
</script>

When developing with Google Apps Script, managing permissions is crucial for both security and user trust. One of the most effective ways to limit your script's reach is by using "currentonly" scopes. This tells Google (and your users) that your script only needs to access the _specific_ file it is running in, rather than having full access to the user's entire Google Drive.

However, this restricted scope comes with significant limitations that often trip up developers. This post breaks down what it is, how to use it, and where it fails.

## What is `@OnlyCurrentDoc`?

By default, if you use a method like `SpreadsheetApp.getActiveSpreadsheet()`, Apps Script might request a broad scope like `https://www.googleapis.com/auth/spreadsheets`. This scope grants your script access to **read and write every single spreadsheet** in the user's Google Drive.

That's often overkill. If you are building a simple script bound to a specific sheet, you likely only need access to _that_ sheet.

To restrict this, you can add a JSDoc annotation at the top of your script file:

```javascript
/**
 * @OnlyCurrentDoc
 */

function onOpen() {
  // ...
}
```

When you save your script, Apps Script attempts to narrow the required scopes to their `.currentonly` variants, such as `https://www.googleapis.com/auth/spreadsheets.currentonly`.

You can also explicitly define this in your `appsscript.json` manifest file to pair with the JSDoc annotation:

```json
{
  "timeZone": "America/New_York",
  "dependencies": {
  },
  "exceptionLogging": "STACKDRIVER",
  "runtimeVersion": "V8",
  "oauthScopes": [
    "https://www.googleapis.com/auth/spreadsheets.currentonly"
  ]
}
```

## The Benefits

1.  **Security**: If your script is compromised or contains a bug, the damage is limited to the single file it's running in.
2.  **User Trust**: The authorization dialog is much less scary. Instead of asking to "See, edit, create, and delete all your Google Sheets spreadsheets," it asks to "See, edit, create, and delete **this** spreadsheet."

## The Critical Limitations

While powerful, `currentonly` scopes are not a magic bullet. They have specific constraints that, if ignored, will cause your script to fail with permission errors.

### 1. Only works with Built-in Services

The `currentonly` model is designed for the high-level, built-in Apps Script services:

- `SpreadsheetApp`
- `DocumentApp`
- `SlidesApp`
- `FormApp`

If you stick to methods like `SpreadsheetApp.getActiveSpreadsheet()`, you are golden.

### 2. No Access to `openById` or `openByUrl`

This is the most common point of confusion. The `currentonly` scope literally means _current only_.

If you try to access another file:

```javascript
// This will FAIL if @OnlyCurrentDoc is present
const otherSheet = SpreadsheetApp.openById("12345...");
```

Your script will throw an error stating it does not have permission to perform that action. You restricted it to the active doc, so it cannot open others.

### 3. Does NOT work with Advanced Services

This is a big one. Advanced Google Services (enabled under "Services" in the editor, like `Sheets` for the Sheets API v4) do **not** support `currentonly` scopes.

If you enable the **Sheets Advanced Service** to use functionality not available in `SpreadsheetApp` (like certain developer metadata operations or complex formatting), your script will require the full `https://www.googleapis.com/auth/spreadsheets` scope.

<Note>
  Even if you use <code>@OnlyCurrentDoc</code>, enabling an Advanced Service will often force the script to request the full scope, overriding your annotation.
</Note>

### 4. Does NOT work with Direct API Calls

Similarly, if you are using `UrlFetchApp` to manually call the Google Drive API or Google Sheets API with an OAuth token:

```javascript
ScriptApp.getOAuthToken();
UrlFetchApp.fetch("https://sheets.googleapis.com/v4/...");
```

You need the full scope associated with that API endpoint. The `currentonly` scope is an Apps Script concept, not a general Google API concept that can be passed to raw REST endpoints easily in this context.

## Summary

Use `currentonly` scopes whenever possible to improve security and user experience. But remember:

- **Do** use it for container-bound scripts that only modify the active file.
- **Don't** expect it to work if you need to open other files (`openById`).
- **Don't** expect it to work with Advanced Services (`Sheets`, `Drive`, etc.).
