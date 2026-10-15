import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [haslo, setHaslo] = useState('');
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await login(email, haslo);
      navigate(location.state?.from || '/');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <form className="formularz-zamowienia" onSubmit={submit}>
      <h3>Logowanie</h3>
      <label htmlFor="email">Email</label>
      <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      <label htmlFor="haslo">Hasło</label>
      <input id="haslo" type="password" value={haslo} onChange={(e) => setHaslo(e.target.value)} required />
      {error && <p className="komunikat-blad" role="alert">{error}</p>}
      <button className="przycisk-zamow" type="submit">Zaloguj</button>
      <p>Nie masz konta? <Link to="/rejestracja">Zarejestruj się</Link></p>
    </form>
  );
}
