
import axios from "axios";
import fs from "fs";
import { JSDOM } from "jsdom";
import path from "path";
import { fileURLToPath } from "url";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.resolve(__dirname, "../../../data");

interface WaitlistEntry {
  date: string;
  count: number;
  applicants: string[];
}

async function main() {
  const argv = await yargs(hideBin(process.argv))
    .option("did", {
      alias: "d",
      type: "number",
      description: "UltraSignup Event ID",
      demandOption: true,
    })
    .option("output", {
      alias: "o",
      type: "string",
      description: "Output JSON filename (relative to data dir)",
      demandOption: true,
    })
    .help()
    .argv;

  const url = `https://ultrasignup.com/event_waitlist.aspx?did=${argv.did}`;
  const dataFile = path.join(DATA_DIR, argv.output);

  console.log(`Fetching ${url}...`);
  const response = await axios.get(url);
  const dom = new JSDOM(response.data);
  const doc = dom.window.document;

  const applicants: string[] = [];
  // Adjusted selector to be robust
  const links = doc.querySelectorAll("a[href*='results_participant.aspx']");
  
  links.forEach((link) => {
    if (link.textContent) {
        applicants.push(link.textContent.trim());
    }
  });

  console.log(`Found ${applicants.length} applicants.`);

  let history: WaitlistEntry[] = [];
  if (fs.existsSync(dataFile)) {
    try {
      history = JSON.parse(fs.readFileSync(dataFile, "utf-8"));
    } catch (e) {
      console.error("Error reading existing data, starting fresh.", e);
    }
  }

  const today = new Date().toISOString().split("T")[0];
  
  // filtering out today's entry if it exists to replace it with latest
  history = history.filter((entry) => entry.date !== today);

  history.push({
    date: today,
    count: applicants.length,
    applicants: applicants,
  });

  // Sort by date
  history.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  fs.writeFileSync(dataFile, JSON.stringify(history, null, 2));
  console.log(`Saved data to ${dataFile}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
