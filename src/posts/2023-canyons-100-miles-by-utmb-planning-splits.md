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

:::note
All information here has been updated for the alternate 2023 course.
:::

## 24 hour splits :clock1:

Here are my roughly estimates splits for a 21.5 hour finish of the Canyons 100 mile. 

<div class="mb-6">
    <table class="w-full">
    <thead>
    <tr class="font-bold bg-gray-800 text-xl border-b-2 mb-2">
    <th>Aid Station</th>
    <th>Distance</th>
    <th>Avg Gain</th>
    <th>Avg Pace</th>
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

I'm not counting on any crew and will be using drop bags at the aid stations. I'm also not planning to have a pacer.

You can see some of my [latest runs and past race reports here](/run/#recent-activities). This would be my fastest 100 mile finish time, but also the [most runnable course I have done](https://ultrasignup.com/results_participant.aspx?fname=Justin&lname=Poehnelt#) and fifth 100 miler!

## Sunset, sunrise :sunrise:

- Sunset is at 7:54 -> I will pick up additional night gear at Driver's Flat.
- Sunrise is at 6:09 -> I can stash extra night gear at Foresthill.

## Other estimates :hourglass:

- "Fastest" time according to UTMB: 20:56 :thinking: This is only a few minutes less than the original course which doesn't seem right.
- Strava estimated **moving** time: 18:37 :man_shrugging: I uploaded the GPX file to Strava and you can check it out [at Strava](https://www.strava.com/routes/3076999906543797568) or in the embed below. I think this estimate is closer to what the winners will finish in than what my time will be.

<div class="max-w-lg m-auto mb-4"><div class="strava-embed-placeholder" data-embed-type="route" data-embed-id="3076999906543797568" data-full-width="true"></div><script src="https://strava-embeds.com/embed.js"></script></div>

## Ultrasignup rating distribution :trophy:

As everyone knows, there is some direct placement into UTMB for top finishers. Here is a quick graph showing all runners in the 100 mile distance bucketed by their UltraSignup rating.

{% image src="src/images/canyons-by-utmb-ultrasignup-rating-distribution.png", alt="UltraSignup rating distribution" %}

:::note
This overestimates when a name has multiple ratings, e.g. John Smith has a 65% and 95% rating. I'm not sure how to handle this and defaulted to the higher rating. There are also runners with no rating and many runners that have a high rating across very few races that may not have been super competitive.
:::

I'm currently 28th in males over 40 years with an [81% rating](https://ultrasignup.com/results_participant.aspx?fname=Justin&lname=Poehnelt), but after some manual checking of runners, this is closer to low teens. The spreadsheet is available online on [Google Sheets](https://docs.google.com/spreadsheets/d/10tMi06_DF0OZ39VeD3vrhUGx0R8tBfD7D9AZ7-qtESA/edit?usp=sharing).
