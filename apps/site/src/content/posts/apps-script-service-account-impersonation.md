---
title: Apps Script Service Account Impersonation
description: >-
  Avoid downloading private service account keys by using impersonation in Apps
  Script to obtain access tokens.
pubDate: '2024-01-10'
tags: >-
  code,google,google workspace,apps script,service accounts,google
  cloud,security
---
<script>
  import Note from '$lib/components/content/Note.svelte';
</script>

Unlike many other environments in Google Cloud that provide default application credentials, Apps Script is built on OAuth and user credentials. However there are many cases, where a service account is needed to access Google Cloud resources. For example, a service account is needed to interact with the [Google Chat API](https://developers.google.com/chat/api/guides/auth/service-accounts) as a Chat App.

Instead of downloading the service account key and storing it in the Apps Script project, the service account can be impersonated using the [`ScriptApp.getOAuthToken()`] and user as principal. This allows the service account to be used **without downloading the key**.

## Setup service account impersonation and Apps Script

There a few steps to get this working right in Apps Script:

1. Create a service account in the Google Cloud project
1. Grant the principal (your account or whoever executes the script) access to the service account
1. Add the `Service Account Token Creator` role to the principal (`Owner` role is not sufficient)
1. Enable the [IAM Service Account Credentials API](https://console.cloud.google.com/) in the Google Cloud project
1. Add the Google Cloud project number to the Apps Script project settings
1. Add the following scopes to the Apps Script project manifest:

```json
{
  "oauthScopes": [
    "https://www.googleapis.com/auth/script.external_request",
    "https://www.googleapis.com/auth/cloud-platform"
  ]
}
```

A more detailed explanation of these steps can be found in the [Create short-lived credentials for a service account](https://cloud.google.com/iam/docs/create-short-lived-credentials-direct#user-credentials).

## IAM Service Account Credentials API and impersonation

To generate the an access token for the service account, the [`generateAccessToken`](https://cloud.google.com/iam/docs/reference/credentials/rest/v1/projects.serviceAccounts/generateAccessToken) endpoint of the IAM Credentials API is used. Calling this endpoint requires code similar to the following using [UrlFetchApp] and [`ScriptApp.getOAuthToken()`]:

```js
/**
 * Generates an access token using impersonation. Requires the following:
 *
 * - Service Account Token Creator
 * - IAM Credentials API
 *
 * @params {string} serviceAccountEmail
 * @params {Array<string>} scope
 * @params {string} [lifetime="3600s"]
 * @returns {string}
 */
function generateAccessTokenForServiceAccount(
  serviceAccountEmailOrId,
  scope,
  lifetime = "3600s", // default
) {
  const host = "https://iamcredentials.googleapis.com";
  const url = `${host}/v1/projects/-/serviceAccounts/${serviceAccountEmailOrId}:generateAccessToken`;

  const payload = {
    scope,
    lifetime,
  };

  const options = {
    method: "POST",
    headers: { Authorization: "Bearer " + ScriptApp.getOAuthToken() },
    contentType: "application/json",
    muteHttpExceptions: true,
    payload: JSON.stringify(payload),
  };

  const response = UrlFetchApp.fetch(url, options);

  if (response.getResponseCode() < 300) {
    return JSON.parse(response.getContentText()).accessToken;
  } else {
    throw new Error(response.getContentText());
  }
}
```

This function can be used to generate an access token for the service account. The access token can then be used to make requests to Google Cloud APIs.

## Generating and using service account access tokens in Apps Script

Now I can use this function to generate an access token for the service account and verify it contains valid scopes:

```js
function main() {
  const token = generateAccessTokenForServiceAccount(
    // can also be the email: foo@your-project.iam.gserviceaccount.com
    "112304111718889638064",
    ["https://www.googleapis.com/auth/datastore"]
  );

  // verify the token
  console.log(
    UrlFetchApp.fetch(
      `https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=${token}`,
    ).getContentText(),
  );
}
```

The output looks like the following:

```bash
12:53:12 PM	Notice	Execution started
12:53:13 PM	Info	ya29.c.c0AY_VpZ... // truncated
12:53:13 PM	Info	{
  "issued_to": "112304111718889638064",
  "audience": "112304111718889638064",
  "scope": "https://www.googleapis.com/auth/datastore",
  "expires_in": 3599,
  "access_type": "online"
}
12:53:14 PM	Notice	Execution completed
```

To use this token to make requests to Google Cloud APIs, the token can be added to the `Authorization` header of the request instead of the [`ScriptApp.getOAuthToken()`] user token:

```js
const options = {
  headers: { Authorization: `Bearer ${token}` },
};

UrlFetchApp.fetch(url, options);
```

<Note>

Be sure to update the scopes in the `generateAccessTokenForServiceAccount` function to match the scopes needed for the request.

</Note>

[UrlFetchApp]: https://developers.google.com/apps-script/reference/url-fetch/url-fetch-app
[`ScriptApp.getOAuthToken()`]: https://developers.google.com/apps-script/reference/script/script-app#getoauthtoken
