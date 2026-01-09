/**
 * Mail Merge for Gmail & Google Sheets
 * Author: Justin Poehnelt
 * License: Apache-2.0
 * 
 * README: https://justin.poehnelt.com/posts/free-gmail-sheets-mail-merge-script/
 */

/**
 * Main Orchestrator Function
 */
/**
 * Main Orchestrator Function
 * @param {Object} runConfig - Configuration passed from the Run Dialog.
 * @param {string} runConfig.draftId - The ID of the Gmail draft to use.
 * @param {string} runConfig.mode - "DRAFT" or "SEND".
 * @param {string} runConfig.senderName - Name to send as.
 */
function sendMailMerge(runConfig) {
  // If run without args (legacy trigger), show error
  if (!runConfig) {
     SpreadsheetApp.getUi().alert("Please use 'Run Mail Merge' from the menu to select options.");
     return;
  }

  const START_TIME = Date.now();
  const MAX_EXECUTION_TIME = 280 * 1000; // 4.5 mins

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getActiveSheet();
  
  // Validation: Ensure valid Campaign sheet structure
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const emailIdx = headers.indexOf("Email");
  const statusIdx = headers.indexOf("Status");
  const dateSentIdx = headers.indexOf("Date Sent");
  const linkIdx = headers.indexOf("Email Link");

  if (emailIdx === -1 || statusIdx === -1) {
    SpreadsheetApp.getUi().alert("Error: Active sheet does not have required 'Email' and 'Status' columns.");
    return;
  }

  // Safety Check: Quota
  if (MailApp.getRemainingDailyQuota() < 1) {
    SpreadsheetApp.getUi().alert("Daily email quota exceeded.");
    return;
  }

  // 1. Get the Draft Message
  let draftMsg;
  try {
    const draft = GmailApp.getDraft(runConfig.draftId);
    if (!draft) throw new Error("Draft not found.");
    draftMsg = draft.getMessage();
  } catch (e) {
    SpreadsheetApp.getUi().alert(`❌ Error loading draft: ${e.message}`);
    return;
  }

  const rawHtml = draftMsg.getBody();
  const subjectTemplate = draftMsg.getSubject();
  const attachments = draftMsg.getAttachments();
  
  // Dashboard Update: Mark as Running (Optional implementation)
  const campaignName = sheet.getName().replace("Campaign: ", "");
  
  // 2. Iterate Recipients
  let emailsSentCount = 0;
  
  // Mark rows as PENDING immediately for better UX
  const pendingUpdates = [];
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const status = String(row[statusIdx]); // Ensure string for comparisons
    const email = row[emailIdx];
    
    // Logic: Process only if NOT sent, NOT error, and NOT skipped
    // Also respect formula-based "SKIP"
    if (status !== "SENT" && status !== "DRAFT_CREATED" && status !== "SKIP" && email) {
       pendingUpdates.push(["PENDING"]);
    } else {
       // Keep existing status (value or formula result)
       pendingUpdates.push([status]); 
    }
  }
  
  if (data.length > 1) {
    sheet.getRange(2, statusIdx + 1, pendingUpdates.length, 1).setValues(pendingUpdates);
    SpreadsheetApp.flush();
  }

  for (let i = 1; i < data.length; i++) {
    if (Date.now() - START_TIME > MAX_EXECUTION_TIME) {
      sheet.getRange(i + 1, statusIdx + 1).setValue("PAUSED_TIMEOUT");
      break;
    }

    const row = sheet.getRange(i + 1, 1, 1, headers.length).getValues()[0];
    const email = row[emailIdx];
    const status = String(row[statusIdx]);

    if (status === "SENT" || status === "DRAFT_CREATED" || status === "SKIP" || status === "PAUSED_TIMEOUT") {
      continue; // Skip processed or skipped rows
    }
    
    // Double check email presence
    if (!email) continue;

    try {
      // 3. Personalize
      const personalization = personalizeContent_(
        rawHtml,
        subjectTemplate,
        headers,
        row,
      );

      // 4. Inline Images
      const imageMap = mapInlineImages_(attachments, rawHtml);

      // 5. Send or Draft
      // Helper returns the created GmailMessage (or null if Draft logic changes)
      const sentMessage = sendOrDraft_({
        email,
        subject: personalization.subject,
        htmlBody: personalization.html,
        inlineImages: imageMap.inlineImages,
        attachments: imageMap.attachments,
        name: runConfig.senderName, // Use runtime config
        mode: runConfig.mode
      });

      // 6. Update Status & Tracking
      const timestamp = new Date();
      const statusText = runConfig.mode === "DRAFT" ? "DRAFT_CREATED" : "SENT";
      
      // Get Link if available (only in SEND mode and if message returned)
      let emailLink = "";
      if (sentMessage && sentMessage.getId) {
         emailLink = `https://mail.google.com/mail/u/0/#sent/${sentMessage.getId()}`; 
      }
      
      // Update Row
      sheet.getRange(i + 1, statusIdx + 1).setValue(statusText);
      if (dateSentIdx !== -1) sheet.getRange(i + 1, dateSentIdx + 1).setValue(timestamp);
      if (linkIdx !== -1) sheet.getRange(i + 1, linkIdx + 1).setValue(emailLink);

      // 7. Central Logging
      if (runConfig.mode === "SEND") {
        logToCentralSheet_([
          timestamp,
          campaignName,
          subjectTemplate, // Template Name
          runConfig.draftId, // Template ID (Unique)
          email,
          personalization.subject,
          statusText,
          emailLink
        ]);
      }

      emailsSentCount++;
      if (emailsSentCount % 10 === 0) SpreadsheetApp.flush();

    } catch (e) {
      sheet.getRange(i + 1, statusIdx + 1).setValue("ERROR: " + e.message);
      SpreadsheetApp.flush();
    }
  }
  
  // Final Status Update in Dashboard
  updateCampaignStatus_(campaignName, subjectTemplate);
  showMessage("Mail Merge Complete", "✅ <b>Run Complete.</b><br>Emails have been processed.");
}

/**
 * Appends a row to the Central "Log" sheet.
 * @param {Array} rowData - [Timestamp, Campaign, Template, Email, Subject, Status, Link]
 */
function logToCentralSheet_(rowData) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let logSheet = ss.getSheetByName("Log");
  if (!logSheet) {
    logSheet = ss.insertSheet("Log");
    logSheet.appendRow(["Timestamp", "Campaign Name", "Template Name", "Template ID", "Recipient Email", "Subject", "Status", "Email Link"]);
    logSheet.setFrozenRows(1);
  }
  logSheet.appendRow(rowData);
}

/**
 * Replaces {{Placeholders}} in HTML and Subject with row data.
 * @param {string} htmlTemplate - The raw HTML content from the draft.
 * @param {string} subjectTemplate - The subject line from the draft.
 * @param {string[]} headers - Array of header names.
 * @param {string[]} row - Array of row values.
 * @return {{html: string, subject: string}} The personalized HTML and subject.
 */
function personalizeContent_(htmlTemplate, subjectTemplate, headers, row) {
  let html = htmlTemplate;
  let subject = subjectTemplate;

  headers.forEach((header, colIdx) => {
    const value = row[colIdx];
    // Safety: Escape special characters like $ or ? so they don't break the code
    const escapedHeader = header.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const placeholder = new RegExp(`{{${escapedHeader}}}`, "g");
    html = html.replace(placeholder, value);
    subject = subject.replace(placeholder, value);
  });

  // Check for undefined placeholders in the HTML and Subject
  const undefinedPlaceholders = new Set([
    ...(html.match(/{{[^}]+}}/g) || []),
    ...(subject.match(/{{[^}]+}}/g) || []),
  ]);
  if (undefinedPlaceholders.size > 0) {
    throw new Error(
      `Undefined placeholders found: ${Array.from(undefinedPlaceholders).join(", ")}`,
    );
  }

  return { html, subject };
}

/**
 * Maps attachments to inline images based on CID or Alt text.
 * @param {GoogleAppsScript.Gmail.GmailAttachment[]} allAttachments - Attachments from the draft.
 * @param {string} htmlBody - The HTML body content.
 * @return {{inlineImages: Object, attachments: GoogleAppsScript.Gmail.GmailAttachment[]}} Separated inline images (by cid) and regular attachments.
 */
function mapInlineImages_(allAttachments, htmlBody) {
  const inlineImages = {};
  const attachments = [];

  allAttachments.forEach((att) => {
    const name = att.getName();
    let cid = null;

    if (htmlBody.includes(`cid:${name}`)) {
      cid = name;
    } else if (att.getContentType().startsWith("image/")) {
      const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const imgTagMatch = htmlBody.match(
        new RegExp(`<img[^>]+alt="${escapedName}"[^>]*>`, "i"),
      );
      if (imgTagMatch) {
        const srcMatch = imgTagMatch[0].match(/src="cid:([^"]+)"/);
        if (srcMatch) {
          cid = srcMatch[1];
        }
      }
    }

    if (cid) {
      inlineImages[cid] = att;
    } else {
      attachments.push(att);
    }
  });

  return { inlineImages, attachments };
}

/**
 * Helper to fetch drafts and active sheet name for client-side UI.
 */
function getDraftsAndSheetInfo() {
  const sheet = SpreadsheetApp.getActiveSheet();
  const sheetName = sheet.getName();
  
  const drafts = [];
  try {
     // 1. Label Search
     const labeledThreads = GmailApp.search("label:MAIL_MERGE");
     labeledThreads.forEach(t => {
       const msgs = t.getMessages();
       const lastMsg = msgs[msgs.length - 1]; 
       if (lastMsg.isDraft()) {
         drafts.push({ id: lastMsg.getId(), subject: lastMsg.getSubject() });
       }
     });

     // 2. Fallback Search
     const subjectThreads = GmailApp.search("in:drafts subject:Template");
     subjectThreads.forEach(t => {
       const msgs = t.getMessages();
       const lastMsg = msgs[msgs.length - 1];
       if (lastMsg.isDraft() && !drafts.some(d => d.id === lastMsg.getId())) {
         drafts.push({ id: lastMsg.getId(), subject: lastMsg.getSubject() });
       }
     });
  } catch (e) {
    console.error(e);
  }
  
  return { drafts, sheetName };
}

/**
 * Sends an email or creates a draft based on config.
 * @param {Object} options - Sending options.
 * @return {GoogleAppsScript.Gmail.GmailMessage|null} The sent message or null if draft.
 */
function sendOrDraft_({
  email,
  subject,
  htmlBody,
  inlineImages,
  attachments,
  name,
  from,
  mode
}) {
  const options = {
    htmlBody,
    attachments,
    inlineImages,
    name,
  };

  console.log(`[Custom Mail Merge] Processing for ${email} in mode ${mode}`);

  if (from) {
    options.from = from;
  }

  if (mode === "DRAFT") {
    GmailApp.createDraft(email, subject, "See HTML", options);
    return null;
  } else {
    return GmailApp.sendEmail(email, subject, "See HTML", options);
  }
}
