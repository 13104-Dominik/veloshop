import { useEffect, useState } from 'react';
import { api, formatPrice } from '../api.js';

export default function Orders() {
  const [orders, setOrders] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api('/orders/my').then(setOrders).catch((e) => setError(e.message));
  }, []);

  if (error) return <p className="komunikat-blad">{error}</p>;
  if (!orders) return <p>Ładowanie...</p>;
  if (orders.length === 0) return <p className="pusty-koszyk">Nie masz jeszcze zamówień.</p>;

  return (
    <>
      <h2>Moje zamówienia</h2>
      {orders.map((o) => (
        <div key={o.id} className="podsumowanie-zamowienia">
          <h3>Zamówienie #{o.id} - {o.status}</h3>
          <p>{new Date(o.data_zlozenia).toLocaleString('pl-PL')} | Suma: <strong>{formatPrice(o.suma_calkowita)}</strong></p>
          <ul>{o.elementy.map((e) => <li key={e.id}>{e.nazwa_roweru} x {e.ilosc} ({formatPrice(e.cena)})</li>)}</ul>
        </div>
      ))}
    </>
  );
}
