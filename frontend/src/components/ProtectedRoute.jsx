import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// ProtectedRoute checks if a token exists in AuthContext.
// If it does, it renders the child routes via <Outlet />.
// If it does not, it redirects the user to /login.
const ProtectedRoute = () => {
  const { token } = useAuth();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
