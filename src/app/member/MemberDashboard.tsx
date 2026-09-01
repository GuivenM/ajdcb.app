import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Loader2, CheckCircle2, XCircle, CalendarDays, Wallet, ArrowRight } from 'lucide-react';
import { membreApi } from '../../lib/memberApi';
import { useMemberAuth } from '../context/MemberAuthContext';
import { CotisationHistoriqueEntry } from '../admin/types';

interface HistoriqueResponse {
  historique: CotisationHistoriqueEntry[];
}

interface EvenementApercu {
  id: number;
  titre: string;
  periode: string;
  lieu: string | null;
}

export function MemberDashboard() {
  const { membre } = useMemberAuth();
  const [moisCourant, setMoisCourant] = useState<CotisationHistoriqueEntry | null>(null);
  const [prochainEvenement, setProchainEvenement] = useState<EvenementApercu | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      membreApi.get<HistoriqueResponse>('/v1/membre/mes-cotisations'),
      membreApi.get<EvenementApercu[]>('/v1/membre/evenements'),
    ])
      .then(([cotisations, evenements]) => {
        setMoisCourant(cotisations.historique[0] || null);
        setProchainEvenement(evenements[0] || null);
      })
      .catch(() => {
        // Erreurs déjà gérées globalement (401 -> déconnexion) — le
        // tableau de bord affiche simplement moins d'informations.
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Bonjour {membre?.prenom} 👋</h1>
      <p className="text-slate-500 mt-1 mb-6">Bienvenue dans votre espace membre AJDCB.</p>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          <Link
            to="/membre/cotisations"
            className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-2 text-slate-500 text-sm mb-3">
              <Wallet className="w-4 h-4" /> Cotisation du mois
            </div>
            {moisCourant?.statut === 'payee' ? (
              <p className="flex items-center gap-2 text-brand-green-700 font-semibold">
                <CheckCircle2 className="w-5 h-5" /> À jour
              </p>
            ) : (
              <p className="flex items-center gap-2 text-brand-red-600 font-semibold">
                <XCircle className="w-5 h-5" /> Impayée
              </p>
            )}
            <span className="text-sm text-slate-400 flex items-center gap-1 mt-2">
              Voir l'historique <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </Link>

          <Link
            to="/membre/evenements"
            className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-2 text-slate-500 text-sm mb-3">
              <CalendarDays className="w-4 h-4" /> Prochain événement
            </div>
            {prochainEvenement ? (
              <>
                <p className="font-semibold text-slate-900">{prochainEvenement.titre}</p>
                <p className="text-sm text-slate-500">{prochainEvenement.periode}</p>
              </>
            ) : (
              <p className="text-sm text-slate-400">Aucun événement à venir</p>
            )}
            <span className="text-sm text-slate-400 flex items-center gap-1 mt-2">
              Voir tous les événements <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </Link>
        </div>
      )}
    </div>
  );
}
