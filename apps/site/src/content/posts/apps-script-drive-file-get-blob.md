---
title: Drive File Get Blob and Scopes in Google Apps Script
description: >-
  Working with binary files like PDFs or images in Google Drive with Google Apps
  Script can be a bit tricky due to scopes. Here is a comparison of the three
  main ways to get the Blob of a file in Google Drive and the scopes required.
pubDate: "2024-03-27"
tags: >-
  code,google,google workspace,apps script,blob,pdf,scopes,google workspace
  addons,restricted scopes,oauth verification
---

<script>
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

```js
const url = `https://www.googleapis.com/drive/v3/files/${id}?alt=media`;
UrlFetchApp.fetch(url, {
  headers: {
    Authorization: `Bearer ${ScriptApp.getOAuthToken()}`,
  },
}).getContent();
```

### Code snippets for each method and comparison

Here are the code snippets for each method and a comparison of the first 10 bytes of the `Blob` obtained by each method. Replace `ID` with the ID of the file you want to test.

```javascript
const ID = "18q95H4slpt6sgtkbEoq6m9rppCb-GAEX";

function getBlobById(id = ID) {
  return DriveApp.getFileById(id).getBlob();
}

function getBlobByIdAdvanced(id = ID) {
  // Does not work with alt: "media"
  try {
    return Drive.Files.get(id, { alt: "media" });
  } catch (e) {
    console.error(e.message);
  }
}

function getBlobByUrl(id = ID) {
  const url = `https://www.googleapis.com/drive/v3/files/${id}?alt=media`;
  return UrlFetchApp.fetch(url, {
    headers: {
      // This token will differ based upon the context of the script execution
      Authorization: `Bearer ${ScriptApp.getOAuthToken()}`,
    },
  }).getContent();
}

function test() {
  const driveAppBlob = getBlobById(ID);
  const driveAdvancedBlob = getBlobByIdAdvanced(ID);
  const urlFetchBlob = getBlobByUrl(ID);

  console.log({
    driveAppBytes: driveAppBlob.getBytes().slice(0, 10),
    driveAdvancedBytes: driveAdvancedBlob?.getBytes()?.slice(0, 10),
    urlFetchBlobBytes: urlFetchBlob.slice(0, 10),
  });
}
```

The `test()` function will log the first 10 bytes of the `Blob` obtained by each method. You can run this function from the Apps Script editor to compare the results.

```sh
9:52:12 AM	Notice	Execution started
9:52:13 AM	Error	Failed with: Drive.Files.get(id, { alt: "media" })
9:52:14 AM	Info	{
  driveAppBytes:     [ -119, 80, 78, 71, 13, 10, 26, 10, 0, 0 ],
  driveAdvancedBytes: undefined,
  urlFetchBlobBytes: [ -119, 80, 78, 71, 13, 10, 26, 10, 0, 0 ] }
9:52:14 AM	Notice	Execution completed
```

### Conclusion

The `DriveApp` method is the most straightforward and reliable way to obtain the `Blob` of a file in Google Drive. However, it requires the `drive` scope, which is restricted for Workspace Add-ons. The Drive Advanced Service method is not recommended due to the issue with `alt=media`. The `UrlFetchApp` method is the most flexible and can be used with the minimal `script.external_request` scope, but it poses a potential security risk.
