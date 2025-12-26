class Firestore {
  /**
   * @params {string} projectId
   * @params {string} [databaseId="(default)"]
   */
  constructor(projectId, databaseId = "(default)") {
    this.basePath = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/${databaseId}/documents`;
  }

  // ... omitted

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
}
