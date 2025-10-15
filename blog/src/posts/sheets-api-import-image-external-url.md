---
layout: post
title: "Google Sheets API - IMPORT / Image - Bypass User Consent"
excerpt: "Use the Spreadsheets v4 API to set the importFunctionsExternalUrlAccessAllowed property to true and allow access to external URLs without requiring user consent."
tags:
  - post
  - code
  - google
  - google workspace
  - sheets
  - privacy  
date: "2024-04-24T00:00:00.000Z"
hideToc: true
---

Accessing data from external parties in Google Sheets is now blocked by default. This change affects any spreadsheets that use the `IMAGE` or `IMPORT` functions to import data from external URLs. Users will now need to grant permission to access external data before the functions can be used. This warning shows up as:

> Warning: Some formulas are trying to send and receive data from external parties.

This issue was reported in the [Sheets API Issue Tracker](https://issuetracker.google.com/issues/324798866). The change is intended to improve privacy and security by preventing unauthorized access to external data sources.

Developers using the Sheets API and creating PDF reports or similar will need to make a change to the spreadsheet to work around this. The engineering team at Google has provided the following guidance:

> We are working on adding options to the Google Sheets API and the Apps Script Sheets integration to support acknowledging the import warning on a per-document basis (essentially mimicking the user flow, although it can be done in advance of adding any IMPORT-related formulas).

As part of the [Spreadsheets v4 API](https://developers.google.com/sheets/api/reference/rest/v4/spreadsheets#spreadsheetproperties), there is now a new property:

```js
{
  "importFunctionsExternalUrlAccessAllowed": boolean
}
```

The comment for this property reads:

> Whether to allow external URL access for image and import functions. Read only when true. When false, you can set to true.

The property is set to `false` by default. Developers can use the `spreadsheets.batchUpdate` method in the Sheets API to set this property to `true` and allow access to external URLs for the `IMAGE` and `IMPORT` functions without requiring user consent.

```js
{
  "requests": [
    {
      "updateSpreadsheetProperties": {
        "properties": {
          "importFunctionsExternalUrlAccessAllowed": true
        },
        "fields": "importFunctionsExternalUrlAccessAllowed"
      }
    }
  ]
}
```

After this change, the warning message will no longer appear, and the functions will work as expected!
