---
title: "How to Embed Inline Images in Gmail Drafts"
description: >-
  Inline images often appear as attachments or broken. Learn the correct way to
  use cid: protocol with GmailApp.createDraft().
pubDate: "2026-02-02"
tags:
  - code
  - google
  - google workspace
  - apps script
  - gmail
  - email
faq:
  - question: Why do my inline images show as attachments?
    answer: >-
      You need to use the cid: protocol in the img src attribute and pass the
      image in the inlineImages parameter, not attachments.
  - question: What is the cid protocol?
    answer: >-
      CID (Content-ID) is an email standard for referencing inline content. Use
      src="cid:imageName" where imageName matches a key in inlineImages.
  - question: Why does my inline image show as broken?
    answer: >-
      Common causes include using incorrect cid syntax (don't include "cid:" in
      the key), missing the image blob, or incorrect MIME type.
---

<script>
  import Snippet from "$lib/components/content/Snippet.svelte";
  import Note from '$lib/components/content/Note.svelte';
</script>

Adding images to emails sounds simple, but inline images in Gmail drafts are surprisingly tricky. Done wrong, your carefully crafted email shows broken image icons or relegates your images to attachments.

[Issue 77320923](https://issuetracker.google.com/77320923) has 89 votes on this topic.

## The Problem

```javascript
// WRONG - image won't display inline
GmailApp.createDraft('to@example.com', 'Subject', '', {
  htmlBody: '<img src="https://example.com/image.png">'
});
```

External URLs in emails are often blocked by email clients. And attaching an image doesn't automatically embed it inline.

## The Solution: cid: Protocol

The `cid:` (Content-ID) protocol references images embedded within the email:

<Snippet src="./snippets/apps-script-gmail-inline-images/basic-inline.js" />

## Key Rules

1. **Use `cid:` prefix in `src`**: `<img src="cid:myImage">`
2. **Key matches without prefix**: `inlineImages: { myImage: blob }` (not `"cid:myImage"`)
3. **Always include plain text body**: Fallback for text-only clients
4. **Blob must have MIME type**: `image/png`, `image/jpeg`, etc.

<Note>

Before November 2016, you could use `realattid` instead of `cid`. This no longer works—always use `cid:`.

</Note>

## Multiple Inline Images

<Snippet src="./snippets/apps-script-gmail-inline-images/multiple-images.js" />

## Images from Google Drive

<Snippet src="./snippets/apps-script-gmail-inline-images/drive-images.js" />

## Images from URLs

<Snippet src="./snippets/apps-script-gmail-inline-images/url-images.js" />

## Complete Example: Email Newsletter

<Snippet src="./snippets/apps-script-gmail-inline-images/newsletter.js" />

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Image shows as attachment | Use `inlineImages`, not `attachments` |
| Broken image icon | Check that `cid:name` matches key in `inlineImages` |
| Wrong key format | Don't include `cid:` in the inlineImages key |
| No image at all | Verify blob exists and has correct MIME type |
| Image blocked | Some clients block images by default—test in Gmail |

## What's Next

- [Free/Busy Across Calendars](/posts/apps-script-free-busy) — Calendar API scheduling queries
- [Delegated Mailbox Access](/posts/apps-script-delegated-mailbox) — Service account impersonation

## Resources

- [createDraft() Reference](https://developers.google.com/apps-script/reference/gmail/gmail-app#createdraftrecipient,-subject,-body,-options)
- [Issue 77320923](https://issuetracker.google.com/77320923)
