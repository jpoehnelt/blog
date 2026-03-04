import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/cli.ts", "src/index.ts", "src/types.ts", "src/enrichment.ts"],
  format: ["esm", "cjs"],
  // Note: --dts is omitted from the Bazel build target because tsup's DTS
  // generation requires the full type dependency graph in the sandbox.
  // Run `pnpm build` directly if you need .d.ts output files.
});
