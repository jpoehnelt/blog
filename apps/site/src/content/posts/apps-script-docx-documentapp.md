---
title: Converting between Office docx and Google Docs in Google Apps Script
description: >-
  Learn how to programmatically convert, open, and edit Microsoft Word .docx
  files using Google Apps Script and the Drive API.
pubDate: "2024-04-30"
tags:
  - code
  - google
  - google workspace
  - google docs
  - apps script
  - docx
  - docs
  - drive
---

<script>
  import Snippet from "$lib/components/content/Snippet.svelte";
</script>

In this post, we will explore how to use Office `.docx` and `DocumentApp` in Google Apps Script. All of these operations are available directly in the Docs application, but you can also use Apps Script to automate these tasks.

## Background

The `.docx` file format is for documents created in Microsoft Word, Apple Pages, or OpenOffice. DOCX files are a combination of XML and binary files. These differ from Google Docs files, which are stored in Google Drive and are accessible through the Google Docs web interface.

Google Apps Script is a cloud-based scripting platform for Google Workspace. It provides easy ways to automate tasks across Google products and third-party services.

## Converting from `.docx` to Google Docs

When using Apps Script, it can be tempting to try and open a `.docx` file directly using `DocumentApp.openById()`. However, these methods only work with Google Docs files and you will see an error if you try to open a `.docx` file directly.

> Exception: The document is inaccessible. Please try again later.

To work with `.docx` files, you need to convert them to Google Docs format first. Here is a simple example using the Drive API Advanced Service:

```javascript
const docx = DriveApp.getFileById(docxId);

const id = Drive.Files.copy({}, docx.getId(), { convert: true }).id;
const doc = DocumentApp.openById(document.id);
```

Alternatively, you can use the `Drive.Files.create()` method to create a new version of the `.docx` file in Google Docs format:

<Snippet src="./snippets/apps-script-docx-documentapp/docx.js" />

In some cases, you may want to delete the original `.docx` file after converting it to Docs format:

```javascript
// pattern for moving file to trash in Apps Script
docx.setTrashed(true);
```

## Converting to `.docx` Format from Google Docs

Converting a Docs file to `.docx` format is a bit more complex in Apps Script. You need to use the REST Drive API to export the file as a `.docx` file via `URLFetchApp` and then create a new file in Drive with the exported blob. See https://developers.google.com/drive/api/reference/rest/v3/files#exportLinks for more information on the export links available for Google Docs files.

<Snippet src="./snippets/apps-script-docx-documentapp/doc.js" />

Because we are using the Drive API via URLFetchApp, you need to add the `https://www.googleapis.com/auth/drive` scope to your Apps Script project.

<Snippet src="./snippets/apps-script-docx-documentapp/example.js" />

When I execute the above code, I get the following:

```sh
12:26:57 PM	Notice	Execution started
12:27:02 PM	Info	1K5Ll4HO41ObD7SCrSJrWonZTLy4xph12
12:27:02 PM	Notice	Execution completed
```

## Conclusion

In this post, we explored how to convert between `.docx` and Google Docs formats using Google Apps Script. We used the Drive API to copy and export files in different formats. These methods can be useful when you need to work with `.docx` files in Google Apps Script.
