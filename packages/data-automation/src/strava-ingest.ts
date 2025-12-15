import axios from "axios";
import { getUnixTime, parseISO, subDays, endOfToday } from "date-fns";
import path from "path";
import fs from "fs";

const main = async () => {
  const before = getUnixTime(
    process.env.STRAVA_BEFORE
      ? parseISO(process.env.STRAVA_BEFORE)
      : endOfToday(),
  );
  const after = getUnixTime(
    process.env.STRAVA_AFTER
      ? parseISO(process.env.STRAVA_AFTER)
      : subDays(endOfToday(), 5),
  );

  let page = 1;

  const activities: Record<string, any> = {};

  // eslint-disable-next-line
  while (true) {
    const per_page = 100;
    const url = `https://www.strava.com/api/v3/athlete/activities?page=${page}&per_page=${per_page}&before=${before}&after=${after}`;

    console.log({ url });

    // eslint-disable-next-line
    const data: any[] = (
      await axios.get(url, {
        headers: {
          Authorization: `Bearer ${process.env.STRAVA_ACCESS_TOKEN}`,
        },
      })
    ).data;

    data.forEach((d) => {
      activities[String(d.id)] = d;
    });

    if (data.length !== per_page) {
      break;
    }

    page++;
  }

  for (const id of Object.keys(activities)) {
    const activity = (
      await axios.get(`https://www.strava.com/api/v3/activities/${id}`, {
        headers: {
          Authorization: `Bearer ${process.env.STRAVA_ACCESS_TOKEN}`,
        },
      })
    ).data;

    const activityFileName = `${id}.json`;
    const dir = path.dirname(activityFileName);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    const filePath = path.join("data", "strava", activityFileName);
    fs.writeFileSync(filePath, JSON.stringify(activity, null, 2));
  }
};

await main();
