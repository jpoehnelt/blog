import fs from "fs";
import path from "path";
import fetch from "node-fetch";
import get from "lodash/fp/get.js";
import dotenv from "dotenv";

const BLOCKLIST = [
  "https://brid.gy/comment/twitter/jpoehnelt/1535308812822802432/1537800564465184768",
  "https://webmention.rocks",
];

function convertResponseToJson(response) {
  return response.json();
}

function checkDataValidity(data) {
  if ("children" in data) return data;

  throw new Error("Invalid webmention.io response.");
}

const main = async () => {
  dotenv.config();

  const domain = "https://justin.poehnelt.com";
  const apiEndpoint = "https://webmention.io/api/mentions.jf2";
  const apiOptions = [
    `token=${process.env.WEBMENTION_IO_TOKEN}`,
    "per-page=10000",
  ];

  fetch(`${apiEndpoint}?${apiOptions.join("&")}`)
    .then(convertResponseToJson)
    .then(checkDataValidity)
    .then(get("children"))
    .then(writeMentionsToFile);

  function writeMentionsToFile(mentions) {
    const all = {};
    mentions
      .filter((mention) => BLOCKLIST.every((url) => !mention["wm-source"].includes(url)))
      .forEach((mention) => {
        let target = mention["wm-target"].replace(domain, "");

        if (target === "") {
          target = "/";
        }

        if (!all[target]) {
          all[target] = {
            all: [],
            likes: [],
            replies: [],
            mention: [],
            repost: [],
            bookmark: [],
            rsvp: [],
          };
        }

        all[target].all.push(mention);
      });

    fs.writeFileSync(
      path.join("src", "_data", `webmentions.json`),
      JSON.stringify(all, null, 2),
      { encoding: "utf-8" }
    );
  }
};

await main();
