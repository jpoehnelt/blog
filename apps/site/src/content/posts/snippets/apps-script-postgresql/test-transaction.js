function testTransactionRollback() {
  console.log("[4/4] Testing Transaction Rollback...");
  const conn = getDbConnection();

  // Disable auto-commit to start transaction mode
  conn.setAutoCommit(false);

  try {
    const stmt = conn.createStatement();

    // 1. Valid Insert
    stmt.execute(
      "INSERT INTO gas_test_types (data) " +
        "VALUES ('{\"step\": \"transaction_start\"}')"
    );

    // 2. Simulate Error (e.g., bad SQL syntax or script logic error)
    // This SQL is invalid because column 'fake_col' doesn't exist
    stmt.execute(
      "INSERT INTO gas_test_types (fake_col) VALUES ('fail')"
    );

    conn.commit(); // Should not be reached
  } catch (e) {
    console.log(
      "   -> Caught expected error: " +
        e.message.substring(0, 50) + "..."
    );
    conn.rollback();
    console.log("   -> Rollback executed.");
  } finally {
    conn.close();
  }

  // Verification: Ensure the first insert is NOT in DB
  const verifyConn = getDbConnection();
  const verifyStmt = verifyConn.createStatement();
  const rs = verifyStmt.executeQuery(
    "SELECT count(*) FROM gas_test_types " +
      "WHERE data->>'step' = 'transaction_start'"
  );

  rs.next();
  const count = rs.getInt(1);
  if (count === 0) {
    console.log("   -> Rollback verified: No partial data exists.");
  } else {
    throw new Error("Rollback failed! Partial data found in DB.");
  }

  rs.close();
  verifyStmt.close();
  verifyConn.close();
}
