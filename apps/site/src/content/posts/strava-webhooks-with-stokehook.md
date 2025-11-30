---
title: Strava Webhooks with Stokehook.com
description: 'An app I built using Svelte, Firebase, and the Strava API.'
pubDate: '2022-06-03'
tags: 'code,run,strava,automation,webhook'
---



<script>
  import Image from '$lib/components/content/Image.svelte';
</script>

I recently implemented a small application, [Stokehook.com](https://stokehook.com), that can send webhooks for your Strava activities to any endpoint. Getting data out of Strava as it is uploaded has never been easy to do and I wanted to fix that in a way that lets other developers integrate the activities into other workflows.

<Image src="https://stokehook.com/social.jpg" alt="Stokehook.com" />

## Tech Stack

- Svelte + Sveltekit
- TailwindCSS
- Firestore
- Firebase Auth
- Hosted on Netlify (easier than Firebase functions and hosting for now)

## How it works

The app basically does the following.

1. Handle authentication with Strava
1. Receives a webhook from Strava for all app users
1. Looks up the webhook setting for the user
1. Refreshes the access token for the user
1. Enriches the webhook with the full object (Strava sends minimal information in their webhook)
1. Sends it off to the user's endpoint

The interface for the app is pretty simple.

<Image src="src/images/stokehook-settings.png" alt="Settings" />

## Payload

The key feature is that Strava sends a "thin" webhook with minimal fields for the activity. The app gets all fields for the object via the Strava API before sending it along. 

So instead of:

```json
{
  "aspect_type": "create",
  "event_time": 1654224986,
  "object_id": 7246184314,
  "object_type": "activity",
  "owner_id": 2170160,
  "subscription_id": 217592,
  "updates": {},
}
```

The payload ends up looking like:

```json
{
  "aspect_type": "create",
  "event_time": 1654224986,
  "object_id": 7246184314,
  "object_type": "activity",
  "owner_id": 2170160,
  "subscription_id": 217592,
  "updates": {},
  "data": {
    "resource_state": 3,
    "athlete": {
      "id": 2170160,
      "resource_state": 1
    },
    "name": "Evening Hike",
    "distance": 2077.3,
    "moving_time": 1700,
    "elapsed_time": 1843,
    "total_elevation_gain": 25,
    "type": "Hike",
    "id": 7246184314,
    "start_date": "2022-06-03T02:22:32Z",
    "start_date_local": "2022-06-02T20:22:32Z",
    ...
    "pr_count": 0,
    "total_photo_count": 0,
    "has_kudoed": false,
    "suffer_score": 2,
    "description": null,
    "calories": 99,
    "perceived_exertion": null,
    "prefer_perceived_exertion": null,
    "segment_efforts": [],
    ...
    "available_zones": [
      "heartrate"
    ]
  },
  "meta": {
    "id": "FDnZJ5smHVVPYQAVOrq3",
    "url": "https://webhook.site/633a324a-eec8-46d1-9bb8-d7b7ca0d90b5"
  }
}
```

Try it out at [Stokehook.com](https://stokehook.com)!
