import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function ProtectedRoute({ children, admin = false }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <p>Ładowanie...</p>;
  if (!user) return <Navigate to="/logowanie" state={{ from: location.pathname }} replace />;
  if (admin && user.rola !== 'admin') return <Navigate to="/" replace />;
  return children;
}
