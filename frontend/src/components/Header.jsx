import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';
import { cartCount } from '../cartReducer.js';

export default function Header() {
  const { user, logout } = useAuth();
  const { items } = useCart();
  const navigate = useNavigate();

  return (
    <header>
      <div className="logo-koszyk">
        <div className="logo">
          <Link to="/"><h1>VELOSHOP</h1></Link>
          <p className="podtytul">Rowery dla każdego</p>
        </div>
        <nav className="nawigacja">
          <Link to="/rowery">Wszystkie rowery</Link>
          {user?.rola === 'admin' && <Link to="/admin">Panel admina</Link>}
          {user ? (
            <>
              <Link to="/zamowienia">Moje zamówienia</Link>
              <span className="uzytkownik">{user.imie}</span>
              <button className="przycisk-powrot" onClick={() => { logout(); navigate('/'); }}>Wyloguj</button>
            </>
          ) : (
            <>
              <Link to="/logowanie">Zaloguj</Link>
              <Link to="/rejestracja">Załóż konto</Link>
            </>
          )}
          <Link to="/koszyk" className="przycisk-koszyk">Koszyk ({cartCount(items)})</Link>
        </nav>
      </div>
    </header>
  );
}
