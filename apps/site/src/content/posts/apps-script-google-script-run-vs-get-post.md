---
title: "Google Apps Script: google.script.run vs. doGet/doPost Endpoints"
description: >-
  Learn about the different options for making API calls in Google Apps Script
  web apps: `google.script.run` and GET/POST endpoints (`doGet` and `doPost`).
  Understand their strengths and weaknesses to choose the best approach for your
  project.
pubDate: "2024-03-29"
tags: >-
  code,google,google workspace,apps script,google script run,doGet,doPost,apps
  script web app
---

<script>
  import Note from '$lib/components/content/Note.svelte';
</script>

When building a Google Apps Script web app, you have two primary options for making API calls from the frontend to the backend: `google.script.run` and GET/POST endpoints (`doGet` and `doPost`). Each method has its own strengths and weaknesses, and the best choice depends on the complexity of your web app and your specific requirements.

### `google.script.run`

Ideal for simple Google Apps Script web apps. Enables direct communication with server-side scripts for specific, asynchronous function calls.

```js
function readData() {
  // This could be a call to Google Sheets
  return { data: Session.getActiveUser().getEmail() };
}
```

```js
google.script.run
  .withSuccessHandler((result) => console.log(result))
  .withFailureHandler((error) => console.error(error))
  .readData();
```

The poorly named `withUserObject` method can be used to pass additional data to the callback function. This can be useful for passing additional context to the callback function as as the HTMLElement that triggered the call. It is really just a helper to avoid complex closures.

> A closure is the combination of a function bundled together (enclosed) with references to its surrounding state (the lexical environment). [MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Closures)

```js
google.script.run
  .withSuccessHandler((result, userObject) =>
    console.log({ result, userObject }),
  )
  .withUserObject(this)
  .readData();
```

### `doGet`/`doPost` endpoints

More flexible. Use with any web development framework and access data from various applications. Requires implementing logic within a single set of endpoints to route to functions.

```js
function doGet(e) {
  if (e.parameter.action === "read") {
    return ContentService.createTextOutput(
      JSON.stringify(readData()),
    ).setMimeType(ContentService.MimeType.JSON);
  } else {
    // return the HTML file, index.html in this case
    return HtmlService.createHtmlOutputFromFile("index");
  }
}
```

And then to call the endpoint from the frontend:

```js
fetch("https://script.google.com/macros/s/SOME_ID/exec?action=read")
  .then((response) => response.json())
  .then((data) => console.log(data));
```

If you inspect the network tab in your browser, you will see the request will be 302 redirected to a URL similar to `https://script.googleusercontent.com/macros/echo?user_content_key=A3V4uWwF...`. The `fetch` call will follow this redirect automatically by default.

<Note>

You will still need to access these endpoints from the Apps Script Web app if you want to make authenticated calls from the `doGet` or `doPost` functions to Google services such as Sheets.

</Note>

### Decision Factors

|                | `google.script.run`                    | `doGet` and `doPost`                                     |
| -------------- | -------------------------------------- | -------------------------------------------------------- |
| Best for       | Simple Google Apps Script Web app      | Web framework served as Google Apps Script Web app       |
| Communication  | Direct                                 | REST API calls                                           |
| Function Calls | Function specified by name             | Requires logic routing                                   |
| Asynchronous   | Yes (Callbacks)                        | Yes (Promises)                                           |
| Testing        | More challenging but still easy enough | Easier mocking                                           |
| File Downloads | No                                     | Yes                                                      |
| Access         | Only Apps Script Web apps              | Any app (unless accessing Google services from function) |
| Error Handling | Limited                                | Full control                                             |

- If you're building a Apps Script Web app, `google.script.run` is the simplest choice.
- If you are building a Apps Script Web app using a framework like React, Angular, or Vue, consider using GET/POST endpoints for compatibility. (You are probably using something like [clasp](https://developers.google.com/apps-script/guides/clasp) to manage your Apps Script project in this case.)
- You can only have a single `doGet` and `doPost` function in a Google Apps Script project. You will need a mechanism to route requests to the appropriate function. `google.script.run` does this automatically.
- `doGet` and `doPost` endpoints require you to build the response using the [`ContentService`](https://developers.google.com/apps-script/reference/content/content-service). This is a benefit if you want to control the response format and possibly have the browser [`downloadAsFile`](<https://developers.google.com/apps-script/reference/content/text-output#downloadAsFile(String)>) the response.
- If you need to robustly test your frontend, consider using `doGet` and `doPost` endpoints. You can then mock the API calls in your tests.

### Documentation Links

- [`google.script.run`](https://developers.google.com/apps-script/guides/html/reference/run)
- [`doGet` and `doPost`](https://developers.google.com/apps-script/guides/web)
- [`HtmlService`](https://developers.google.com/apps-script/reference/html/html-service)
- [`ContentService`](https://developers.google.com/apps-script/reference/content/content-service)

### Conclusion

Both `google.script.run` and using `doGet` and `doPost` endpoints provide effective ways to perform API calls from your Apps Script Web apps. If you're building a simple web app, `google.script.run` is likely the easiest choice. For more complex web apps built with frameworks like React or Angular, or if you need greater control over responses and error handling, `doGet` and `doPost` endpoints offer the flexibility you need.
