const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const isEmail = (v) => typeof v === 'string' && v.length <= 100 && EMAIL_RE.test(v);
const isNonEmpty = (v, max = 200) => typeof v === 'string' && v.trim().length > 0 && v.trim().length <= max;
const isPassword = (v) => typeof v === 'string' && v.length >= 8 && v.length <= 72;
const isPositiveInt = (v) => Number.isInteger(v) && v > 0;
const isPrice = (v) => typeof v === 'number' && Number.isFinite(v) && v > 0 && v < 1e8;
const isPhone = (v) => typeof v === 'string' && /^[0-9 +()-]{7,20}$/.test(v);

module.exports = { isEmail, isNonEmpty, isPassword, isPositiveInt, isPrice, isPhone };
