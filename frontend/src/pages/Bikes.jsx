import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../api.js';
import BikeCard from '../components/BikeCard.jsx';
import { useCart } from '../context/CartContext.jsx';

export default function Bikes() {
  const { id } = useParams();
  const { dispatch } = useCart();
  const [bikes, setBikes] = useState([]);
  const [q, setQ] = useState('');
  const [error, setError] = useState('');
  const [added, setAdded] = useState('');

  useEffect(() => {
    const params = new URLSearchParams();
    if (id) params.set('kategoria', id);
    if (q.trim()) params.set('q', q.trim());
    const t = setTimeout(() => {
      api(`/bikes?${params}`).then((d) => { setBikes(d); setError(''); }).catch((e) => setError(e.message));
    }, 250); // debounce wyszukiwania
    return () => clearTimeout(t);
  }, [id, q]);

  const add = (bike) => {
    dispatch({ type: 'ADD', bike });
    setAdded(`Dodano do koszyka: ${bike.nazwa}`);
  };

  return (
    <>
      <h2>{id ? 'Rowery w kategorii' : 'Wszystkie rowery'}</h2>
      <input className="wyszukiwarka" placeholder="Szukaj po nazwie lub marce..." value={q} onChange={(e) => setQ(e.target.value)} aria-label="Szukaj" />
      {added && <p className="komunikat-sukces">{added}</p>}
      {error && <p className="komunikat-blad">{error}</p>}
      <div className="rowery">
        {bikes.map((b) => <BikeCard key={b.id} bike={b} onAdd={add} />)}
      </div>
      {!error && bikes.length === 0 && <p className="pusty-koszyk">Brak rowerów spełniających kryteria.</p>}
    </>
  );
}
