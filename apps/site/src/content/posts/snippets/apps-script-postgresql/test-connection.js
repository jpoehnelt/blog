function testConnection() {
  console.log("[1/4] Testing Basic Connection...");
  const conn = getDbConnection();
  const stmt = conn.createStatement();
  const rs = stmt.executeQuery("SELECT version()");

  if (rs.next()) {
    const version = rs.getString(1);
    console.log("   -> Connected: " + version.substring(0, 40) + "...");
  }

  rs.close();
  stmt.close();
  conn.close();
}
