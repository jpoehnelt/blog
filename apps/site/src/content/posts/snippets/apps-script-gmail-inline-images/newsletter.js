/**
 * Creates a complete newsletter draft with header, content, and images.
 */
function createNewsletter() {
  // Fetch images
  const header = UrlFetchApp.fetch('https://picsum.photos/600/200').getBlob();
  const article = UrlFetchApp.fetch('https://picsum.photos/300/200').getBlob();

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; }
        .header { text-align: center; }
        .article { display: flex; gap: 16px; margin: 20px 0; }
        .article img { border-radius: 8px; }
        .footer { text-align: center; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <div class="header">
        <img src="cid:headerImg" style="width: 100%; border-radius: 8px;">
        <h1>Weekly Update</h1>
      </div>
      
      <div class="article">
        <img src="cid:articleImg" style="width: 150px; height: 100px; object-fit: cover;">
        <div>
          <h3>Featured Article</h3>
          <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
        </div>
      </div>
      
      <div class="footer">
        <p>You're receiving this because you subscribed.</p>
        <p><a href="#">Unsubscribe</a></p>
      </div>
    </body>
    </html>
  `;

  GmailApp.createDraft(
    'subscribers@example.com',
    '📰 Weekly Update - ' + new Date().toLocaleDateString(),
    'View this email in a browser to see images.',
    {
      htmlBody: html,
      inlineImages: {
        headerImg: header,
        articleImg: article
      }
    }
  );

  Logger.log('Newsletter draft created');
}
