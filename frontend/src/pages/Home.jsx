import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';

export default function Home() {
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    api('/categories').then(setCategories).catch((e) => setError(e.message));
  }, []);

  return (
    <>
      <section className="hero">
        <h2 className="hero-tytul"><span className="bialy">Znajdź swój</span> <span className="czerwony">idealny rower</span></h2>
        <p className="hero-opis">Górskie, szosowe, miejskie i elektryczne. Wybierz kategorię i ruszaj w drogę.</p>
        <Link to="/rowery" className="przycisk-hero">Zobacz wszystkie rowery</Link>
      </section>
      <h2>Kategorie</h2>
      {error && <p className="komunikat-blad">{error}</p>}
      <div className="kategorie">
        {categories.map((c) => (
          <Link key={c.id} to={`/kategoria/${c.id}`} className="karta-kategorii">
            <h3>{c.nazwa}</h3>
            <p>{c.opis}</p>
          </Link>
        ))}
      </div>
    </>
  );
}
