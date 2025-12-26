function generateContent(text, API_KEY) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${API_KEY}`;

  return JSON.parse(
    UrlFetchApp.fetch(url, {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      payload: JSON.stringify({
        contents: [
          {
            parts: [{ text }],
          },
        ],
      }),
    }).getContentText(),
  );
}
