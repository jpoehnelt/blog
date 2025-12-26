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
