---
title: Apps Script Service Account Impersonation
description: >-
  Avoid downloading private service account keys by using impersonation in Apps
  Script to obtain access tokens.
pubDate: "2024-01-10"
tags:
  - code
  - google
  - google workspace
  - apps script
  - service accounts
  - google cloud
  - security
---

<script>
  import Snippet from "$lib/components/content/Snippet.svelte";
  import Note from '$lib/components/content/Note.svelte';
</script>

<Note>

Update: See [Secure Secrets in Google Apps Script](/posts/secure-secrets-google-apps-script) for a comprehensive guide on managing secrets.

</Note>

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

<Snippet src="./snippets/apps-script-service-account-impersonation/appsscript.json" />

A more detailed explanation of these steps can be found in the [Create short-lived credentials for a service account](https://cloud.google.com/iam/docs/create-short-lived-credentials-direct#user-credentials).

## IAM Service Account Credentials API and impersonation

To generate the an access token for the service account, the [`generateAccessToken`](https://cloud.google.com/iam/docs/reference/credentials/rest/v1/projects.serviceAccounts/generateAccessToken) endpoint of the IAM Credentials API is used. Calling this endpoint requires code similar to the following using [UrlFetchApp] and [`ScriptApp.getOAuthToken()`]:

<Snippet src="./snippets/apps-script-service-account-impersonation/generateaccesstokenforserviceaccount.js" />

This function can be used to generate an access token for the service account. The access token can then be used to make requests to Google Cloud APIs.

## Generating and using service account access tokens in Apps Script

Now I can use this function to generate an access token for the service account and verify it contains valid scopes:

<Snippet src="./snippets/apps-script-service-account-impersonation/main.js" />

The output looks like the following:

<Snippet src="./snippets/apps-script-service-account-impersonation/example.sh" />

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
