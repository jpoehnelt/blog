// DEFAULT CONFIGURATION
const DEFAULT_CONFIG = {
  MODE: "DRAFT", // Options: "SEND" or "DRAFT"
  RECIPIENT_SHEET: "Recipients",
  DRAFT_SUBJECT: "Mail Merge Template",
  SENDER_NAME: "My Name",
  SENDER_EMAIL: "" // Optional: "support@yourdomain.com"
};

/**
 * Retrieves the configuration from ScriptProperties, merging with defaults.
 * @return {Object} The complete configuration object.
 */
/**
 * Wrapper to expose config to client-side.
 */
function getConfig() {
  return getConfig_();
}

/**
 * Wrapper to save settings from client-side.
 * @param {Object} settings - The settings object to save.
 */
function saveSettings(settings) {
    saveSettings_(settings);
}

/**
 * Retrieves the configuration from ScriptProperties, merging with defaults.
 * @return {Object} The complete configuration object.
 */
function getConfig_() {
  const props = PropertiesService.getScriptProperties().getProperties();
  return { ...DEFAULT_CONFIG, ...props };
}

/**
 * Saves settings to ScriptProperties.
 * @param {Object} formObject - The form data object from the settings dialog.
 */
function saveSettings_(formObject) {
  const props = PropertiesService.getScriptProperties();
  props.setProperties(formObject);
}
