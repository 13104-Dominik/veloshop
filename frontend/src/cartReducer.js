// Czysta funkcja zarządzająca stanem koszyka (łatwa do przetestowania).
export function cartReducer(state, action) {
  switch (action.type) {
    case 'ADD': {
      const { bike } = action;
      const found = state.find((i) => i.id === bike.id);
      if (found) return state.map((i) => (i.id === bike.id ? { ...i, ilosc: Math.min(i.ilosc + 1, 99) } : i));
      return [...state, { id: bike.id, nazwa: bike.nazwa, marka: bike.marka, cena: bike.cena, zdjecie: bike.zdjecie, ilosc: 1 }];
    }
    case 'REMOVE':
      return state.filter((i) => i.id !== action.id);
    case 'SET_QTY': {
      const ilosc = Math.floor(Number(action.ilosc));
      if (!Number.isFinite(ilosc) || ilosc < 1) return state;
      return state.map((i) => (i.id === action.id ? { ...i, ilosc: Math.min(ilosc, 99) } : i));
    }
    case 'CLEAR':
      return [];
    default:
      return state;
  }
}

export const cartTotal = (items) => Math.round(items.reduce((s, i) => s + i.cena * i.ilosc, 0) * 100) / 100;
export const cartCount = (items) => items.reduce((s, i) => s + i.ilosc, 0);
