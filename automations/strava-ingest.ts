import axios from 'axios';
import { getUnixTime, parseISO, subDays, endOfToday } from 'date-fns'
import path from 'path';
import fs from 'fs';


const main = async () => {

    const after = getUnixTime(process.env.STRAVA_AFTER ? parseISO(process.env.STRAVA_AFTER) : subDays(endOfToday(), 10));
    const file = path.join('src', '_data', 'strava.json');

    let page = 1;

    const activities = {};

    // eslint-disable-next-line
    while (true) {
        const per_page = 100;

        const url = `https://www.strava.com/api/v3/athlete/activities?page=${page}&per_page=${per_page}&after=${after}`;

        console.log(url);
        // eslint-disable-next-line
        const data: any[] = (
            await axios.get(url, {
                headers: {
                    Authorization: `Bearer ${process.env.STRAVA_ACCESS_TOKEN}`,
                },
            })
        ).data;

        console.log(data);

        data.forEach(d => {
            activities[String(d.id)] = d;
        })

        if (data.length !== per_page) {
            break;
        }

        page++;
    }

    const existing = JSON.parse(fs.readFileSync(file, 'utf8'));
    const updated = { ...existing, ...activities };

    fs.writeFileSync(file, JSON.stringify(updated, null, 2))

}

await main();
