/**
 * Gets recent emails from a shared mailbox.
 * @param {string} sharedEmail - The shared mailbox address
 * @param {number} maxResults - Maximum emails to fetch
 * @returns {Object[]} Array of email summaries
 */
function getEmailsFromSharedMailbox(sharedEmail, maxResults = 10) {
  const messages = gmailApiRequest(sharedEmail, 'messages', {
    maxResults: maxResults,
    labelIds: 'INBOX'
  });

  if (!messages.messages) {
    return [];
  }

  // Note: this fetches one message detail per iteration (N+1 pattern).
  // For better performance with large inboxes, use the Gmail batch endpoint
  // (/batch/gmail/v1) to retrieve all message details in a single request.
  return messages.messages.map(msg => {
    const full = gmailApiRequest(sharedEmail, `messages/${msg.id}`, {
      format: 'metadata',
      metadataHeaders: 'From,Subject,Date'
    });

    const headers = {};
    full.payload.headers.forEach(h => {
      headers[h.name] = h.value;
    });

    return {
      id: msg.id,
      from: headers.From,
      subject: headers.Subject,
      date: headers.Date,
      snippet: full.snippet
    };
  });
}

/**
 * Example: List emails from support inbox
 */
function listSupportEmails() {
  const emails = getEmailsFromSharedMailbox('support@yourcompany.com', 5);

  emails.forEach(email => {
    Logger.log(`From: ${email.from}`);
    Logger.log(`Subject: ${email.subject}`);
    Logger.log(`Preview: ${email.snippet}`);
    Logger.log('---');
  });
}
