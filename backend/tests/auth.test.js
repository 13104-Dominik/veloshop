jest.mock('../src/db');
const request = require('supertest');
const bcrypt = require('bcryptjs');
const db = require('../src/db');
const app = require('../src/app');
const { userToken, bearer } = require('./helpers');

beforeEach(() => jest.resetAllMocks());

describe('POST /api/auth/register', () => {
  test('tworzy konto i zwraca token', async () => {
    db.query.mockResolvedValueOnce([]).mockResolvedValueOnce({ insertId: 7 });
    const res = await request(app).post('/api/auth/register').send({ imie: 'Jan', email: 'jan@test.pl', haslo: 'haslo1234' });
    expect(res.status).toBe(201);
    expect(res.body.token).toBeDefined();
    expect(res.body.user).toEqual({ id: 7, imie: 'Jan', email: 'jan@test.pl', rola: 'user' });
    // hasło trafia do bazy tylko jako hash
    const insertParams = db.query.mock.calls[1][1];
    expect(insertParams).not.toContain('haslo1234');
  });
  test('odrzuca zbyt krótkie hasło', async () => {
    const res = await request(app).post('/api/auth/register').send({ imie: 'Jan', email: 'jan@test.pl', haslo: '123' });
    expect(res.status).toBe(400);
  });
  test('odrzuca błędny email', async () => {
    const res = await request(app).post('/api/auth/register').send({ imie: 'Jan', email: 'zly', haslo: 'haslo1234' });
    expect(res.status).toBe(400);
  });
  test('zwraca 409 gdy email zajęty', async () => {
    db.query.mockResolvedValueOnce([{ id: 1 }]);
    const res = await request(app).post('/api/auth/register').send({ imie: 'Jan', email: 'jan@test.pl', haslo: 'haslo1234' });
    expect(res.status).toBe(409);
  });
});

describe('POST /api/auth/login', () => {
  const user = async () => ({ id: 3, imie: 'Ola', email: 'ola@test.pl', rola: 'user', haslo_hash: await bcrypt.hash('haslo1234', 4) });

  test('loguje poprawnymi danymi', async () => {
    db.query.mockResolvedValueOnce([await user()]);
    const res = await request(app).post('/api/auth/login').send({ email: 'ola@test.pl', haslo: 'haslo1234' });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.haslo_hash).toBeUndefined();
  });
  test('odrzuca złe hasło (401)', async () => {
    db.query.mockResolvedValueOnce([await user()]);
    const res = await request(app).post('/api/auth/login').send({ email: 'ola@test.pl', haslo: 'zlehaslo!' });
    expect(res.status).toBe(401);
  });
  test('odrzuca nieistniejące konto tym samym komunikatem', async () => {
    db.query.mockResolvedValueOnce([await user()]);
    const bad = await request(app).post('/api/auth/login').send({ email: 'ola@test.pl', haslo: 'zlehaslo!' });
    db.query.mockResolvedValueOnce([]);
    const none = await request(app).post('/api/auth/login').send({ email: 'brak@test.pl', haslo: 'haslo1234' });
    expect(none.status).toBe(401);
    expect(none.body.error).toBe(bad.body.error);
  });
});

describe('GET /api/auth/me', () => {
  test('401 bez tokenu', async () => {
    expect((await request(app).get('/api/auth/me')).status).toBe(401);
  });
  test('401 z fałszywym tokenem', async () => {
    const res = await request(app).get('/api/auth/me').set(bearer('falszywy.token.jwt'));
    expect(res.status).toBe(401);
  });
  test('zwraca dane użytkownika z poprawnym tokenem', async () => {
    db.query.mockResolvedValueOnce([{ id: 2, imie: 'Ola', email: 'ola@test.pl', rola: 'user' }]);
    const res = await request(app).get('/api/auth/me').set(bearer(userToken()));
    expect(res.status).toBe(200);
    expect(res.body.email).toBe('ola@test.pl');
  });
});
