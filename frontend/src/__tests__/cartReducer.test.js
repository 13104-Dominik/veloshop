import { cartReducer, cartTotal, cartCount } from '../cartReducer.js';

const bike = { id: 1, nazwa: 'Trek FX 3', marka: 'Trek', cena: 100.1, zdjecie: 'zdjecia/a.jpg' };

describe('cartReducer', () => {
  test('ADD dodaje nową pozycję z ilością 1', () => {
    const s = cartReducer([], { type: 'ADD', bike });
    expect(s).toHaveLength(1);
    expect(s[0].ilosc).toBe(1);
  });
  test('ADD tego samego roweru zwiększa ilość', () => {
    const s = cartReducer(cartReducer([], { type: 'ADD', bike }), { type: 'ADD', bike });
    expect(s).toHaveLength(1);
    expect(s[0].ilosc).toBe(2);
  });
  test('SET_QTY ustawia ilość i ignoruje wartości nieprawidłowe', () => {
    const start = cartReducer([], { type: 'ADD', bike });
    expect(cartReducer(start, { type: 'SET_QTY', id: 1, ilosc: '5' })[0].ilosc).toBe(5);
    expect(cartReducer(start, { type: 'SET_QTY', id: 1, ilosc: 0 })).toBe(start);
    expect(cartReducer(start, { type: 'SET_QTY', id: 1, ilosc: 'abc' })).toBe(start);
    expect(cartReducer(start, { type: 'SET_QTY', id: 1, ilosc: 500 })[0].ilosc).toBe(99);
  });
  test('REMOVE i CLEAR', () => {
    const start = cartReducer([], { type: 'ADD', bike });
    expect(cartReducer(start, { type: 'REMOVE', id: 1 })).toEqual([]);
    expect(cartReducer(start, { type: 'CLEAR' })).toEqual([]);
  });
  test('cartTotal i cartCount', () => {
    const items = [{ cena: 100.1, ilosc: 2 }, { cena: 200, ilosc: 1 }];
    expect(cartTotal(items)).toBe(400.2);
    expect(cartCount(items)).toBe(3);
  });
});
