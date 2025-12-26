---
title: Drive File Get Blob and Scopes in Google Apps Script
description: >-
  Working with binary files like PDFs or images in Google Drive with Google Apps
  Script can be a bit tricky due to scopes. Here is a comparison of the three
  main ways to get the Blob of a file in Google Drive and the scopes required.
pubDate: "2024-03-27"
tags:
  - code
  - google
  - google workspace
  - apps script
  - blob
  - pdf
  - scopes
  - google workspace addons
  - restricted scopes
  - oauth verification
---

<script>
  import Snippet from "$lib/components/content/Snippet.svelte";
  import Note from '$lib/components/content/Note.svelte';
</script>

Apps Script is often a convenient way to interact with Google Drive files. However, there are challenges when working with binary files like PDFs or images, specifically related to scopes.

These challenges arise from the different authorization patterns:

- **Running a script manually**: any scope can be used.
- **Running a script or function bound to a Google Workspace document**: any scope can be used, but it is recommended to minimize the required scopes.
- **Running a script as a Workspace Add-on**: the **minimal scope** must be used, and restricted scopes like `https://www.googleapis.com/auth/drive` should be avoided.

<Note>

Everything below assumes that you are in one of the latter scenarios and are trying to limit restricted and sensitive scopes.

</Note>

I encountered this issue while working on my [Google Cloud Next talk](/posts/2024-google-next-talk-rust-python-apps-script) and a demo involving a Workspace Add-on to compress images. Although my use case was related to images, the same issue applies to PDFs and obtaining the `Blob` of the file. But first, let's provide some background information.

### Methods to obtain the `Blob` of a file in Google Drive

There are three main methods to obtain the `Blob` of a file in Google Drive:

#### DriveApp

This method is the most straightforward, but it requires the `drive` scope.

```js
DriveApp.getFileById(id).getBlob();
```

#### Drive Advanced Service

This method, which uses the Drive Advanced Service, works with the `drive.file`, but doesn't work with `alt=media`. See this issue in the [Google Issue Tracker](https://issuetracker.google.com/issues/149104685).

```js
// This will throw an error
Drive.Files.get(id, { alt: "media" });
```

#### UrlFetchApp

This method is the most flexible, but it requires the `script.external_request` scope. While this allows retrieving a single file from Drive as a `Blob`, it also allows sending requests to any URL, which poses a potential security risk. This method is likely the best option for getting through the OAuth verification process for your Workspace Add-on, but it may not be installed by some organizations with strict data loss prevention policies.

<Snippet src="./snippets/apps-script-drive-file-get-blob/url.js" />

### Code snippets for each method and comparison

Here are the code snippets for each method and a comparison of the first 10 bytes of the `Blob` obtained by each method. Replace `ID` with the ID of the file you want to test.

<Snippet src="./snippets/apps-script-drive-file-get-blob/getblobbyid.js" />

The `test()` function will log the first 10 bytes of the `Blob` obtained by each method. You can run this function from the Apps Script editor to compare the results.

<Snippet src="./snippets/apps-script-drive-file-get-blob/example.sh" />

### Conclusion

The `DriveApp` method is the most straightforward and reliable way to obtain the `Blob` of a file in Google Drive. However, it requires the `drive` scope, which is restricted for Workspace Add-ons. The Drive Advanced Service method is not recommended due to the issue with `alt=media`. The `UrlFetchApp` method is the most flexible and can be used with the minimal `script.external_request` scope, but it poses a potential security risk.
