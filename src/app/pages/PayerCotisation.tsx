import React, { useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Loader2, CheckCircle2 } from 'lucide-react';
import { api, ApiError } from '../../lib/api';
import { Membre } from '../admin/types';
import { FedaPayButton } from '../components/FedaPayButton';

const MONTANT_COTISATION = 1000;

/** Les 6 derniers mois (courant inclus), au format AAAA-MM attendu par l'API. */
function deriveMoisOptions(): { value: string; label: string }[] {
  return Array.from({ length: 6 }).map((_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const value = d.toISOString().slice(0, 7);
    const label = d.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
    return { value, label: label.charAt(0).toUpperCase() + label.slice(1) };
  });
}

export function PayerCotisation() {
  const { id } = useParams<{ id: string }>();
  const [membre, setMembre] = useState<Membre | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [moisSelectionnes, setMoisSelectionnes] = useState<string[]>([new Date().toISOString().slice(0, 7)]);

  const moisOptions = useMemo(deriveMoisOptions, []);

  useEffect(() => {
    if (!id) return;
    api
      .get<Membre>(`/v1/membres/${id}`)
      .then(setMembre)
      .catch((err) => setError(err instanceof ApiError ? err.message : "Membre introuvable."))
      .finally(() => setLoading(false));
  }, [id]);

  function toggleMois(value: string) {
    setMoisSelectionnes((prev) =>
      prev.includes(value) ? prev.filter((m) => m !== value) : [...prev, value]
    );
  }

  if (loading) {
    return (
      <div className="bg-slate-50 min-h-screen pt-32 pb-20 flex justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
      </div>
    );
  }

  if (error || !membre) {
    return (
      <div className="bg-slate-50 min-h-screen pt-32 pb-20 text-center px-4">
        <p className="text-slate-500 mb-6">{error || "Ce lien de paiement n'est plus valide."}</p>
        <Link to="/" className="text-slate-900 font-semibold hover:underline">
          &larr; Retour à l'accueil
        </Link>
      </div>
    );
  }

  const montantTotal = MONTANT_COTISATION * moisSelectionnes.length;

  return (
    <div className="bg-slate-50 min-h-screen pt-32 pb-20 flex justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-brand-green-100 mx-auto mb-4 overflow-hidden flex items-center justify-center text-brand-green-700 font-bold text-xl">
            {membre.photo_url ? (
              <img src={membre.photo_url} alt={membre.nom} className="w-full h-full object-cover" />
            ) : (
              <span>{membre.prenom?.[0]}{membre.nom?.[0]}</span>
            )}
          </div>
          <h1 className="text-xl font-bold text-slate-900 mb-1">
            Bonjour {membre.prenom} {membre.nom}
          </h1>
          <p className="text-slate-500 mb-8">Réglez votre cotisation mensuelle AJDCB.</p>

          <div className="text-left mb-6">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Mois à régler <span className="text-slate-400 font-normal">(un ou plusieurs)</span>
            </label>
            <div className="space-y-1">
              {moisOptions.map((m) => (
                <label
                  key={m.value}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-50 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={moisSelectionnes.includes(m.value)}
                    onChange={() => toggleMois(m.value)}
                    className="w-4 h-4 rounded border-slate-300 text-brand-green-600 focus:ring-brand-green-500"
                  />
                  <span className="text-slate-700">{m.label}</span>
                </label>
              ))}
            </div>
          </div>

          {moisSelectionnes.length === 0 ? (
            <p className="text-sm text-slate-400">Sélectionnez au moins un mois pour continuer.</p>
          ) : (
            <FedaPayButton
              endpoint="/v1/paiements/cotisation"
              extraPayload={{ membre_id: membre.id, mois: moisSelectionnes }}
              montant={montantTotal}
              label="Payer ma cotisation"
              className="w-full"
              payeur={{
                nom_payeur: `${membre.prenom} ${membre.nom}`,
                telephone_payeur: membre.whatsapp || '',
              }}
            />
          )}

          {membre.statut === 'en_attente_paiement' && (
            <p className="mt-4 text-xs text-slate-500 flex items-center justify-center gap-1.5">
              <CheckCircle2 size={14} className="text-brand-green-500" />
              Ce paiement activera votre adhésion.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
