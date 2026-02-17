---
title: "How to Connect PostgreSQL to Google Apps Script (JDBC Guide)"
description: >-
  Learn how to connect Google Apps Script to PostgreSQL using the Jdbc service. Includes connection string conversion, JSONB/UUID workarounds, parameterized queries, transactions, PostGIS spatial queries, and a full test suite with performance benchmarks.
pubDate: "2026-02-17"
tags:
  - code
  - google
  - google workspace
  - apps script
  - postgresql
  - jdbc
  - database
  - postgis
  - spatial
faq:
  - question: "Does Google Apps Script support PostgreSQL?"
    answer: "Yes! Apps Script's Jdbc service now supports PostgreSQL connections. You can connect to any PostgreSQL provider (Neon, Supabase, etc.) using the jdbc:postgresql:// connection format."
  - question: "Why does my Postgres connection string fail in Apps Script?"
    answer: "Apps Script uses a Java-based JDBC driver that doesn't support the modern postgres://user:pass@host/db URI syntax. You must convert it to the JDBC format: jdbc:postgresql://host:5432/db?user=x&password=y&ssl=true."
  - question: "How do I use JSONB and UUID types in Apps Script?"
    answer: "Apps Script's JDBC driver doesn't natively handle JSONB and UUID types. The workaround is to cast them to ::text in your SELECT queries, then parse the results in JavaScript."
  - question: "Are parameterized queries supported in Apps Script JDBC?"
    answer: "Yes. Use conn.prepareStatement(sql) with ? placeholders and stmt.setString() to bind values. This protects against SQL injection just like in any JDBC application."
  - question: "Can I use PostGIS with Apps Script?"
    answer: "Yes! If your PostgreSQL provider supports PostGIS (most do), you can run spatial queries — distance calculations, proximity searches, and GeoJSON output — directly from Apps Script."
  - question: "How fast is PostgreSQL from Apps Script?"
    answer: "Connection setup takes ~250ms. On an existing connection, batch writes average ~50ms/row and reads ~50ms/row. The main bottleneck is connection overhead, so reuse connections and use a connection pooler for production workloads."
  - question: "Does Apps Script support connection pooling with PostgreSQL?"
    answer: "Apps Script itself doesn't pool connections, but most managed PostgreSQL providers (like Neon and Supabase) offer built-in connection poolers. Use the pooled connection URL to avoid exhausting database connections when multiple users trigger your script simultaneously."
---

<script>
  import Snippet from "$lib/components/content/Snippet.svelte";
  import SnippetMerged from "$lib/components/content/SnippetMerged.svelte";
  import Note from '$lib/components/content/Note.svelte';
  import Tldr from '$lib/components/content/Tldr.svelte';
</script>

<Tldr>

Apps Script now supports **PostgreSQL** through `Jdbc.getConnection()`. The catch: you can't use the modern `postgres://` connection string format — you must convert it to JDBC's `jdbc:postgresql://` format.

</Tldr>

Many of you have been waiting for this one. Google Apps Script's [`Jdbc` service] has quietly added **PostgreSQL support**, and it opens up a huge range of possibilities for connecting your spreadsheets, forms, and automations directly to one of the most popular relational databases in the world — no middleware required.

But before you copy your Neon or Supabase connection string and paste it in, there's a gotcha you need to know about.

## Converting your PostgreSQL connection string for Apps Script

Every modern Postgres provider — [Neon](https://neon.tech), [Supabase](https://supabase.com), [Railway](https://railway.app) — gives you a connection string that looks like this:

```
postgres://user:pass@ep-cool-name-123.us-east-2.aws.neon.tech/mydb?sslmode=require
```

**This will not work in Apps Script.** If you paste it directly into `Jdbc.getConnection()`, you'll get an unhelpful error.

The fix is to convert it to the JDBC format that Apps Script expects:

```
jdbc:postgresql://ep-cool-name-123.us-east-2.aws.neon.tech:5432/mydb?user=user&password=pass&ssl=true
```

Here's the full breakdown of what changes:

| Component      | Modern Format (Neon, Supabase)        | Apps Script (JDBC)                           |
| :------------- | :------------------------------------ | :------------------------------------------- |
| **Protocol**   | `postgres://` or `postgresql://`      | `jdbc:postgresql://`                         |
| **Auth**       | Inline: `user:password@host`          | Parameters: `?user=x&password=y`             |
| **Port**       | Often implicit (defaults to 5432)     | Must be explicit: `:5432`                    |
| **SSL**        | `sslmode=require`                     | `ssl=true` (JDBC doesn't support `sslmode`)  |

<Note>

Store your JDBC URL in **Script Properties** (`Project Settings > Script Properties`), not in your source code. Never hardcode credentials. See [/posts/apps-script-secrets-management] for more on managing secrets in Apps Script.

</Note>

## Setting up the connection

Here's how I configure the connection. The JDBC URL is stored in Script Properties under the key `DB_URL`:

<Snippet src="./snippets/apps-script-postgresql/config.js" />

## Testing PostgreSQL from Apps Script

I put together a test suite to validate that the full PostgreSQL stack actually works from Apps Script. These aren't just "hello world" queries — each test targets a specific failure mode.

Here's why I test these four things:

1. **Connectivity** — Validates the SSL handshake and credentials are all correct.
2. **Modern Types** — Apps Script's JDBC driver fails on `JSONB` and `UUID` unless you cast to `::text`. This test proves the workaround.
3. **Parameterized Queries** — Proof that `prepareStatement` works, protecting against SQL injection.
4. **Transactions** — Proof that if your script times out (a [common occurrence in Apps Script](https://developers.google.com/apps-script/guides/services/quotas)), the database isn't left in a corrupted state.

### Test 1: Basic connectivity

The simplest possible query — `SELECT version()`. If this passes, your SSL handshake, credentials, and network path are all correct.

<Snippet src="./snippets/apps-script-postgresql/test-connection.js" />

### Test 2: UUID and JSONB support

This is the test that will save you hours of potential debugging. Apps Script's JDBC driver doesn't know how to deserialize Postgres's `JSONB` and `UUID` types natively. The fix is simple but non-obvious: **cast everything to `::text`** in your `SELECT` statement.

<Snippet src="./snippets/apps-script-postgresql/test-modern-types.js" />

The key line is:

```sql
SELECT id::text, data::text FROM gas_test_types LIMIT 1
```

Without `::text`, you get a cryptic JDBC error. With it, you get clean strings that `JSON.parse()` handles perfectly.

### Test 3: Parameterized queries

If you're inserting user-generated data, you **must** use `prepareStatement` with `?` placeholders instead of string concatenation. This is the same pattern used in any JDBC application — the driver handles escaping for you.

<Snippet src="./snippets/apps-script-postgresql/test-parameterized.js" />

<Note>

Note the `?::jsonb` cast in the SQL. The `?` is the JDBC placeholder, and `::jsonb` tells Postgres to treat the bound string as JSON. This way you can pass a `JSON.stringify()`'d object directly.

</Note>

### Test 4: Transaction rollback

Apps Script has a [6-minute execution limit](https://developers.google.com/apps-script/guides/services/quotas). If your script is in the middle of a multi-step database operation when it times out, you need to know that your data is safe.

This test proves that `conn.setAutoCommit(false)` plus `conn.rollback()` works as expected — a valid insert followed by an invalid one results in _neither_ being committed.

<Snippet src="./snippets/apps-script-postgresql/test-transaction.js" />

### Test 5: Batch read/write performance

How fast is the JDBC bridge, really? This test inserts 100 rows using `addBatch()`/`executeBatch()` and reads them back, logging per-row timing so you know what to expect.

<Snippet src="./snippets/apps-script-postgresql/test-perf.js" />

## Running the full suite

Wire it all up with a single entry point:

<Snippet src="./snippets/apps-script-postgresql/run-all-tests.js" />

If everything is configured correctly, you should see:

```
=== STARTING POSTGRES TESTS ===
[1/4] Testing Basic Connection...
   -> Connected: PostgreSQL 18.1 (a027103) on aarch64-unk...
[2/4] Testing UUID & JSONB Support...
   -> UUID fetched: 543cd4a1-6e72-4fd8-b492-497df26ce5b7
   -> JSON parsed successfully: {"test": "json_parsing", "works": true}
[3/4] Testing Parameterized (Secure) Inserts...
   -> Secure insert successful.
[4/4] Testing Transaction Rollback...
   -> Caught expected error: ERROR: column "fake_col" of relation "gas_test_typ...
   -> Rollback executed.
   -> Rollback verified: No partial data exists.
[perf] Testing Read/Write Performance...
   new conn + write (n=1):  conn: 248ms | write: 116ms
   new conn + read  (n=1):  conn: 251ms | read:  120ms
   batch write (n=100): 51.02ms/row (Total: 5102ms)
   batch read  (n=100): 51.36ms/row (Total: 5136ms)
=== ALL TESTS PASSED SUCCESSFULLY ===
```

Your numbers will vary depending on the region of your database. These results are from a Neon instance in US East.

## Bonus: PostGIS spatial queries

If your Postgres provider supports [PostGIS](https://postgis.net/), you get full spatial query support from Apps Script. That means distance calculations, proximity searches, and GeoJSON output — all in a server-side script.

This test enables PostGIS, inserts two points using [WKT (Well-Known Text)](https://en.wikipedia.org/wiki/Well-known_text_representation_of_geometry), and then runs a proximity query that calculates distances and returns GeoJSON:

<Snippet src="./snippets/apps-script-postgresql/test-postgis.js" />

The `ST_Distance` function with `::geography` casting gives you real-world meters (not degrees), and `ST_AsGeoJSON` produces standard GeoJSON you can drop straight into a map library. The `ST_DWithin` filter keeps the query efficient by only looking at points within a 2 km radius.

<Note>

The `CREATE EXTENSION postgis` command may require admin/superuser privileges. Most managed Postgres providers pre-enable PostGIS or let you enable it from their dashboard.

</Note>

## Common PostgreSQL + Apps Script problems

Once you've confirmed everything works, here are the four things that will bite you in production.

### 1. The firewall "whitelisting" nightmare

Google Apps Script does **not** run on a static IP address. It runs on a massive, dynamic range of Google IPs that change frequently.

- **The trap:** You try to secure your database by only allowing connections from your server's IP. Your script fails immediately.
- **The failed fix:** You try to whitelist Google's IP ranges. The list is huge, changes often, and is a maintenance burden.
- **The real fix:**
  - **Option A (cloud providers):** Rely on **SSL/TLS authentication** rather than IP whitelisting. Set your firewall to `0.0.0.0/0` (allow all) but **enforce** `ssl=true` in your JDBC URL and use a strong, long password. This is the standard approach for most managed Postgres providers.
  - **Option B (enterprise/on-prem):** If you _must_ have a static IP (e.g., for a corporate database), Apps Script can't connect directly. You might want to consider a proxy.

### 2. The "connection storm"

Apps Script is serverless in the truest sense. Every time your script runs — a form submission trigger, a scheduled job, a menu click — it spins up a _fresh_ instance and opens a _new_ connection to Postgres.

- **The trap:** If 100 people submit your form in 1 minute, Apps Script attempts 100 simultaneous connections.
- **The result:** `FATAL: remaining connection slots are reserved for non-replication superuser roles`. Your app crashes.
- **The fix:** Use a **connection pooler**. Some providers include this out of the box — look for the `-pooler` suffix in your connection URL or enable it in your provider's dashboard. The pooler funnels thousands of incoming requests into a few stable connections to the actual database. _Always_ use the pooled connection string for Apps Script, never the direct one. PgBouncer is a popular open-source connection pooler if you need to set this up yourself.

### 3. The cold start timeout

Apps Script has a strict [6-minute runtime limit](https://developers.google.com/apps-script/guides/services/quotas). Serverless databases often "scale to zero" when idle to save costs.

- **The trap:** Your nightly script tries to connect, but the database takes 5–10 seconds to wake up. The JDBC driver times out before the database is ready.
- **The fix:** Implement a retry loop in your connection logic:

<Snippet src="./snippets/apps-script-postgresql/retry-connection.js" />

### 4. The silent data corruption (timezones)

Apps Script (JavaScript) and your database (Postgres) might disagree on what time it is.

- **The trap:** You insert `new Date()` from Apps Script. It sends `2026-02-17 10:00:00`. Is that UTC? EST? PST?
- **The result:** Your "Daily Report" runs at midnight but misses the last 4 hours of data because Postgres thinks those records are from "tomorrow."
- **The fix:**
  - **Database side:** Always use `TIMESTAMPTZ` (Timestamp with Time Zone) columns, never bare `TIMESTAMP`.
  - **Script side:** Let Postgres handle timestamp generation using `NOW()` or `CURRENT_TIMESTAMP` in the SQL query itself, rather than passing a JavaScript `Date` object.

```sql
-- Safe: let Postgres generate the timestamp
INSERT INTO logs (message, created_at) VALUES (?, NOW())
```

## What this unlocks

With a real PostgreSQL database behind Apps Script, you're no longer limited to the 1000-item ceiling of [PropertiesService](/posts/apps-script-key-value-stores/) or the 10 MB cap on Sheets. You can now build Apps Script automations that:

- **Store structured data** with proper schemas, indexes, and constraints.
- **Run complex queries** — joins, aggregations, window functions — directly from your script.
- **Scale** with your Postgres provider's infrastructure instead of fighting Apps Script storage limits.
- **Share data** between Apps Script projects, web apps, and backend services through a single database.

The combination of Apps Script's deep Google Workspace integration and PostgreSQL's power as a general-purpose database is genuinely useful. I'm excited to see what people build with it.

## Complete code

Here's everything in a single file you can paste into the Apps Script editor:

<SnippetMerged srcs="./snippets/apps-script-postgresql/config.js,./snippets/apps-script-postgresql/run-all-tests.js,./snippets/apps-script-postgresql/test-connection.js,./snippets/apps-script-postgresql/test-modern-types.js,./snippets/apps-script-postgresql/test-parameterized.js,./snippets/apps-script-postgresql/test-transaction.js,./snippets/apps-script-postgresql/test-perf.js" />

[`Jdbc` service]: https://developers.google.com/apps-script/reference/jdbc
