import { Routes, Route } from 'react-router-dom';
import Header from './components/Header.jsx';
import Footer from './components/Footer.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Home from './pages/Home.jsx';
import Bikes from './pages/Bikes.jsx';
import Cart from './pages/Cart.jsx';
import Checkout from './pages/Checkout.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Orders from './pages/Orders.jsx';
import Admin from './pages/Admin.jsx';

export default function App() {
  return (
    <>
      <Header />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/rowery" element={<Bikes />} />
          <Route path="/kategoria/:id" element={<Bikes />} />
          <Route path="/koszyk" element={<Cart />} />
          <Route path="/zamowienie" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
          <Route path="/zamowienia" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute admin><Admin /></ProtectedRoute>} />
          <Route path="/logowanie" element={<Login />} />
          <Route path="/rejestracja" element={<Register />} />
          <Route path="*" element={<p>Nie znaleziono strony.</p>} />
        </Routes>
      </main>
      <Footer />
    </>
  );
}
