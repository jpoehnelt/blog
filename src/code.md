---
layout: page
title: My Career as Software Engineer
path: code
---

## Software Engineer

I am a **Developer Relations Engineer** at Google for Google Maps Platform with a background in geospatial applications and satellite imagery. Previously I worked at [Descartes Labs](https://www.descarteslabs.com/) and the [US Geological Survey](https://www.usgs.gov/).

Approximately two thirds of my work is supporting open source and much of that is within the [Google Maps GitHub organization](https://github.com/googlemaps). The remainder of my development work is internal to Google and focused on fixing bugs, enabling new features, and creating processes that create a better development experience.

## Recent posts

{% for recent in collections.postsTaggedCode | reverse | limit(10) -%}
* {{ recent.data.date | dateDisplay }} - [{{ recent.data.title }}]({{ recent.url }})
{% endfor %}

See more at <a class="tag code" href="/tag/code">code</a>.
## Open Source Development Stats
I am active on GitHub and track some of my development activity for open source.

<img src="https://github-readme-stats.vercel.app/api?username=jpoehnelt&show_icons=true&&theme=nord&hide_border=true&count_private=true&hide=issues&custom_title=Github%20Stats" width="495" height="170" alt="jpoehnelt GitHub stats"/>

## NPM Packages

I maintain numerous packages including the following on NPM.

{% for entry in npm | sort(true, false, 'score.detail.popularity') -%}
- [{{ entry.package.name }}](https://www.npmjs.com/package/{{ entry.package.name }})
{% endfor -%}

:::note
I also write in other languages, but I have only ingested data from NPM my [11ty.dev](https://11ty.dev) personal site.
:::
