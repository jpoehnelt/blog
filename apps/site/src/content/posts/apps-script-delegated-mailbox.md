---
title: "How to Access Delegated or Shared Mailboxes with Apps Script"
description: >-
  GmailApp only accesses the current user's mailbox. Learn how to use Gmail API
  with service account impersonation for delegated mailbox access.
pubDate: "2026-02-02"
tags:
  - code
  - google
  - google workspace
  - apps script
  - gmail api
  - service accounts
  - security
faq:
  - question: Can GmailApp access a shared mailbox?
    answer: >-
      No. GmailApp only accesses the mailbox of the user running the script.
      You need to use the Gmail API with service account impersonation.
  - question: What is domain-wide delegation?
    answer: >-
      Domain-wide delegation allows a service account to impersonate any user
      in a Google Workspace domain. It requires Admin Console configuration.
  - question: Is this secure?
    answer: >-
      Yes, when configured properly. Use the principle of least privilege—only
      grant the minimum scopes needed, and audit which service accounts have
      delegation enabled.
---

<script>
  import Snippet from "$lib/components/content/Snippet.svelte";
  import Note from '$lib/components/content/Note.svelte';
</script>

Support teams often need to monitor shared inboxes like `support@company.com`. But GmailApp only sees the mailbox of whoever runs the script—there's no way to specify a different mailbox.

[Issue 36755316](https://issuetracker.google.com/36755316) has 58 votes for this feature.

## The Problem

```javascript
GmailApp.getInboxThreads(); // Always the script owner's inbox
// GmailApp.getInboxThreads('shared@company.com'); // DOES NOT EXIST
```

## The Solution: Service Account Impersonation

Use a service account with domain-wide delegation to access any mailbox in your organization.

## Prerequisites

This is an advanced setup requiring:

1. **Service Account**: Created in Google Cloud Console
2. **Domain-Wide Delegation**: Enabled for the service account
3. **Admin Console Access**: To authorize the delegation
4. **OAuth2 Library**: For Apps Script OAuth2 handling

### Step 1: Create a Service Account

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to **IAM & Admin** > **Service Accounts**
3. Click **Create Service Account**
4. Name it (e.g., "Gmail Delegated Access")
5. Click **Create and Continue**, then **Done**
6. Click the service account, go to **Keys** tab
7. Add Key > Create New Key > JSON
8. Save the JSON file securely

### Step 2: Enable Domain-Wide Delegation

1. In the service account details, click **Show Advanced Settings**
2. Enable **Domain-wide Delegation**
3. Note the **Client ID**

### Step 3: Authorize in Admin Console

1. Go to [admin.google.com](https://admin.google.com)
2. **Security** > **API Controls** > **Domain-wide Delegation**
3. Click **Add New**
4. Enter the service account's Client ID
5. Add scope: `https://www.googleapis.com/auth/gmail.readonly`
6. Click **Authorize**

### Step 4: Add the OAuth2 Library

1. In Apps Script, click **Libraries** (+)
2. Add: `1B7FSrk5Zi6L1rSxxTDgDEUsPzlukDsi4KGuTMorsTQHhGBzBkMun4iDF`
3. Select the latest version

<Snippet src="./snippets/apps-script-delegated-mailbox/appsscript.json" />

## Implementation

<Snippet src="./snippets/apps-script-delegated-mailbox/gmail-service.js" />

## Reading Emails from Shared Mailbox

<Snippet src="./snippets/apps-script-delegated-mailbox/read-emails.js" />

<Note>

Never store the private key in your script. Use `PropertiesService.getScriptProperties()` to store sensitive values, or use the approach from my [service account impersonation post](/posts/apps-script-service-account-impersonation) to avoid keys entirely.

</Note>

## Complete Example: Shared Inbox Monitor

<Snippet src="./snippets/apps-script-delegated-mailbox/inbox-monitor.js" />

## Security Best Practices

1. **Least Privilege**: Only grant necessary scopes (readonly vs full access)
2. **Audit Regularly**: Review which service accounts have delegation
3. **Key Rotation**: Rotate service account keys periodically
4. **Logging**: Monitor API usage in Cloud Console

## What's Next

- [Service Account Impersonation Without Keys](/posts/apps-script-service-account-impersonation) — Avoid downloading private keys
- [How to Use Inline Images in Gmail](/posts/apps-script-gmail-inline-images) — Correct cid: usage

## Resources

- [Gmail API Reference](https://developers.google.com/gmail/api/reference/rest/v1/users.messages)
- [Domain-Wide Delegation Guide](https://developers.google.com/identity/protocols/oauth2/service-account#delegatingauthority)
- [OAuth2 Library for Apps Script](https://github.com/googleworkspace/apps-script-oauth2)
- [Issue 36755316](https://issuetracker.google.com/36755316) — Vote for native support
