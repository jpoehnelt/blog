import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { JSDOM } from "jsdom";
import DOMPurify from "dompurify";
import * as _ from "lodash-es";

interface WebMention {
  "wm-id": string;
  "wm-source": string;
  "wm-target": string;
  "wm-property": string;
  "wm-received": string;
  content?: {
    text: string;
    html: string;
  };
  url: string;
}

const window = new JSDOM("").window;
const purify = DOMPurify(window as any);

const BLOCKLIST = [
  "https://brid.gy/comment/twitter/jpoehnelt/1535308812822802432/1537800564465184768",
  "https://webmention.rocks",
];

const main = async () => {
  dotenv.config();

  const domain = "https://justin.poehnelt.com";
  const apiEndpoint = "https://webmention.io/api/mentions.jf2";
  const apiOptions = [
    `token=${process.env.WEBMENTION_IO_TOKEN}`,
    "per-page=10000",
  ];

  fetch(`${apiEndpoint}?${apiOptions.join("&")}`)
    .then((r) => r.json())
    .then(({ children }) => children)
    .then(writeMentionsToFile);

  function writeMentionsToFile(mentions: WebMention[]) {
    const filePath = path.join("blog", "src", "_data", `webmentions.json`);
    const all = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    mentions
      .filter((mention) =>
        BLOCKLIST.every((url) => !mention["wm-source"].includes(url)),
      )
      .filter((mention) => mention.content?.text !== "[deleted]")
      .forEach((mention) => {
        let target = mention["wm-target"].replace(domain, "");

        if (target === "") {
          target = "/";
        }

        if (!all[target]) {
          all[target] = {
            all: [],
            "like-of": [],
            "in-reply-to": [],
            "repost-of": [],
            "bookmark-of": [],
            "mention-of": [],
            rsvp: [],
          };
        }

        if (mention.content?.html) {
          mention.content.html = purify.sanitize(mention.content.html, {
            USE_PROFILES: { html: true },
          });
        }

        all[target].all.push(mention);
        all[target][mention["wm-property"]].push(mention);
      });

    // remove duplicates by keeping the last duplicate
    Object.keys(all).forEach((key) => {
      Object.keys(all[key]).forEach((property) => {
        const unique: Record<string, WebMention> = {};
        for (let mention of all[key][property]) {
          unique[mention["wm-id"]] = mention;
        }
        all[key][property] = Object.values(unique).sort((a, b) =>
          a["wm-id"].localeCompare(b["wm-id"]),
        );
      });
    });

    function jsonSorter(_key: string, value: unknown) {
      if (value === null) {
        return null;
      }
      if (Array.isArray(value)) {
        return value;
      }
      if (typeof value === "object") {
        return Object.fromEntries(Object.entries(value).sort());
      }
      return value;
    }

    fs.writeFileSync(filePath, JSON.stringify(all, jsonSorter, 2), {
      encoding: "utf-8",
    });
  }
};

await main();
