import playwright from "playwright";
import dJSON from "dirty-json";
import { parse as parseDate } from "date-fns";
import slugify from "slugify";
import path from "path";
import fs from "fs";
import gzip from "node-gzip";
import protobuf from "protobufjs";
import _ from "lodash";

const getResults = async (id: number, context: playwright.BrowserContext) => {
  const resultUrl = `https://ultrasignup.com/results_event.aspx?did=${id}`;
  const page = await context.newPage();
  await page.route("**/*", (route) => {
    if (
      ["script", "xhr", "document"].includes(route.request().resourceType())
    ) {
      return route.continue();
    }
    return route.abort();
  });

  console.log(`Opening ${resultUrl}`);
  const [response] = await Promise.all([
    page.waitForResponse(
      (response) => {
        return response
          .url()
          .includes("https://ultrasignup.com/service/events.svc/results");
      },
      { timeout: 5000 }
    ),
    page.goto(resultUrl),
  ]);

  const distance = slugify(
    await page.locator(".event_selected_link").innerText(),
    { lower: true }
  );

  const start = formatEventDateStringToISO(
    await page.locator(".event-date").innerText()
  );
  const {
    data: { title, location, url },
  } = dJSON.parse(
    (await page.innerHTML("html")).match(/addcalevent\(([{}\S\s]*?)\);/)[1]
  );

  const results = await response.json();

  if (results.length === 0) {
    console.log(`No results for ${title}`);
    return;
  }

  page.close();

  const directory = dataDirectory(title);
  const resultDirectory = path.join(directory, start.split("T")[0]);

  fs.mkdirSync(resultDirectory, { recursive: true });

  fs.writeFileSync(
    path.join(directory, "metadata.json"),
    JSON.stringify({ title, location, url }, null, 2)
  );

  const root = await protobuf.load(
    path.join(".", "proto", "ultrasignup.proto")
  );

  const Results = root.lookupType("Results");

  const message = Results.fromObject({ results });

  fs.writeFileSync(
    path.join(resultDirectory, `distance-${distance}.pbf.gz`),
    await gzip.gzip(Results.encode(message).finish().buffer)
  );

  fs.writeFileSync(
    path.join(resultDirectory, `distance-${distance}.json`),
    JSON.stringify(results, null, 2)
  );
  console.log(`Finished ${resultUrl} - ${title}`);

  return start;
};

const formatEventDateStringToISO = (s: string): string =>
  parseDate(
    `${s} 00:00:00 +00`,
    "EEEE, MMMM d, yyyy HH:mm:ss x",
    new Date()
  ).toISOString();

const dataDirectory = (title: string): string =>
  path.join(
    ".",
    "src",
    "_data",
    "_raw",
    "ultrasignup",
    `${slugify(title, { strict: true, lower: true })}`
  );

const main = async () => {
  const browser = await playwright.chromium.launch({
    // proxy: { server: 'http://91.216.164.251:80' }, // Another free proxy from the list
  });

  const context = await browser.newContext();

  for (let chunk of _.chunk(_.shuffle(_.range(1, 100000)), 10)) {
    await Promise.allSettled(
      chunk.map((id: number) => getResults(id, context))
    );
  }

  await browser.close();
};
main();
