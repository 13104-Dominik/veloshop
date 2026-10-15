import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ imie: '', email: '', haslo: '' });
  const [error, setError] = useState('');
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await register(form.imie, form.email, form.haslo);
      navigate('/');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <form className="formularz-zamowienia" onSubmit={submit}>
      <h3>Rejestracja</h3>
      <label htmlFor="imie">Imię</label>
      <input id="imie" value={form.imie} onChange={set('imie')} required maxLength={100} />
      <label htmlFor="email">Email</label>
      <input id="email" type="email" value={form.email} onChange={set('email')} required />
      <label htmlFor="haslo">Hasło (min. 8 znaków)</label>
      <input id="haslo" type="password" value={form.haslo} onChange={set('haslo')} required minLength={8} />
      {error && <p className="komunikat-blad" role="alert">{error}</p>}
      <button className="przycisk-zamow" type="submit">Załóż konto</button>
      <p>Masz już konto? <Link to="/logowanie">Zaloguj się</Link></p>
    </form>
  );
}
