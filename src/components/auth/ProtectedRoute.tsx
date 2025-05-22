import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

type ProtectedRouteProps = {
  children: ReactNode;
  allowedRoles: string[];
};

const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { isAuthenticated, userRole } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (userRole && !allowedRoles.includes(userRole)) {
    // User is authenticated but doesn't have the required role
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;