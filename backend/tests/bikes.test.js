jest.mock('../src/db');
const request = require('supertest');
const db = require('../src/db');
const app = require('../src/app');
const { userToken, adminToken, bearer } = require('./helpers');

beforeEach(() => jest.resetAllMocks());

const bike = { nazwa: 'Test 1', marka: 'Trek', cena: 1999.99, kategoria_id: 1, zdjecie: 'zdjecia/x.jpg' };

describe('katalog (odczyt)', () => {
  test('GET /api/categories', async () => {
    db.query.mockResolvedValueOnce([{ id: 1, nazwa: 'Górskie', opis: 'x' }]);
    const res = await request(app).get('/api/categories');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
  });
  test('GET /api/bikes?kategoria=1 używa parametru zapytania', async () => {
    db.query.mockResolvedValueOnce([{ id: 1 }]);
    const res = await request(app).get('/api/bikes?kategoria=1');
    expect(res.status).toBe(200);
    expect(db.query).toHaveBeenCalledWith(expect.stringContaining('kategoria_id = ?'), [1]);
  });
  test('GET /api/bikes?kategoria=abc zwraca 400', async () => {
    expect((await request(app).get('/api/bikes?kategoria=abc')).status).toBe(400);
  });
  test('GET /api/bikes/:id - 404 gdy brak', async () => {
    db.query.mockResolvedValueOnce([]);
    expect((await request(app).get('/api/bikes/999')).status).toBe(404);
  });
});

describe('CRUD roweru - autoryzacja', () => {
  test('POST bez tokenu -> 401', async () => {
    expect((await request(app).post('/api/bikes').send(bike)).status).toBe(401);
  });
  test('POST jako zwykły użytkownik -> 403', async () => {
    const res = await request(app).post('/api/bikes').set(bearer(userToken())).send(bike);
    expect(res.status).toBe(403);
    expect(db.query).not.toHaveBeenCalled();
  });
  test('PUT i DELETE jako użytkownik -> 403', async () => {
    expect((await request(app).put('/api/bikes/1').set(bearer(userToken())).send(bike)).status).toBe(403);
    expect((await request(app).delete('/api/bikes/1').set(bearer(userToken()))).status).toBe(403);
  });
});

describe('CRUD roweru - admin', () => {
  test('POST tworzy rower', async () => {
    db.query.mockResolvedValueOnce({ insertId: 99 });
    const res = await request(app).post('/api/bikes').set(bearer(adminToken())).send(bike);
    expect(res.status).toBe(201);
    expect(res.body.id).toBe(99);
  });
  test('POST waliduje cenę', async () => {
    const res = await request(app).post('/api/bikes').set(bearer(adminToken())).send({ ...bike, cena: -5 });
    expect(res.status).toBe(400);
  });
  test('PUT aktualizuje; 404 gdy brak', async () => {
    db.query.mockResolvedValueOnce({ affectedRows: 1 });
    expect((await request(app).put('/api/bikes/5').set(bearer(adminToken())).send(bike)).status).toBe(200);
    db.query.mockResolvedValueOnce({ affectedRows: 0 });
    expect((await request(app).put('/api/bikes/5').set(bearer(adminToken())).send(bike)).status).toBe(404);
  });
  test('DELETE usuwa (204)', async () => {
    db.query.mockResolvedValueOnce({ affectedRows: 1 });
    expect((await request(app).delete('/api/bikes/5').set(bearer(adminToken()))).status).toBe(204);
  });
  test('DELETE roweru z zamówień -> 409', async () => {
    db.query.mockRejectedValueOnce(Object.assign(new Error('fk'), { code: 'ER_ROW_IS_REFERENCED_2' }));
    expect((await request(app).delete('/api/bikes/5').set(bearer(adminToken()))).status).toBe(409);
  });
});
