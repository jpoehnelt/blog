/**
 * Monitors a shared mailbox and sends alerts for new messages.
 * Set up a time-based trigger to run every 5 minutes.
 */
function monitorSharedInbox() {
  const SHARED_MAILBOX = 'support@yourcompany.com';
  const ALERT_EMAIL = 'alerts@yourcompany.com';

  // Get the last check time
  const props = PropertiesService.getScriptProperties();
  const lastCheck = props.getProperty('lastCheck');
  const lastCheckTime = lastCheck ? new Date(lastCheck) : new Date(0);

  // Search for new messages
  const query = `after:${Math.floor(lastCheckTime.getTime() / 1000)}`;
  const messages = gmailApiRequest(SHARED_MAILBOX, 'messages', {
    q: query,
    maxResults: 50
  });

  if (messages.messages && messages.messages.length > 0) {
    const newCount = messages.messages.length;
    Logger.log(`Found ${newCount} new message(s) in ${SHARED_MAILBOX}`);

    // Send alert email
    GmailApp.sendEmail(
      ALERT_EMAIL,
      `📬 ${newCount} new message(s) in ${SHARED_MAILBOX}`,
      `There are ${newCount} new messages in the shared mailbox.\n\n` +
      `View them at: https://mail.google.com/mail/u/?authuser=${SHARED_MAILBOX}`
    );
  }

  // Update last check time
  props.setProperty('lastCheck', new Date().toISOString());
}

/**
 * One-time setup to initialize the lastCheck property.
 */
function initializeMonitor() {
  PropertiesService.getScriptProperties()
    .setProperty('lastCheck', new Date().toISOString());
  Logger.log('Monitor initialized');
}
