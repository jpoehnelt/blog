---
title: "How to Check Free/Busy Status Across Multiple Calendars"
description: >-
  CalendarApp requires fetching all events manually. Learn how to use Calendar API
  freebusy.query for efficient scheduling across multiple calendars.
pubDate: "2026-02-02"
tags:
  - code
  - google
  - google workspace
  - apps script
  - calendar api
  - scheduling
faq:
  - question: How do I check if multiple calendars have availability?
    answer: >-
      Use the Calendar API freebusy.query endpoint. It returns busy blocks for
      multiple calendars in a single API call.
  - question: What's wrong with using CalendarApp.getEvents()?
    answer: >-
      It requires fetching all events and manually calculating gaps. Free/busy
      is more efficient and doesn't expose event details.
  - question: Does free/busy work with meeting rooms?
    answer: >-
      Yes. Resource calendars (conference rooms, equipment) work the same way
      as user calendars in free/busy queries.
---

<script>
  import Snippet from "$lib/components/content/Snippet.svelte";
  import Note from '$lib/components/content/Note.svelte';
</script>

Building a meeting scheduler? You need to find when multiple people (and rooms) are all free. CalendarApp makes this painful—you have to fetch every event and calculate gaps yourself.

[Issue 392668969](https://issuetracker.google.com/392668969) has 108 votes for better scheduling support.

## The Problem

```javascript
// The hard way: fetch all events, loop, find gaps
const events = calendar.getEvents(start, end);
// Now manually calculate when there are NO events...
```

This is slow, exposes event details you might not have permission to see, and scales poorly.

## The Solution: Free/Busy Query

The Calendar API provides a `freebusy.query` endpoint that returns only busy blocks:

## Prerequisites

1. Enable the **Calendar API** Advanced Service
2. Required scope: `https://www.googleapis.com/auth/calendar.readonly`

<Snippet src="./snippets/apps-script-free-busy/appsscript.json" />

## Basic Free/Busy Query

<Snippet src="./snippets/apps-script-free-busy/basic-query.js" />

## Finding Mutual Free Time

<Snippet src="./snippets/apps-script-free-busy/mutual-free.js" />

<Note>

Free/busy queries respect calendar sharing permissions. If you don't have access to see someone's busy times, you'll get an error in the response rather than busy blocks.

</Note>

## Complete Example: Meeting Scheduler

<Snippet src="./snippets/apps-script-free-busy/scheduler.js" />

## Working with Time Zones

The API uses ISO 8601 timestamps. Always include timezone info:

```javascript
// Good - explicit timezone
const timeMin = new Date('2024-03-15T09:00:00-07:00');

// Risky - depends on script timezone
const timeMin = new Date(2024, 2, 15, 9, 0, 0);
```

## What's Next

- [Move Files in Drive](/posts/apps-script-move-files) — Atomic file operations
- [Delegated Mailbox Access](/posts/apps-script-delegated-mailbox) — Access shared inboxes

## Resources

- [freebusy.query Reference](https://developers.google.com/calendar/api/v3/reference/freebusy/query)
- [Issue 392668969](https://issuetracker.google.com/392668969) — Vote for native support
