import React from 'react';
import { useMemberAuth } from '../context/MemberAuthContext';

export function MemberDashboard() {
  const { membre } = useMemberAuth();

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Bonjour {membre?.prenom} 👋</h1>
      <p className="text-slate-500 mt-1">
        Bienvenue dans votre espace membre AJDCB. Cette page s'enrichira bientôt (cotisations,
        événements, profil).
      </p>
    </div>
  );
}
