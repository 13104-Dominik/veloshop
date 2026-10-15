// Tworzy bazę, tabele, dane przykładowe i konto administratora.
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

// Połączenie SSL (wymagane np. przez Aiven): DB_SSL=true lub DB_SSL_CA z certyfikatem CA
function sslConfig() {
  if (process.env.DB_SSL_CA) return { ca: process.env.DB_SSL_CA.replace(/\\n/g, '\n') };
  if (process.env.DB_SSL === 'true') return { rejectUnauthorized: false };
  return undefined;
}

(async () => {
  const dbName = process.env.DB_NAME || 'sklep_rowerowy';
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    multipleStatements: true,
    charset: 'utf8mb4',
    ssl: sslConfig(),
  });
  await conn.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4`);
  await conn.query(`USE \`${dbName}\``);
  await conn.query(fs.readFileSync(path.join(__dirname, '..', 'db', 'schema.sql'), 'utf8'));

  const [[{ n }]] = await conn.query('SELECT COUNT(*) AS n FROM kategorie');
  if (n === 0) {
    await conn.query(fs.readFileSync(path.join(__dirname, '..', 'db', 'seed.sql'), 'utf8'));
    console.log('Dodano kategorie i rowery.');
  }

  const email = process.env.ADMIN_EMAIL || 'admin@veloshop.pl';
  const [admins] = await conn.query('SELECT id FROM uzytkownicy WHERE email = ?', [email]);
  if (admins.length === 0) {
    const hash = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'Admin123!', 10);
    await conn.query("INSERT INTO uzytkownicy (imie, email, haslo_hash, rola) VALUES ('Administrator', ?, ?, 'admin')", [email, hash]);
    console.log('Utworzono konto administratora:', email);
  }
  await conn.end();
  console.log('Baza gotowa.');
})().catch((e) => { console.error(e); process.exit(1); });
