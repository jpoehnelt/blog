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
faq:
  - question: "What is the limit for mail merge in Gmail?"
    answer: "Gmail (@gmail.com) allows 500 recipients per 24 hours, while Google Workspace (Business) allows 2,000. Note that one email to 1 person with 1 CC counts as 2 recipients."
  - question: "Can I send from an alias (e.g., support@)?"
    answer: "Yes! In the script settings, set **Sender Email** to \"support@yourdomain.com\". Note that this email must already be added as a \"Send mail as\" alias in your Gmail settings."
  - question: "Why use `GmailApp` instead of `MailApp`?"
    answer: "`MailApp` is simpler but limited. We use `GmailApp` because it allows draft access (to use your template), supports sending from aliases, and provides better inbox management features like threading."
  - question: "Is \"Test Mode\" safe?"
    answer: "Yes. When `MODE = \"DRAFT\"`, no emails are sent. They appear in your **Drafts** folder so you can verify the look and feel before switching to `\"SEND\"` mode."
  - question: "Will my emails go to spam?"
    answer: "They shouldn't, as long as you don't act like a spammer. Gmail is designed for personal negotiation, not cold outreach. Warm up your account by starting with 50 emails, not 2,000. If using Google Workspace, ensure your domain has SPF & DKIM records set up."
  - question: "Gmail vs. Transactional Email Services (SendGrid/Mailgun)?"
    answer: "Use **Gmail** (this script) for personal outreach, newsletters to colleagues, or internal updates. Use a **Transactional Service** (like SendGrid or AWS SES) if you need analytics (open rates), unsubscribes, or are sending 50,000+ marketing emails."
  - question: "Can I CC or BCC people?"
    answer: "Yes. You can simply add `cc: \"manager@example.com\"` or `bcc: \"...\"` to the `options` object in the code, just like we did for `name` and `inlineImages`."
  - question: "Can I schedule emails for later?"
    answer: "This script runs immediately. To schedule it, you would need to use Apps Script \"Triggers\" (the clock icon) to run `sendMailMerge` at a specific time."syndicate: true
---

<script>
  import Note from "$lib/components/content/Note.svelte";
  import Tldr from "$lib/components/content/Tldr.svelte";
  import Snippet from "$lib/components/content/Snippet.svelte";
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

**How to use it (The "Multi-Campaign" Workflow):**

This isn't just a simple script; it's a full campaign manager.

1.  **Initialize**: Run **Mail Merge System > ✨ Initialize System**. This creates three sheets:
    *   `Recipients`: Your Master List of all contacts.
    *   `Campaigns`: A dashboard history of your runs.
    *   `Log`: A detailed audit trail of every email sent.
2.  **Add Data**: Fill in your `Recipients` sheet. Add a "Tag" column (e.g. "Newsletter", "VIP") to group people.
3.  **Create Campaign**: Click **➕ New Campaign**.
    *   Filter by Tag (e.g. `Tag = "VIP"`).
    *   The system creates a *new tab* (e.g. `Campaign: VIP Promo`) with just those people.
4.  **Run**: Go to your new Campaign tab and click **🚀 Run Mail Merge**.
    *   Select your Gmail Draft.
    *   The script sends emails *only* to the people in this tab.

## 2. The Email Script (For Developers)

For those who want to understand the engine or build it into their own projects, here is the full **email script for email merge**.

This "v2" script is robust. It includes:

- **Runtime Configuration**: Select drafts dynamically at runtime.
- **Central Logging**: Tracks `Date Sent`, `Template ID`, and `Gmail Link` for every email.
- **Quota Protection**: Auto-pauses before you hit the 6-minute execution limit.

### mail-merge.js

<Snippet src="./snippets/free-gmail-sheets-mail-merge-script/mail-merge.js" />

### campaigns.js (New!)

Handles the creation of filtered campaign tabs and dashboard logging.

<Snippet src="./snippets/free-gmail-sheets-mail-merge-script/campaigns.js" />

### ui.js

<Snippet src="./snippets/free-gmail-sheets-mail-merge-script/ui.js" />
 
### utils.js

<Snippet src="./snippets/free-gmail-sheets-mail-merge-script/utils.js" />

### appsscript.json (Manifest)

<Snippet src="./snippets/free-gmail-sheets-mail-merge-script/appsscript.json" />

### config.js

<Snippet src="./snippets/free-gmail-sheets-mail-merge-script/config.js" />

### HTML Interface

We use **Alpine.js** to build a modern, reactive UI. Create a single file named `index.html` and paste this code.

**index.html**:
<Snippet src="./snippets/free-gmail-sheets-mail-merge-script/index.html" />

## 3. Need Complex Layouts? Use Google Docs

For standard emails, Gmail Drafts are perfect. But if you are sending a **Contract**, **Invoice**, or **Newsletter** with complex tables, you should use Google Docs as your template source.

**Pro Tip**: Google Docs are great for tables and text, but tricky for images. For image-heavy emails, stick to the Gmail Draft method above.

To use a Google Doc, you must manually edit the script to use `getGoogleDocContent("ID")` instead of `GmailApp.getDraft`.

<Snippet src="./snippets/free-gmail-sheets-mail-merge-script/google-doc-helper.js" />

<Note>

**Critical Developer Note**: To use this Google Doc method, you must explicitly enable permission to read Drive files.

1. Go to **Project Settings** (Gear icon).
2. Check **"Show appsscript.json manifest file in editor"**.
3. Add `"https://www.googleapis.com/auth/drive.readonly"` to the `oauthScopes` array.

<Snippet src="./snippets/free-gmail-sheets-mail-merge-script/appsscript.json" />

Without this, the script will fail.

</Note>

## 4. How to Create a Mail Merge with Gmail and Google Sheets

If you are setting this up from scratch using the code above, follow these steps.

### Step 1: Prepare the Sheet

1.  Create a new Google Sheet.
2.  **Extensions > Apps Script**.
3.  Paste the code files (`mail-merge.js`, `ui.js`, etc.) from the snippets above.
4.  Refresh the Sheet.

### Step 2: Initialize

1.  Click **Mail Merge System > ✨ Initialize System**.
2.  Grant Permissions (Reference "Step 3" below).
3.  This will create your **Recipients** master list.

### Step 3: Authorize

1.  You will see an "Authorization Required" popup.
2.  Click **Review Permissions**.
3.  Choose your account.
4.  You will see a "Google hasn’t verified this app" screen. **This is normal**—it's because _you_ are the developer.
5.  Click **Advanced** > **Go to (Script Name) (unsafe)**.
6.  Click **Allow**.

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



