---
title: "Free Mail Merge for Gmail & Google Sheets: The Developer’s Guide"
description: "Learn how to create a free, unlimited mail merge with Gmail and Google Sheets. Includes a free copy of the mail merge template and the full email script for developers."
pubDate: "2025-12-21"
tags:
  - google apps script
  - google workspace
  - mail merge
  - google sheets
  - automation
syndicate: true
---

<script>
  import Note from "$lib/components/content/Note.svelte";
  import Tldr from "$lib/components/content/Tldr.svelte";
</script>

<Tldr>

- **Free & Unlimited**: Send up to 2,000 emails/day (Workspace) or 500/day (Gmail) for free.
- **No Add-ons**: Runs entirely on your Google account. No watermarks, no subscription fees.
- **Privacy Focused**: Your data never leaves your Google Sheet.
- **Developer Grade**: Includes Test Mode, Aliases, and Time-Limit protections.

</Tldr>

Why pay for a simple mail merge?

If you search for "mail merge gmail," you are bombarded with paid tools. They offer "free tiers" that limit you to 50 emails a day or slap a watermark on your messages.

**You don't need an add-on.** As a developer, I know that the technology to send these emails is already built into your Google account—for free.

This guide will show you how to use Google Apps Script to build a **free, unlimited mail merge** tool using Gmail and Google Sheets. Whether you want a "one-click" template or the raw code to build it yourself, this guide has you covered.

## 1. The One-Click Solution (Get the Template)

Don't want to code? I have packaged the script into a ready-to-use Google Sheet.

<div class="my-8 p-6 bg-blue-50 border border-blue-200 rounded-lg text-center">
  <h3 class="text-xl font-bold mb-2">🚀 Get the Free Mail Merge Template</h3>
  <p class="mb-4">Click below to make a copy of the sheet to your Google Drive.</p>
  <a href="#" class="inline-block px-6 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 no-underline text-white hover:text-white visited:text-white">Make a Copy of Mail Merge Sheet</a>
  <p class="text-sm text-gray-500 mt-2">(Link coming soon)</p>
</div>

**How to use it:**

1.  **Draft**: Write your email in Gmail. Use `{{First Name}}` as a placeholder.
2.  **Data**: Fill in the "Recipients" tab in the Sheet.
3.  **Send**: Click the "Mail Merge System" menu > "Send Emails".

## 2. The Email Script (For Developers)

For those who want to understand the engine or build it into their own projects, here is the full **email script for email merge**.

This "v2" script is robust. It handles:

- **Test Mode**: Create drafts to verify formatting before sending.
- **Inline Images**: Automatically fixes broken logos/images from your draft.
- **Aliases**: Send from "support@yourdomain.com".
- **Time Limits**: Gracefully pauses if the script runs too long (avoiding the 6-minute timeout).

```javascript
/**
 * Mail Merge for Gmail & Google Sheets
 * Author: Justin Poehnelt
 * License: Apache-2.0
 * 
 * README: https://justin.poehnelt.com/posts/free-gmail-sheets-mail-merge-script/
 */

// DEFAULT CONFIGURATION
const DEFAULT_CONFIG = {
  MODE: "DRAFT", // Options: "SEND" or "DRAFT"
  RECIPIENT_SHEET: "Recipients",
  DRAFT_SUBJECT: "Mail Merge Template",
  SENDER_NAME: "My Name",
  SENDER_EMAIL: "" // Optional: "support@yourdomain.com"
};

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu("Mail Merge System")
    .addItem("🚀 Run Mail Merge", "sendMailMerge")
    .addSeparator()
    .addItem("⚙️ Settings", "showSettings")
    .addToUi();
}

/**
 * Main Orchestrator Function
 */
function sendMailMerge() {
  const config = getConfig_();
  const START_TIME = Date.now();
  const MAX_EXECUTION_TIME = 280 * 1000; // 4.5 mins

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(config.RECIPIENT_SHEET);
  if (!sheet) {
    SpreadsheetApp.getUi().alert(`Sheet "${config.RECIPIENT_SHEET}" not found.`);
    return;
  }
  const data = sheet.getDataRange().getValues();
  const headers = data[0];

  // Safety Check: Do we have enough email quota left?
  if (MailApp.getRemainingDailyQuota() < 1) {
    SpreadsheetApp.getUi().alert("Daily email quota exceeded.");
    return;
  }

  // 1. Find the Gmail Draft
  // We use a search query to find your draft quickly
  const draft = getDraftBySubject_(config.DRAFT_SUBJECT);
  const templateMsg = draft.getMessage();
  const rawHtml = templateMsg.getBody();
  const attachments = templateMsg.getAttachments();

  // 2. Iterate Recipients
  const emailIdx = headers.indexOf("Email");
  const statusIdx = headers.indexOf("Status");
  let emailsSentCount = 0;

  for (let i = 1; i < data.length; i++) {
    // Safety Check: Stop if we're running out of time (prevents Timeout errors)
    if (Date.now() - START_TIME > MAX_EXECUTION_TIME) {
      sheet.getRange(i + 1, statusIdx + 1).setValue("PAUSED_TIMEOUT");
      SpreadsheetApp.flush();
      break;
    }

    const row = data[i];
    const email = row[emailIdx];
    const status = row[statusIdx];

    // Skip if sent or empty
    if (status === "SENT" || status === "DRAFT_CREATED") {
      continue;
    }

    try {
      // 3. Replace variables like {{Name}} with real data
      const personalization = personalizeContent_(
        rawHtml,
        config.DRAFT_SUBJECT,
        headers,
        row,
      );

      // 4. Fix any broken images (like logos) in the email
      const imageMap = mapInlineImages_(attachments, rawHtml);

      // 5. Send or Draft
      sendOrDraft_({
        email,
        subject: personalization.subject,
        htmlBody: personalization.html,
        inlineImages: imageMap.inlineImages,
        attachments: imageMap.attachments,
        name: config.SENDER_NAME,
        from: config.SENDER_EMAIL,
        mode: config.MODE
      });

      // 6. Update Status
      const statusText = config.MODE === "DRAFT" ? "DRAFT_CREATED" : "SENT";
      sheet.getRange(i + 1, statusIdx + 1).setValue(statusText);

      // Save our progress to the sheet every 10 rows
      emailsSentCount++;
      if (emailsSentCount % 10 === 0) {
        SpreadsheetApp.flush();
      }
    } catch (e) {
      sheet.getRange(i + 1, statusIdx + 1).setValue("ERROR: " + e.message);
      SpreadsheetApp.flush(); // Always flush on error
    }
  }
}

/**
 * Settings UI
 */
function showSettings() {
  const config = getConfig_();
  
  // Find drafts for dropdown (subject must contain "Template")
  const drafts = GmailApp.search("in:drafts subject:Template");
  const subjects = new Set();
  
  // Always add the current one to ensure it's selectable (even if renamed/moved)
  if (config.DRAFT_SUBJECT) {
    subjects.add(config.DRAFT_SUBJECT);
  }
  
  drafts.forEach(t => subjects.add(t.getFirstMessageSubject()));
  const draftList = Array.from(subjects);

  const template = HtmlService.createTemplateFromFile("Settings");
  
  // Pass current values to template
  template.MODE = config.MODE;
  template.RECIPIENT_SHEET = config.RECIPIENT_SHEET;
  template.DRAFT_SUBJECT = config.DRAFT_SUBJECT;
  template.SENDER_NAME = config.SENDER_NAME;
  template.SENDER_EMAIL = config.SENDER_EMAIL || "";
  template.draftList = draftList;

  SpreadsheetApp.getUi().showModalDialog(template.evaluate().setWidth(400).setHeight(500), "Settings");
}

function saveSettings(formObject) {
  const props = PropertiesService.getScriptProperties();
  props.setProperties(formObject);
}

function getConfig_() {
  const props = PropertiesService.getScriptProperties().getProperties();
  return { ...DEFAULT_CONFIG, ...props };
}

/**
 * Finds a Gmail draft by its subject line using Search (Optimized).
 */
function getDraftBySubject_(subject) {
  // Search Gmail for the draft (faster than loading all drafts)
  const qSubject = subject.replace(/"/g, '\\"');
  const threads = GmailApp.search(`in:drafts subject:"${qSubject}"`);
  if (threads.length === 0) {
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
 * Replaces {{Placeholders}} in HTML and Subject with row data.
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
 * Sends an email or creates a draft based on config.
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

  if (from) {
    options.from = from;
  }

  if (mode === "DRAFT") {
    GmailApp.createDraft(email, subject, "See HTML", options);
  } else {
    GmailApp.sendEmail(email, subject, "See HTML", options);
  }
}
```

### Settings.html

Create a new HTML file named `Settings.html` and paste this code:

```html
<!DOCTYPE html>
<html>
  <head>
    <base target="_top">
    <style>
      body { font-family: sans-serif; padding: 10px; }
      .form-group { margin-bottom: 15px; }
      label { display: block; margin-bottom: 5px; font-weight: bold; }
      input, select { width: 100%; padding: 8px; box-sizing: border-box; }
      button { background-color: #4CAF50; color: white; padding: 10px 15px; border: none; cursor: pointer; }
      button:hover { background-color: #45a049; }
    </style>
  </head>
  <body>
    <h3>Mail Merge Settings</h3>
    <form id="settingsForm">
      <div class="form-group">
        <label for="MODE">Mode</label>
        <select id="MODE" name="MODE">
          <option value="DRAFT" <?= MODE === 'DRAFT' ? 'selected' : '' ?>>Draft (Test)</option>
          <option value="SEND" <?= MODE === 'SEND' ? 'selected' : '' ?>>Send (Live)</option>
        </select>
      </div>
      <div class="form-group">
        <label for="RECIPIENT_SHEET">Recipient Sheet Name</label>
        <input type="text" id="RECIPIENT_SHEET" name="RECIPIENT_SHEET" value="<?= RECIPIENT_SHEET ?>">
      </div>
      <div class="form-group">
        <label for="DRAFT_SUBJECT">Draft Subject (Template)</label>
        <select id="DRAFT_SUBJECT" name="DRAFT_SUBJECT">
          <? for (let i = 0; i < draftList.length; i++) { ?>
            <option value="<?= draftList[i] ?>" <?= DRAFT_SUBJECT === draftList[i] ? 'selected' : '' ?>>
              <?= draftList[i] ?>
            </option>
          <? } ?>
        </select>
      </div>
      <div class="form-group">
        <label for="SENDER_NAME">Sender Name</label>
        <input type="text" id="SENDER_NAME" name="SENDER_NAME" value="<?= SENDER_NAME ?>">
      </div>
      <div class="form-group">
        <label for="SENDER_EMAIL">Sender Email (Alias)</label>
        <input type="text" id="SENDER_EMAIL" name="SENDER_EMAIL" value="<?= SENDER_EMAIL ?>" placeholder="Optional">
      </div>
      <button type="button" onclick="save()">Save Settings</button>
    </form>
    <script>
      function save() {
        const form = document.getElementById('settingsForm');
        const data = {
          MODE: form.MODE.value,
          RECIPIENT_SHEET: form.RECIPIENT_SHEET.value,
          DRAFT_SUBJECT: form.DRAFT_SUBJECT.value,
          SENDER_NAME: form.SENDER_NAME.value,
          SENDER_EMAIL: form.SENDER_EMAIL.value
        };
        google.script.run
          .withSuccessHandler(() => google.script.host.close())
          .saveSettings(data);
      }
    </script>
  </body>
</html>
```

## 3. Need Complex Layouts? Use Google Docs

For standard emails, Gmail Drafts are perfect. But if you are sending a **Contract**, **Invoice**, or **Newsletter** with complex tables, you should use Google Docs as your template source.

**Pro Tip**: Google Docs are great for tables and text, but tricky for images. For image-heavy emails, stick to the Gmail Draft method above.

To use a Google Doc, add this helper function to your script:

```javascript
function getGoogleDocContent(docId) {
  const url = `https://docs.google.com/feeds/download/documents/export/Export?id=${docId}&exportFormat=html`;
  const param = {
    method: "get",
    headers: { Authorization: `Bearer ${ScriptApp.getOAuthToken()}` },
    muteHttpExceptions: true,
  };
  return UrlFetchApp.fetch(url, param).getContentText();
}
```

Then, in the main function, replace the `draft` logic with:

```javascript
const html = getGoogleDocContent("YOUR_DOC_ID");
```

<Note>

**Critical Developer Note**: To use this Google Doc method, you must explicitly enable permission to read Drive files.

1. Go to **Project Settings** (Gear icon).
2. Check **"Show appsscript.json manifest file in editor"**.
3. Add `"https://www.googleapis.com/auth/drive.readonly"` to the `oauthScopes` array.

```json
{
  "timeZone": "America/New_York",
  "dependencies": {},
  "exceptionLogging": "STACKDRIVER",
  "runtimeVersion": "V8",
  "oauthScopes": [
    "https://www.googleapis.com/auth/spreadsheets.currentonly",
    "https://www.googleapis.com/auth/gmail.send",
    "https://www.googleapis.com/auth/drive.readonly"
  ]
}
```

Without this, the script will fail.

</Note>

## 4. How to Create a Mail Merge with Gmail and Google Sheets

If you are setting this up from scratch using the code above, follow these steps.

### Step 1: Prepare the Sheet

1.  Create a new Google Sheet.
2.  Rename the tab to `Recipients`.
3.  Add headers: `Email`, `First Name`, `Status`.

<Note>

**Template Variables**: The headers in your Sheet correspond to the `{{Variables}}` in your email.

- **Case Sensitive**: `{{First Name}}` matches the column `First Name`. It does NOT match `first name`.
- **Exact Match**: Ensure there are no trailing spaces in your column headers.

</Note>

### Step 2: Install the Script

1.  Go to **Extensions > Apps Script**.
2.  Delete any code in `Code.gs`.
3.  Paste the script provided above into `Code.gs`.
4.  Click **+** (plus icon) next to **Files** and select **HTML**.
5.  Name it `Settings` (which creates `Settings.html`).
6.  Paste the HTML code provided above.
7.  Save the project (Cmd+S).

### Step 3: Authorize

1.  Reload your Google Sheet.
2.  You will see a new menu **Mail Merge System**.
3.  Click **Run Mail Merge** or **Settings**.
4.  **Important**: You will see an "Authorization Required" popup.
    - Click **Review Permissions**.
    - Choose your account.
    - You will see a "Google hasn’t verified this app" screen. **This is normal**—it's because _you_ are the developer.
    - Click **Advanced** > **Go to (Script Name) (unsafe)**.
    - Click **Allow**.

## 5. Why This Script is "Developer Grade" (Common Pitfalls)

If you have tried other scripts and failed, here is why. This script explicitly handles the "long-tail" errors that break most free tutorials.

### 1. The "6-Minute Wall" (Timeout)

Apps Script kills any process that runs longer than 6 minutes. Sending 500 emails takes time.

- **The Fix**: This script detects when it has been running for 4.5 minutes (`MAX_EXECUTION_TIME`) and auto-pauses, marking the current row as `PAUSED_TIMEOUT`. You can simply run the script again to pick up exactly where it left off.

### 2. The "Inline Image" Ghosting

Copying an image into a Gmail draft often results in it being attached as `image001.png` at the bottom of the email, rather than appearing inline.

- **The Fix**: The `mapInlineImages` function scans your HTML for `img` tags and re-maps the attachment Blobs to the correct `cid` (Content-ID), ensuring your logo appears exactly where you put it.

### 3. The "Quota Confusion" (Velocity vs Volume)

Google's spam filters will block you if you try to burst 100 emails in 1 second, even if you are within your 2,000/day daily limit.

- **The Fix**: We use `SpreadsheetApp.flush()` every 10 rows. This not only saves your progress but acts as a natural throttle to keep your "send velocity" within safe limits.

### 4. The "Date & Number" Formatting Glitch

Dates in Sheets (`12/25/2025`) often arrive in emails as full objects (`Fri Dec 25 2025 00:00:00...`).

- **The Fix**: The simplest solution is to format your columns in Sheets as **Format > Number > Plain Text**. This ensures the script reads exactly what you see.

### 5. The "Regex Bomb"

Naive scripts use `string.replace(Header, Value)`. If your header is `Salary (USD)`, the parentheses break the Regex engine.

- **The Fix**: We escape all special characters in your headers before creating the RegExp, so you can use columns like `Question?` or `Price ($)` without crashing.

## FAQ

**Q: What is the limit for mail merge in Gmail?**

A:

- **Gmail (@gmail.com)**: 500 recipients per 24 hours.
- **Google Workspace (Business)**: 2,000 recipients per 24 hours.
- _Note_: One email to 1 person with 1 CC counts as 2 recipients.

**Q: Can I send from an alias (e.g., support@)?**

A: Yes! In the script settings, set **Sender Email** to "support@yourdomain.com". Note that this email must already be added as a "Send mail as" alias in your Gmail settings.

**Q: Why use `GmailApp` instead of `MailApp`?**

A: `MailApp` is simpler but limited. We use `GmailApp` because it allows:

- **Draft Access**: We need to read your "Mail Merge Template" draft to use as the design.
- **Aliases**: `MailApp` cannot send from aliases like `support@company.com`.
- **Inbox Management**: It allows for threading and label management if you expand the script later.

**Q: Is "Test Mode" safe?**

A: Yes. When `MODE = "DRAFT"`, no emails are sent. They appear in your **Drafts** folder so you can verify the look and feel before switching to `"SEND"` mode.

**Q: Will my emails go to spam?**

A: They shouldn't, as long as you don't act like a spammer. Gmail is designed for personal negotiation and business communication, not high-volume "cold outreach."

- **Warm up**: Don't send 2,000 emails on Day 1. Start with 50.
- **SPF & DKIM**: If you use Google Workspace (Business), ensure your domain has SPF and DKIM records set up. This tells receiving servers that you are the legitimate owner of the domain.

**Q: Gmail vs. Transactional Email Services (SendGrid/Mailgun)?**

A: Use **Gmail** (this script) for personal outreach, newsletters to colleagues, or internal updates. Use a **Transactional Service** (like SendGrid or AWS SES) if you need analytics (open rates), unsubscribes, or are sending 50,000+ marketing emails.

**Q: Can I CC or BCC people?**

A: Yes. You can simple add `cc: "manager@example.com"` or `bcc: "..."` to the `options` object in the code, just like we did for `name` and `inlineImages`.

**Q: Can I schedule emails for later?**

A: This script runs immediately. To schedule it, you would need to use Apps Script "Triggers" (the clock icon) to run `sendMailMerge` at a specific time.

