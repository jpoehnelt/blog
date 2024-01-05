---
layout: page
path: /
hideToc: true
title: Home
---

<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Person",
  "address": {
    "@type": "PostalAddress",
    "addressRegion": "CO"
  },
  "jobTitle": "Software Engineer",
  "name": "{{ site.author.name }}",
  "url": "{{ site.url.href }}"
}
</script>

{% image src="src/images/justin-poehnelt.jpg", alt=site.author.name, class_="rounded-full max-w-full sm:max-w-sm mx-auto" %}

# Hello. :wave:

Welcome to my personal site and blog. I like to <a class="tag run" href="/tag/run/">run</a> and <a class="tag code" href="/tag/code/">code</a> and sometimes <a href="/blog/">write</a> about it.

## Socials

You can follow me on these other sites.

<ul>
    <li><a href="{{ site.author.contacts.email.href }}" rel="me">{{ site.author.contacts.email.text }}</a></li>
    <li><a href="https://mastodon.thbps.com/@jpoehnelt" rel="me">@jpoehnelt@mastodon.thbps.com</a></li>
    <li><a rel="noopener noreferrer" href="https://github.com/jpoehnelt" rel="me">GitHub</a></li>
    <li><a rel="noopener noreferrer" href="https://www.linkedin.com/in/justin-poehnelt" rel="me">LinkedIn</a></li>
    <li><a rel="noopener noreferrer" href="https://dev.to/jpoehnelt" rel="me">Dev.to</a></li>

</ul>

## Recent posts

<ul>
  {% for recent in collections.post | reverse | limit(10) -%}
  <li>{{ recent.data.date | dateDisplay }} - <a href="{{ recent.url }}">{{ recent.data.title }}</a></li>
  {%- endfor %}
</ul

See more at [/blog](/blog/).

## Misc

{% include "rss-feed.njk" %}
