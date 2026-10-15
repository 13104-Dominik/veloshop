const router = require('express').Router();
const bcrypt = require('bcryptjs');
const db = require('../db');
const { signToken, requireAuth } = require('../middleware/auth');
const { isEmail, isNonEmpty, isPassword } = require('../validators');

const publicUser = (u) => ({ id: u.id, imie: u.imie, email: u.email, rola: u.rola });

router.post('/register', async (req, res, next) => {
  try {
    const { imie, email, haslo } = req.body || {};
    if (!isNonEmpty(imie, 100)) return res.status(400).json({ error: 'Podaj imię.' });
    if (!isEmail(email)) return res.status(400).json({ error: 'Podaj poprawny adres email.' });
    if (!isPassword(haslo)) return res.status(400).json({ error: 'Hasło musi mieć od 8 do 72 znaków.' });

    const existing = await db.query('SELECT id FROM uzytkownicy WHERE email = ?', [email]);
    if (existing.length > 0) return res.status(409).json({ error: 'Konto z tym adresem email już istnieje.' });

    const hash = await bcrypt.hash(haslo, 10);
    const result = await db.query(
      'INSERT INTO uzytkownicy (imie, email, haslo_hash) VALUES (?, ?, ?)',
      [imie.trim(), email, hash]
    );
    const user = { id: result.insertId, imie: imie.trim(), email, rola: 'user' };
    res.status(201).json({ token: signToken(user), user: publicUser(user) });
  } catch (err) { next(err); }
});

router.post('/login', async (req, res, next) => {
  try {
    const { email, haslo } = req.body || {};
    if (!isEmail(email) || typeof haslo !== 'string') {
      return res.status(400).json({ error: 'Podaj email i hasło.' });
    }
    const rows = await db.query('SELECT * FROM uzytkownicy WHERE email = ?', [email]);
    const user = rows[0];
    // Ten sam komunikat dla złego emaila i złego hasła (nie ujawniamy, które konta istnieją)
    if (!user || !(await bcrypt.compare(haslo, user.haslo_hash))) {
      return res.status(401).json({ error: 'Nieprawidłowy email lub hasło.' });
    }
    res.json({ token: signToken(user), user: publicUser(user) });
  } catch (err) { next(err); }
});

router.get('/me', requireAuth, async (req, res, next) => {
  try {
    const rows = await db.query('SELECT id, imie, email, rola FROM uzytkownicy WHERE id = ?', [req.user.id]);
    if (!rows[0]) return res.status(401).json({ error: 'Użytkownik nie istnieje.' });
    res.json(rows[0]);
  } catch (err) { next(err); }
});

module.exports = router;
