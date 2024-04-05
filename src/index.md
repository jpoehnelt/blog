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

Welcome to my personal site and blog. I like to <a href="/tag/run/">#run</a> and <a href="/tag/code/">#code</a> and sometimes <a href="/blog/">write</a> about it.

## Socials

You can follow me on these other sites.

<ul>
    <li><a href="{{ site.author.contacts.email.href }}" rel="me">{{ site.author.contacts.email.text }}</a></li>
    <li><a rel="me" href="https://social.jpoehnelt.dev/@justin">Mastodon</a></li>
    <li><a rel="noopener noreferrer me" href="https://github.com/jpoehnelt">GitHub</a></li>
    <li><a rel="noopener noreferrer me" href="https://www.linkedin.com/in/justin-poehnelt">LinkedIn</a></li>
    <li><a rel="noopener noreferrer me" href="https://dev.to/jpoehnelt">Dev.to</a></li>

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
