/**
 * CONFIGURATION
 * Set 'DB_URL' in Project Settings > Script Properties.
 * Format:
 *   jdbc:postgresql://HOST:5432/DB
 *     ?user=USER&password=PASS&ssl=true
 */
const DB_URL = PropertiesService
  .getScriptProperties()
  .getProperty("DB_URL");

/**
 * HELPER: Centralized Connection Logic
 */
function getDbConnection() {
  if (!DB_URL) throw new Error("DB_URL Script Property is missing.");
  return Jdbc.getConnection(DB_URL);
}
