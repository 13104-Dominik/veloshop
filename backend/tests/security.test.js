jest.mock('../src/db');
const request = require('supertest');
const db = require('../src/db');
const app = require('../src/app');

beforeEach(() => jest.resetAllMocks());

const PAYLOADS = ["' OR '1'='1", "'; DROP TABLE rowery; --", '1 UNION SELECT * FROM uzytkownicy', '" OR ""="'];

describe('odporność na SQL Injection', () => {
  test.each(PAYLOADS)('wyszukiwarka: payload trafia do parametrów, nie do SQL: %s', async (payload) => {
    db.query.mockResolvedValue([]);
    const res = await request(app).get('/api/bikes').query({ q: payload });
    expect(res.status).toBe(200);
    const [sql, params] = db.query.mock.calls[0];
    expect(sql).not.toContain(payload);
    expect(sql).not.toMatch(/DROP|UNION/i);
    expect(params.join('')).toContain(payload);
  });
  test.each(PAYLOADS)('logowanie: payload w polu email jest odrzucany: %s', async (payload) => {
    const res = await request(app).post('/api/auth/login').send({ email: payload, haslo: 'x' });
    expect(res.status).toBe(400);
    expect(db.query).not.toHaveBeenCalled();
  });
  test('identyfikator kategorii z payloadem -> 400', async () => {
    const res = await request(app).get('/api/bikes').query({ kategoria: '1 OR 1=1' });
    expect(res.status).toBe(400);
  });
});

describe('nagłówki i konfiguracja', () => {
  test('helmet ustawia nagłówki bezpieczeństwa i ukrywa X-Powered-By', async () => {
    const res = await request(app).get('/api/health');
    expect(res.headers['x-content-type-options']).toBe('nosniff');
    expect(res.headers['x-powered-by']).toBeUndefined();
  });
  test('nieprawidłowy JSON -> 400', async () => {
    const res = await request(app).post('/api/auth/login').set('Content-Type', 'application/json').send('{zly json');
    expect(res.status).toBe(400);
  });
  test('błąd bazy nie ujawnia szczegółów (500 z ogólnym komunikatem)', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    db.query.mockRejectedValueOnce(new Error('ER_ACCESS_DENIED for user root@10.0.0.5'));
    const res = await request(app).get('/api/categories');
    expect(res.status).toBe(500);
    expect(JSON.stringify(res.body)).not.toMatch(/root|10\.0/);
  });
  test('nieznany endpoint API -> 404', async () => {
    expect((await request(app).get('/api/nie-ma')).status).toBe(404);
  });
});
