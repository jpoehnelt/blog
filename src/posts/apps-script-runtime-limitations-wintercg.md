---
layout: post
title: Apps Script V8 Runtime Limitations
excerpt: A comparison of the WinterCG Minimum Common Web Platform API draft with the Apps Script V8 runtime.
tags:
  - post
  - code
  - google
  - google workspace
  - apps script
  - v8
  - wintercg
  - javascript
  - runtime
date: "2024-02-29T00:00:00.000Z"
hideToc: true
---

[Google Apps Script](https://developers.google.com/apps-script) is a cloud-based scripting platform that lets you automate tasks, customize functions, and build solutions within Google Workspace using JavaScript and the V8 runtime. V8 is the JavaScript engine that powers Google Chrome and Node.js. However, the runtime has some limitations that you should be aware of when developing Apps Script projects and not all JavaScript functions and interfaces are supported.

### WinterCG Minimum Common Web Platform API


This is similar to the challenges being addressed by the [Web-interoperable Runtimes Community Group](https://wintercg.org/) (WinterCG) project, which aims to improve API interoperability across different JavaScript runtimes. The WinterCG has a draft [Minimum Common Web Platform API](https://common-min-api.proposal.wintercg.org/) proposal that aims to define a minimum set of APIs that should be available in all JavaScript runtimes. I took this draft and tested the APIs in the Apps Script V8 runtime to see which ones are supported and which ones are not. Below are the results generated by the [script](https://script.google.com/d/1bhyvE4wt_fY06LIjxsXKKXU2PXgsMCrQqOr4SImxiWOemCIsGmaHlR-J/edit?usp=sharing):


### JavaScript APIs and availability in Apps Script V8

<table class="text-md">
  <thead>
    <tr>
    <th>JavaScript API</th>
    <th>Available</th>
    <th>Error</th>
    </tr>
  </thead>
  <tbody>
    {% for api in appsScriptWinterCG | sort(false, false, "name") %}
    <tr>
      <td>{{ api.name }}</td>
      <td>{% if api.available %}✅{% else %}❌{% endif %}</td>
      <td>{% if api.error %}<code>{{ api.error }}</code>{% else %}-{% endif %}</td>
    </tr>
    {% endfor %}
  </tbody>
</table>

### Runtime workarounds

For some APIs there is an Apps Script specific alternative. For example, the `fetch` API is not available in Apps Script, but you can use the `UrlFetchApp` service instead.

```js
// fetch('https://api.example.com/data')
UrlFetchApp.fetch("https://api.example.com/data");
```

Other examples such as `setTimeout` and `setInterval` are not available in Apps Script, but you can use the `Utilities.sleep` method.

```js
// setTimeout(() => console.log('Hello'), 1000)
Utilities.sleep(1000);
console.log("Hello");
```

It is also possible to use polyfills or workarounds to achieve the same functionality. An example of this is the `TextEncoder` and `TextDecoder` interfaces, which are not available in Apps Script, but you can use the [`util` NPM package](https://www.npmjs.com/package/util) to achieve the same functionality with some manual setup or bundling outside of Apps Script.

One thing to keep in mind is that streaming functionality is not available in Apps Script and there really isn't a good workaround for this. However, there is [asynchronous support which is needed for the WebAssembly interface](/posts/apps-script-async-await/)!
