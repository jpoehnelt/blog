---
layout: post
title: Embed images from Google Drive in your website
excerpt: Google Drive broke the ability to embed images with the /uc path. Here's how to embed images from Google Drive in your website.
tags:
  - post
  - code
  - google
  - google drive
  - google workspace
  - html
  - iframe
  - web
date: "2024-01-11T00:00:00.000Z"
hideToc: true
---

Recently the ability to embed Google Drive images with the `/uc` path started failing. For example, the following `<img>` would have worked in the past with the export view link:

```html
<!-- DOES NOT WORK: 403 Forbidden -->
<img src="https://drive.google.com/uc?export=view&id=1234567890abcdef" />
```

However this no longer works and a 403 error is returned. Partly this is because of the discontinuation of third party cookies. You can read more at this blog post, [Upcoming Changes to Third Party Cookies in Google Drive](https://workspaceupdates.googleblog.com/2023/10/upcoming-changes-to-third-party-cookies-in-google-drive.html).

The suggestion is to do the following to embed a Google Drive image:

> For other files, once opened in Drive, select “Open in new window” from the overflow menu, and then open the overflow menu and select “Embed item…”, which provides the iframe HTML tag.

This generates an iframe with the following HTML:

```html
<iframe src="https://drive.google.com/file/d/1234567890abcdef/preview"></iframe>
```

## Examples embedding images from Google Drive

This can be added to a website, but it's not ideal. The iframe has a background color and the image is not responsive.

Here the border has been removed with `style="border: 0"` and no height or width has been set.

<iframe
src="https://drive.google.com/file/d/18onwpszLRsc62P92f7biat6ORbXtL7u4/preview"
style="border: 0"
></iframe>

Here the border has been removed with `style="border: 0"` and the height and width have been set to match the image.

<iframe
src="https://drive.google.com/file/d/18onwpszLRsc62P92f7biat6ORbXtL7u4/preview"
style="border: 0"
height="400"
width="600"
></iframe>

### Limitations

- The iframe has a background color
- The image in the iframe is not responsive
- Other elements such as zoom controls over the image
- No ability to add alt text
- Click handlers will be messy
- Requires knowing the size of the image and not just the Drive file id

### Long term fix

I would move the files to a different host optimized for serving public images behind a CDN.
