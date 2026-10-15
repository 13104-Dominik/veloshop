import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';
import { cartTotal } from '../cartReducer.js';
import { formatPrice } from '../api.js';

export default function Cart() {
  const { items, dispatch } = useCart();

  if (items.length === 0) {
    return (
      <div className="pusty-koszyk">
        <h2>Koszyk</h2>
        <p>Twój koszyk jest pusty.</p>
        <Link to="/rowery" className="przycisk">Przeglądaj rowery</Link>
      </div>
    );
  }

  return (
    <>
      <h2>Koszyk</h2>
      <table className="tabela-koszyka">
        <thead><tr><th>Rower</th><th>Cena</th><th>Ilość</th><th>Razem</th><th></th></tr></thead>
        <tbody>
          {items.map((i) => (
            <tr key={i.id}>
              <td>{i.nazwa} <small>({i.marka})</small></td>
              <td>{formatPrice(i.cena)}</td>
              <td>
                <input className="pole-ilosc" type="number" min="1" max="99" value={i.ilosc} aria-label={`Ilość: ${i.nazwa}`}
                  onChange={(e) => dispatch({ type: 'SET_QTY', id: i.id, ilosc: e.target.value })} />
              </td>
              <td>{formatPrice(i.cena * i.ilosc)}</td>
              <td><button className="przycisk-usun" onClick={() => dispatch({ type: 'REMOVE', id: i.id })}>Usuń</button></td>
            </tr>
          ))}
          <tr className="suma"><td colSpan="3"><strong>Suma</strong></td><td colSpan="2"><strong>{formatPrice(cartTotal(items))}</strong></td></tr>
        </tbody>
      </table>
      <div className="przyciski-koszyka">
        <Link to="/rowery" className="przycisk-powrot">Kontynuuj zakupy</Link>
        <button className="przycisk-usun" onClick={() => dispatch({ type: 'CLEAR' })}>Wyczyść koszyk</button>
        <Link to="/zamowienie" className="przycisk-zamow">Złóż zamówienie</Link>
      </div>
    </>
  );
}
