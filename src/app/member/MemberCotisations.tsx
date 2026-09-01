import React, { useEffect, useMemo, useState } from 'react';
import { Loader2, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';
import { membreApi, ApiError } from '../../lib/memberApi';
import { useMemberAuth } from '../context/MemberAuthContext';
import { FedaPayButton } from '../components/FedaPayButton';
import { CotisationHistoriqueEntry } from '../admin/types';

const MONTANT_COTISATION = 1000;

interface HistoriqueResponse {
  historique: CotisationHistoriqueEntry[];
  retard_consecutif: number;
  alerte_radiation: boolean;
}

const MOIS_LABELS: Record<string, string> = {};
function labelMois(mois: string) {
  if (!MOIS_LABELS[mois]) {
    const [annee, m] = mois.split('-').map(Number);
    const label = new Date(annee, m - 1, 1).toLocaleDateString('fr-FR', {
      month: 'long',
      year: 'numeric',
    });
    MOIS_LABELS[mois] = label.charAt(0).toUpperCase() + label.slice(1);
  }
  return MOIS_LABELS[mois];
}

export function MemberCotisations() {
  const { membre } = useMemberAuth();
  const [data, setData] = useState<HistoriqueResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [moisSelectionnes, setMoisSelectionnes] = useState<string[]>([]);

  useEffect(() => {
    membreApi
      .get<HistoriqueResponse>('/v1/membre/mes-cotisations')
      .then(setData)
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Erreur de chargement.'))
      .finally(() => setLoading(false));
  }, []);

  const moisImpayes = useMemo(
    () => (data?.historique || []).filter((h) => h.statut === 'impayee').map((h) => h.mois),
    [data]
  );

  function toggleMois(value: string) {
    setMoisSelectionnes((prev) =>
      prev.includes(value) ? prev.filter((m) => m !== value) : [...prev, value]
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
      </div>
    );
  }

  if (error || !data) {
    return <p className="text-slate-500">{error || 'Impossible de charger vos cotisations.'}</p>;
  }

  const montantTotal = MONTANT_COTISATION * moisSelectionnes.length;

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-1">Mes cotisations</h1>
      <p className="text-slate-500 mb-6">Historique des 12 derniers mois (1 000 FCFA / mois).</p>

      {data.alerte_radiation && (
        <div className="mb-6 rounded-xl bg-brand-red-50 border border-brand-red-200 text-brand-red-700 text-sm px-4 py-3 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          {data.retard_consecutif} mois consécutifs impayés — régularisez pour éviter une
          radiation (Règlement intérieur, Article 3).
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm divide-y divide-slate-100 mb-8">
        {data.historique.map((h) => (
          <div key={h.mois} className="flex items-center justify-between px-5 py-3">
            <span className="text-slate-700">{labelMois(h.mois)}</span>
            {h.statut === 'payee' && (
              <span className="flex items-center gap-1.5 text-sm text-brand-green-700">
                <CheckCircle2 className="w-4 h-4" /> Payée
              </span>
            )}
            {h.statut === 'impayee' && (
              <span className="flex items-center gap-1.5 text-sm text-brand-red-600">
                <XCircle className="w-4 h-4" /> Impayée
              </span>
            )}
            {h.statut === 'anterieure_adhesion' && (
              <span className="text-sm text-slate-400">—</span>
            )}
          </div>
        ))}
      </div>

      {moisImpayes.length > 0 && membre && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <h2 className="font-semibold text-slate-900 mb-3">Régulariser un ou plusieurs mois</h2>
          <div className="space-y-1 mb-4">
            {moisImpayes.map((mois) => (
              <label
                key={mois}
                className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-50 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={moisSelectionnes.includes(mois)}
                  onChange={() => toggleMois(mois)}
                  className="w-4 h-4 rounded border-slate-300 text-brand-green-600 focus:ring-brand-green-500"
                />
                <span className="text-slate-700">{labelMois(mois)}</span>
              </label>
            ))}
          </div>

          {moisSelectionnes.length === 0 ? (
            <p className="text-sm text-slate-400">Sélectionnez au moins un mois pour continuer.</p>
          ) : (
            <FedaPayButton
              endpoint="/v1/paiements/cotisation"
              extraPayload={{ membre_id: membre.id, mois: moisSelectionnes }}
              montant={montantTotal}
              label="Payer"
              defaultValues={{
                nom_payeur: membre.nom_complet,
                telephone_payeur: membre.whatsapp || '',
              }}
            />
          )}
        </div>
      )}
    </div>
  );
}
