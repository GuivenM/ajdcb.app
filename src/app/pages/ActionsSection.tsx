import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowLeft, Calendar, Loader2, MapPin } from 'lucide-react';
import { api, ApiError } from '../../lib/api';
import { Action, SectionAction } from '../admin/types';

const PILLAR_TITLES: Record<SectionAction, string> = {
  solidarite: 'Solidarité & Intégration',
  education: 'Éducation & Formation',
  culture: 'Culture & Identité',
  communication: 'Communication & Partenariats',
};

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?q=80&w=1000&auto=format&fit=crop';

export function ActionsSection() {
  const { section } = useParams<{ section: SectionAction }>();
  const [actions, setActions] = useState<Action[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!section) return;
    setLoading(true);
    setError(null);
    api
      .get<Action[]>(`/v1/actions/section/${section}`)
      .then((data) => setActions(data.filter((a) => a.statut === 'actif')))
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Erreur de chargement'))
      .finally(() => setLoading(false));
  }, [section]);

  const title = (section && PILLAR_TITLES[section]) || 'Actions';

  return (
    <div className="bg-slate-50 min-h-screen pt-32 pb-20">
      <div className="container mx-auto px-4 md:px-6 max-w-5xl">
        <Link
          to="/actions"
          className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-900 mb-8 transition-colors"
        >
          <ArrowLeft size={18} />
          Retour aux piliers
        </Link>

        <h1 className="text-3xl md:text-5xl font-bold text-slate-900 mb-12">{title}</h1>

        {loading && (
          <div className="flex justify-center py-24 text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
        )}

        {error && !loading && <div className="text-center py-24 text-slate-500">{error}</div>}

        {!loading && !error && actions.length === 0 && (
          <div className="text-center py-24 text-slate-500">
            Aucune réalisation publiée pour ce pilier pour le moment.
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-8">
          {actions.map((action, index) => (
            <motion.div
              key={action.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-100"
            >
              <div className="aspect-video bg-slate-200">
                <img
                  src={action.image_url || FALLBACK_IMAGE}
                  alt={action.titre}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-6">
                <h2 className="text-xl font-bold text-slate-900 mb-2">{action.titre}</h2>
                <div className="flex flex-wrap items-center gap-4 text-slate-500 text-sm mb-3">
                  {(action.date_affichage || action.date_debut) && (
                    <div className="flex items-center gap-1.5">
                      <Calendar size={14} />
                      {action.date_affichage ||
                        new Date(action.date_debut as string).toLocaleDateString('fr-FR', { dateStyle: 'long' })}
                    </div>
                  )}
                  {(action.lieu_affichage || action.lieu) && (
                    <div className="flex items-center gap-1.5">
                      <MapPin size={14} />
                      {action.lieu_affichage || action.lieu}
                    </div>
                  )}
                </div>
                <p className="text-slate-600 leading-relaxed">{action.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
