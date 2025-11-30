---
title: Google User Credentials in non-interactive workflows
description: >-
  Using an offline Oauth2 flow to get Google user credentials for use as
  application default credentials in APIs that do not allow service accounts or
  API keys and require user credentials.
pubDate: '2023-05-04'
tags: 'code,google,oauth,gcloud,workspace'
---

<script>
  import Note from '$lib/components/content/Note.svelte';
</script>

Many Google APIs, such as those for Google Workspace, require end user credentials instead of service account credentials or API keys. This is a problem when you want to use these APIs in a non-interactive pattern as is the case of automations for your individual account. In this post I will show you how to generate a refresh token using gcloud that can be embedded into your workflow.

<Note>

For Google Workspace domains, you can use [domain-wide delegation](https://developers.google.com/admin-sdk/directory/v1/guides/delegation) to use a service account to impersonate a user. This is not possible for individual accounts.

</Note>

## Prerequisites

- Google Cloud Project with billing enabled
- gcloud CLI installed and configured with your Google Cloud Project

## Create a new OAuth2 Client ID

First, we need to create a new OAuth2 Client ID. This will allow us to obtain a refresh token that can be used to generate access tokens for our API calls.

1. Go to the [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Click "Create Credentials" and select "OAuth client ID"
3. Select "Desktop app" as the application type
4. Give your client a name and click "Create"
5. Download the client secret JSON file and rename as `client-id-file.json`

## Generate a refresh token and credentials file

To generate the refresh token, use gcloud to run an offline OAuth2 flow. This will open a browser window where you can log in with your Google account and authorize the application. The refresh token will be in the credentials file saved to `credentials.json`. Use the following command:

```bash
gcloud auth application-default login \
    --client-id-file="client-id-file.json" \
    --scopes="https://www.googleapis.com/auth/drive"
```

<Note>

The `--scopes` flag is optional and should be set to the scopes required by the API you are using. For example, if you are using the Google Drive API, you would set `--scopes="https://www.googleapis.com/auth/drive"`. If you want to add another scope, you can add it to the list of scopes separated by commas and regenerate the `credentials.json` file.

</Note>

The `credentials.json` file will have contents similar to the following:

```js
{
  "client_id": "318971810891-E8CivL18KOkJzHB5yn.apps.googleusercontent.com",
  "client_secret": "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9sLvLS",
  "refresh_token": "1//iKehrEMZb3aRJFCUxToYY0Nrsve7DoJomVr3zDsHmLUb1LmHsiIq1AUx55MMqnCA",
  "type": "authorized_user"
}
```

The `type` field should be `authorized_user` and the `refresh_token` field is what we (or the library/SDK) will use to generate access tokens. This is different from a service account key file where the `type` field is `service_account` and the `private_key` field is used to generate access tokens.

<Note>

The refresh token is a long-lived credential that can be used to generate access tokens for your API calls. It should be treated as a secret and not shared with anyone.

</Note>

## Obtaining an access token

Now that we have a refresh token, we can use it to generate access tokens for our API calls. The following example uses the Google Drive API to list the files in your Google Drive with curl.

```bash
curl -H "Authorization: Bearer $(gcloud auth application-default print-access-token)" \
    https://www.googleapis.com/drive/v3/files
```

We can also just validate the access token with the following endpoint:

```bash
curl "https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=$(gcloud auth application-default print-access-token)"
```

The output of this command should return the following info:

```js
{
  "issued_to": "318971810891-E8CivL18KOkJzHB5yn.apps.googleusercontent.com",
  "audience": "318971810891-E8CivL18KOkJzHB5yn.apps.googleusercontent.com",
  "scope": "https://www.googleapis.com/auth/drive https://www.googleapis.com/auth/accounts.reauth",
  "expires_in": 3593,
  "access_type": "offline"
}
```

## User credentials as application default credentials

In many cases, we want to use the `credentials.json` file on other machines or in other environments. We can do this by setting the `GOOGLE_APPLICATION_CREDENTIALS` environment variable to the path of the `credentials.json` file. This will allow us to use the `gcloud auth application-default print-access-token` command to generate access tokens for our API calls and transparently allow us to use the credentials through Google Cloud libraries and SDKs.

```bash
export GOOGLE_APPLICATION_CREDENTIALS="/some/path/credentials.json"
```

## Example use case

I use this pattern to synchronize my Gmail labels and filters using Terraform executed in a GitHub action along with other automations. My GitHub workflow looks like the following, where `GOOGLE_CREDENTIALS` is a secret containing the contents of the `credentials.json` file:

```yaml
name: Terraform
on:
  push:
    branches:
      - main
  pull_request:
jobs:
  terraform:
    if: github.actor != 'dependabot[bot]'
    name: "Terraform"
    runs-on: ubuntu-latest
    env:
      GOOGLE_APPLICATION_CREDENTIALS: ${{ github.workspace }}/credentials.json
    steps:
      - uses: actions/checkout@v3
      - uses: hashicorp/setup-terraform@v2

      - name: Write credentials.json
        uses: jsdaniell/create-json@v1.2.2
        with:
          name: "credentials.json"
          json: ${{ secrets.GOOGLE_CREDENTIALS }}

      - name: Terraform Init
        id: init
        run: terraform init

      - name: Terraform Validate
        id: validate
        run: terraform validate -no-color

      - name: Terraform Plan
        id: plan
        run: terraform plan -no-color

      - name: Terraform Apply
        id: apply
        run: terraform apply -auto-approve
        if: github.ref == 'refs/heads/main' && steps.plan.outcome == 'success'
```

## Conclusion

In this post I showed you how to generate a refresh token using gcloud that can be used to generate access tokens for your API calls. This is useful when you want to use Google APIs in a non-interactive pattern as is the case of automations for your individual account. I also showed you how to use the `credentials.json` file in other environments and how to use it with Google Cloud libraries and SDKs.
