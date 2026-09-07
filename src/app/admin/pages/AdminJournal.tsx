import React, { useEffect, useState } from 'react';
import { Loader2, History, ChevronLeft, ChevronRight, Bot } from 'lucide-react';
import { api, ApiError } from '../../../lib/api';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { toast } from 'sonner';

interface EntreeJournal {
  id: number;
  action: string;
  description: string;
  created_at: string;
  user: { id: number; nom: string; prenom: string } | null;
}

interface Meta {
  current_page: number;
  last_page: number;
  total: number;
}

const CATEGORIE_COULEUR: Record<string, string> = {
  cotisation: 'bg-brand-gold-100 text-brand-gold-700 border-brand-gold-200',
  membre: 'bg-brand-green-50 text-brand-green-700 border-brand-green-200',
  utilisateur: 'bg-blue-50 text-blue-700 border-blue-200',
  adhesion: 'bg-purple-50 text-purple-700 border-purple-200',
};

function badgeCouleur(action: string) {
  const categorie = action.split('.')[0];
  return CATEGORIE_COULEUR[categorie] || 'bg-slate-100 text-slate-600 border-slate-200';
}

export function AdminJournal() {
  const [entrees, setEntrees] = useState<EntreeJournal[] | null>(null);
  const [meta, setMeta] = useState<Meta | null>(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    load(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  async function load(p: number) {
    setEntrees(null);
    try {
      const res = await api.get<{ items: EntreeJournal[]; meta: Meta }>(`/v1/journal-activite?page=${p}`);
      setEntrees(res.items);
      setMeta(res.meta);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Impossible de charger le journal.');
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <History className="w-6 h-6 text-slate-400" /> Journal d'activité
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Historique des actions sensibles : cotisations, membres, comptes admin, adhésions.
        </p>
      </div>

      {entrees === null ? (
        <div className="flex justify-center py-20 text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      ) : entrees.length === 0 ? (
        <div className="text-center py-16 text-slate-400 bg-white rounded-3xl border border-slate-100">
          Rien à afficher pour l'instant.
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-100 divide-y divide-slate-100">
          {entrees.map((e) => (
            <div key={e.id} className="flex items-start gap-4 p-4">
              <Badge variant="outline" className={`shrink-0 mt-0.5 ${badgeCouleur(e.action)}`}>
                {e.action}
              </Badge>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-slate-800">{e.description}</p>
                <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                  {e.user ? (
                    `${e.user.prenom} ${e.user.nom}`
                  ) : (
                    <>
                      <Bot className="w-3 h-3" /> Automatique (système)
                    </>
                  )}
                  {' — '}
                  {new Date(e.created_at).toLocaleString('fr-FR')}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {meta && meta.last_page > 1 && (
        <div className="flex items-center justify-center gap-3 mt-6">
          <Button variant="outline" size="icon" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="text-sm text-slate-500">
            Page {meta.current_page} / {meta.last_page}
          </span>
          <Button variant="outline" size="icon" disabled={page >= meta.last_page} onClick={() => setPage((p) => p + 1)}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
