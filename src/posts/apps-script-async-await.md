---
layout: post
title: Promises, async and await in Google Apps Script
excerpt: Google Apps Script is based on the V8 engine and supports the use of Promises, async and await. However, there are almost no APIs available that are asynchronous except for the WebAssembly API.
tags:
  - post
  - code
  - google
  - google workspace
  - apps script
  - async
  - es6
  - wasm
  - webassembly
date: "2024-02-07T00:00:00.000Z"
---

Google Apps Script is based on the V8 engine and supports the use of Promises, async and await. However, there are almost no APIs available that are asynchronous except for the WebAssembly API.

The [WebAssembly](https://developer.mozilla.org/en-US/docs/WebAssembly) API is used to run compiled code binaries. This is a very niche use case and not something that is commonly used in Apps Script, but WebAssembly is explicitly called out for in the [V8 engine](https://v8.dev/):

> v8 is Google’s open source high-performance JavaScript and WebAssembly engine, written in C++. It is used in Chrome and in Node.js, among others. It implements ECMAScript and WebAssembly...

I'm not going to get into the specifics of WebAssembly in this post, but I wanted to identify it as the only place I've seen async and await actually useful in Apps Script.

## Syntax of Promises, async and await in Apps Script

The syntax for Promises, async and await in Apps Script is the same as you would expect in modern JavaScript. Here is a simple example of a Promise:

```javascript
function main() {
  const promise =  new Promise((resolve, reject) => {
    resolve('hello world');
  });

  console.log(promise.constructor.name);
  promise.then(console.log);
}
```

As expected in JavaScript, this outputs the following:

```sh
11:11:50 AM	Notice	Execution started
11:11:50 AM	Info	Promise
11:11:50 AM	Info	hello world
11:11:50 AM	Notice	Execution completed
```

But, as I mentioned, this is not actually asynchronous. The `Promise` is resolved immediately and the `then` is called immediately. So there is no actual asynchronous behavior here. 

:::note
I haven't dug deep into the underlying event loop and tasks here. Might be worth a future post to dig deeper.
:::

Here is an example of using async and await:

```javascript
async function main() {
  const promise = new Promise((resolve, reject) => {
    resolve('hello world');
  });

  console.log(promise.constructor.name);
  console.log(await promise);
}
```

This leads to an interesting discovery, the entry function can be `async` and the `await` keyword can be used. But can I use a top level await?

```javascript
const promise = new Promise((resolve, reject) => {
  resolve('hello world');
});

await promise; // doesn't work

function main() {
  console.log(promise.constructor.name);
}
```

No, top level await is not supported in Apps Script and returns the following error when trying to save the script:

```sh
Syntax error: SyntaxError: await is only valid 
  in async functions and the top level bodies 
  of modules line: 5 file: Code.gs
```

## WebAssembly in Apps Script

As mentioned earlier, the only place I've seen async and await actually useful in Apps Script is with the WebAssembly API. Here is a simple example of using async and await with WebAssembly:

```javascript
async function main() {
  let bytes = new Uint8Array(
    Utilities.base64Decode(
      'AGFzbQEAAAABBwFgAn9/AX8DAgEAB' +
      'wcBA2FkZAAACgkBBwAgACABagsAHA' +
      'RuYW1lAQYBAANhZGQCDQEAAgADbGh' +
      'zAQNyaHM='
    )
  );

  let {
    instance: {
      exports: {
        add
      }
    }
  } = await WebAssembly.instantiate(bytes);

  console.log(add(1, 2));
}
```

This output works as expected:

```sh
11:44:38 AM	Notice	Execution started
11:44:38 AM	Info	3
11:44:38 AM	Notice	Execution completed
```

However, to verify that the code is actually running asynchronously, I removed the `await WebAssembly.instantiate` which results in:

```javascript
11:45:57 AM	Notice	Execution started
11:45:58 AM	Error	
TypeError: Cannot read properties of 
  undefined (reading 'exports') 
  main	@ Code.gs:6
```

So, it is clear that the WebAssembly API is actually running asynchronously and populating the `instance.exports` object after the `instantiate` method is called.

## Conclusion

The topic here is a bit esoteric, but as you attempt to push the limits of what is possible in Apps Script, it is good to know that you can use Promises, async and await in your code. I hope to share much more in the future on WebAssembly and other advanced topics in Apps Script!