const jwt = require('jsonwebtoken');

const secret = () => process.env.JWT_SECRET || 'dev-secret-change-me';

function signToken(user) {
  return jwt.sign({ id: user.id, rola: user.rola }, secret(), {
    expiresIn: process.env.JWT_EXPIRES_IN || '2h',
  });
}

// Wymaga nagłówka Authorization: Bearer <token>
function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const [type, token] = header.split(' ');
  if (type !== 'Bearer' || !token) {
    return res.status(401).json({ error: 'Wymagane zalogowanie.' });
  }
  try {
    req.user = jwt.verify(token, secret());
    next();
  } catch {
    res.status(401).json({ error: 'Token jest nieprawidłowy lub wygasł.' });
  }
}

function requireAdmin(req, res, next) {
  if (!req.user || req.user.rola !== 'admin') {
    return res.status(403).json({ error: 'Brak uprawnień administratora.' });
  }
  next();
}

module.exports = { signToken, requireAuth, requireAdmin };
