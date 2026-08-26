import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Calendar, MapPin, Loader2 } from 'lucide-react';
import { api, ApiError } from '../../lib/api';
import { Evenement } from '../admin/types';
import { FedaPayButton } from '../components/FedaPayButton';

export function Events() {
  const [evenements, setEvenements] = useState<Evenement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .get<Evenement[]>('/v1/evenements?a_venir=1')
      .then(setEvenements)
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Erreur de chargement'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="bg-slate-50 min-h-screen pt-32 pb-20">
      <div className="container mx-auto px-4 md:px-6">
        <div className="mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">Événements</h1>
          <p className="text-xl text-slate-500">Les prochains rendez-vous de la communauté congolaise au Bénin.</p>
        </div>

        {loading && (
          <div className="flex justify-center py-20 text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
        )}

        {error && !loading && (
          <div className="text-center py-20 text-slate-500">{error}</div>
        )}

        {!loading && !error && evenements.length === 0 && (
          <div className="text-center py-20 text-slate-500">Aucun événement à venir pour le moment.</div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {evenements.map((evt, index) => {
            const payant = !!evt.prix && evt.prix > 0;
            const complet = evt.capacite_max != null && evt.nombre_inscrits >= evt.capacite_max;

            return (
              <motion.div
                key={evt.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-100 flex flex-col"
              >
                <div className="h-48 bg-slate-200 relative overflow-hidden">
                  {evt.image_url ? (
                    <img src={evt.image_url} alt={evt.titre} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400">
                      <Calendar size={40} />
                    </div>
                  )}
                  {evt.categorie && (
                    <span className="absolute top-4 left-4 px-3 py-1 bg-white/90 backdrop-blur-md rounded-lg text-xs font-bold text-slate-700 uppercase tracking-wider">
                      {evt.categorie}
                    </span>
                  )}
                </div>

                <div className="p-6 flex flex-col flex-1">
                  <div className="flex items-center gap-2 text-brand-green-600 text-xs font-semibold mb-2">
                    <Calendar size={14} />
                    {new Date(evt.date_debut).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 mb-2">{evt.titre}</h3>

                  {evt.description && (
                    <p className="text-slate-500 text-sm mb-4 line-clamp-3">{evt.description}</p>
                  )}

                  {evt.lieu && (
                    <div className="flex items-center gap-2 text-slate-400 text-xs mb-4">
                      <MapPin size={14} />
                      {evt.lieu}
                    </div>
                  )}

                  <div className="mt-auto pt-4">
                    {complet ? (
                      <span className="text-sm font-semibold text-red-500">Événement complet</span>
                    ) : payant ? (
                      <FedaPayButton
                        endpoint={`/v1/paiements/evenements/${evt.id}`}
                        montant={evt.prix as number}
                        devise={evt.devise || 'XOF'}
                        label="Réserver ma place"
                        className="w-full justify-center"
                      />
                    ) : (
                      <span className="inline-block px-4 py-2 bg-brand-green-50 text-brand-green-700 rounded-full text-sm font-semibold">
                        Entrée libre
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
