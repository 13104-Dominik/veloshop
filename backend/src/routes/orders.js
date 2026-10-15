const router = require('express').Router();
const db = require('../db');
const { requireAuth, requireAdmin } = require('../middleware/auth');
const { isNonEmpty, isPhone, isPositiveInt } = require('../validators');

const STATUSES = ['nowe', 'w realizacji', 'wyslane', 'anulowane'];

// POST /api/orders - ceny pobierane z bazy, nigdy z żądania klienta
router.post('/', requireAuth, async (req, res, next) => {
  try {
    const { imie_nazwisko, adres, telefon, items } = req.body || {};
    if (!isNonEmpty(imie_nazwisko, 100)) return res.status(400).json({ error: 'Podaj imię i nazwisko.' });
    if (!isNonEmpty(adres, 200)) return res.status(400).json({ error: 'Podaj adres dostawy.' });
    if (!isPhone(telefon)) return res.status(400).json({ error: 'Podaj poprawny numer telefonu.' });
    if (!Array.isArray(items) || items.length === 0 || items.length > 50) {
      return res.status(400).json({ error: 'Koszyk jest pusty.' });
    }
    for (const it of items) {
      if (!it || !isPositiveInt(it.rower_id) || !isPositiveInt(it.ilosc) || it.ilosc > 99) {
        return res.status(400).json({ error: 'Nieprawidłowe pozycje zamówienia.' });
      }
    }

    const orderId = await db.withTransaction(async (tx) => {
      const ids = [...new Set(items.map((i) => i.rower_id))];
      const bikes = await tx.query('SELECT id, nazwa, cena FROM rowery WHERE id IN (?)', [ids]);
      const byId = new Map(bikes.map((b) => [b.id, b]));
      let suma = 0;
      for (const it of items) {
        const b = byId.get(it.rower_id);
        if (!b) {
          const e = new Error('Nie znaleziono roweru o id ' + it.rower_id);
          e.status = 400;
          throw e;
        }
        suma += b.cena * it.ilosc;
      }
      suma = Math.round(suma * 100) / 100;
      const r = await tx.query(
        'INSERT INTO zamowienia (uzytkownik_id, imie_nazwisko, adres, telefon, suma_calkowita) VALUES (?, ?, ?, ?, ?)',
        [req.user.id, imie_nazwisko.trim(), adres.trim(), telefon.trim(), suma]
      );
      for (const it of items) {
        const b = byId.get(it.rower_id);
        await tx.query(
          'INSERT INTO elementy_zamowienia (zamowienie_id, rower_id, nazwa_roweru, cena, ilosc) VALUES (?, ?, ?, ?, ?)',
          [r.insertId, b.id, b.nazwa, b.cena, it.ilosc]
        );
      }
      return r.insertId;
    });
    res.status(201).json({ id: orderId });
  } catch (err) { next(err); }
});

async function withItems(orders) {
  if (orders.length === 0) return orders;
  const ids = orders.map((o) => o.id);
  const items = await db.query('SELECT * FROM elementy_zamowienia WHERE zamowienie_id IN (?)', [ids]);
  return orders.map((o) => ({ ...o, elementy: items.filter((i) => i.zamowienie_id === o.id) }));
}

router.get('/my', requireAuth, async (req, res, next) => {
  try {
    const orders = await db.query('SELECT * FROM zamowienia WHERE uzytkownik_id = ? ORDER BY id DESC', [req.user.id]);
    res.json(await withItems(orders));
  } catch (err) { next(err); }
});

router.get('/', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const orders = await db.query(
      'SELECT z.*, u.email FROM zamowienia z JOIN uzytkownicy u ON u.id = z.uzytkownik_id ORDER BY z.id DESC'
    );
    res.json(await withItems(orders));
  } catch (err) { next(err); }
});

router.patch('/:id/status', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const { status } = req.body || {};
    if (!isPositiveInt(id)) return res.status(400).json({ error: 'Nieprawidłowy identyfikator.' });
    if (!STATUSES.includes(status)) return res.status(400).json({ error: 'Nieprawidłowy status.' });
    const r = await db.query('UPDATE zamowienia SET status = ? WHERE id = ?', [status, id]);
    if (r.affectedRows === 0) return res.status(404).json({ error: 'Nie znaleziono zamówienia.' });
    res.json({ id, status });
  } catch (err) { next(err); }
});

module.exports = router;
