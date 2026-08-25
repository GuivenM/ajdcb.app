import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { UserPlus, Mail, Loader2, ArrowRight } from 'lucide-react';
import { api } from '../../lib/api';
import { useAuth } from '../context/AuthContext';
import type { Adhesion, Message } from './types';

export function Dashboard() {
  const { user } = useAuth();
  const [adhesions, setAdhesions] = useState<Adhesion[] | null>(null);
  const [messages, setMessages] = useState<Message[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [a, m] = await Promise.all([
          api.get<Adhesion[]>('/v1/adhesions'),
          api.get<Message[]>('/v1/messages'),
        ]);
        if (!cancelled) {
          setAdhesions(a);
          setMessages(m);
        }
      } catch {
        if (!cancelled) setError("Impossible de charger les données du tableau de bord.");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const loading = adhesions === null || messages === null;
  const enAttente = adhesions?.filter((a) => a.statut === 'en_attente').length ?? 0;
  const approuvees = adhesions?.filter((a) => a.statut === 'approuvee').length ?? 0;
  const nonLus = messages?.filter((m) => m.statut === 'non_lu').length ?? 0;
  const repondus = messages?.filter((m) => m.statut === 'repondu').length ?? 0;

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Tableau de bord</h1>
          <p className="text-slate-500 text-sm mt-0.5">Bonjour {user?.prenom}, voici l'activité de l'AJDCB.</p>
        </div>
        <span className="text-xs text-slate-400 hidden sm:block">
          {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
        </span>
      </div>

      {error && (
        <div className="mb-5 rounded-xl bg-brand-red-50 border border-brand-red-200 text-brand-red-700 text-sm px-4 py-3">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center gap-2 text-slate-500 text-sm">
          <Loader2 className="w-4 h-4 animate-spin" /> Chargement…
        </div>
      ) : (
        <>
          {/* Cartes KPI — grille aérée, une carte par indicateur */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 mb-3.5">
            <StatCard
              label="Adhésions en attente"
              value={enAttente}
              icon={UserPlus}
              tone={enAttente > 0 ? 'gold' : 'green'}
            />
            <StatCard label="Adhésions approuvées" value={approuvees} icon={UserPlus} tone="green" />
            <StatCard
              label="Messages non lus"
              value={nonLus}
              icon={Mail}
              tone={nonLus > 0 ? 'red' : 'green'}
            />
            <StatCard label="Messages répondus" value={repondus} icon={Mail} tone="green" />
          </div>

          {/* Accès rapides — deux cartes côte à côte, même esprit que les cartes KPI */}
          <div className="grid md:grid-cols-2 gap-3.5">
            <QuickLinkCard
              to="/admin/adhesions"
              title="Demandes d'adhésion"
              description={
                enAttente > 0
                  ? `${enAttente} demande${enAttente > 1 ? 's' : ''} en attente de traitement.`
                  : "Aucune demande en attente pour l'instant."
              }
              cta="Traiter les demandes"
            />
            <QuickLinkCard
              to="/admin/messages"
              title="Messages"
              description={
                nonLus > 0
                  ? `${nonLus} message${nonLus > 1 ? 's' : ''} non lu${nonLus > 1 ? 's' : ''}.`
                  : 'Boîte de réception à jour.'
              }
              cta="Voir la boîte de réception"
            />
          </div>

          <p className="text-sm text-slate-400 mt-6">
            Tous les modules prévus pour cette V1 sont maintenant en place.
          </p>
        </>
      )}
    </div>
  );
}

const TONE_STYLES = {
  green: 'text-brand-green-600',
  gold: 'text-brand-gold-500',
  red: 'text-brand-red-600',
} as const;

function StatCard({
  label,
  value,
  icon: Icon,
  tone = 'green',
}: {
  label: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  tone?: keyof typeof TONE_STYLES;
}) {
  return (
    <div className="bg-white border border-brand-green-100 rounded-xl p-[18px]">
      <div className="flex items-center justify-between">
        <span className="text-xs text-slate-400">{label}</span>
        <Icon className={`w-4 h-4 ${TONE_STYLES[tone]}`} />
      </div>
      <div className="text-2xl font-bold text-slate-900 mt-2">{value}</div>
    </div>
  );
}

function QuickLinkCard({
  to,
  title,
  description,
  cta,
}: {
  to: string;
  title: string;
  description: string;
  cta: string;
}) {
  return (
    <Link
      to={to}
      className="bg-white border border-brand-green-100 rounded-xl p-5 hover:border-brand-green-300 transition-colors group"
    >
      <h2 className="text-sm font-semibold text-slate-900 mb-1">{title}</h2>
      <p className="text-sm text-slate-500 mb-4">{description}</p>
      <span className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-green-600">
        {cta}
        <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
      </span>
    </Link>
  );
}
