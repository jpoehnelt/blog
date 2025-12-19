---
title: Key Value Store Options in Google Apps Script
description: >-
  A comparison of key-value store options in Google Apps Script, including
  PropertiesService, CacheService, Firestore, and Sheet Developer Metadata.
pubDate: "2024-03-16"
tags:
  - code
  - google
  - google workspace
  - apps script
  - firestore
  - google cloud
  - key value store
  - cache
  - sheets
---

<script>
  import Note from '$lib/components/content/Note.svelte';
</script>

In Google Apps Script, there are a few options for key-value stores. This post will cover the following options:

- [PropertiesService] (User, Script, and Document Properties)
- [CacheService] (User and Script Caches)
- [Firestore]
- [Sheet Developer Metadata] (not tested here)

Here is a quick comparison of the options:

| Option                     | Item Size | Items                                                                                           | Cost                                                        | Expiration | Access Control            |
| -------------------------- | --------- | ----------------------------------------------------------------------------------------------- | ----------------------------------------------------------- | ---------- | ------------------------- |
| [PropertiesService]        | 9KB       | 1000                                                                                            | Free                                                        | No         | Yes (Separate Properties) |
| [CacheService]             | 1KB       | 1000                                                                                            | Free                                                        | Yes        | Yes (Separate Caches)     |
| [Firestore]                | 1GB       | [unlimited](https://firebase.google.com/docs/firestore/quotas#collections_documents_and_fields) | [Pay as you go](https://cloud.google.com/firestore/pricing) | Yes        | Yes (Rules)               |
| [Sheet Developer Metadata] | 2MB       | ?                                                                                               | Free                                                        | No         | No                        |

You might have noticed I left off a key element here, latency, because I want cover that under below.

## Latency Comparisons

The latency of each option is important to consider when choosing a key-value store. All of the tests run below assumed the store was not empty to simulate a real-world scenario.

<Note>

There is a lot of variability in the latency of these stores and a larger sample over multiple days is required!

</Note>

## Open Questions

- What happens when there is concurrent access to the key-value store?
- What happens when the script is run in different environments (e.g., add-on, web app, API)?

## Decision Guidance

**Do I need expiration?**

- No expiration: Use [CacheService], [PropertiesService], or [Firestore]
- Expiration: Use [CacheService] or [Firestore]

Of course these are only guideline and you can do any number of things with keys, e.g. use a key suffix to simulate a ttl.

```javascript
const keyToday = `${key}-${new Date().toISOString().split("T")[0]}`;
```

**How many items am I storing?**

- Small number of items: Use [CacheService], [PropertiesService]
- Large number of items: Use [Firestore]

**How large of values am I storing?**

- Small data: Use [CacheService], [PropertiesService]
- Moderate (1KB-9KB): Use [PropertiesService]
- Large data: Use [Firestore]

**How important is access control?**

- User-specific data: Use [PropertiesService], [CacheService], or [Firestore]
- Audit logs: Use [Firestore]

**How sensitive is my application to latency?**

- Low latency: Use [CacheService] or [PropertiesService]
- Prefer user specific `CacheService.getUserCache()`, `PropertiesService.getUserProperties()`
- Latency insensitive: Use [Firestore]

**How important is cost?**

- Free: Use [CacheService], [PropertiesService], `Sheet Developer Metadata`
- Pay as you go: Use [Firestore] (likely free for most use cases)

## Background

Below is an overview of each key-value store option in Google Apps Script.

### CacheService

The [CacheService] in Google Apps Script provides a way to store key-value pairs in memory for a certain period of time. It offers two types of caches: User Cache and Script Cache.

- User Cache: This cache is associated with the user running the script. It can be used to store user-specific data that needs to be accessed across different script executions.
- Script Cache: This cache is associated with the script itself. It can be used to store script-specific data that needs to be accessed by all users running the script.

Items stored in the [CacheService] have a maximum size of 1KB per item and a total limit of 1000 items for each cache. When you hit this limit, you will see the following error:

```sh
Exception: Argument too large: value
```

To learn more about [CacheService] and its methods, you can refer to the [official documentation](https://developers.google.com/apps-script/reference/cache/cache-service).

### PropertiesService

The [PropertiesService] in Google Apps Script provides a way to store key-value pairs. It offers three types of properties: User Properties, Script Properties, and Document Properties.

- User Properties: [`PropertiesService.getUserProperties()`](<https://developers.google.com/apps-script/reference/properties/properties-service#getUserProperties()>) These properties are associated with the user running the script and are stored in the user's Google Account. They are accessible across different scripts and can be used to store user-specific data.
- Script Properties: [`PropertiesService.getScriptProperties()`](<https://developers.google.com/apps-script/reference/properties/properties-service#getScriptProperties()>) These properties are associated with the script itself and are stored in the script project. They are accessible by all users running the script and can be used to store script-specific data.
- Document Properties: [`PropertiesService.getDocumentProperties()`](<https://developers.google.com/apps-script/reference/properties/properties-service#getDocumentProperties()>) These properties are associated with a specific document and are stored in the document itself. They are accessible by all users who have access to the document and can be used to store document-specific data.

Properties stored using [PropertiesService] have a maximum size of 9KB per property and a total limit of 500KB for all properties combined. When you hit this limit, you will see the following error:

```sh
Exception: You have exceeded the property storage quota.
  Please remove some properties and try again.
```

To match the [CacheService] interface I wrapped the [PropertiesService] in a class:

```javascript
class PropertiesWrapper {
  /**
   * @params {Properties} properties
   */
  constructor(properties) {
    this.properties = properties;
  }
  /**
   * @params {String} k
   * @params {String} v
   */
  put(k, v) {
    this.properties.setProperties({ k: v });
  }

  /**
   * @params {String} k
   * @returns {String|undefined}
   */
  get(k) {
    return this.properties.getProperty(k);
  }
}
```

To learn more about [PropertiesService] and its methods, you can refer to the [official documentation](https://developers.google.com/apps-script/reference/properties/properties-service).

### Sheet Developer Metadata

The Sheet Developer Metadata is a feature in Google Sheets that allows developers to store custom metadata associated with a spreadsheet. This metadata can be used to store additional information or settings related to the spreadsheet.

With Sheet Developer Metadata, developers can create and manage metadata keys and values, which can be accessed programmatically using the Google Sheets API. This provides a way to store and retrieve custom information about a spreadsheet, such as configuration settings, tracking data, or any other relevant data.

The main limitation here will be rate limits and you may see an error like this (you can request increases in quotas):

```sh
GoogleJsonResponseException: API call to sheets.spreadsheets.batchUpdate failed with error:
  Quota exceeded for quota metric 'Write requests' and limit 'Write requests per minute per
    user' of service 'sheets.googleapis.com' for consumer 'project_number:1234567890'
```

To learn more about Sheet Developer Metadata and its usage, you can refer to the [official documentation](https://developers.google.com/sheets/api/guides/metadata).

### Firestore

Firestore is a flexible, scalable, and fully managed NoSQL document database provided by Google Cloud. It is designed to store, sync, and query data for web, mobile, and server applications. Firestore offers real-time data synchronization, automatic scaling, and powerful querying capabilities.

With Firestore, you can store and retrieve structured data in the form of documents organized into collections. It supports a wide range of data types and provides features like transactions, indexes, and security rules for fine-grained access control. Compared to other possible stores, the free quota for Firestore should cover equivalent usage. You can refer to the [pricing page](https://cloud.google.com/firestore/pricing) for more details. Firestore now has TTL. See this [blog post](https://cloud.google.com/blog/products/databases/manage-storage-costs-using-time-to-live-in-firestore).

To learn more about Firestore and its features, you can refer to the [official documentation](https://firebase.google.com/docs/firestore) or read my blog post on [Using Firestore in Apps Script](/posts/apps-script-firestore/).

## Conclusion

The choice of key-value store in Google Apps Script depends on the specific use case and requirements. Each option has its own advantages and limitations, and it's important to consider factors like item size, item count, cost, expiration, and access control when making a decision.

[Firestore]: https://firebase.google.com/docs/firestore
[PropertiesService]: https://developers.google.com/apps-script/reference/properties/properties-service
[CacheService]: https://developers.google.com/apps-script/reference/cache/cache-service
[Sheet Developer Metadata]: https://developers.google.com/sheets/api/guides/metadata
