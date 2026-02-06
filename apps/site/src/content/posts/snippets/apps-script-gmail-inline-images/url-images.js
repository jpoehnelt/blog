/**
 * Fetches an image from a URL and embeds it inline.
 * @param {string} imageUrl - The URL of the image
 * @returns {GoogleAppsScript.Base.Blob} The image blob
 */
function getImageFromUrl(imageUrl) {
  const response = UrlFetchApp.fetch(imageUrl);
  const blob = response.getBlob();

  // Set a name for the blob (helps with debugging)
  const fileName = imageUrl.split('/').pop().split('?')[0] || 'image';
  blob.setName(fileName);

  return blob;
}

/**
 * Creates a draft with an image fetched from a URL.
 */
function createDraftWithUrlImage() {
  const imageUrl = 'https://picsum.photos/600/300';
  const imageBlob = getImageFromUrl(imageUrl);

  GmailApp.createDraft(
    'recipient@example.com',
    'Dynamic Image',
    'Fallback text',
    {
      htmlBody: `
        <h1>Random Image</h1>
        <img src="cid:randomImage" style="border-radius: 8px;">
        <p>This image was fetched from Picsum.</p>
      `,
      inlineImages: { randomImage: imageBlob }
    }
  );

  Logger.log('Draft created with URL image');
}
