function main() {
  // archive dependabot notifications
  GmailApp.moveThreadsToArchive(
    GmailApp.search('label:"inbox" from:dependabot[bot]').filter((thread) =>
      threadMatches(thread, [/Merged .* into .*/, /Closed /]),
    ),
  );

  // archive semantic release publish notifications
  GmailApp.moveThreadsToArchive(
    GmailApp.search('label:"inbox" from:github-actions[bot]').filter((thread) =>
      threadMatches(thread, [
        /This PR is included in version/,
        /This issue has been resolved in version/,
      ]),
    ),
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
