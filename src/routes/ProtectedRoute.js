import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Requires login
export function ProtectedRoute() {
  const { token } = useAuth();
  return token ? <Outlet /> : <Navigate to="/login" replace />;
}

// Requires specific role(s)
export function RoleRoute({ roles }) {
  const { token, user } = useAuth();
  if (!token) return <Navigate to="/login" replace />;
  if (!roles.includes(user?.role)) return <Navigate to="/unauthorized" replace />;
  return <Outlet />;
}

// Redirect authenticated users away from /login
export function GuestRoute() {
  const { token, user } = useAuth();
  if (!token) return <Outlet />;
  const dest = { ADMIN:'/admin', RECEPTIONIST:'/receptionist', DOCTOR:'/doctor' }[user?.role] || '/';
  return <Navigate to={dest} replace />;
}
