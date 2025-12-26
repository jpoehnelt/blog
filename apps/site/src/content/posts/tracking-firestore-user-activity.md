---
title: Track all Firestore write activity in Firestore
description: >-
  Capture all user activity in a Firestore collection using Audit Logs, Pub/Sub,
  and Cloud Functions.
pubDate: "2022-10-21"
tags:
  - code
  - firestore
  - pubsub
  - functions
  - firebase
  - audit
  - logs
---

<script>
  import Snippet from "$lib/components/content/Snippet.svelte";
  import Image from '$lib/components/content/Image.svelte';
</script>

## Introduction

As part of a little side project, I wanted to log all Firestore writes for a user to a user specific collection that I can use to display a user's activity. I was able to accomplish this using Audit Logs, Pub/Sub, and Cloud Functions.

## Requirements

- Log all Firestore writes for a user, ignore reads
- Access the writes as an activity collection for the user, `users/{userId}/activity`

## Architecture

There are a few moving parts to this solution, but it's pretty automatic.

<Image src="firestore-audit-logs-to-collection.png" alt="Firestore Audit Logs to Collection" />

1. Audit Logs are enabled for Firestore writes

<Image src="firestore-audit-logs.png" alt="Enable Firestore Audit Logs" />

2. Logs are sent to a Pub/Sub topic via a sink

<Image src="activity-logs-sink-pubsub.jpeg" alt="Create PubSub Sink" />

3. Cloud Function is triggered by Pub/Sub message

<Snippet src="./snippets/tracking-firestore-user-activity/uid.ts" />

4. Cloud Function writes to Firestore

<Image src="firestore-activity-collection-document.jpeg" alt="User Collection Containing Activity" />
