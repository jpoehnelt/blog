import * as esbuild from "esbuild";

await esbuild.build({
  entryPoints: [
    "src/syndicate.ts",
    "src/strava-refresh.ts",
    "src/strava-ingest.ts",
  ],
  bundle: true,
  outdir: "dist",
  platform: "node",
  sourcemap: true,
  format: "esm",
  packages: "external",
  banner: { js: "#!/usr/bin/env node" },
});
