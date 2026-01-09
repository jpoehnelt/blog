/**
 * Finds a Gmail draft by its subject line using Search (Optimized).
 * @param {string} subject - The exact subject line of the draft to find.
 * @return {Object} An object with a getMessage() method that returns the GmailMessage.
 * @throws {Error} If no draft with the given subject is found.
 */
function getDraftBySubject_(subject) {
  // Search Gmail for the draft (faster than loading all drafts)
  // Search Gmail for the draft (faster than loading all drafts)
  const qSubject = subject.replace(/"/g, '\\"');
  let threads = GmailApp.search(`in:drafts subject:"${qSubject}"`);
  
  // Fallback: Gmail search index can be slow. If not found, iterate all drafts.
  if (threads.length === 0) {
    const drafts = GmailApp.getDrafts();
    for (const draft of drafts) {
      if (draft.getMessage().getSubject() === subject) {
        return draft;
      }
    }
    throw new Error(`Draft with subject "${subject}" not found.`);
  }

  // Find the specific message that is a draft
  for (const thread of threads) {
    const msgs = thread.getMessages();
    for (const msg of msgs) {
      if (msg.isDraft() && msg.getSubject() === subject) {
        // Return a helper for this draft message
        return { getMessage: () => msg };
      }
    }
  }
  throw new Error(`Draft with subject "${subject}" not found.`);
}

/**
 * Checks if the system sheets exist.
 * @return {boolean} True if all core sheets exist.
 */
function isSystemInitialized() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheets = [
    DEFAULT_CONFIG.RECIPIENT_SHEET,
    "Campaigns",
    "Log"
  ];
  return sheets.every(name => ss.getSheetByName(name) !== null);
}

/**
 * Imports Google Contacts into the Recipients sheet.
 * @return {Object} Result counts { added, skipped }.
 */
function importGoogleContacts() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(DEFAULT_CONFIG.RECIPIENT_SHEET);
  
  if (!sheet) {
    throw new Error(`Sheet "${DEFAULT_CONFIG.RECIPIENT_SHEET}" not found. Please run Initialize System first.`);
  }

  // Get existing emails to prevent duplicates
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const emailColIdx = headers.indexOf("Email Recipient");
  
  if (emailColIdx === -1) {
    throw new Error('Column "Email Recipient" not found.');
  }

  const existingEmails = new Set();
  // Start from row 1 (exclude header)
  for (let i = 1; i < data.length; i++) {
    const email = data[i][emailColIdx];
    if (email) existingEmails.add(email.toString().toLowerCase());
  }

  // Fetch Contacts
  const contacts = ContactsApp.getContacts();
  const newRows = [];
  let skipped = 0;

  contacts.forEach(contact => {
    const emails = contact.getEmails();
    if (emails.length > 0) {
      // Use primary email or first available
      const primaryEmail = emails.find(e => e.isPrimary()) || emails[0];
      const emailAddr = primaryEmail.getAddress().toLowerCase();

      if (!existingEmails.has(emailAddr)) {
        const name = contact.getFullName();
        // Map to columns: [First Name, Last Name, Email Recipient...]
        // We only know Name and Email largely. We can try to split name.
        // Assuming Standard Header Order: First Name, Last Name, Email Recipient, ...
        // Better: Construct row based on header index if possible, but for now simple append
        
        // Simple Append Strategy: Name -> First Name (if exists), Email -> Email Recipient
        // We'll just put Full Name in First Name col for simplicity or split it
        
        const row = new Array(headers.length).fill("");
        row[emailColIdx] = primaryEmail.getAddress(); // Preserve case
        
        // Try to fill Name
        const nameIdx = headers.indexOf("First Name");
        if (nameIdx !== -1) row[nameIdx] = name;
        
        newRows.push(row);
        existingEmails.add(emailAddr);
      } else {
        skipped++;
      }
    }
  });

  if (newRows.length > 0) {
    sheet.getRange(sheet.getLastRow() + 1, 1, newRows.length, newRows[0].length).setValues(newRows);
  }

  return { added: newRows.length, skipped: skipped };
}
