function testModernTypes() {
  console.log("[2/4] Testing UUID & JSONB Support...");
  const conn = getDbConnection();
  const stmt = conn.createStatement();

  // Setup: Create a table with modern types
  stmt.execute(`
    CREATE TABLE IF NOT EXISTS gas_test_types (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      data JSONB,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);

  // Cleanup old test data
  stmt.execute("DELETE FROM gas_test_types");

  const testData = '{"test": "json_parsing", "works": true}';
  const sql =
    "INSERT INTO gas_test_types (data) VALUES (?::jsonb)";
  const ps = conn.prepareStatement(sql);
  ps.setString(1, testData);
  ps.execute();
  ps.close();

  // FETCH: strictly cast to ::text to avoid JDBC driver errors
  const rs = stmt.executeQuery(
    "SELECT id::text, data::text FROM gas_test_types LIMIT 1",
  );

  if (rs.next()) {
    const uuid = rs.getString(1);
    const jsonStr = rs.getString(2);
    const jsonObj = JSON.parse(jsonStr);

    if (jsonObj.works === true) {
      console.log("   -> UUID fetched: " + uuid);
      console.log("   -> JSON parsed successfully: " + jsonStr);
    } else {
      throw new Error("JSON parsing mismatch");
    }
  } else {
    throw new Error("No data returned from insert");
  }

  rs.close();
  stmt.close();
  conn.close();
}
