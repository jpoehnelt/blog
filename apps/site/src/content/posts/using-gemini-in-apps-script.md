---
title: Using Gemini in Apps Script
description: >-
  Learn how to use the new built-in Vertex AI Advanced Service in Google Apps Script to access Gemini models directly, without the need for complex UrlFetchApp calls.
pubDate: "2026-01-12"
tags:
  - code
  - google
  - google workspace
  - apps script
  - gemini
  - ai
  - vertex ai
---

<script>
  import Snippet from "$lib/components/content/Snippet.svelte";
  import Note from '$lib/components/content/Note.svelte';
  import Image from '$lib/components/content/Image.svelte';
</script>

This has been a long time coming, and it is finally here. Apps Script now has a new **Vertex AI advanced service**!

<Note>

⚠️⚠️ **Important:** In my testing, it is not possible to use Gemini 3 models, like `gemini-3-pro-preview`, because they are in preview. You can use the `gemini-2.5-pro` model instead.

</Note>

Previously, if you wanted to call Gemini or other Vertex AI models, you had to manually construct `UrlFetchApp` requests, handle bearer tokens, and manage headers. It was doable, but verbose and annoying.

### Before: The Old Way

In my previous post on [Using Vertex AI in Apps Script](/posts/apps-script-vertex-ai), the code looked like this:

```javascript
function predict(prompt) {
  const URL = `${BASE}/v1/projects/${PROJECT_ID}/locations/us-central1/publishers/google/models/${MODEL}:predict`;
  const options = {
    method: "post",
    headers: { Authorization: `Bearer ${ACCESS_TOKEN}` },
    muteHttpExceptions: true,
    contentType: "application/json",
    payload: JSON.stringify({
      instances: [{ prompt }],
      parameters: { temperature: 0.2, maxOutputTokens: 256 }
    }),
  };
  const response = UrlFetchApp.fetch(URL, options);
  // ... parsing logic ...
}
```

### After: The New Way

Now, with the built-in service, it's just:

```javascript
const response = VertexAI.Endpoints.generateContent(payload, model);
```

## The Vertex AI Advanced Service

The new service, `VertexAI`, allows you to interact with the Vertex AI API directly. This means you can generate text, images, and more using models like **Gemini 3 Pro** with significantly less boilerplate code. You can check out the full [Vertex AI REST reference docs](https://cloud.google.com/vertex-ai/generative-ai/docs/model-reference/gemini) for more details on available methods and parameters.

## Prerequisites

To use the Vertex AI advanced service, you need to do the following, which you already did if your were using via `UrlFetchApp`:

1.  **Google Cloud Project:** You need a Standard GCP Project (not the default Apps Script managed one).
2.  **Billing Enabled:** Vertex AI requires a billing account attached to the project.

    <Image src="using-gemini-with-vertex-ai/enable-billing-for-vertex-ai.png" alt="Enable Billing for Vertex AI" />

    <Image src="using-gemini-with-vertex-ai/failed-leverage-core-competencies-enable-billing.png" alt="Failed to Leverage Core Competencies Enable Billing" />

    > Failed to leverage core competencies: API call to aiplatform.endpoints.generateContent failed with error: This API method requires billing to be enabled. Please enable billing on project ... then retry.

3.  **API Enabled:** Enable the **Vertex AI API** in your Cloud Console.
4.  **Apps Script Configuration:** Add your Cloud Project number in **Project Settings**.
5.  **Add Service:** Enable the **Vertex AI** advanced service in the "Services" section of the editor.

    <Image src="using-gemini-with-vertex-ai/apps-script-cloud-project-number.png" alt="Apps Script Cloud Project Number" />

    <Image src="using-gemini-with-vertex-ai/add-vertex-ai-service.png" alt="Add Vertex AI Service" />

    <Image src="using-gemini-with-vertex-ai/enable-vertex-ai.png" alt="Enable Vertex AI Service" />

    Or manually enable it in `appsscript.json`:

    <Snippet src="./snippets/using-gemini-with-vertex-ai/appsscript.json" />

## Code Snippet: The Gen Z Translator

To demonstrate the power of this service for educators, let's build the **"Gen Z" Translator**. This tool takes student emails filled with slang and translates them into proper Victorian-era English, ensuring clear communication.

<Snippet src="./snippets/using-gemini-with-vertex-ai/genz-translator.js" />

The result:

```
3:35:40 PM	Notice	Execution started
3:36:02 PM	Info	Student said: Hey prof, that lecture today was straight fire. The vibes were immaculate and I'm lowkey obsessed with this topic. Slay.
3:36:02 PM	Info	Professor heard

My Dearest Professor,

Permit me to express, with the utmost sincerity, my profound admiration for your discourse this day. It was a truly masterful and illuminating exposition, delivered with a passion that can only be described as incandescent.

The intellectual atmosphere you so deftly cultivated within the hall was of the most superlative quality; a veritable feast for the mind. Indeed, I confess that you have awakened within me a most fervent and, I daresay, burgeoning obsession with the subject matter, a fascination I had not previously known myself to possess.

It was, in all respects, a triumph of scholarly erudition.

I have the honour to remain, Sir,
Your most humble and devoted student.
3:36:02 PM	Notice	Execution completed
```


## Code Snippet: Corporate Jargon Generator

And if you need to translate in the _other_ direction—from simple human emotion to soul-crushing business speak—we have you covered too. This snippet does the exact opposite, turning honest phrases into "synergistic deliverables."

<Snippet src="./snippets/using-gemini-with-vertex-ai/jargon.js" />

The result:

```
3:29:25 PM	Notice	Execution started
3:29:32 PM	Info	Original: I made a mistake.
3:29:32 PM	Info	Corporate:

It has come to my attention, through rigorous self-assessment and a steadfast commitment to continuous improvement, that a momentary lapse in strategic foresight led to a suboptimal outcome, which I am now diligently leveraging as a foundational catalyst for enhanced future performance metrics.
3:29:41 PM	Info	Original: Can we meet later?
3:29:41 PM	Info	Corporate:

Considering the dynamic parameters of our current operational cadence, might we strategically align our respective bandwidths for a high-impact ideation interface at a mutually agreeable, post-meridian temporal increment?
3:29:52 PM	Info	Original: I need a raise.
3:29:52 PM	Info	Corporate:

In order to strategically galvanize optimal human capital resource allocation and ensure the continued, robust realization of enterprise-wide objectives, it is incumbent upon us to engage in a proactive, granular analysis of my present remuneration scaffolding, thereby effectuating an equitable recalibration commensurate with my demonstrably amplified value proposition and pivotal synergistic contributions.
3:29:53 PM	Notice	Execution completed
```

## Multimodal Magic

Text is great, but Gemini is multimodal. You can pass images directly to the model to have it analyze charts, describe photos, or even read handwriting.

<Snippet src="./snippets/using-gemini-with-vertex-ai/multimodal.js" />

The result:

```
3:26:28 PM	Notice	Execution started
3:26:40 PM	Info	A male trail runner, competing in a mountain ultramarathon with bib number 49, uses trekking poles to ascend a steep and rocky path.
3:26:40 PM	Notice	Execution completed
```

## Why this rocks

- **No more `UrlFetchApp`**: The service handles the underlying network requests.
- **Built-in Auth**: `ScriptApp.getOAuthToken()` is handled more seamlessly, though you still need standard scopes.
- **Cleaner Syntax**: `VertexAI.Endpoints.generateContent(payload, model)` is much easier to read than a massive `fetch` call.

## Troubleshooting

### "Unexpected error while getting the method or property generateContent..."

> Unexpected error while getting the method or property generateContent on object Apiary.aiplatform.endpoints.

If you see this error, it is often because you are using a model that isn't available in your selected region, or you are trying to use a **Preview model** without using the GLOBAL endpoint. There is a bug here, and you can use the `gemini-2.5-pro` model instead.
