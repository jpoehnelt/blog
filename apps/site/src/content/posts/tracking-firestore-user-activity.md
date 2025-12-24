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
  import img_firestore_audit_logs_to_collection_png from "$lib/images/firestore-audit-logs-to-collection.png?enhanced";
  import img_firestore_audit_logs_png from "$lib/images/firestore-audit-logs.png?enhanced";
  import img_activity_logs_sink_pubsub_jpeg from "$lib/images/activity-logs-sink-pubsub.jpeg?enhanced";
  import img_firestore_activity_collection_document_jpeg from "$lib/images/firestore-activity-collection-document.jpeg?enhanced";
  import Image from '$lib/components/content/Image.svelte';
</script>

## Introduction

As part of a little side project, I wanted to log all Firestore writes for a user to a user specific collection that I can use to display a user's activity. I was able to accomplish this using Audit Logs, Pub/Sub, and Cloud Functions.

## Requirements

- Log all Firestore writes for a user, ignore reads
- Access the writes as an activity collection for the user, `users/{userId}/activity`

## Architecture

There are a few moving parts to this solution, but it's pretty automatic.

<Image src={img_firestore_audit_logs_to_collection_png} alt="Firestore Audit Logs to Collection" />

1. Audit Logs are enabled for Firestore writes

<Image src={img_firestore_audit_logs_png} alt="Enable Firestore Audit Logs" />

2. Logs are sent to a Pub/Sub topic via a sink

<Image src={img_activity_logs_sink_pubsub_jpeg} alt="Create PubSub Sink" />

3. Cloud Function is triggered by Pub/Sub message

```typescript
import * as firebaseAdmin from "firebase-admin";
import * as functions from "firebase-functions";

export default functions.pubsub
  .topic("firestore-activity")
  .onPublish(async (message) => {
    const { data } = message;
    const { timestamp, protoPayload } = JSON.parse(
      Buffer.from(data, "base64").toString(),
    );

    const uid =
      protoPayload.authenticationInfo.thirdPartyPrincipal.payload.user_id;

    const writes = protoPayload.request.writes;

    const activityRef = firebaseAdmin
      .firestore()
      .collection("users")
      .doc(uid)
      .collection("activity");

    await Promise.all(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      writes.map((write: any) => {
        activityRef.add({ write, timestamp });
      }),
    );
  });
```

4. Cloud Function writes to Firestore

<Image src={img_firestore_activity_collection_document_jpeg} alt="User Collection Containing Activity" />
