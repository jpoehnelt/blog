function testPerformance() {
  console.log("[perf] Testing Read/Write Performance...");

  const ROWS = 100;
  const insertSql = "INSERT INTO gas_test_perf (value) VALUES (?)";

  // --- Setup ---
  let setupConn, setupStmt;
  try {
    setupConn = getDbConnection();
    setupStmt = setupConn.createStatement();
    setupStmt.execute(`
      CREATE TABLE IF NOT EXISTS gas_test_perf (
        id SERIAL PRIMARY KEY,
        value TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);
    // TRUNCATE is faster than DELETE
    setupStmt.execute(
      "TRUNCATE TABLE gas_test_perf " + "RESTART IDENTITY CASCADE",
    );
  } catch (e) {
    console.error("Setup failed: " + e.message);
    return;
  } finally {
    if (setupStmt) setupStmt.close();
    if (setupConn) setupConn.close();
  }

  // --- New connection, single write (n=1) ---
  let conn1, ps1;
  try {
    const t1ConnStart = Date.now();
    conn1 = getDbConnection();
    const t1ConnMs = Date.now() - t1ConnStart;

    const t1WriteStart = Date.now();
    ps1 = conn1.prepareStatement(insertSql);
    ps1.setString(1, "cold-write");
    ps1.executeUpdate();
    const t1WriteMs = Date.now() - t1WriteStart;

    console.log(
      "   new conn + write (n=1):  " +
        "conn: " +
        t1ConnMs +
        "ms | " +
        "write: " +
        t1WriteMs +
        "ms",
    );
  } catch (e) {
    console.error("Write n=1 failed:", e);
  } finally {
    if (ps1) ps1.close();
    if (conn1) conn1.close();
  }

  // --- New connection, single read (n=1) ---
  let conn2, stmt2, rs2;
  try {
    const t2ConnStart = Date.now();
    conn2 = getDbConnection();
    const t2ConnMs = Date.now() - t2ConnStart;

    const t2ReadStart = Date.now();
    stmt2 = conn2.createStatement();
    rs2 = stmt2.executeQuery("SELECT id, value FROM gas_test_perf LIMIT 1");

    if (rs2.next()) {
      // Extract data to mimic real workload
      rs2.getString("value");
    }
    const t2ReadMs = Date.now() - t2ReadStart;

    console.log(
      "   new conn + read  (n=1):  " +
        "conn: " +
        t2ConnMs +
        "ms | " +
        "read: " +
        t2ReadMs +
        "ms",
    );
  } catch (e) {
    console.error("Read n=1 failed:", e);
  } finally {
    if (rs2) rs2.close();
    if (stmt2) stmt2.close();
    if (conn2) conn2.close();
  }

  // --- Existing connection, batch write & read ---
  let conn3, cleanStmt, ps3, stmt4, rs4;
  try {
    conn3 = getDbConnection();

    cleanStmt = conn3.createStatement();
    cleanStmt.execute(
      "TRUNCATE TABLE gas_test_perf " + "RESTART IDENTITY CASCADE",
    );
    cleanStmt.close();
    cleanStmt = null; // Prevent double-close in finally block

    // -- BATCH WRITE --
    // Disable auto-commit for batch perf
    conn3.setAutoCommit(false);
    ps3 = conn3.prepareStatement(insertSql);

    const t3Start = Date.now();
    for (let i = 0; i < ROWS; i++) {
      ps3.setString(1, "row-" + i);
      ps3.addBatch();
    }
    ps3.executeBatch();
    conn3.commit(); // Explicitly commit the transaction
    const t3Ms = Date.now() - t3Start;

    console.log(
      "   batch write (n=" +
        ROWS +
        "): " +
        (t3Ms / ROWS).toFixed(2) +
        "ms/row" +
        " (Total: " +
        t3Ms +
        "ms)",
    );

    // Restore default state before reading
    conn3.setAutoCommit(true);

    // -- BATCH READ --
    stmt4 = conn3.createStatement();

    // Start timer BEFORE executeQuery
    const t4Start = Date.now();
    rs4 = stmt4.executeQuery(
      "SELECT id, value " + "FROM gas_test_perf ORDER BY id",
    );

    let count = 0;
    while (rs4.next()) {
      count++;
      // Extract data to mimic real workload
      rs4.getString("value");
    }
    const t4Ms = Date.now() - t4Start;

    console.log(
      "   batch read  (n=" +
        count +
        "): " +
        (t4Ms / count).toFixed(2) +
        "ms/row" +
        " (Total: " +
        t4Ms +
        "ms)",
    );
  } catch (e) {
    console.error("Batch test failed:", e);
  } finally {
    if (rs4) rs4.close();
    if (stmt4) stmt4.close();
    if (ps3) ps3.close();
    if (cleanStmt) cleanStmt.close();
    if (conn3) {
      // Best effort pool restore
      try {
        conn3.setAutoCommit(true);
      } catch (e) {}
      conn3.close();
    }
  }
}
