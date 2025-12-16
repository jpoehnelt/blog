---
title: Google Calendar - Usage Limits Exceeded
description: Cleanup repositories on GitHUb by deleting old forks.
pubDate: "2024-01-24"
tags: "code,google,calendar,spam,notification,google workspace,quota"
---

When creating events in Google Calendar, many developers come across the error message: **Calendar usage limits exceeded**. This happens even when they are not exceeding the API quota.

## Error - usage limits exceeded

The full error response is the following:

```js
{
      domain: 'usageLimits',
      reason: 'quotaExceeded',
      message: 'Calendar usage limits exceeded.'
}
```

The corresponding Calendar API request might look like the following:

```http
POST https://www.googleapis.com/calendar/v3/calendars/primary/events

Authorization: Bearer [YOUR_ACCESS_TOKEN]
Accept: application/json
Content-Type: application/json

{
  "attendees": [
    {
      "email": "foo@example.com"
    },
    {
      "email": "bar@example.com"
    }
  ],
  "end": {
    "date": "2024-01-02"
  },
  "start": {
    "date": "2024-01-01"
  },
  "summary": "A Calendar Event"
}
```

## Cause - spam prevention

**The reason for this is to prevent spam** and is triggered by the following:

- Sending notifications to attendees
- Including attendees that are external to the Google Workspace domain, e.g. inviting `someone@example.com` from `someone@example.org`.

## Solution - remove attendees

The problem is only fixed by removing the attendees and using an alternative approach. In the case of external domains, and sending notifications, the following are some alternatives:

- Provide a template link for users to create an event in their Google Calendar.
- Use `.ics` files to create events in any calendar application.
- Use OAuth to modify the user's calendar directly.
- Share a public Google Calendar and add events to it.
- Use the [publish event feature](https://support.google.com/calendar/answer/41207) in Google Calendar to embed HTML.

Google Calendar template links look like the following:

```http
https://calendar.google.com/calendar/r/eventedit
  ?action=TEMPLATE
  &dates=20230325T224500Z%2F20230326T001500Z
  &stz=Europe/Brussels
  &etz=Europe/Brussels
  &details=EVENT_DESCRIPTION_HERE
  &location=EVENT_LOCATION_HERE
  &text=EVENT_TITLE_HERE
```

## Resources

- [Avoid Calendar use limits](https://support.google.com/a/answer/2905486)
- [Google Calendar API public issue tracker](https://issuetracker.google.com/issues?q=status:open%20componentid:191627%2B%20%22Calendar%20usage%20limits%20exceeded%22)
- [Calendar sharing through the API](https://developers.google.com/calendar/api/concepts/sharing)
- [Inviting attendees to an event](https://developers.google.com/calendar/api/concepts/inviting-attendees-to-events)
- [Google Calendar template link](https://support.google.com/calendar/answer/41207?hl=en)
