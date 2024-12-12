---
layout: post
title: Google Drive Picker Web Component - Preview Release
excerpt: "I'm excited to announce the preview release of the open-source Google Drive Picker web component, <drive-picker/>, now published to NPM at @googleworkspace/drive-picker-element!"
tags:
  - post
  - code
  - google
  - google workspace
  - drive
  - picker
date: "2024-12-12T00:00:00.000Z"
hideToc: true
---

I'm excited to announce the preview release of the open-source [Google Drive Picker web component](https://github.com/googleworkspace/drive-picker-element), \<drive-picker/\>, now published to [NPM](https://www.npmjs.com/package/@googleworkspace/drive-picker-element) at @googleworkspace/drive-picker-element\!

### What is the Google Drive Picker web component?

The [Google Drive Picker web component](https://github.com/googleworkspace/drive-picker-element) provides a convenient way to integrate the Google Picker API into your web applications. Web components are reusable, custom HTML elements that encapsulate their own functionality and styling, allowing developers to create modular and independent UI widgets that work in any web framework.

The following code shows how to integrate this component into a vanilla JavaScript web application. You can also explore the [Storybook demo](https://googleworkspace.github.io/drive-picker-element/iframe.html?id=stories-drive-picker--docs&viewMode=docs).

```html
<!-- import with bundler -->
<!-- <script>
  import "@googleworkspace/drive-picker-element";
</script>
-->

<!-- import with cdn -->
<script src="https://unpkg.com/@googleworkspace/drive-picker-element@latest/dist/index.iife.min.js"></script>

<drive-picker
  client-id="YOUR_OAUTH_CLIENT_ID"
  app-id="YOUR_CLOUD_PROJECT_NUMBER"
>
  <drive-picker-docs-view
    starred="true"
    mime-types="application/vnd.google-apps.document,application/vnd.google-apps.spreadsheet"
  ></drive-picker-docs-view>
</drive-picker>

<script>
  const element = document.querySelector("drive-picker");
  element.addEventListener("picker:picked", console.log);
  element.addEventListener("picker:canceled", console.log);
</script>
```

### Why Google Picker API?

The drive.file scope grants per-file access, improving security and limiting access to necessary files and features. It allows your app to create and modify Drive files opened or shared with it. Learn more about [Google Drive API scopes](https://developers.google.com/drive/api/guides/api-specific-auth#drive-scopes) and the [Google Drive Picker API](https://developers.google.com/drive/picker/guides/overview).

### Feedback welcome

Help us reach a stable release! Submit bugs and feature requests to our [GitHub repository](https://github.com/googleworkspace/drive-picker-element).
