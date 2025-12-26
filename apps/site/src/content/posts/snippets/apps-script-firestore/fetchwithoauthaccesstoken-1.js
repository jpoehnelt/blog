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
    this.basePath = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/${databaseId}/documents`;
  }

  /**
   * @params {string} documentPath
   * @params {Object=} params Include parameters such as `updateMask`, `mask`, etc
   */
  get(documentPath, params = {}) {
    return this.fetch(this.url(documentPath, params), { method: Methods.GET });
  }

  /**
   * @params {string} documentPath
   * @params {Object=} params Include parameters such as `updateMask`, `mask`, etc
   * @params {Object=} payload
   */
  patch(documentPath, params = {}, payload) {
    return this.fetch(this.url(documentPath, params), {
      method: Methods.PATCH,
      payload: JSON.stringify(payload),
    });
  }

  /**
   * @params {string} documentPath
   * @params {Object=} params Include parameters such as `updateMask`, `mask`, etc
   * @params {Object=} payload
   */
  create(documentPath, params = {}, payload) {
    return this.fetch(this.url(documentPath, params), {
      method: Methods.POST,
      payload: JSON.stringify(payload),
    });
  }

  /**
   * @params {string} documentPath
   * @params {Object=} params Include parameters such as `updateMask`, `mask`, etc
   */
  delete(documentPath, params = {}) {
    return this.fetch(this.url(documentPath, params), {
      method: Methods.DELETE,
    });
  }

  /**
   * @params {string} documentPath
   * @params {Object=} params Include parameters such as `updateMask`, `mask`, etc
   */
  url(documentPath, params = {}) {
    return encodeURI(
      [
        `${this.basePath}${documentPath}`,
        Object.entries(params)
          .map(([k, v]) => `${k}=${v}`)
          .join("&"),
      ].join("?"),
    );
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
      muteHttpExceptions: true,
    };

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
    "Content-type": "application/json",
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
        stringValue: "test",
      },
    },
  };

  console.log(db.patch("/kv/test", {}, doc));
  console.log(db.get("/kv/test"));
  console.log(db.delete("/kv/test"));
}
