---
layout: post
title: "How to Set Google Meet Access Settings for a Calendar Event"
excerpt: "In this post, I am going to show you how to use Google Workspace APIs to create a Calendar event and set the access settings for the Google Meet Space."
tags:
  - post
  - code
  - google
  - google workspace
  - calendar
  - meet
  - nodejs
  - javascript  
date: "2024-04-25T00:00:00.000Z"
hideToc: true
---

**UPDATE: You need to replace the meeting in the Calendar Event in order to edit the Meet space. See https://issuetracker.google.com/379337762.**

In this post, I am going to show you how to use Google Workspace APIs to create a Calendar event and set the access settings for the Google Meet Space. This is in response to an [issue opened in the Google Meet issue tracker](https://issuetracker.google.com/334192346).

> I'm encountering an issue when inviting participants with non-Gmail accounts. For instance, if I invite two people—one with a Gmail account and the other without—the non-Gmail user is unable to join the meeting directly. Instead, they are prompted to request permission to join, which can be inconvenient. While I'm aware of the option to manually adjust host controls to allow all users, doing this for each meeting is impractical and tedious.

The solution is to set the space config to access type `"OPEN"`.

```js
{ "config": { "accessType": "OPEN" } }
```

However, this requires making **THREE** API calls: one to create the event, one to get the Meet space from the short code, and another to update the access settings for the Google Meet space.

1. Create a Calendar event
2. Get the Meet space
3. Update the access settings for the Meet space

### Create a Calendar event

First, we need to create a Calendar event. We can use the [Google Calendar API](https://developers.google.com/calendar) to do this. Here is a simple example using Node.js:

```js
const event = (await client.events.insert({
  calendarId,
  resource: {
    summary: "summary",
    description: "description",
    // all day event
    start: {
      date,
    },
    end: {
      date,
    },
    conferenceData: {
      createRequest: {
        requestId: Math.random().toString(36).substring(7),
        conferenceSolutionKey: {
          type: "hangoutsMeet",
        },
      },
    },
  },
})).data;
```

This will create a Calendar event with a Google Meet link. The `conferenceData.createRequest` object is required to create a Google Meet link for the event with the `conferenceDataVersion` parameter set to 1. Below is the partial event object:

```js
{
  // ...
  "hangoutLink": "https://meet.google.com/rup-ghhj-obi",
  "conferenceData": {
    "createRequest": {
      "requestId": "srvg8v",
      "conferenceSolutionKey": {
        "type": "hangoutsMeet"
      },
      "status": {
        "statusCode": "success"
      }
    },
    "entryPoints": [
      {
        "entryPointType": "video",
        "uri": "https://meet.google.com/rup-ghhj-obi",
        "label": "meet.google.com/rup-ghhj-obi"
      },
      // ...
    ],
    "conferenceSolution": {
      "key": {
        "type": "hangoutsMeet"
      },
      "name": "Google Meet",
      "iconUri": "https://fonts.gstatic.com/s/i/productlogos/meet_2020q4/v6/web-512dp/logo_meet_2020q4_color_2x_web_512dp.png"
    },
    "conferenceId": "rup-ghhj-obi"
  }
}
```

### Get the Meet space

Using the Google Meet NodeJS client library, we can get the space using the `conferenceId`. First, import the library:

```js
import { v2 as meetV2 } from "@google-apps/meet";
```

Then use the `SpacesServiceClient` to get the space from the `conferenceId`:

```js
const conferenceId = event.conferenceData.conferenceId;

const meetClient = new meetV2.SpacesServiceClient({ authClient: auth });
const space = (
  await meetClient.getSpace({
    name: `spaces/${conferenceId}`,
  })
)[0];
```

This returns the following space:

```js
{
  name: 'spaces/vIMPKJmrMMsB',
  meetingUri: 'https://meet.google.com/rup-ghhj-obi',
  meetingCode: 'rup-ghhj-obi',
  config: { accessType: 'TRUSTED', entryPointAccess: 'ALL' },
  activeConference: null
}
```

### Update the access settings for the Meet space

Finally, we can update the access settings for the Google Meet space using the `updateSpace` method:

```js
const updatedSpace = (
  await meetClient.updateSpace({
    space: { name: space.name, config: { accessType: "OPEN" } },
    updateMask: {
      paths: ["config.access_type"], // must be in snake_case
    },
  })
)[0];
```

And now the Google Meet space is set to access type "OPEN":

```js
{
  name: 'spaces/vIMPKJmrMMsB',
  meetingUri: 'https://meet.google.com/rup-ghhj-obi',
  meetingCode: 'rup-ghhj-obi',
  config: { accessType: 'OPEN', entryPointAccess: 'ALL' },
  activeConference: null
}
```

With this solution, you can now create a Calendar event and set the access settings for the Google Meet space using the Google Workspace APIs. This will allow participants with non-Gmail accounts to join the meeting directly without having to request permission.

### Complete code

The complete code for this is below:

{% code src="src/_snippets/calendar-meet/index.js" %}
