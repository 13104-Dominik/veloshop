import { createContext, useContext, useEffect, useReducer } from 'react';
import { cartReducer } from '../cartReducer.js';

const CartContext = createContext(null);
export const useCart = () => useContext(CartContext);

const KEY = 'veloshop_cart';
const load = () => {
  try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch { return []; }
};

export function CartProvider({ children }) {
  const [items, dispatch] = useReducer(cartReducer, [], load);
  useEffect(() => localStorage.setItem(KEY, JSON.stringify(items)), [items]);
  return <CartContext.Provider value={{ items, dispatch }}>{children}</CartContext.Provider>;
}
