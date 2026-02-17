function testPostGIS() {
  console.log("=== STARTING POSTGIS TESTS ===");
  const conn = Jdbc.getConnection(DB_URL);

  try {
    const stmt = conn.createStatement();

    // 1. SETUP: Enable PostGIS & Create Table
    // Note: 'CREATE EXTENSION' might require admin privileges.
    console.log("[1/3] Setting up PostGIS...");
    stmt.execute("CREATE EXTENSION IF NOT EXISTS postgis");

    stmt.execute(`
      CREATE TABLE IF NOT EXISTS spatial_test (
        id SERIAL PRIMARY KEY,
        name TEXT,
        geom GEOMETRY(Point, 4326) -- Standard WGS84 (Lat/Lon)
      )
    `);
    stmt.execute("DELETE FROM spatial_test"); // Clean slate

    // 2. INSERT: Using WKT (Well-Known Text)
    // We use a PreparedStatement to safely insert coordinates
    console.log("[2/3] Inserting Spatial Data...");
    const insertSql =
      "INSERT INTO spatial_test (name, geom) " +
      "VALUES (?, ST_GeomFromText(?, 4326))";
    const ps = conn.prepareStatement(insertSql);

    // Point A: The White House (-77.0365, 38.8977)
    ps.setString(1, "White House");
    ps.setString(2, "POINT(-77.0365 38.8977)");
    ps.addBatch();

    // Point B: The Washington Monument (-77.0353, 38.8895) ~1km away
    ps.setString(1, "Washington Monument");
    ps.setString(2, "POINT(-77.0353 38.8895)");
    ps.addBatch();

    ps.executeBatch();
    ps.close();

    // 3. QUERY: Spatial Math & GeoJSON
    // Ask Postgres to calculate distance
    // and format the result as JSON
    console.log("[3/3] Running Spatial Query...");
    const query = `
      SELECT 
        name, 
        ST_Distance(
          geom::geography, 
          ST_GeomFromText('POINT(-77.0365 38.8977)', 4326)::geography
        ) as meters_away,
        ST_AsGeoJSON(geom)::text as geojson 
      FROM spatial_test
      WHERE ST_DWithin(
        geom::geography, 
        ST_GeomFromText('POINT(-77.0365 38.8977)', 4326)::geography, 
        2000 -- Look for points within 2000 meters
      )
    `;

    const rs = stmt.executeQuery(query);

    while (rs.next()) {
      const name = rs.getString(1);
      const dist = parseFloat(rs.getString(2)).toFixed(0);
      const json = rs.getString(3); // Grab the GeoJSON string

      console.log(` -> Found: ${name}`);
      console.log(`    Distance: ${dist} meters`);
      console.log(`    GeoJSON: ${json}`);
    }

    rs.close();
    stmt.close();
  } catch (e) {
    console.error("PostGIS Test Failed: " + e.message);
    console.error(
      "Ensure your database user has " +
        "permission to 'CREATE EXTENSION postgis'",
    );
  } finally {
    conn.close();
  }
}
