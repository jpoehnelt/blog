---
title: Apps Script and WebAssembly - A comprehensive guide
description: >-
  You can use WebAssembly with Google Apps Script! This post will cover how to
  do that and provide a comprehensive guide on how to get started.
pubDate: "2024-04-04"
tags: "code,google,google workspace,wasm,rust,python,apps script,webassembly"
---

<script>
  import Note from '$lib/components/content/Note.svelte';
</script>

<Note>

This is part of my Google Cloud Next 24 presentation on _Unleashing the power of Rust, Python, and WebAssembly in Apps Script_. You can see the session details at: [Lightning Talk](https://cloud.withgoogle.com/next?session=IHLT300).

Checkout the code in the [GitHub repo](http://goo.gle/apps-script-wasm) and the [Youtube playlist](https://www.youtube.com/playlist?list=PLR12YEoQaeDfVeuvJkxMv-J9OMfgVY6vp).

</Note>

**You can use WebAssembly with Google Apps Script!** This post will cover how to do that and provide a comprehensive guide on how to get started. As a teaser, here is a short video showing Python in Google Sheets using a custom Apps Script function to run Rust code compiled to WebAssembly that interprets Python code!

<div class="flex justify-center mb-8"><iframe width="560" height="315" src="https://www.youtube.com/embed/B-XbtR4ASx8?si=W0b8q9KC4alkJ1Do&loop=1&list=PLR12YEoQaeDfVeuvJkxMv-J9OMfgVY6vp" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
</div>

## About WebAssembly

WebAssembly (WASM) is a binary instruction format for a stack-based virtual machine. Wasm is designed as a portable target for compilation of high-level languages like C/C++/Rust, enabling deployment on the web for client and server applications.

## Apps Script and WebAssembly

Apps Script is a cloud-based scripting language for light-weight application development on Google Workspace. It provides easy ways to automate tasks across Google products and third-party services.

The runtime is based on the V8 JavaScript engine which is also used in Chrome. This means that you can use WebAssembly in Apps Script by using the [WebAssembly] JavaScript API.

## Reasons to use WebAssembly in Apps Script

There are a few reasons to use WebAssembly in Apps Script:

1. **Performance**: WebAssembly can be faster than equivalent JavaScript in some cases.
1. **Permissions**: WebAssembly can be used to perform data local tasks without the need for additional permissions such as `script.external_request`.
1. **Obfuscation**: WebAssembly can be used to obfuscate code and protect intellectual property.
1. **Libraries**: WebAssembly can be used to run libraries that are not available in Apps Script.
1. **Fun**: You don't need a reason to use WebAssembly. It's fun!

## Building a WebAssembly module for Apps Script

To get started, you will need to compile your WebAssembly module to a `.wasm` file. You can use Rust, C, C++, or AssemblyScript to compile your module. I will be using Rust in this example.

The three primary pieces of code you will need are the Rust code and the JavaScript code to load and run the WebAssembly module.

```rust
// src/lib.rs
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub fn hello(name: &str) -> JsValue {
   format!("Hello, {} from Rust!", name).into()
}
```

The following JavaScript code will load and run the WebAssembly module. I keep this in a separate file to make it easier to bundle with ESBuild and isolate the long generated file.

```js
// src/wasm.js
async function hello_(name) {
  const wasm = await import("./pkg/example_bg.wasm");
  const { __wbg_set_wasm, hello } = await import("./pkg/example_bg.js");
  __wbg_set_wasm(wasm);
  return hello(name);
}

globalThis.hello_ = hello_;
```

This is the entry point in Apps Script.

```js
// src/main.js
async function main() {
  const name = "world";
  console.log(await hello_(name));
}
```

However, there are some special call outs to the tools needed tie everything together.

1. You will need to use `cargo` to build your Rust code.
   ```sh
   cargo build --target wasm32-unknown-unknown
   ```
1. You will need to use [wasm-bindgen] to generate the JavaScript bindings for your Rust code.
   ```sh
   wasm-bindgen \
     --out-dir src/pkg \
     --target bundler \
     ./target/wasm32-unknown-unknown/release/example.wasm
   ```
1. You will need to use `wasm-opt` to optimize your WebAssembly module. This is optional but recommended.
   ```sh
   wasm-opt \
     src/pkg/example_bg.wasm \
     -Oz \
     -o src/pkg/example_bg.wasm
   ```
1. You will need to use a bundler such as ESBuild to bundle your JavaScript code and WebAssembly module.
   ```sh
   node build.js
   ```

In this last step, my `build.js` file looks like this:

```js
import fs from "fs";
import esbuild from "esbuild";
import { wasmLoader } from "esbuild-plugin-wasm";
import path from "path";

const outdir = "dist";
const sourceRoot = "src";

await esbuild.build({
  entryPoints: ["./src/wasm.js"],
  bundle: true,
  outdir,
  sourceRoot,
  platform: "neutral",
  format: "esm",
  plugins: [wasmLoader({ mode: "embedded" })],
  inject: ["polyfill.js"],
  minify: true,
  banner: { js: "// Generated code DO NOT EDIT\n" },
});

const passThroughFiles = ["main.js", "appsscript.json"];

await Promise.all(
  passThroughFiles.map(async (file) =>
    fs.promises.copyFile(path.join(sourceRoot, file), path.join(outdir, file)),
  ),
);
```

There are a few things to note in this file:

- I am including a polyfill for the `TextDecoder` and `TextEncoder` classes. This is because Apps Script does not have these classes available.
- I am copying the `main.js` and `appsscript.json` files to the `dist` directory. I like to keep these in the same output directory as the bundled files for easy deployment with [clasp].
- I am using the [esbuild-plugin-wasm] to load the WebAssembly module. This is a plugin to load the WebAssembly module as a base64 encoded string. This is necessary because Apps Script does not have a way to load binary files easily and I want to minimize required scopes such as `drive.readonly` or `script.external_request`.

The polyfill file looks like this:

```js
export {
  TextEncoder,
  TextDecoder,
} from "fastestsmallesttextencoderdecoder/EncoderDecoderTogether.min.js";
```

The performance of the encoder and decoder is very important to overall performance of WASM in Apps Script!

The [esbuild-plugin-wasm] inlines the WebAssembly module as a base64 encoded string in the JavaScript file which looks like the following in the non-minified output:

```js
// wasm-embedded:.../example_bg.wasm
var example_bg_default;
var init_example_bg = __esm({
  "wasm-embedded:.../example_bg.wasm"() {
    example_bg_default = __toBinary("AGFzbQEAAAABP...");
  },
});
```

## Application Binary Interface and WASM Bindgen

The interface between the JavaScript and WebAssembly module is a bit tricky. This is why the [wasm-bindgen] tool is so useful. It generates the JavaScript bindings for the Rust code which makes it easier to call the functions in the WebAssembly module. What are these bindings? They are the `__wbg_*` functions that are generated by [wasm-bindgen] and are used to convert between JavaScript and WebAssembly types. For more on this, I would recommend reading the [https://surma.dev/things/rust-to-webassembly/](https://surma.dev/things/rust-to-webassembly/).

[wasm-bindgen] also enables the use of `JsValue` which is a type that can represent any JavaScript value in Rust. This is useful for passing strings and other complex types between JavaScript and Rust and allows a Rust function to return a JavaScript value like so:

```rust
#[wasm_bindgen]
pub fn foo(bar: &JsValue) -> JsValue {
  // Do something with bar
  JsValue::from_str("Hello from Rust!")
}
```

I can also take this a step further with [serde-wasm-bindgen](https://rustwasm.github.io/wasm-bindgen/reference/arbitrary-data-with-serde.html) or as in one my use cases returning a JavaScript error object from Rust.

```rust
#[wasm_bindgen(inline_js = r"
export class MyErrorFromRust extends Error {
    constructor(message) {
        super(message);
    }
}
")]
extern "C" {
    pub type MyErrorFromRust;
    #[wasm_bindgen(constructor)]
    fn new(message: JsValue) -> MyErrorFromRust;
}
```

The result of these bindings is code that looks like this and abstracts the need for me to worry about shared memory and other low-level details:

```js
export function hello(name) {
  const ptr0 = passStringToWasm0(
    name,
    wasm.__wbindgen_malloc,
    wasm.__wbindgen_realloc,
  );
  const len0 = WASM_VECTOR_LEN;
  const ret = wasm.hello(ptr0, len0);
  return takeObject(ret);
}
```

This generated code is not something I would want to write by hand!

<div class="flex justify-center mb-8"><iframe width="560" height="315" src="https://www.youtube.com/embed/tBOSEAhKNBs?si=v1L5oD6FjFoZOCa7&loop=1&list=PLR12YEoQaeDfVeuvJkxMv-J9OMfgVY6vp" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe></div>

## Asynchronous Apps Script

I have written about the use of async and await in Apps Script before and the only place it is useful in Apps Script is with the WebAssembly API. For more on this, see my post on [async and await in Apps Script](/posts/apps-script-async-await/).

Repeating the earlier code block, you can see how the `async` and `await` keywords are used in the JavaScript code.

```js
// src/main.js
async function main() {
  const name = "world";
  console.log(await hello_(name));
}
```

This pattern works every in Apps Script including in custom functions and add-ons. I actually used `Promise.all` to run multiple WebAssembly functions in parallel in one of my [add-ons to compress images](https://github.com/googleworkspace/apps-script-samples/blob/f465caa0a7f29a9f04bad77f9e75daf0cbc4e570/wasm/image-add-on/src/add-on.js#L81).

```js
await Promise.all(
  items.map((bytes) =>
    // call WASM function
    compress_(bytes, {
      quality: qualityToInt(quality),
      format: item.mimeType.split("/").pop(),
      width: parseInt(width ?? "0"),
      height: parseInt(height ?? "0"),
    }),
  ),
);
```

## Performance

There are several performance considerations to be aware of when using WebAssembly in Apps Script:

- There is a performance cost to instantiating large Apps Script projects.
- There is a performance cost to instantiating large WASM modules within Apps Script project. In some pattern of usage, this cost is incurred every time the script is run such as in a custom function for a Google Sheet. However, if you call the WASM multiple times in the same script run, the cost is only for the initialization on the first call and subsequent calls are much faster.
- There is a performance cost to passing data between JavaScript and WebAssembly and the various conversions that are required.
- There are likely gains to be made in performance by optimizing the WebAssembly module and the JavaScript code that interacts with it. I have not done extensive performance testing but I have seen significant performance gains by using optimized TextEncoder and TextDecoder classes in the polyfill.

The basic hello world example has negligible costs and executes in the 1-2 millisecond range. However, more complex examples can take longer to execute.

The Python custom function example I have been working on takes about 2-4 seconds to send the python code and data to Rust, interpret the Python code, and return the result to Apps Script, and then return the result to the Google Sheet. In this case, the entire bundle of WASM, polyfills, and generated JavaScript is about 7MB! However, this is running arbitrary Python code in a Google Sheet which is pretty cool!

The image compression add-on example has better performance and can compress an image in about 1-2 seconds, much of this is just I/O latency for larger images, upwards of 5MB, loading from Google Drive.

<div class="flex justify-center mb-8"><iframe width="560" height="315" src="https://www.youtube.com/embed/FmOL3SLikNk?si=y0zSqw1DrzIHHAFB&loop=1&list=PLR12YEoQaeDfVeuvJkxMv-J9OMfgVY6vp" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe></div>

## Conclusion

WebAssembly is a powerful tool that can be used in Google Apps Script to extend the capabilities of the platform. It can be used to run code that is not available in Apps Script, to obfuscate code, and to run code that is faster than equivalent JavaScript. I have used WebAssembly in several projects and have found it to be a valuable tool in my toolbox.

[wasm-bindgen]: https://rustwasm.github.io/wasm-bindgen/
[WebAssembly]: https://webassembly.org/
[esbuild-plugin-wasm]: https://github.com/Tschrock/esbuild-plugin-wasm
[clasp]: https://github.com/google/clasp
