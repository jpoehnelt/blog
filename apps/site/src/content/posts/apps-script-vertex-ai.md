---
title: Using Vertex AI in Apps Script
description: >-
  How to use the Vertex AI API in Apps Script to make predictions on your data
  or use it in any of your other Google Workspace processes.
pubDate: "2023-12-11"
tags:
  - code
  - google
  - google workspace
  - apps script
  - ai
  - vertex ai
  - google cloud
---

<script>
  import Snippet from "$lib/components/content/Snippet.svelte";
  import Note from '$lib/components/content/Note.svelte';
</script>

<Note>

Update: See [Generating Text with Gemini Pro in Apps Script](/posts/apps-script-gemini-pro-text) for a snippet on using Gemini Pro.

</Note>

Using Vertex AI in Apps Script and is remarkably easy! This post will show you how to use the Vertex AI API in Apps Script to make predictions on your data or use it in any of your other Google Workspace processes.

## What is Vertex AI?

Vertex AI is a product from Google Cloud that allows you to train and deploy machine learning models. It is a fully managed service that allows you to train and deploy models using a variety of different frameworks and languages. You can read more about it [here](https://cloud.google.com/vertex-ai/docs).

Vertex AI wraps multiple Large Language Models such as `text-bison` and the soon to be released Gemini model.

## Accessing Vertex AI from Apps Script

The following requirements are needed to access Vertex AI from Apps Script:

- A Google Cloud project with billing
- Vertex API enabled
- An Oauth consent with an internal or test configuration

## Apps Script Code

The first requirement is to configure the Apps Script project.

1. Add the Google Cloud Project number to the Apps Script project properties. This can be found in the Google Cloud console.
2. Check the `Show "appsscript.json" manifest file in editor` in the Apps Script project settings.
3. Update the `appsscript.json` file with the following `oauthScopes` field:

<Snippet src="./snippets/apps-script-vertex-ai/appsscript.json" />

Now we can write the code to access the Vertex AI API, but will start with some global constants and getting the access token.

```js
const PROJECT_ID = "INSERT_YOUR_PROJECT_ID_HERE";
const MODEL = "text-bison";
const ACCESS_TOKEN = ScriptApp.getOAuthToken();
```

<Note>

❗ It is not possible to use this access token from a custom function in Google Sheets.

Unlike most other types of Apps Scripts, [custom functions never ask users to authorize access to personal data](https://developers.google.com/apps-script/guides/sheets/functions#using_services). Consequently, they can only call services that do not have access to personal data. For example, a custom function can call the URL Fetch service to fetch a URL, but it cannot call the Gmail service to send email. Because the scope, `https://www.googleapis.com/auth/cloud-platform`, is required, a service account would be needed to access the API from a

</Note>

Next we will write a function to make a prediction on a single string using [`URLFetchApp`](https://developers.google.com/apps-script/reference/url-fetch/url-fetch-app).

<Snippet src="./snippets/apps-script-vertex-ai/predict.js" />

A quick LLM version of the "Hello World":

```js
function _debug() {
  Logger.log(
    predict("What was the first computer program to return 'Hello World'?"),
  );
}
```

This returns the following:

<Snippet src="./snippets/apps-script-vertex-ai/vertex-response.json" />

## Caching the API Call

It may be desireable to cache the Vertex API call to avoid hitting rate limits and to limit costs. This can be done using the CacheService.

Read more about [memoization in Apps Script](/posts/apps-script-memoization/).

The linked memoization would allow for the same prompt to be passed to the function without making an API call.

<Snippet src="./snippets/apps-script-vertex-ai/debug.js" />
