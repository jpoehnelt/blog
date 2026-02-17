function testParameterizedInsert() {
  console.log("[3/4] Testing Parameterized (Secure) Inserts...");
  const conn = getDbConnection();

  const sql = "INSERT INTO gas_test_types (data) VALUES (?::jsonb)";
  const stmt = conn.prepareStatement(sql);

  // Bind variable to the first '?'
  // We stringify because JDBC doesn't know what a JS Object is
  stmt.setString(
    1,
    JSON.stringify({ user: "Secure User", role: "admin" })
  );

  const rows = stmt.executeUpdate();

  if (rows !== 1)
    throw new Error("Parameterized insert failed to affect 1 row.");
  console.log("   -> Secure insert successful.");

  stmt.close();
  conn.close();
}
