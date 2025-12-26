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
