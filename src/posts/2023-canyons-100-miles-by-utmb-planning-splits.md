---
layout: post
title: Canyons 100 mile by UTMB planning and splits
excerpt: Planning and splits for the 2023 Canyons 100 mile by UTMB
tags:
    - post
    - run
    - ultramarathon
    - 100 mile
    - California
    - utmb
    - canyons
    - planning
    - splits
date: '2023-03-28T00:00:00.000Z'
---

I'm running the Canyons 100 mile race in April! This will be my first experience on these iconic trails and I am using this blog post to capture some of my planning. I'll be making updates as the race approaches!

## 24 hour splits :clock1:

Here are my roughly estimates splits for a 24 hour finish of the Canyons 100 mile. There are likely mistakes in the table and I'll update this page in the future. UTMB has some discrepancies between the [Aid Station Chart](https://res.cloudinary.com/utmb-world/image/upload/v1678114879/canyons/PDFs/2023_Canyons_Endurance_Runs_by_UTMB_100_mile_Aid_Station_Elevation_Chart_b4e00198ec.pdf.pdf) and the [Time Charts](https://canyons.utmb.world/races/100M) on their website and I did a bunch of manual calculations and conversions.

:::note
All values in miles and feet.
:::

<div class="mb-6">
    <table class="w-full">
    <thead>
    <tr class="font-bold bg-gray-800 text-xl border-b-2 mb-2">
    <th>Aid Station</th>
    <th>Distance</th>
    <th>Average Gain</th>
    <th>Pace</th>
    <th>Aid</th>
    <th>Clock</th>
    </tr>
    </thead>
    <tbody>
    {% for split in splits -%}
    <tr class="even:bg-gray-800 border-b-2 border-gray-900 py-4 px-2">
        <td>{{ split.location }}</td>
        <td>{{ split.target.distance }}</td>
        <td>{{ split.gainPerMile }}</td>
        <td>{{ split.target.pace }}</td>
        <td>{{ split.target.aid }}</td>
        <td>{{ split.target.time }}</td>
    </tr>
    {% endfor -%}
    </tbody>
    </table>
</div>

I'm not counting on any crew and will be using drop bags at the aid stations. I'm also not planning to have a pacer. If you have a crew, you will likely spend less time at some of the aid stations than I am and more at others.

You can see some of my [latest runs and past race reports here](/run/#recent-activities). This would be my fastest 100 mile finish time, but also the [most runnable course I have done](https://ultrasignup.com/results_participant.aspx?fname=Justin&lname=Poehnelt#) and fifth 100 miler!

## Sunset, sunrise :sunrise:

- Sunset is at 7:54 -> I need to grab extra night gear from my drop bag at Mammoth Bar.
- Sunrise is at 6:09 -> I can stash extra night gear at Mitchell Mine.

## Conditions: :fire: :snowflake:

Snow and trail conditions resulting from the Mosquito fire could slow things down. Here is the latest map from Sentinel 2 imagery on March 25:

{% image src="src/images/canyons-by-utmb-snow-map-2023-03-25.png", alt="Latest map showing snow along the Canyons course" %}

You can also get some updates on the trail work being done at the [Western States website](https://www.wser.org/2023/03/25/update-mosquito-fire-trail-restoration/). Follow the Canyons 100 mile by UTMB on [Facebook](https://www.facebook.com/runcanyons/) for more updates.

## Other estimates :hourglass:

- "Fastest" time according to UTMB: 21:02
- Strava estimated **moving** time: 19:48 :man_shrugging: I uploaded the GPX file to Strava at the end of February and you can check it out [at Strava](https://www.strava.com/routes/3065772647029620938) or in the embed below.

<div class="max-w-lg m-auto mb-4"><div class="strava-embed-placeholder" data-embed-type="route" data-embed-id="3065772647029620938" data-full-width="true"></div><script src="https://strava-embeds.com/embed.js"></script></div>

## Aid station chart :chart_with_upwards_trend:

This aid station chart [accessed March 29](https://res.cloudinary.com/utmb-world/image/upload/v1678114879/canyons/PDFs/2023_Canyons_Endurance_Runs_by_UTMB_100_mile_Aid_Station_Elevation_Chart_b4e00198ec.pdf.pdf) is missing the Deadwood aid stations.

{% image src="src/images/canyons-100-mile-aid-station-chart.png", alt="Aid station chart" %}

## Ultrasignup rating distribution

As everyone knows, there is some direct placement into UTMB for top finishers. Here is a quick graph showing all runners in the 100 mile distance with bucketed by their UltraSignup rating.

{% image src="src/images/canyons-by-utmb-ultrasignup-rating-distribution.png", alt="UltraSignup rating distribution" %}

:::note
This overestimates when a name has multiple ratings, e.g. John Smith has a 65% and 95% rating. I'm not sure how to handle this and defaulted to the higher rating. There are also runners with no rating and many runners that have a high rating across very few races that may not have been super competitive.
:::

I'm currently 28th in males over 40 years with an [81% rating](https://ultrasignup.com/results_participant.aspx?fname=Justin&lname=Poehnelt), but after some manual checking of runners, this is closer to low teens. The spreadsheet is available online on [Google Sheets](https://docs.google.com/spreadsheets/d/10tMi06_DF0OZ39VeD3vrhUGx0R8tBfD7D9AZ7-qtESA/edit?usp=sharing).
