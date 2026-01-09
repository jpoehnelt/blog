/**
 * Campaigns Module
 * Handles creation of new campaign sheets and dashboard logging.
 */

// Constants for Sheet Names
const SHEET_RECIPIENTS = "Recipients";
const SHEET_CAMPAIGNS = "Campaigns";
const SHEET_LOG = "Log";

/**
 * Creates a new Campaign sheet based on filters.
 * @param {string} name - The user-provided name for the campaign.
 * @param {string} filterCol - The header name to filter by.
 * @param {string} filterVal - The value to match (strings are compared).
 * @param {boolean} includeAll - If true, ignores filter and copies all data.
 */
function createCampaign(name, filterCol, filterVal, includeAll) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // 1. Sanitization: Ensure valid sheet name
  // Remove restricted chars: : / ? * [ ] \ and shorten to avoid limits
  const safeName = name.replace(/[:\/?*\[\]\\]/g, "_").substring(0, 50);
  const campaignSheetName = `Campaign: ${safeName}`;
  
  if (ss.getSheetByName(campaignSheetName)) {
    throw new Error(`A campaign named "${safeName}" already exists.`);
  }

  // 2. Get Data from Master
  const masterSheet = ss.getSheetByName(SHEET_RECIPIENTS);
  if (!masterSheet) {
    throw new Error(`Master sheet "${SHEET_RECIPIENTS}" not found. Please run "Initialize" first.`);
  }
  
  const data = masterSheet.getDataRange().getValues();
  if (data.length < 2) {
    throw new Error("Recipients sheet is empty.");
  }
  
  const headers = data[0];
  const colIndex = headers.indexOf(filterCol);
  
  if (!includeAll && colIndex === -1) {
    throw new Error(`Filter column "${filterCol}" not found.`);
  }
  
  // 3. Filter Data
  const timestamp = new Date();
  const filteredRows = [headers]; // Start with headers
  
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (includeAll) {
      filteredRows.push(row);
    } else {
      // Loose comparison for flexibility (e.g. 100 vs "100")
      if (String(row[colIndex]).toLowerCase() === String(filterVal).toLowerCase()) {
        filteredRows.push(row);
      }
    }
  }
  
  if (filteredRows.length === 1) {
    throw new Error(`No recipients found matching "${filterCol} = ${filterVal}".`);
  }
  
  // 4. Create New Sheet
  const newSheet = ss.insertSheet(campaignSheetName);
  
  // 5. Append Status Columns
  // We add: Status, Error, Date Sent, Email Link
  const enhancedRows = filteredRows.map((row, index) => {
    if (index === 0) {
      return [...row, "Status", "Error", "Date Sent", "Email Link"];
    }
    // Existing data + empty placeholders for new columns
    return [...row, "", "", "", ""];
  });
  
  newSheet.getRange(1, 1, enhancedRows.length, enhancedRows[0].length).setValues(enhancedRows);
  
  // 6. Formatting & Protection
  newSheet.setFrozenRows(1);
  newSheet.getRange(1, 1, 1, enhancedRows[0].length).setFontWeight("bold");
  
  // Protect Header Row to prevent structure damage
  const protection = newSheet.getRange(1, 1, 1, enhancedRows[0].length).protect();
  protection.setDescription("Header Protection");
  protection.setWarningOnly(true); // Warn user but allow edit if insistent
  
  // 7. Log to Dashboard
  logCampaignToDashboard_(timestamp, safeName, includeAll ? "ALL" : `${filterCol}=${filterVal}`, "CREATED");
  
  return campaignSheetName;
}

/**
 * Logs a campaign entry to the Dashboard sheet.
 * @param {Date} date - Creation date.
 * @param {string} name - Campaign Name.
 * @param {string} filter - Filter Description.
 * @param {string} status - Current Status.
 */
function logCampaignToDashboard_(date, name, filter, status) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let dashSheet = ss.getSheetByName(SHEET_CAMPAIGNS);
  
  if (!dashSheet) {
    // Should be created by init(), but fallback just in case
    dashSheet = ss.insertSheet(SHEET_CAMPAIGNS);
    dashSheet.appendRow(["Date", "Campaign Name", "Filter Criteria", "Status", "Template Used"]);
    dashSheet.setFrozenRows(1);
    dashSheet.getRange(1, 1, 1, 5).setFontWeight("bold");
  }
  
  dashSheet.appendRow([date, name, filter, status, ""]);
}

/**
 * Updates the campaign status in the Dashboard (e.g. after a run).
 * @param {string} campaignName - Name of the campaign (without prefix).
 * @param {string} templateName - The template used.
 */
function updateCampaignStatus_(campaignName, templateName) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const dashSheet = ss.getSheetByName(SHEET_CAMPAIGNS);
  if (!dashSheet) return;
  
  const data = dashSheet.getDataRange().getValues();
  // Assume Column B (index 1) is Campaign Name
  // We search for last occurrence or unique name
  for (let i = data.length - 1; i >= 1; i--) {
    if (data[i][1] === campaignName) {
      dashSheet.getRange(i + 1, 4).setValue("COMPLETED"); // Status Column
      dashSheet.getRange(i + 1, 5).setValue(templateName); // Template Column
      break;
    }
  }
}

/**
 * Helper to get headers for the UI dropdown.
 */
function getHeadersFromMaster() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_RECIPIENTS);
  if (!sheet) return [];
  
  return sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
}
