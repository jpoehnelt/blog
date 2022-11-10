import axios from "axios";
import path from "path";
import fs from "fs";
import { XMLParser } from "fast-xml-parser";

const main = async () => {
  const file = path.join("src", "_data", "mastodon.json");

  const url = "https://mastodon.thbps.com/@jpoehnelt.rss";

  const data: string = (await axios.get(url)).data;

  const parser = new XMLParser();
  const parsed = parser.parse(data);
  const posts = Object.fromEntries(
    parsed.rss.channel.item.map((item) => [item.guid, item])
  );

  const existing = JSON.parse(fs.readFileSync(file, "utf8"));
  const updated = { ...existing, ...posts };

  fs.writeFileSync(file, JSON.stringify(updated, null, 2));
};

await main();
