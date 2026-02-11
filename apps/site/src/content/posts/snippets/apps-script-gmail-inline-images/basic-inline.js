/**
 * Creates a draft with an inline image using the cid: protocol.
 */
function createDraftWithInlineImage() {
  // Get an image blob (from Drive, URL, or base64)
  const imageBlob = DriveApp.getFileById('YOUR_IMAGE_FILE_ID').getBlob();

  GmailApp.createDraft(
    'recipient@example.com',
    'Email with Inline Image',
    'Plain text fallback for non-HTML clients',
    {
      htmlBody: `
        <h1>Check out this image!</h1>
        <img src="cid:headerImage" style="max-width: 600px;">
        <p>The image is embedded above, not attached.</p>
      `,
      inlineImages: {
        headerImage: imageBlob  // Key matches "cid:headerImage" (without cid:)
      }
    }
  );

  Logger.log('Draft created with inline image');
}
