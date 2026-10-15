jest.mock('../src/db');
const request = require('supertest');
const db = require('../src/db');
const app = require('../src/app');
const { userToken, adminToken, bearer } = require('./helpers');

beforeEach(() => jest.resetAllMocks());

const dane = { imie_nazwisko: 'Jan Kowalski', adres: 'ul. Kwiatowa 1, 00-001 Warszawa', telefon: '123 456 789' };

describe('POST /api/orders', () => {
  test('wymaga logowania', async () => {
    const res = await request(app).post('/api/orders').send({ ...dane, items: [{ rower_id: 1, ilosc: 1 }] });
    expect(res.status).toBe(401);
  });
  test('odrzuca pusty koszyk', async () => {
    const res = await request(app).post('/api/orders').set(bearer(userToken())).send({ ...dane, items: [] });
    expect(res.status).toBe(400);
  });
  test('odrzuca nieprawidłową ilość', async () => {
    const res = await request(app).post('/api/orders').set(bearer(userToken())).send({ ...dane, items: [{ rower_id: 1, ilosc: 0 }] });
    expect(res.status).toBe(400);
  });
  test('liczy sumę z cen w bazie, a nie z żądania', async () => {
    const tx = { query: jest.fn() };
    tx.query
      .mockResolvedValueOnce([{ id: 1, nazwa: 'A', cena: 100.1 }, { id: 2, nazwa: 'B', cena: 200 }])
      .mockResolvedValueOnce({ insertId: 55 })
      .mockResolvedValue({});
    db.withTransaction.mockImplementation((fn) => fn(tx));

    const res = await request(app).post('/api/orders').set(bearer(userToken()))
      .send({ ...dane, items: [{ rower_id: 1, ilosc: 2, cena: 1 }, { rower_id: 2, ilosc: 1 }] });

    expect(res.status).toBe(201);
    expect(res.body.id).toBe(55);
    const insertOrderParams = tx.query.mock.calls[1][1];
    expect(insertOrderParams[4]).toBe(400.2); // 2*100.1 + 200, cena z żądania zignorowana
  });
  test('400 gdy rower nie istnieje', async () => {
    const tx = { query: jest.fn().mockResolvedValueOnce([]) };
    db.withTransaction.mockImplementation((fn) => fn(tx));
    const res = await request(app).post('/api/orders').set(bearer(userToken())).send({ ...dane, items: [{ rower_id: 404, ilosc: 1 }] });
    expect(res.status).toBe(400);
  });
});

describe('przeglądanie i statusy', () => {
  test('GET /api/orders/my zwraca zamówienia użytkownika z pozycjami', async () => {
    db.query.mockResolvedValueOnce([{ id: 1 }]).mockResolvedValueOnce([{ zamowienie_id: 1, nazwa_roweru: 'A' }]);
    const res = await request(app).get('/api/orders/my').set(bearer(userToken()));
    expect(res.status).toBe(200);
    expect(res.body[0].elementy).toHaveLength(1);
    expect(db.query.mock.calls[0][1]).toEqual([2]); // filtr po id użytkownika z tokenu
  });
  test('GET /api/orders tylko dla admina', async () => {
    expect((await request(app).get('/api/orders').set(bearer(userToken()))).status).toBe(403);
  });
  test('PATCH status: walidacja i sukces', async () => {
    expect((await request(app).patch('/api/orders/1/status').set(bearer(adminToken())).send({ status: 'xxx' })).status).toBe(400);
    db.query.mockResolvedValueOnce({ affectedRows: 1 });
    expect((await request(app).patch('/api/orders/1/status').set(bearer(adminToken())).send({ status: 'wyslane' })).status).toBe(200);
  });
});
