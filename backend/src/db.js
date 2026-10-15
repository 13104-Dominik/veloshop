require('dotenv').config();
const mysql = require('mysql2/promise');

// Połączenie SSL (wymagane np. przez Aiven): DB_SSL=true lub DB_SSL_CA z certyfikatem CA
function sslConfig() {
  if (process.env.DB_SSL_CA) return { ca: process.env.DB_SSL_CA.replace(/\\n/g, '\n') };
  if (process.env.DB_SSL === 'true') return { rejectUnauthorized: false };
  return undefined;
}

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'sklep_rowerowy',
  waitForConnections: true,
  connectionLimit: 10,
  decimalNumbers: true,
  ssl: sslConfig(),
});

// Zapytania zawsze parametryzowane (?), co chroni przed SQL Injection.
async function query(sql, params = []) {
  const [rows] = await pool.query(sql, params);
  return rows;
}

// Wykonuje fn(tx) w transakcji; tx.query działa jak query().
async function withTransaction(fn) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const tx = { query: async (sql, params = []) => (await conn.query(sql, params))[0] };
    const result = await fn(tx);
    await conn.commit();
    return result;
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

module.exports = { query, withTransaction, pool };
