import axios from "axios";
import path from "path";
import fs from "fs";
import { XMLParser } from "fast-xml-parser";

const toObject = (arr: { guid: string; pubDate: string }[]) =>
  Object.fromEntries(arr.map((item) => [item.guid, item]));

const main = async () => {
  const file = path.join("src", "_data", "mastodon.json");

  const url = "https://mastodon.thbps.com/@jpoehnelt.rss";

  const data: string = (await axios.get(url)).data;

  const parser = new XMLParser();
  const parsed = parser.parse(data);
  const posts = toObject(parsed.rss.channel.item);
  const existing = toObject(JSON.parse(fs.readFileSync(file, "utf8")));
  const updated = Object.values({ ...existing, ...posts }).sort((a, b) =>
    b.guid.localeCompare(a.guid)
  );

  fs.writeFileSync(file, JSON.stringify(updated, null, 2));
};

await main();
