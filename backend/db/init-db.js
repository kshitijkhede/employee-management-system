/**
 * One-shot database initializer.
 *
 * Reads db/schema.sql and executes it against MySQL so you don't have to
 * run the mysql client manually. Usage:
 *
 *    npm run init-db
 */
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config();

async function init() {
  const sql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');

  // Connect WITHOUT selecting a database (the script creates it).
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    multipleStatements: true,
  });

  console.log('[init-db] Running schema.sql ...');
  await connection.query(sql);
  console.log('[init-db] Done. Database and "employees" table are ready.');
  await connection.end();
}

init().catch((err) => {
  console.error('[init-db] Failed:', err.message);
  process.exit(1);
});
