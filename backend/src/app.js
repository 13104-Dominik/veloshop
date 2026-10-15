const path = require('path');
const fs = require('fs');
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yaml');

const authRoutes = require('./routes/auth');
const { bikesRouter, categoriesRouter } = require('./routes/bikes');
const orderRoutes = require('./routes/orders');

const app = express();
app.disable('x-powered-by');
app.set('trust proxy', 1); // hosting (Render/Railway) stawia proxy przed aplikacją
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '100kb' }));

// Ograniczenie prób logowania/rejestracji (ochrona przed brute force)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: Number(process.env.AUTH_RATE_LIMIT) || 50,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Zbyt wiele prób. Spróbuj ponownie później.' },
});

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/categories', categoriesRouter);
app.use('/api/bikes', bikesRouter);
app.use('/api/orders', orderRoutes);

// Dokumentacja API (Swagger UI) pod /api/docs
const specPath = path.join(__dirname, '..', 'openapi.yaml');
if (fs.existsSync(specPath)) {
  const spec = YAML.parse(fs.readFileSync(specPath, 'utf8'));
  app.use('/api/docs', (req, res, next) => { res.removeHeader('Content-Security-Policy'); next(); }, swaggerUi.serve, swaggerUi.setup(spec));
}

app.use('/api', (req, res) => res.status(404).json({ error: 'Nie znaleziono zasobu.' }));

// W produkcji backend serwuje zbudowany frontend (jedna usługa do wdrożenia)
const dist = path.join(__dirname, '..', '..', 'frontend', 'dist');
if (fs.existsSync(dist)) {
  app.use(express.static(dist));
  app.get('*', (req, res) => res.sendFile(path.join(dist, 'index.html')));
}

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed') return res.status(400).json({ error: 'Nieprawidłowy JSON.' });
  if (err.status && err.status < 500) return res.status(err.status).json({ error: err.message });
  console.error(err);
  res.status(500).json({ error: 'Wewnętrzny błąd serwera.' });
});

module.exports = app;
