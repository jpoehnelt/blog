---
title: Combining Google Workspace Add-ons and Editor Add-ons
description: >-
  Both Add-on types have their own strengths and weaknesses. Combining them
  could be a powerful way to build Add-ons for Google Workspace but with some
  caveats.
pubDate: "2023-11-30"
tags:
  - code
  - google
  - workspace
  - add-ons
  - google workspace
  - apps script
  - hacking
---

<script>
  import Tldr from '$lib/components/content/Tldr.svelte';
</script>

<Tldr>

A Workspace Add-on can create and manage a container bound script to combine the functionality of both Workspace Add-ons and Editor Add-ons. This allows for custom menu items, more triggers, and custom functions in sheets, but beware of the UX and edge cases.

</Tldr>

## Comparing Workspace Add-ons and Editor Add-ons

Workspace Add-ons and Editor Add-ons are two different ways to extend Google Workspace. Some key differences are:

| Feature                          | Workspace Add-ons | Editor Add-ons |
| -------------------------------- | ----------------- | -------------- |
| Alt run times                    | ✅                | ❌             |
| `onEdit`, `onSelection` triggers | ❌                | ✅             |
| Top level menu                   | ❌                | ✅             |

For a complete list see [this table](https://developers.google.com/apps-script/add-ons/concepts/types).

## Combining Workspace Add-ons and Editor Add-ons

One way to combine the two Add-on types is to have a Workspace Add-on create and manage a container bound script. This container bound script could then be used to replicate the functionality of an Editor Add-on. This requires the following scope: `https://www.googleapis.com/auth/script.projects`. This is not a sensitive or restricted scope because it still requires the user to authorize the script.

With this pattern, I can achieve the following:

- Custom menu items in the top-level menu
- `onEdit` and `onSelection` triggers
- Alt run times
- Custom functions in sheets

But what is a practical use case for this? Maybe calling an external service or an LLM to process data in a sheet with a custom function while also having a custom menu item to run the function manually in the mobile version of the app?Apps Script developers are known for their creativity, so I'm sure there are other use cases and other patterns that I haven't even thought of!

Should you do this? Probably not. See the [Gotchas](#gotchas) section below.

## Example code for creating a container bound script

There are two steps to creating a container bound script:

1. Create a container bound script project
2. Create files in the container bound script project
3. (Optional) Update the container bound script project (not shown)

This uses the Apps Script API with the scope `https://www.googleapis.com/auth/script.projects`. While the code below is in Apps Script, it could be run from any language that can make HTTP requests as part of a Workspace Add-on.

```js
const projectsUrl = "https://script.googleapis.com/v1/projects";

// for alt runtime see token in
// https://developers.google.com/workspace/add-ons/guides/alternate-runtimes
const accessToken = ScriptApp.getOAuthToken();
const headers = {
  Authorization: `Bearer ${accessToken}`,
};

// Create container bound script project
// Note: There can be multiple projects per file
// Note: There is no way to list existing projects,
//   https://issuetracker.google.com/111149037
const response = UrlFetchApp.fetch(projectsUrl, {
  method: "post",
  contentType: "application/json",
  payload: JSON.stringify({
    title: "_addon",
    parentId: SpreadsheetApp.getActiveSpreadsheet().getId(),
  }),
  headers,
});

const { scriptId } = JSON.parse(response.getContentText());

// TODO persist scriptId for future updates

Logger.info(`created script: ${scriptId}`);

// Create files in container bound project, manifest is required
const files = [
  {
    source: `// DO NOT EDIT
/**
 * Multiplies an input value by 2.
 * @param {number} input The number to double.
 * @return The input multiplied by 2.
 * @customfunction
*/
function DOUBLE(input) {
  return input * 2;
}

/**
 * The event handler triggered when opening the spreadsheet.
 * @param {Event} e The onOpen event.
 * @see https://developers.google.com/apps-script/guides/triggers#onopene
 * @OnlyCurrentDoc
 */
function onOpen(e) {
  // Add a custom menu to the spreadsheet.
  SpreadsheetApp.getUi() // Or DocumentApp, SlidesApp, or FormApp.
      .createMenu('Custom Menu')
      .addItem('Hello', 'hello')
      .addToUi();
}

function hello() {
  Browser.msgBox('Hello from custom menu');
}
  `,
    name: "test",
    type: "SERVER_JS",
  },
  {
    name: "appsscript",
    type: "JSON",
    source: JSON.stringify(
      {
        timeZone: "America/New_York",
        exceptionLogging: "STACKDRIVER",
        runtimeVersion: "V8",
      },
      null,
      2,
    ),
  },
];

UrlFetchApp.fetch(`${projectsUrl}/${scriptId}/content`, {
  method: "put",
  contentType: "application/json",
  payload: JSON.stringify({
    files,
  }),
  headers,
});
```

## Gotchas

There are a few things to be aware of when using this pattern:

- Container-bound scripts cannot be listed using the Apps Script API, so the ID
  needs to be stored.
- The container-bound script must be updated through the Apps Script API when necessary.
- Potential issues with approvals and scopes have not been tested.
- The user experience for running the container-bound script and approving the scopes is not fully tested and may involve some manual steps.
- Users can still manually edit the container-bound script, which could cause issues.

## Additional resources

- [Workspace Add-ons](https://developers.google.com/workspace/add-ons)
- [Types of Add-ons](https://developers.google.com/apps-script/add-ons/concepts/types)
- [Apps Script API](https://developers.google.com/apps-script/api)
- [Apps Script API reference](https://developers.google.com/apps-script/api/reference/rest)
