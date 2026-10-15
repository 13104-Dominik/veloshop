const express = require('express');
const db = require('../db');
const { requireAuth, requireAdmin } = require('../middleware/auth');
const { isNonEmpty, isPrice, isPositiveInt } = require('../validators');

const router = express.Router();
const categoriesRouter = express.Router();

// GET /api/categories
categoriesRouter.get('/', async (req, res, next) => {
  try {
    res.json(await db.query('SELECT id, nazwa, opis FROM kategorie ORDER BY id'));
  } catch (err) { next(err); }
});

// GET /api/bikes?kategoria=1&q=trek
router.get('/', async (req, res, next) => {
  try {
    const where = [];
    const params = [];
    if (req.query.kategoria !== undefined) {
      const id = Number(req.query.kategoria);
      if (!isPositiveInt(id)) return res.status(400).json({ error: 'Nieprawidłowy identyfikator kategorii.' });
      where.push('kategoria_id = ?');
      params.push(id);
    }
    if (typeof req.query.q === 'string' && req.query.q.trim()) {
      where.push('(nazwa LIKE ? OR marka LIKE ?)');
      const like = `%${req.query.q.trim()}%`;
      params.push(like, like);
    }
    const sql = 'SELECT * FROM rowery' + (where.length ? ' WHERE ' + where.join(' AND ') : '') + ' ORDER BY id';
    res.json(await db.query(sql, params));
  } catch (err) { next(err); }
});

router.get('/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!isPositiveInt(id)) return res.status(400).json({ error: 'Nieprawidłowy identyfikator.' });
    const rows = await db.query('SELECT * FROM rowery WHERE id = ?', [id]);
    if (!rows[0]) return res.status(404).json({ error: 'Nie znaleziono roweru.' });
    res.json(rows[0]);
  } catch (err) { next(err); }
});

function validateBike(body) {
  const { nazwa, marka, cena, kategoria_id, zdjecie } = body || {};
  if (!isNonEmpty(nazwa, 100)) return 'Podaj nazwę roweru.';
  if (!isNonEmpty(marka, 50)) return 'Podaj markę.';
  if (!isPrice(cena)) return 'Cena musi być liczbą większą od zera.';
  if (!isPositiveInt(kategoria_id)) return 'Wybierz kategorię.';
  if (zdjecie !== undefined && zdjecie !== null && zdjecie !== '' && !isNonEmpty(zdjecie, 200)) return 'Nieprawidłowa ścieżka zdjęcia.';
  return null;
}

router.post('/', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const err = validateBike(req.body);
    if (err) return res.status(400).json({ error: err });
    const { nazwa, marka, cena, kategoria_id, zdjecie } = req.body;
    const result = await db.query(
      'INSERT INTO rowery (nazwa, marka, cena, kategoria_id, zdjecie) VALUES (?, ?, ?, ?, ?)',
      [nazwa.trim(), marka.trim(), cena, kategoria_id, zdjecie || null]
    );
    res.status(201).json({ id: result.insertId, nazwa, marka, cena, kategoria_id, zdjecie: zdjecie || null });
  } catch (e) {
    if (e.code === 'ER_NO_REFERENCED_ROW_2') return res.status(400).json({ error: 'Wybrana kategoria nie istnieje.' });
    next(e);
  }
});

router.put('/:id', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!isPositiveInt(id)) return res.status(400).json({ error: 'Nieprawidłowy identyfikator.' });
    const err = validateBike(req.body);
    if (err) return res.status(400).json({ error: err });
    const { nazwa, marka, cena, kategoria_id, zdjecie } = req.body;
    const result = await db.query(
      'UPDATE rowery SET nazwa = ?, marka = ?, cena = ?, kategoria_id = ?, zdjecie = ? WHERE id = ?',
      [nazwa.trim(), marka.trim(), cena, kategoria_id, zdjecie || null, id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Nie znaleziono roweru.' });
    res.json({ id, nazwa, marka, cena, kategoria_id, zdjecie: zdjecie || null });
  } catch (e) {
    if (e.code === 'ER_NO_REFERENCED_ROW_2') return res.status(400).json({ error: 'Wybrana kategoria nie istnieje.' });
    next(e);
  }
});

router.delete('/:id', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!isPositiveInt(id)) return res.status(400).json({ error: 'Nieprawidłowy identyfikator.' });
    const result = await db.query('DELETE FROM rowery WHERE id = ?', [id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Nie znaleziono roweru.' });
    res.status(204).end();
  } catch (e) {
    if (e.code === 'ER_ROW_IS_REFERENCED_2') {
      return res.status(409).json({ error: 'Nie można usunąć roweru, który występuje w zamówieniach.' });
    }
    next(e);
  }
});

module.exports = { bikesRouter: router, categoriesRouter };
