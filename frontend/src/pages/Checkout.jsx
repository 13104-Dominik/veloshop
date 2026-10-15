import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api, formatPrice } from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';
import { cartTotal } from '../cartReducer.js';

export default function Checkout() {
  const { user } = useAuth();
  const { items, dispatch } = useCart();
  const [form, setForm] = useState({ imie_nazwisko: user?.imie || '', adres: '', telefon: '' });
  const [error, setError] = useState('');
  const [orderId, setOrderId] = useState(null);
  const [busy, setBusy] = useState(false);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      const res = await api('/orders', {
        method: 'POST',
        body: { ...form, items: items.map((i) => ({ rower_id: i.id, ilosc: i.ilosc })) },
      });
      dispatch({ type: 'CLEAR' });
      setOrderId(res.id);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  if (orderId) {
    return (
      <div className="komunikat-sukces">
        <h2>Dziękujemy za zamówienie!</h2>
        <p>Numer zamówienia: <strong>#{orderId}</strong></p>
        <Link to="/zamowienia" className="przycisk">Moje zamówienia</Link>
      </div>
    );
  }
  if (items.length === 0) return <p className="pusty-koszyk">Koszyk jest pusty. <Link to="/rowery">Wróć do sklepu</Link></p>;

  return (
    <>
      <h2>Zamówienie</h2>
      <div className="podsumowanie-zamowienia">
        <h3>Do zapłaty: {formatPrice(cartTotal(items))}</h3>
      </div>
      <form className="formularz-zamowienia" onSubmit={submit}>
        <h3>Dane do wysyłki</h3>
        <label htmlFor="imie_nazwisko">Imię i nazwisko</label>
        <input id="imie_nazwisko" value={form.imie_nazwisko} onChange={set('imie_nazwisko')} required maxLength={100} />
        <label htmlFor="adres">Adres dostawy</label>
        <input id="adres" value={form.adres} onChange={set('adres')} required maxLength={200} />
        <label htmlFor="telefon">Telefon</label>
        <input id="telefon" value={form.telefon} onChange={set('telefon')} required maxLength={20} />
        {error && <p className="komunikat-blad">{error}</p>}
        <button className="przycisk-zamow" type="submit" disabled={busy}>{busy ? 'Wysyłanie...' : 'Potwierdź zamówienie'}</button>
      </form>
    </>
  );
}
