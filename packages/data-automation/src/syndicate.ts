import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import glob from "fast-glob";
import matter from "@jpoehnelt/matter";
import { readFile, writeFile } from "fs/promises";
import path from "path";
import { CONFIG } from "./syndicate/config.js";
import { DevToPlatform } from "./syndicate/devto.js";
import { MediumPlatform } from "./syndicate/medium.js";
import type { Platform } from "./syndicate/platform.js";
import type { Frontmatter, PostData } from "./syndicate/types.js";

async function main() {
  const argv = yargs(hideBin(process.argv))
    .option("slug", { type: "string" })
    .option("platform", { choices: ["devto", "medium", "all"], default: "all" })
    .option("mode", {
      choices: ["pull", "sync"],
      default: "sync",
      description:
        "Action to perform: pull (update local metadata) or sync (both)",
    })
    .option("force", {
      type: "boolean",
      default: false,
      description: "Force update of existing drafts (Dev.to only)",
    })
    .option("dry-run", { type: "boolean", default: false })
    .parseSync();

  const pattern = argv.slug
    ? `${CONFIG.paths.build}/${argv.slug}.md`
    : `${CONFIG.paths.build}/*.md`;

  const files = await glob(pattern);
  if (!files.length) return console.log("No files found.");

  // Initialize Platforms
  const platforms: Platform[] = [];
  if (
    (argv.platform === "all" || argv.platform === "devto") &&
    CONFIG.keys.devto
  ) {
    platforms.push(
      new DevToPlatform(CONFIG.keys.devto, {
        dryRun: argv.dryRun,
        mode: argv.mode as any,
        force: argv.force,
        baseUrl: CONFIG.baseUrl,
      }),
    );
  }
  if (
    (argv.platform === "all" || argv.platform === "medium") &&
    CONFIG.keys.medium
  ) {
    platforms.push(
      new MediumPlatform(
        CONFIG.keys.medium,
        {
          dryRun: argv.dryRun,
          mode: argv.mode as any,
          force: argv.force,
          baseUrl: CONFIG.baseUrl,
        },
        CONFIG.keys.github,
      ),
    );
  }

  await Promise.all(platforms.map((p) => p.init()));

  // Process Files
  console.log(`Processing ${files.length} files...`);

  for (const file of files) {
    const filename = path.basename(file);
    const sourcePath = path.resolve(CONFIG.paths.source, filename);

    try {
      // Read SOURCE for frontmatter and original content (for writing back)
      const rawSourceContent = await readFile(sourcePath, "utf-8");
      const parsedSource = matter.parse(rawSourceContent);

      if (parsedSource.data.syndicate !== true) continue;

      // Read BUILD for syndicated content (includes footer, license, etc)
      const rawBuildContent = await readFile(file, "utf-8");
      const parsedBuild = matter.parse(rawBuildContent);

      const slug = path.basename(sourcePath, ".md");
      const canonicalUrl =
        parsedBuild.data.canonicalURL ||
        parsedBuild.data.canonical_url ||
        `${CONFIG.baseUrl}/${slug}`;

      const postData: PostData = {
        slug,
        content: parsedBuild.content, // Use built content
        frontmatter: parsedSource.data as Frontmatter, // Use source frontmatter
        canonicalUrl,
      };

      // Run Syndication
      let hasChanges = false;
      let currentFrontmatter = parsedSource.data as Frontmatter;

      for (const platform of platforms) {
        // Pass current state
        const statusUpdate = await platform.syndicate({
          ...postData,
          frontmatter: currentFrontmatter,
        });

        if (statusUpdate) {
          hasChanges = true;
          // Patch generic frontmatter based on platform name
          // We need a mapping or check instance type.
          // However, Platform is abstract and name attribute is protected.
          // Let's assume standardized platform mapping based on instance or explicit check.
          // Easier: Just patch based upon known keys for now, or check class name.

          if (platform instanceof DevToPlatform) {
            currentFrontmatter = {
              ...currentFrontmatter,
              devto: {
                ...currentFrontmatter.devto,
                ...statusUpdate,
              },
            };
          } else if (platform instanceof MediumPlatform) {
            currentFrontmatter = {
              ...currentFrontmatter,
              medium: {
                ...currentFrontmatter.medium,
                ...statusUpdate,
              },
            };
          }
        }
      }

      // Write Back
      if (hasChanges && !argv.dryRun) {
        await writeFile(
          sourcePath,
          matter.stringify(parsedSource.content, currentFrontmatter),
        );
        console.log(`✅ Updated frontmatter for ${filename}`);
      }
    } catch (e) {
      console.warn(`Skipping ${filename}: Source file not found or invalid.`);
    }
  }
}

main().catch(console.error);
