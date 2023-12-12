---
layout: post
title: Using Vertex AI in Apps Script
excerpt: How to use the Vertex AI API in Apps Script to make predictions on your data or use it in any of your other Google Workspace processes.
tags:
  - post
  - code
  - google
  - google workspace
  - apps script
  - ai
  - vertex ai
  - google cloud
date: "2023-12-11T00:00:00.000Z"

---

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

```json
{
  "timeZone": "America/Denver",
  "dependencies": {},
  "exceptionLogging": "STACKDRIVER",
  "runtimeVersion": "V8",
  "oauthScopes": [
    "https://www.googleapis.com/auth/cloud-platform",
    "https://www.googleapis.com/auth/script.external_request"
  ]
}
```

Now we can write the code to access the Vertex AI API, but will start with some global constants and getting the access token.

```js
const PROJECT_ID = "INSERT_YOUR_PROJECT_ID_HERE";
const MODEL = "text-bison";
const ACCESS_TOKEN = ScriptApp.getOAuthToken();
```

:::note
:exclamation: It is not possible to use this access token from a custom function in Google Sheets.

Unlike most other types of Apps Scripts, [custom functions never ask users to authorize access to personal data](https://developers.google.com/apps-script/guides/sheets/functions#using_services). Consequently, they can only call services that do not have access to personal data. For example, a custom function can call the URL Fetch service to fetch a URL, but it cannot call the Gmail service to send email. Because the scope, `https://www.googleapis.com/auth/cloud-platform`, is required, a service account would be needed to access the API from a
:::

Next we will write a function to make a prediction on a single string using [`URLFetchApp`](https://developers.google.com/apps-script/reference/url-fetch/url-fetch-app).

```js
function predict(prompt) {
  const BASE = "https://us-central1-aiplatform.googleapis.com";
  const URL = `${BASE}/v1/projects/${PROJECT_ID}/locations/us-central1/publishers/google/models/${MODEL}:predict`;

  const payload = JSON.stringify({
    instances: [{ prompt }],
    parameters: {
      temperature: 0.2,
      maxOutputTokens: 256,
      top: 40,
      topP: 0.95,
    },
  });

  const options = {
    method: "post",
    headers: { Authorization: `Bearer ${ACCESS_TOKEN}` },
    muteHttpExceptions: true,
    contentType: "application/json",
    payload,
  };

  const response = UrlFetchApp.fetch(URL, options);

  if (response.getResponseCode() == 200) {
    return JSON.parse(response.getContentText());
  } else {
    throw new Error(response.getContentText());
  }
}
```

A quick LLM version of the "Hello World":

```js
function _debug() {
  Logger.log(
    predict("What was the first computer program to return 'Hello World'?"),
  );
}
```

This returns the following:

```json
{
  "predictions": [
    {
      "safetyAttributes": {
        "blocked": false,
        "scores": [0.1, 0.2, 0.1],
        "safetyRatings": [
          {
            "severity": "NEGLIGIBLE",
            "probabilityScore": 0.1,
            "category": "Dangerous Content",
            "severityScore": 0.1
          },
          {
            "severity": "NEGLIGIBLE",
            "severityScore": 0.1,
            "category": "Harassment",
            "probabilityScore": 0.2
          },
          {
            "severity": "NEGLIGIBLE",
            "probabilityScore": 0.1,
            "severityScore": 0.1,
            "category": "Hate Speech"
          },
          {
            "category": "Sexually Explicit",
            "severity": "NEGLIGIBLE",
            "probabilityScore": 0.1,
            "severityScore": 0.1
          }
        ],
        "categories": ["Derogatory", "Insult", "Sexual"]
      },
      "citationMetadata": { "citations": [] },
      "content": "The first computer program to return 'Hello World' was written in BCPL by Martin Richards in 1967."
    }
  ],
  "metadata": {
    "tokenMetadata": {
      "outputTokenCount": { "totalBillableCharacters": 82, "totalTokens": 25 },
      "inputTokenCount": { "totalBillableCharacters": 51, "totalTokens": 12 }
    }
  }
}
```

## Caching the API Call

It may be desireable to cache the Vertex API call to avoid hitting rate limits and to limit costs. This can be done using the CacheService.

Read more about [memoization in Apps Script](/posts/apps-script-memoization/).

The linked memoization would allow for the same prompt to be passed to the function without making an API call.

```js
// See `memoize` from https://justin.poehnelt.com/posts/apps-script-memoization/
const predictMemoized = memoize(predict);

function _debug() {
  Logger.log(
    predictMemoized(
      "What was the first computer program to return 'Hello World'?",
    ),
  );
}
```
