import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowLeft, Calendar, Loader2, MapPin } from 'lucide-react';
import { api, ApiError } from '../../lib/api';
import { Actualite } from '../admin/types';

export function NewsDetail() {
  const { id } = useParams<{ id: string }>();
  const [actualite, setActualite] = useState<Actualite | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    api
      .get<Actualite>(`/v1/actualites/${id}`)
      .then(setActualite)
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Erreur de chargement'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="bg-slate-50 min-h-screen pt-32 pb-20 flex justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
      </div>
    );
  }

  if (error || !actualite) {
    return (
      <div className="bg-slate-50 min-h-screen pt-32 pb-20">
        <div className="container mx-auto px-4 md:px-6 text-center">
          <p className="text-slate-500 mb-6">{error || "Cette publication n'existe pas ou plus."}</p>
          <Link to="/news" className="text-slate-900 font-semibold hover:underline">
            &larr; Retour au journal
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen pt-32 pb-20">
      <div className="container mx-auto px-4 md:px-6 max-w-3xl">
        <Link
          to="/news"
          className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-900 mb-8 transition-colors"
        >
          <ArrowLeft size={18} />
          Retour au journal
        </Link>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {actualite.image_url && (
            <div className="rounded-3xl overflow-hidden mb-8 aspect-video bg-slate-200">
              <img
                src={actualite.image_url}
                alt={actualite.titre}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <span className="px-3 py-1 bg-slate-900 text-white rounded-lg text-xs font-bold uppercase tracking-wider">
            {actualite.type_label}
          </span>

          <h1 className="text-3xl md:text-5xl font-bold text-slate-900 mt-4 mb-4">
            {actualite.titre}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-slate-500 text-sm mb-8">
            <div className="flex items-center gap-2">
              <Calendar size={16} />
              {actualite.date_evenement
                ? new Date(actualite.date_evenement).toLocaleString('fr-FR', {
                    dateStyle: 'long',
                    timeStyle: 'short',
                  })
                : new Date(actualite.created_at).toLocaleDateString('fr-FR', { dateStyle: 'long' })}
            </div>
            {actualite.lieu_evenement && (
              <div className="flex items-center gap-2">
                <MapPin size={16} />
                {actualite.lieu_evenement}
              </div>
            )}
            <span>Par {actualite.auteur}</span>
          </div>

          {actualite.description && (
            <p className="text-xl text-slate-600 mb-8 leading-relaxed">{actualite.description}</p>
          )}

          <div className="prose prose-slate max-w-none whitespace-pre-wrap leading-relaxed text-slate-700">
            {actualite.contenu}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
