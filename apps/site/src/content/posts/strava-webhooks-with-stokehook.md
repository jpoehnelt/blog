---
title: Strava Webhooks with Stokehook.com
description: "An app I built using Svelte, Firebase, and the Strava API."
pubDate: "2022-06-03"
tags:
  - code
  - run
  - strava
  - automation
  - webhook
---

<script>
  import Snippet from "$lib/components/content/Snippet.svelte";
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

<Image src="stokehook-settings.png" alt="Settings" />

## Payload

The key feature is that Strava sends a "thin" webhook with minimal fields for the activity. The app gets all fields for the object via the Strava API before sending it along.

So instead of:

<Snippet src="./snippets/strava-webhooks-with-stokehook/webhook-payload.json" />

The payload ends up looking like:

<Snippet src="./snippets/strava-webhooks-with-stokehook/webhook-payload-1.json" />

Try it out at [Stokehook.com](https://stokehook.com)!
