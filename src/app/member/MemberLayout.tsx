import React from 'react';
import { Outlet, useNavigate, Link } from 'react-router-dom';
import { LogOut, AlertTriangle } from 'lucide-react';
import { useMemberAuth } from '../context/MemberAuthContext';
import { Button } from '../components/ui/button';

export function MemberLayout() {
  const { membre, logout } = useMemberAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate('/membre/login', { replace: true });
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/membre" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-md bg-slate-50 border border-slate-200 flex items-center justify-center p-1.5 shrink-0">
              <img src="/logo-mark-ajdcb.png" alt="AJDCB" className="w-full h-full object-contain" />
            </div>
            <div>
              <p className="font-bold text-sm text-slate-900 leading-tight">Espace Membre</p>
              <p className="text-xs text-slate-500">{membre?.nom_complet}</p>
            </div>
          </Link>

          <Button variant="ghost" size="sm" onClick={handleLogout} className="text-slate-600">
            <LogOut className="w-4 h-4" /> Déconnexion
          </Button>
        </div>
      </header>

      {membre?.en_attente_paiement && (
        <div className="bg-amber-50 border-b border-amber-200">
          <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-2 text-sm text-amber-800">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>
              Votre cotisation initiale n'a pas encore été réglée. Votre statut passera à « actif »
              dès son règlement.
            </span>
          </div>
        </div>
      )}

      <main className="max-w-5xl mx-auto px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}
