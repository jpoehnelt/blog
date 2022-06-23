import fs from "fs";
import path from "path";
import fetch from "node-fetch";
import get from "lodash/fp/get.js";
import dotenv from "dotenv";
import { URL } from "url";

dotenv.config();

const domain = "https://justin.poehnelt.com";
const apiEndpoint = "https://webmention.io/api/mentions.jf2";
const apiOptions = [
  `token=${process.env.WEBMENTION_IO_TOKEN}`,
  "per-page=10000",
];

let blocklist = [
  "http://gadgetsearcher.com",
  "https://pixallus.com",
  "http://programming.yourworldin90seconds.com",
  "https://programming.nichedomain.news",
  "https://marketingsolution.com.au",
  "https://programming.aplus-review.com",
  "https://digitalapexgroup.com",
  "https://technologynews.biz",
  "https://worldtech.news",
  "https://programming.webcloning.com",
  "https://www.sacramentowebdesigngroup.com",
  "https://htmltreehouse.com",
  "https://1dmx.org",
  "https://websitedesign-usa.com",
  "https://techupd.com",
  "https://fancyhints.com",
  "https://techalertnews.com",
  "https://buzzedly.com",
  "https://dztechno.com",
  "https://graphicdon.com",
  "https://www.newsgosspis.com",
  "http://www.digitasbuzz.in",
  "https://gotutoral.com",
  "https://wpguynews.com",
  "https://www.klobal.net",
  "http://www.webmastersgallery.com",
  "https://pikopong.com",
  "https://keren.link",
  "https://ntdln.com",
  "https://jczh.xyz",
  "https://pazukong.wordpress.com",
  "https://fullstackfeed.com",
  "https://thebrandingstore.net",
  "https://development-tools.net",
  "https://itdirectory.my",
  "https://www.sacramentowebdesigngroup.com",
  "https://engrmks.com.ng",
  "https://www.xspdf.com",
  "http://isokunoffice.club",
  "http://dinezh.com",
  "http://www.makemoneyupdaters.com",
  "http://clicknow.in",
  "http://nexstair.com",
  "http://kovtonyuk.inf.ua",
  "http://postheaven.net",
  "http://www.legendstrivia.co.uk",
  "http://squareblogs.net",
  "http://www.fourthcity.net",
  "http://www.engrmks.com.ng",
  "http://711web.com",
  "http://techupd.com",
  "http://www.67nj.org",
  "http://tipsxd.com",
  "http://www.new.pixel-forge.ca",
  "http://pixallus.com",
  "http://wpnewshub.com",
  "http://tecriter.wordpressarena.com",
  "http://reddits.contractwebsites.com",
  "http://wawas-kingdom.com",
  "http://dztechno.com",
  "http://wpguynews.com",
  "http://www.digitasbuzz.in",
  "http://watchfvsslive.co",
  "http://gotutoral.com",
  "http://techfans.co.uk",
  "http://pikopong.com",
  "http://marketingsolution.com.au",
  "https://brid.gy/comment/twitter/jpoehnelt/1535308812822802432/1537800564465184768",
];

fetch(`${apiEndpoint}?${apiOptions.join("&")}`)
  .then(convertResponseToJson)
  .then(checkDataValidity)
  .then(get("children"))
  .then(writeMentionsToFile);

function convertResponseToJson(response) {
  return response.json();
}

function checkDataValidity(data) {
  if ("children" in data) return data;

  throw new Error("Invalid webmention.io response.");
}

function writeMentionsToFile(mentions) {
  const all = {};
  mentions
    .filter((mention) =>
      !blocklist.includes(new URL(mention["wm-source"]).origin)
    )
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

      // switch (mention["wm-property"]) {
      //   case "like-of":
      //     all[target].likes.push(mention);
      //     break;
      //   case "in-reply-to":
      //     all[target].replies.push(mention);
      //     break;
      //   case "repost-of":
      //     all[target].repost.push(mention);
      //     break;
      //   case "mention-of":
      //     all[target].mention.push(mention);
      //     break;
      //   case "bookmark-of":
      //     all[target].bookmark.push(mention);
      //   case "rsvp":
      //     all[target].rsvp.push(mention);
      //   default:
      //     break;
      // }
    });

  fs.writeFileSync(
    path.join("src", "_data", `webmentions.json`),
    JSON.stringify(all, null, 2),
    { encoding: "utf-8" }
  );
}
