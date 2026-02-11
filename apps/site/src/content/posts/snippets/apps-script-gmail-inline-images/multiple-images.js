/**
 * Creates a draft with multiple inline images.
 */
function createDraftWithMultipleImages() {
  const logo = DriveApp.getFileById('LOGO_FILE_ID').getBlob();
  const banner = DriveApp.getFileById('BANNER_FILE_ID').getBlob();
  const footer = DriveApp.getFileById('FOOTER_FILE_ID').getBlob();

  GmailApp.createDraft(
    'recipient@example.com',
    'Newsletter with Multiple Images',
    'View this email in a browser for images.',
    {
      htmlBody: `
        <div style="max-width: 600px; margin: 0 auto;">
          <img src="cid:logo" style="height: 50px;">
          <hr>
          <img src="cid:banner" style="width: 100%;">
          <h1>Welcome to our Newsletter</h1>
          <p>Thanks for subscribing!</p>
          <hr>
          <img src="cid:footer" style="width: 100%;">
        </div>
      `,
      inlineImages: {
        logo: logo,
        banner: banner,
        footer: footer
      }
    }
  );

  Logger.log('Draft created with multiple images');
}
