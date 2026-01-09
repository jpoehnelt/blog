/**
 * Creates the custom menu "Mail Merge System" on open.
 */
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu("Mail Merge System")
    .addItem("➕ New Campaign", "showNewCampaignDialog")
    .addItem("🚀 Run Mail Merge", "showRunDialog")
    .addSeparator()
    .addItem("✨ Initialize System", "init")
    .addItem("⚙️ Global Settings", "showSettings")
    .addToUi();
}

/**
 * Initialize the Google Sheet with required headers.
 */
function init() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // 1. Create or Get Recipients Sheet
  let sheet = ss.getSheetByName(DEFAULT_CONFIG.RECIPIENT_SHEET);
  if (!sheet) {
    sheet = ss.insertSheet(DEFAULT_CONFIG.RECIPIENT_SHEET);
    sheet.appendRow(["First Name", "Last Name", "Email Recipient", "Tag", "Status"]);
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, 5).setFontWeight("bold").setBackground("#f3f3f3");
    
    // Styling
    sheet.setColumnWidth(1, 150); // First Name
    sheet.setColumnWidth(2, 150); // Last Name
    sheet.setColumnWidth(3, 250); // Email
    sheet.setColumnWidth(4, 100); // Tag
    
    // Add sample data
    sheet.appendRow(["John", "Doe", "john@example.com", "newsletter", ""]);
    sheet.appendRow(["Jane", "Smith", "jane@example.com", "vip", ""]);
  }

  // 2. Create Campaigns Dashboard
  let campSheet = ss.getSheetByName(SHEET_CAMPAIGNS);
  if (!campSheet) {
    campSheet = ss.insertSheet(SHEET_CAMPAIGNS);
    campSheet.appendRow(["Date", "Campaign Name", "Filter Criteria", "Status", "Template Used"]);
    campSheet.setFrozenRows(1);
    campSheet.getRange(1, 1, 1, 5).setFontWeight("bold").setBackground("#f3f3f3");
    
    // Styling
    campSheet.setColumnWidth(1, 150); // Date
    campSheet.setColumnWidth(2, 200); // Campaign Name
    campSheet.setColumnWidth(3, 200); // Filter
  }
  
  // 3. Create Log Sheet
  let logSheet = ss.getSheetByName(SHEET_LOG);
  if (!logSheet) {
    logSheet = ss.insertSheet(SHEET_LOG);
    logSheet.appendRow(["Timestamp", "Campaign Name", "Template Name", "Template ID", "Recipient Email", "Subject", "Status", "Email Link"]);
    logSheet.setFrozenRows(1);
    logSheet.getRange(1, 1, 1, 8).setFontWeight("bold").setBackground("#f3f3f3");
        
    // Styling
    logSheet.setColumnWidth(1, 170); // Timestamp
    logSheet.setColumnWidth(2, 150); // Campaign
    logSheet.setColumnWidth(5, 200); // Email
    logSheet.setColumnWidth(6, 250); // Subject
    logSheet.setColumnWidth(8, 300); // Link
  }

  showMessage("System Initialized", "<ul><li>✅ 'Recipients' sheet ready</li><li>✅ 'Campaigns' dashboard ready</li><li>✅ 'Log' sheet ready</li></ul>");
}

/**
 * Displays the New Campaign Wizard.
 */
/**
 * Displays the New Campaign Wizard.
 */
function showNewCampaignDialog() {
  if (!isSystemInitialized()) {
    showMessage("System Not Initialized", "⚠️ Please run <b>Initialize System</b> first to create the necessary sheets.");
    return;
  }
  render_('new-campaign', 'Create New Campaign', 450, 500);
}

/**
 * Displays the Run Dialog for the active sheet.
 */
function showRunDialog() {
  if (!isSystemInitialized()) {
     showMessage("System Not Initialized", "⚠️ Please run <b>Initialize System</b> first.");
     return;
  }

  const sheet = SpreadsheetApp.getActiveSheet();
  const name = sheet.getName();
  
  if (name === DEFAULT_CONFIG.RECIPIENT_SHEET || name === "Campaigns" || name === "Log") {
    showMessage("Invalid Sheet", "⚠️ Please toggle to a specific <b>Campaign Tab</b> (e.g. 'Campaign: Newsletter') before running.");
    return;
  }
  
  render_('run', 'Run Mail Merge', 400, 550);
}

/**
 * Displays the Global Settings dialog.
 */
function showSettings() {
  render_('settings', 'Mail Merge Settings', 400, 500);
}

/**
 * Displays a custom success/message dialog.
 * @param {string} title - The dialog title.
 * @param {string} message - The message body (supports basic HTML).
 */
function showMessage(title, message) {
  render_('message', title, 400, 250, { message: message });
}

/**
 * Helper to render the single-page app with a specific view.
 * @param {string} view - 'new-campaign', 'run', 'settings', or 'message'
 * @param {string} title - Dialog title
 * @param {number} width 
 * @param {number} height 
 * @param {Object} data - Optional data to pass to the view
 */
function render_(view, title, width, height, data = {}) {
  const template = HtmlService.createTemplateFromFile("index");
  // Inject the initial view and data as global variables
  const html = template.evaluate()
      .setWidth(width)
      .setHeight(height)
      .getContent() + 
      `<script>
         window.INITIAL_VIEW = "${view}";
         window.INITIAL_DATA = ${JSON.stringify(data)};
       </script>`;

  SpreadsheetApp.getUi().showModalDialog(HtmlService.createHtmlOutput(html).setWidth(width).setHeight(height), title);
}
