import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store';

interface RouteProps {
  children: React.ReactElement;
}

/**
 * ProtectedRoute — guards customer-facing pages.
 *
 * - Unauthenticated users   → /auth/login
 * - Authenticated admins    → /admin  (admins never land on customer pages)
 * - Authenticated users     → render children normally
 */
export const ProtectedRoute: React.FC<RouteProps> = ({ children }) => {
  const { isAuthenticated, role } = useSelector((state: RootState) => state.auth);

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace />;
  }

  // Admin users belong in the admin panel, not the customer storefront
  if (role === 'admin') {
    return <Navigate to="/admin" replace />;
  }

  return children;
};

export default ProtectedRoute;
