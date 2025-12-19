---
title: Generating Text with Gemini Pro in Apps Script
description: >-
  A short code snippet demonstrating how to generate text with the Gemini Pro
  Rest API in Apps Script.
pubDate: "2023-12-19"
tags:
  - code
  - google
  - google workspace
  - apps script
  - gemini
  - llm
  - ai
---

Short and sweet snippet for generating text in Apps Script with the [Gemini Pro Rest API](https://ai.google.dev/tutorials/rest_quickstart).

```js
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
```

And parsing the response:

```js
const response = generateContent("Hello world!", API_KEY);
const text = response.candidates[0].content?.parts[0].text;
```
