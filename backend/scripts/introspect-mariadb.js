require('dotenv').config({ quiet: true });

const mariadb = require('mariadb');
const fs = require('fs');
const path = require('path');

const SYSTEM_DATABASES = new Set([
  'information_schema',
  'mysql',
  'performance_schema',
  'sys',
]);

async function main() {
  const host = process.env.DB_HOST || '127.0.0.1';
  const port = Number(process.env.DB_PORT || '3306');
  const user = process.env.DB_USERNAME;
  const password = process.env.DB_PASSWORD;

  if (!user || !password) {
    throw new Error('DB_USERNAME/DB_PASSWORD not set in environment');
  }

  const pool = mariadb.createPool({
    host,
    port,
    user,
    password,
    connectionLimit: 5,
  });

  let conn;
  try {
    conn = await pool.getConnection();

    const dbRows = await conn.query('SHOW DATABASES');
    const databases = dbRows
      .map((r) => r.Database)
      .filter((name) => name && !SYSTEM_DATABASES.has(name));

    const result = {
      host,
      port,
      user,
      databases: {},
    };

    for (const db of databases) {
      const tableRows = await conn.query(`SHOW TABLES FROM \`${db}\``);
      const tableKey = `Tables_in_${db}`;
      const tables = tableRows.map((r) => r[tableKey]).filter(Boolean);

      result.databases[db] = { tables: {} };

      for (const table of tables) {
        const columns = await conn.query(`SHOW FULL COLUMNS FROM \`${db}\`.\`${table}\``);
        result.databases[db].tables[table] = columns.map((c) => ({
          field: c.Field,
          type: c.Type,
          nullable: c.Null === 'YES',
          key: c.Key,
          default: c.Default,
          extra: c.Extra,
          collation: c.Collation,
          comment: c.Comment,
        }));
      }
    }

    const json = JSON.stringify(result, null, 2);

    // If an output path is provided, write as UTF-8 (avoids PowerShell UTF-16 redirection).
    const outIdx = process.argv.findIndex((a) => a === '--out' || a === '-o');
    const outPath = outIdx >= 0 ? process.argv[outIdx + 1] : null;

    if (outPath) {
      const full = path.isAbsolute(outPath) ? outPath : path.join(process.cwd(), outPath);
      fs.mkdirSync(path.dirname(full), { recursive: true });
      fs.writeFileSync(full, json, 'utf8');
      console.log(`Wrote schema to ${full}`);
      return;
    }

    // Otherwise, print JSON so we can pipe it.
    console.log(json);
  } finally {
    if (conn) conn.release();
    await pool.end();
  }
}

main().catch((err) => {
  // Avoid printing secrets; show only safe error info.
  console.error('Introspection failed:', err?.message || String(err));
  process.exit(1);
});

