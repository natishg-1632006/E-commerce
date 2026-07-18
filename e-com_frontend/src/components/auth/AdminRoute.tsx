import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store';

interface RouteProps {
  children: React.ReactElement;
}

/**
 * AdminRoute — only renders children if the logged-in user has role === 'admin'.
 * Unauthenticated users are sent to /auth/login.
 * Authenticated non-admin users are sent back to /.
 */
export const AdminRoute: React.FC<RouteProps> = ({ children }) => {
  const { isAuthenticated, role } = useSelector((state: RootState) => state.auth);

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace />;
  }

  if (role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default AdminRoute;
