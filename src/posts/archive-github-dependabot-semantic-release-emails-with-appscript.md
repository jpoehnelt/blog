---
layout: post
title: Automatically archiving Dependabot and Semantic Release emails
excerpt: "Using Google Apps Script as part of my open source workflow."
tags:
    - post
    - code
    - GitHub
    - apps script
    - google workspace
    - dependabot
    - snippet
    - open source
date: '2022-05-12T00:00:00.000Z'
---

As an Open Source maintainer, I get hundreds of emails a day from Dependabot and Semantic Release. A while back, I put together the below [Google Apps Script](https://developers.google.com/apps-script) snippet to automatically archive the emails based upon some simple regex patterns to accomplish the following tasks:

* Archive Dependabot emails that are merged or closed
* Archive Semantic Release publish notifications on

Currently this is running in a cron every 5 minutes.

```js
function main() {
  // archive dependabot notifications
  GmailApp.moveThreadsToArchive(
    GmailApp.search('label:"inbox" from:dependabot[bot]').filter((thread) =>
      threadMatches(thread, [/Merged .* into .*/, /Closed /])
    )
  );

  // archive semantic release publish notifications
  GmailApp.moveThreadsToArchive(
    GmailApp.search('label:"inbox" from:github-actions[bot]').filter((thread) =>
      threadMatches(thread, [
        /This PR is included in version/,
        /This issue has been resolved in version/,
      ])
    )
  );
}

function threadMatches(thread, patterns) {
  const messages = thread.getMessages();

  if (messages.length > 1) {
    for (let message of messages) {
      for (let pattern of patterns) {
        const match = message.getBody().match(pattern);

        if (match) {
          return true;
        }
      }
    }
  }

  return false;
}
```

This is all pretty basic, but it does the job. Future work might focus on inverting the dependabot functionality so that depending on the date of the thread and current status of the pull request, the thread will be moved to the inbox if action is required.

I have yet to find the perfect workflow for my open source work spanning different repositories, organizations, etc. Email is a good backstop for complete coverage and the scripts above give me some eventual consistency.
