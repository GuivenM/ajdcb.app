import React from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth, AdminRole } from '../context/AuthContext';

export function ProtectedRoute({ roles }: { roles?: AdminRole[] }) {
  const { isAuthenticated, isLoading, hasRole } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-6 h-6 animate-spin text-brand-green-600" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" state={{ from: location.pathname }} replace />;
  }

  if (roles && roles.length > 0 && !hasRole(...roles)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 text-center">
        <div>
          <h1 className="text-xl font-bold text-slate-900 mb-2">Accès refusé</h1>
          <p className="text-slate-500">Votre rôle ne permet pas d'accéder à cette page.</p>
        </div>
      </div>
    );
  }

  return <Outlet />;
}
