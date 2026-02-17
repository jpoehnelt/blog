function getDbConnection() {
  const MAX_RETRIES = 3;
  for (let i = 0; i < MAX_RETRIES; i++) {
    try {
      return Jdbc.getConnection(DB_URL);
    } catch (e) {
      console.log("Connection failed (sleeping?): " + e.message);
      Utilities.sleep(5000); // Wait 5 seconds and try again
    }
  }
  throw new Error("DB unreachable after retries");
}
