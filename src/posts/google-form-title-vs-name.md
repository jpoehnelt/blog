---
layout: post
title: Google Forms - title vs name vs documentTitle
excerpt: Recently I had to clarify some confusion around the title and name of a Google Form. Here is a quick explanation of the difference between the two.
tags:
  - post
  - code
  - google
  - google workspace
  - apps script
  - google forms
date: "2024-10-29T00:00:00.000Z"
hideToc: true
---

Recently I had to clarify some confusion around the title and name of a Google Form and some inconsistencies between Apps Script, Forms API, and the Forms UI. For some background, the following image shows the name and title of a Google Form.

{% image src="/images/google-forms-name-title-documentitle.jpg", alt="Google Forms name, title, documentTitle" %}

The below table show the different ways the title and name are returned in the Forms UI, the Forms API, the `FormApp`, `DriveApp`, and the Drive API.

|     | `name` UI       | `title` UI      | `title` Forms API | `documentTitle` Forms API | `getTitle()` `FormApp` | `getName()` `DriveApp` | `name` Drive API |
| --- | --------------- | --------------- | ----------------- | ------------------------- | -------------------- | -------------------- | ---------------- |
| 1   | "Untitled form" | "Untitled form" | `undefined`       | "Untitled form"           | ""                   | "Untitled form"      | "Untitled form"  |
| 2   | "Name"          | "Name"          | `undefined`       | "Name"                    | ""                   | "Name"               | "Name"           |
| 3   | "Name"          | "Title"         | "Title"           | "Name"                    | "Title"              | "Name"               | "Name"           |
| 4   | "Untitled form" | "Title"         | "Title"           | "Untitled form"           | "Title"              | "Untitled form"      | "Untitled form"  |

## Case 1 - Default form

When you first create a form, the name is `Untitled form` and the `title` is unset but defaults to `Untitled form` in the UI. The Forms API does not have a `title` property and the `documentTitle` is `Untitled form`.

## Case 2 - Name set, title unset

If you change the name of the form, the `title` in the application will render as the name. However, the name is still unset in the Forms API and the `documentTitle` is the name as shown in the UI.

## Case 3 - Name and title set

If you set the `name` and `title` of the form, the `title` in the application will render as the `title`. The Forms API will have the `title` set to the title and the `documentTitle` set to the `name`.

## Case 4 - Title set, name unset

If you set the `title` of the form and the name is still the default, the `title` in the application UI will render as the `title`. The Forms API will have the `title` set to the title and the `documentTitle` set to the default `name`.

## Drive API and DriveApp

The Drive API and DriveApp have a `name` property that is always the same as the `documentTitle`.

## Takeaways

- The UI `title` has a fallback to the `name` if the `title` is unset.
- The Forms API `documentTitle` is equivalent to the UI `name` and the Drive API `name`.
- The Forms API `title` is undefined if unset, but the `getTitle()` method in `FormApp` will return the empty string if unset!!

## Example code

Here is an example of how to get the title of a form using the `FormApp` API:

```js
function myFunction() {
  const title = FormApp.openById("10Fb...").getTitle();
  console.log(title); // if unset, it will be ""
}
```
