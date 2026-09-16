import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Route wrapper that protects client routes from unauthorized access.
 * 
 * @param {Array<string>} allowedRoles - Optional list of permitted roles (e.g. ['admin', 'super_admin', 'storekeeper', 'manager'])
 * @param {ReactNode} children - The child component to render if authorized
 */
export default function ProtectedRoute({ allowedRoles, children }) {
  const { userInfo } = useAuth();
  const location = useLocation();

  // If not logged in, redirect to login while preserving the attempted URL in state
  if (!userInfo?.token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If specific roles are required, check if user has access
  if (allowedRoles && allowedRoles.length > 0) {
    const hasRole = allowedRoles.includes(userInfo.role);
    if (!hasRole) {
      return <Navigate to="/" replace />;
    }
  }

  return children;
}
