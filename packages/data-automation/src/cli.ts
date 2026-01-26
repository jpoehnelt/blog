import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import * as discoverCommand from "./commands/discover.js";
import * as ingestCommand from "./commands/ingest.js";
import * as scrapeCommand from "./commands/scrape.js";
import * as scrapeEntrantsCommand from "./commands/scrape-entrants.js";

yargs(hideBin(process.argv))
  .scriptName("data-automation")
  .command(discoverCommand)
  .command(ingestCommand)
  .command(scrapeCommand)
  .command(scrapeEntrantsCommand)
  .demandCommand(1, "You need at least one command before moving on")
  .strict()
  .help()
  .parse();
