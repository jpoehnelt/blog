---
title: Automate Email Bankruptcy using Apps Script
description: Archiving emails older than 30 days automatically.
pubDate: "2020-04-28"
tags: "code,google,apps script,google workspace,automation,email"
---

<script>
  import Image from '$lib/components/content/Image.svelte';
  import Note from '$lib/components/content/Note.svelte';
</script>

It seems my inbox has exploded recently and this morning I wanted to declare email bankruptcy. Being a developer, I of course want to automate all things and Apps Script made this incredibly trivial to accomplish. Below are the steps I took and the total time including writing this blog post was less than an hour!

## Create a script

Go to https://script.google.com/create. See this short guide on accessing Gmail from App Script.

```js
function archiveOldEmail() {
  GmailApp.moveThreadsToArchive(
    GmailApp.search("in:inbox older_than:30d").slice(0, 100),
  );
}
```

You can customize this search as you see fit. I will probably modify this to also ignore specific labels or starred emails. For example, `in:inbox older_than:30 -in:starred` would not archive those emails I have starred. I recommend trying this out in Gmail first.

## Permissions

<Image src="src/images/email-bankruptcy/permissions.png" alt="Permissions" />

At this point, you need to grant permissions for your script to access your Gmail. Lucky for you, you wrote the code, so there shouldn’t be much to worry about. Famous last words! 😀

<Note>

You may need to go through a verification process to get this working or can click the proceed unsafe option. See https://support.google.com/cloud/answer/7454865

</Note>

<Image src="src/images/email-bankruptcy/oauth.png" alt="Oauth prompt" />

The sliced array of threads is because the GmailApp `moveThreadsToArchive` has a limit of 100 threads. But that doesn’t matter because I’m never going to run this manually.

## Trigger

Currently I have a cron that triggers this script every hour.

<Image src="src/images/email-bankruptcy/trigger.png" alt="Triggering apps script every hour" />

## Relax

At this point I should be able to relax as any email that was actually important will probably get a followup. Let’s see how it works!

Oh, and I REALLY hope I never need to adjust the trigger frequency to handle getting more than 100 emails per hour!

<hr>

See all that you can do with Gmail at https://developers.google.com/apps-script/reference/gmail/gmail-app.
