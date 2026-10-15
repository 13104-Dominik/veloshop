const v = require('../src/validators');

describe('validators (testy jednostkowe)', () => {
  test('isEmail', () => {
    expect(v.isEmail('jan@example.com')).toBe(true);
    expect(v.isEmail('jan@')).toBe(false);
    expect(v.isEmail('')).toBe(false);
    expect(v.isEmail(123)).toBe(false);
  });
  test('isPassword wymaga 8-72 znaków', () => {
    expect(v.isPassword('1234567')).toBe(false);
    expect(v.isPassword('12345678')).toBe(true);
    expect(v.isPassword('a'.repeat(73))).toBe(false);
  });
  test('isPositiveInt', () => {
    expect(v.isPositiveInt(1)).toBe(true);
    expect(v.isPositiveInt(0)).toBe(false);
    expect(v.isPositiveInt(1.5)).toBe(false);
    expect(v.isPositiveInt('1')).toBe(false);
  });
  test('isPrice', () => {
    expect(v.isPrice(100.5)).toBe(true);
    expect(v.isPrice(-1)).toBe(false);
    expect(v.isPrice('100')).toBe(false);
  });
  test('isPhone', () => {
    expect(v.isPhone('123 456 789')).toBe(true);
    expect(v.isPhone('abc')).toBe(false);
  });
});
