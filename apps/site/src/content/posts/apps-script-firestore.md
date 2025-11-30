---
title: Using Firestore in Apps Script
description: >-
  Firestore can be a powerful tool when using Apps Script. This post shows how
  to use the [Firestore REST API] in Apps Script.
pubDate: '2024-01-10'
tags: 'code,google,google workspace,apps script,firestore,google cloud'
---

<script>
  import Note from '$lib/components/content/Note.svelte';
</script>

When using Apps Script, sometimes the [CacheService] and [PropertiesService] do not match the requirements of the project -- perhaps there a need for a longer ttl or storing many more values. In these cases, Firestore can be used!

## Setup

1. To use Firestore in Apps Script, you will need to enable the Firestore API in the [Google Cloud Console](https://console.cloud.google.com/apis/library/firestore.googleapis.com). 
2. You will also need to add the following scopes to your Apps Script project:
  ```js
  {
    "oauthScopes": [
      "https://www.googleapis.com/auth/datastore",
      "https://www.googleapis.com/auth/script.external_request"
    ]
  }
  ```
3. Finally, you will need to set the Cloud project id in the Apps Script settings.
4. Create a collection named `kv` in Firestore so the examples below will work.

This post is going to be using the [Firestore REST API](https://firebase.google.com/docs/firestore/use-rest-api) with OAuth access tokens via [`ScriptApp.getOAuthToken()`]. Alternatively, you could use a service account. 

## UrlFetchApp and the [Firestore REST API]

The [UrlFetchApp] can be used to make requests to the [Firestore REST API]. I wrap the [UrlFetchApp] in two function layers to make it easier to use with the OAuth token and handle errors. The first is a simple wrapper to add the OAuth token to the request header.

```js
/**
 * Wraps the `UrlFetchApp.fetch()` method to always add the 
 * Oauth access token in the header 'Authorization: Bearer TOKEN'.
 * 
 * @params {string} url
 * @params {Object=} params
 * @returns {UrlFetchApp.HTTPResponse}
 */
function fetchWithOauthAccessToken__(url, params = {}) {
  const token = ScriptApp.getOAuthToken();

  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-type": 'application/json',
  };

  params.headers = params.headers ?? {};
  params.headers = { ...headers, ...params.headers };

  return UrlFetchApp.fetch(url, params);
}
```

<Note>

I didn't evaluate the performance impacts of repeated [`ScriptApp.getOAuthToken()`] calls.

</Note>

The second function layer is a wrapper to handle errors and parsing that I included as part of the Firestore class I created (more later).

```js
class Firestore {

  // ... omitted

  fetch(url, options) {
    options = {
      ...options,
      muteHttpExceptions: true
    }

    const response = fetchWithOauthAccessToken__(url, options);

    if (response.getResponseCode() < 300) {
      return JSON.parse(response.getContentText());
    } else {
      throw new Error(response.getContentText());
    }
  }
}
```

## Firestore class for Apps Script

To abstract some of the common methods, I created a Firestore class. This class is not meant to be a complete wrapper of the [Firestore REST API], but rather a starting point.

Below is the `.patch()` method as an example which transforms the payload to JSON and passes it to the `.fetch()` wrapper method.

```js
class Firestore {

  // ... omitted

  /**
   * @params {string} documentPath
   * @params {Object=} params Include parameters such as `updateMask`, `mask`, etc
   * @params {Object=} payload
   */
  patch(documentPath, params = {}, payload) {
    return this.fetch(
      this.url(documentPath, params), 
      { method: Methods.PATCH, payload: JSON.stringify(payload) }
    );
  }
}
```

I also included a `url` method to generate the [Firestore REST API] url and include any parameters. This method is used by the other methods to generate the url.

```js
class Firestore {

  /**
   * @params {string} projectId
   * @params {string} [databaseId="(default)"]
   */
  constructor(projectId, databaseId = "(default)") {
    this.basePath = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/${databaseId}/documents`
  }

  // ... omitted

  /**
   * @params {string} documentPath
   * @params {Object=} params Include parameters such as `updateMask`, `mask`, etc
   */
  url(documentPath, params = {}) {
    return encodeURI([
      `${this.basePath}${documentPath}`, 
      Object.entries(params).map(([k, v]) => `${k}=${v}`).join("&")
      ].join("?"));
  }
}
```

This could be extended as necessary for queries, collections, etc.

## Firestore typed documents

When using the [Firestore REST API], documents are represented with a JSON object containing their types. Below is an example of a document with a nested object and array.

```json
{
  "fields": {
    "name": {
      "stringValue": "John Doe"
    },
    "age": {
      "integerValue": "30"
    },
    "address": {
      "mapValue": {
        "fields": {
          "street": {
            "stringValue": "123 Main St"
          },
          "city": {
            "stringValue": "New York"
          },
          "state": {
            "stringValue": "NY"
          },
          "zip": {
            "stringValue": "10001"
          }
        }
      }
    },
    "hobbies": {
      "arrayValue": {
        "values": [
          {
            "stringValue": "hiking"
          },
          {
            "stringValue": "biking"
          }
        ]
      }
    }
  }
}
```

I didn't bother with wrapping and unwrapping this, but a helper function could do this for you. See this GitHub library, [grahamearley/FirestoreGoogleAppsScript/Document.ts](https://github.com/grahamearley/FirestoreGoogleAppsScript/blob/c8641b1801c1935f7eef7c864f28e0ad18bcaa06/Document.ts) for an example implementation.

## Usage of the Apps Script Firestore class

Below is an example of using the Firestore class to patch, get, and delete a document in a collection I had already created named `kv`.

```js
function main() {
  const db = new FirestoreService(PROJECT_ID, DATABASE_ID);
  const doc = {
    fields: {
      foo: {
        stringValue: "test"
      }
    }
  };

  console.log(db.patch("/kv/test", {}, doc,));
  console.log(db.get("/kv/test"));
  console.log(db.delete("/kv/test"));
}
```

This outputs the following:

```
10:30:56 AM	Notice	Execution started
10:30:57 AM	Info	{ name: 'projects/OMITTED/databases/(default)/documents/kv/test',
  fields: { foo: { stringValue: 'test' } },
  createTime: '2024-01-08T21:52:09.794036Z',
  updateTime: '2024-01-10T18:30:57.728011Z' }
10:30:58 AM	Info	{ name: 'projects/OMITTED/databases/(default)/documents/kv/test',
  fields: { foo: { stringValue: 'test' } },
  createTime: '2024-01-08T21:52:09.794036Z',
  updateTime: '2024-01-10T18:30:57.728011Z' }
10:30:58 AM	Info	{}
10:30:58 AM	Notice	Execution completed
```

## Future experiments with Firestore in Apps Script

- Use Firestore rules for segmenting user data
- Use Firestore as a larger cache than the [CacheService]
- Use a service account instead of OAuth access tokens

<Note>

You may want to consider using the library [FirestoreGoogleAppsScript](https://github.com/grahamearley/FirestoreGoogleAppsScript) instead of the code in this post. It is a more complete wrapper of the [Firestore REST API], however there is a balance to using an incomplete external library vs writing a small amount of code yourself as demonstrated here.

</Note>

## Complete code

```js
const PROJECT_ID = "OMITTED"; // Update this
const DATABASE_ID = "(default)"; // Maybe update this

/**
 * @readonly
 * @enum {string}
 */
var Methods = {
  GET: "GET",
  PATCH: "PATCH",
  POST: "POST",
  DELETE: "DELETE",
};

/**
 * Wrapper for the [Firestore REST API] using `URLFetchApp`.
 * 
 * This functionality requires the following scopes:
 *  "https://www.googleapis.com/auth/datastore",
 *  "https://www.googleapis.com/auth/script.external_request"
 */
class FirestoreService {
  /**
   * @params {string} projectId
   * @params {string} [databaseId="(default)"]
   */
  constructor(projectId, databaseId = "(default)") {
    this.basePath = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/${databaseId}/documents`
  }

  /**
   * @params {string} documentPath
   * @params {Object=} params Include parameters such as `updateMask`, `mask`, etc
   */
  get(documentPath, params = {}) {
    return this.fetch(
      this.url(documentPath, params),
      { method: Methods.GET }
    );
  }

  /**
   * @params {string} documentPath
   * @params {Object=} params Include parameters such as `updateMask`, `mask`, etc
   * @params {Object=} payload
   */
  patch(documentPath, params = {}, payload) {
    return this.fetch(
      this.url(documentPath, params),
      { method: Methods.PATCH, payload: JSON.stringify(payload) }
    );
  }

  /**
   * @params {string} documentPath
   * @params {Object=} params Include parameters such as `updateMask`, `mask`, etc
   * @params {Object=} payload
   */
  create(documentPath, params = {}, payload) {
    return this.fetch(
      this.url(documentPath, params),
      { method: Methods.POST, payload: JSON.stringify(payload) }
    );
  }

  /**
   * @params {string} documentPath
   * @params {Object=} params Include parameters such as `updateMask`, `mask`, etc
   */
  delete(documentPath, params = {}) {
    return this.fetch(
      this.url(documentPath, params),
      { method: Methods.DELETE}
    );
  }

  /**
    * @params {string} documentPath
    * @params {Object=} params Include parameters such as `updateMask`, `mask`, etc
    */
  url(documentPath, params = {}) {
    return encodeURI([
      `${this.basePath}${documentPath}`, 
      Object.entries(params).map(([k, v]) => `${k}=${v}`).join("&")
      ].join("?"));
  }

  /**
   * @params {string} documentPath
   * @params {Methods} method
   * @params {Object} options
   * @params {Object=} params Include parameters such as `updateMask`, `mask`, etc
   */
  fetch(url, options) {
    options = {
      ...options,
      muteHttpExceptions: true
    }

    const response = fetchWithOauthAccessToken__(url, options);

    if (response.getResponseCode() < 300) {
      return JSON.parse(response.getContentText());
    } else {
      throw new Error(response.getContentText());
    }
  }
}

/**
 * Wraps the `UrlFetchApp.fetch()` method to always add the 
 * Oauth access token in the header 'Authorization: Bearer TOKEN'.
 * 
 * @params {string} url
 * @params {Object=} params
 * @returns {UrlFetchApp.HTTPResponse}
 */
function fetchWithOauthAccessToken__(url, params = {}) {
  const token = ScriptApp.getOAuthToken();

  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-type": 'application/json',
  };

  params.headers = params.headers ?? {};
  params.headers = { ...headers, ...params.headers };

  return UrlFetchApp.fetch(url, params);
}

function main() {
  const db = new FirestoreService(PROJECT_ID, DATABASE_ID);
  const doc = {
    fields: {
      foo: {
        stringValue: "test"
      }
    }
  };

  console.log(db.patch("/kv/test", {}, doc,));
  console.log(db.get("/kv/test"));
  console.log(db.delete("/kv/test"));
}
```

[CacheService]: https://developers.google.com/apps-script/reference/cache/cache-service
[Firestore REST API]: https://cloud.google.com/firestore/docs/reference/rest
[PropertiesService]: https://developers.google.com/apps-script/reference/properties/properties-service
[UrlFetchApp]: https://developers.google.com/apps-script/reference/url-fetch/url-fetch-app
[`ScriptApp.getOAuthToken()`]: https://developers.google.com/apps-script/reference/script/script-app#getoauthtoken
