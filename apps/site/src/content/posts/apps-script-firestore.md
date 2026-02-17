---
title: Using Firestore in Apps Script
description: >-
  Firestore can be a powerful tool when using Apps Script. This post shows how
  to use the [Firestore REST API] in Apps Script.
pubDate: "2024-01-10"
tags:
  - code
  - google
  - google workspace
  - apps script
  - firestore
  - google cloud
faq:
  - question: When should I use Firestore instead of CacheService or PropertiesService?
    answer: You should use Firestore when you need a longer time-to-live (TTL) for your data, or when you need to store many more values than the 1000-item limit of CacheService and PropertiesService.
  - question: How do I set up Firestore for use in Apps Script?
    answer: To use Firestore in Apps Script, you need to enable the Firestore API in the Google Cloud Console, add the necessary OAuth scopes to your Apps Script project, and set the Cloud project ID in the Apps Script settings.
  - question: How can I interact with the Firestore REST API from Apps Script?
    answer: You can use the UrlFetchApp service to make requests to the Firestore REST API. It's recommended to create wrapper functions to handle authentication (e.g., adding an OAuth token to the header) and to parse the API responses.
  - question: How are Firestore documents structured in the REST API?
    answer: When using the REST API, Firestore documents are represented as JSON objects where each field includes its data type (e.g., stringValue, integerValue, mapValue).
---

<script>
  import Snippet from "$lib/components/content/Snippet.svelte";
  import Note from '$lib/components/content/Note.svelte';
</script>

When using Apps Script, sometimes the [CacheService] and [PropertiesService] do not match the requirements of the project -- perhaps there a need for a longer ttl or storing many more values. In these cases, Firestore can be used! If you need relational data with SQL queries instead of a document store, see [Connecting PostgreSQL to Apps Script](/posts/apps-script-postgresql/).

## Setup

1. To use Firestore in Apps Script, you will need to enable the Firestore API in the [Google Cloud Console](https://console.cloud.google.com/apis/library/firestore.googleapis.com).
2. You will also need to add the following scopes to your Apps Script project:

<Snippet src="./snippets/apps-script-firestore/example.json" />

3. Finally, you will need to set the Cloud project id in the Apps Script settings.
4. Create a collection named `kv` in Firestore so the examples below will work.

This post is going to be using the [Firestore REST API](https://firebase.google.com/docs/firestore/use-rest-api) with OAuth access tokens via [`ScriptApp.getOAuthToken()`]. Alternatively, you could use a service account.

## UrlFetchApp and the [Firestore REST API]

The [UrlFetchApp] can be used to make requests to the [Firestore REST API]. I wrap the [UrlFetchApp] in two function layers to make it easier to use with the OAuth token and handle errors. The first is a simple wrapper to add the OAuth token to the request header.

<Snippet src="./snippets/apps-script-firestore/fetchwithoauthaccesstoken.js" />

<Note>

I didn't evaluate the performance impacts of repeated [`ScriptApp.getOAuthToken()`] calls.

</Note>

The second function layer is a wrapper to handle errors and parsing that I included as part of the Firestore class I created (more later).

<Snippet src="./snippets/apps-script-firestore/response.js" />

## Firestore class for Apps Script

To abstract some of the common methods, I created a Firestore class. This class is not meant to be a complete wrapper of the [Firestore REST API], but rather a starting point.

Below is the `.patch()` method as an example which transforms the payload to JSON and passes it to the `.fetch()` wrapper method.

<Snippet src="./snippets/apps-script-firestore/firestore.js" />

I also included a `url` method to generate the [Firestore REST API] url and include any parameters. This method is used by the other methods to generate the url.

<Snippet src="./snippets/apps-script-firestore/firestore-1.js" />

This could be extended as necessary for queries, collections, etc.

## Firestore typed documents

When using the [Firestore REST API], documents are represented with a JSON object containing their types. Below is an example of a document with a nested object and array.

<Snippet src="./snippets/apps-script-firestore/example.json" />

I didn't bother with wrapping and unwrapping this, but a helper function could do this for you. See this GitHub library, [grahamearley/FirestoreGoogleAppsScript/Document.ts](https://github.com/grahamearley/FirestoreGoogleAppsScript/blob/c8641b1801c1935f7eef7c864f28e0ad18bcaa06/Document.ts) for an example implementation.

## Usage of the Apps Script Firestore class

Below is an example of using the Firestore class to patch, get, and delete a document in a collection I had already created named `kv`.

<Snippet src="./snippets/apps-script-firestore/main.js" />

This outputs the following:

<Snippet src="./snippets/apps-script-firestore/example.txt" />

## Future experiments with Firestore in Apps Script

- Use Firestore rules for segmenting user data
- Use Firestore as a larger cache than the [CacheService]
- Use a service account instead of OAuth access tokens

<Note>

You may want to consider using the library [FirestoreGoogleAppsScript](https://github.com/grahamearley/FirestoreGoogleAppsScript) instead of the code in this post. It is a more complete wrapper of the [Firestore REST API], however there is a balance to using an incomplete external library vs writing a small amount of code yourself as demonstrated here.

</Note>

## Complete code

<Snippet src="./snippets/apps-script-firestore/fetchwithoauthaccesstoken-1.js" />

[CacheService]: https://developers.google.com/apps-script/reference/cache/cache-service
[Firestore REST API]: https://cloud.google.com/firestore/docs/reference/rest
[PropertiesService]: https://developers.google.com/apps-script/reference/properties/properties-service
[UrlFetchApp]: https://developers.google.com/apps-script/reference/url-fetch/url-fetch-app
[`ScriptApp.getOAuthToken()`]: https://developers.google.com/apps-script/reference/script/script-app#getoauthtoken
