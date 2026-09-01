import React from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useMemberAuth } from '../context/MemberAuthContext';

export function MemberProtectedRoute() {
  const { isAuthenticated, isLoading } = useMemberAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-6 h-6 animate-spin text-brand-green-600" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/membre/login" state={{ from: location.pathname }} replace />;
  }

  return <Outlet />;
}
