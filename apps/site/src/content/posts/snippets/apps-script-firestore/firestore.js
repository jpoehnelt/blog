class Firestore {
  // ... omitted

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
}
