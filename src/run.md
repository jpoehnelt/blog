---
layout: page
title: Ultra Running
path: run
---

{% image src="src/images/mogollon-monster-100/justin-poehnelt-during-ultramarathon.jpeg", alt="Sometimes trail running is walking", class_="max-w-xs rounded-sm" %}

## Running

I started running sometime around 2015 and have significantly increased my mileage over the years! :chart_with_upwards_trend:

{% barChart data=stravaYearlyRunTotals %}

## Recent posts

{% for recent in collections.run | reverse | limit(10) -%}
* {{ recent.data.date | dateDisplay }} - [{{ recent.data.title }}]({{ recent.url }})
{% endfor %}

See more at <a class="tag run" href="/tag/run">run</a>.

## Ultra marathons

In 2017, I ran my first ultra marathon and have since completed many 50km races and a single 50 miler and 100 miler. You can follow my results at [ultrasignup.com](https://ultrasignup.com/results_participant.aspx?fname=Justin&lname=Poehnelt).

### Upcoming events

- Moab 240 Endurance Run - 240 Miler - Moab, UT Oct 7, 2022
- Rio Grande 100 - Rio Grande 100 - South Fork, CO Oct 1, 2022
- The Bear - 100 Miler - Logan, UT Sep 23, 2022

### Past results
- **2022** - Creede 100 - Creede, CO Aug 27, 2022 - 2nd place :2nd_place_medal:
- **2022** - Ute 50 Mile - 50 Miler - La Sal, UT - 1st Place :1st_place_medal:
- **2022** - San Juan Solstice 50 - 50 Miler - Lake City, CO 
- **2022** - Mace’s Hideout 100 - 100 Miler - Beulah - Overall: 3 29:20:53 - [Race Report](/posts/2022-maces-hideout-100m/)
- **2022** - Cocodona 250 - DNF (injury)
- **2022** - Red Rocks of Sedona | 2 Day Stage Race - 50K/50K - Overall: 2 :2nd_place_medal:
- **2022** - Behind the Rocks Ultra - 50K - Moab, UT - [Race Report](/posts/2022-behind-the-rocks-50k/)
- **2022** - Moab Red Hot Ultra - 55K - Moab, UT Overall:26 235:29:01
- **2022** - Arches Ultra - 50K - Moab, UT - Overall:32 255:12:35
- **2021** - Dead Horse Ultra - 50 Miler - Moab, UT - Overall:11 117:59:57
- **2021** - Hanging Flume 50k - Hanging Flume 50K - Uravan, CO - Overall:4 44:42:30
- **2021** - Crested Butte Ultra - 55K - Crested Butte, CO - Overall:18 135:38:28
- **2021** - Mogollon Monster 100 - 100 Miler - Pine, AZ - Overall:11 1029:13:06
- **2021** - Bears Ears Ultra - 50 Miler - Monticello, UT - Overall:3 39:49:24 :3rd_place_medal:
- **2020** - Moab Red Hot Ultra - 33K - Moab, UT - Overall:21 192:52:19
- **2019** - Baker Lake Classic 25k - 25K - Concrete, WA - Overall:6 62:13:13
- **2019** - Backcountry Rise - 50K - Toutle, WA - Overall:17 166:33:49
- **2019** - Standhope - 60K - Ketchum, ID - Overall:31 2410:35:09
- **2019** - Dragon's Back Ultra and Trail Races - 38.4K - San Ysidro, NM - Overall:2 23:24:42 :2nd_place_medal:
- **2019** - Jemez Mountain - 50K - Los Alamos, NM - Overall:30 266:46:52
- **2019** - Moab Red Hot Ultra - 33K - Moab, UT - Overall:36 293:09:14

Read more at <a class="tag run" href="/tag/race report">race report</a>.

## Recent activities

<ul>{% for activity in activities | sort(true, false, 'start_date') | limit(20) %}
<li>{{ activity.start_date_local | dateDisplay }}: <a href="https://www.strava.com/activities/{{ activity.id}}">{{ activity.name }}</a>, {{ (activity.distance / 1000) | round(1) }} km</li>
{% endfor %}
</ul>

## Strava

You can follow me on [Strava](https://www.strava.com/athletes/2170160).
