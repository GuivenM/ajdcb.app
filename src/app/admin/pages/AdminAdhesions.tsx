import React, { useEffect, useMemo, useState } from 'react';
import { Loader2, Check, X, Trash2, Eye } from 'lucide-react';
import { api, ApiError } from '../../../lib/api';
import { useAuth } from '../../context/AuthContext';
import type { Adhesion, StatutAdhesion } from '../types';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '../../components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../../components/ui/dialog';
import { Textarea } from '../../components/ui/textarea';
import { Label } from '../../components/ui/label';
import { toast } from 'sonner';

const STATUT_LABELS: Record<StatutAdhesion, string> = {
  en_attente: 'En attente',
  approuvee: 'Approuvée',
  rejetee: 'Rejetée',
};

const STATUT_BADGE: Record<StatutAdhesion, string> = {
  en_attente: 'bg-brand-gold-50 text-brand-gold-500 border-brand-gold-200',
  approuvee: 'bg-brand-green-50 text-brand-green-600 border-brand-green-200',
  rejetee: 'bg-brand-red-50 text-brand-red-600 border-brand-red-200',
};

type FilterTab = 'tous' | StatutAdhesion;

export function AdminAdhesions() {
  const { hasRole } = useAuth();
  const canTraiter = hasRole('super_admin', 'admin');
  const canDelete = hasRole('super_admin');

  const [adhesions, setAdhesions] = useState<Adhesion[] | null>(null);
  const [filter, setFilter] = useState<FilterTab>('tous');
  const [selected, setSelected] = useState<Adhesion | null>(null);
  const [commentaire, setCommentaire] = useState('');
  const [processing, setProcessing] = useState(false);

  async function load() {
    try {
      const data = await api.get<Adhesion[]>('/v1/adhesions');
      setAdhesions(data);
    } catch {
      toast.error('Impossible de charger les demandes d\'adhésion.');
    }
  }

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    if (!adhesions) return [];
    if (filter === 'tous') return adhesions;
    return adhesions.filter((a) => a.statut === filter);
  }, [adhesions, filter]);

  function openDetail(a: Adhesion) {
    setSelected(a);
    setCommentaire(a.commentaire_traitement || '');
  }

  async function traiter(statut: 'approuvee' | 'rejetee') {
    if (!selected) return;
    setProcessing(true);
    try {
      const updated = await api.put<Adhesion>(`/v1/adhesions/${selected.id}/traiter`, {
        statut,
        commentaire: commentaire || undefined,
      });
      setAdhesions((prev) => prev?.map((a) => (a.id === updated.id ? updated : a)) ?? null);
      toast.success(
        statut === 'approuvee' ? 'Demande approuvée avec succès.' : 'Demande rejetée avec succès.'
      );
      setSelected(null);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Une erreur est survenue.');
    } finally {
      setProcessing(false);
    }
  }

  async function remove(a: Adhesion) {
    if (!confirm(`Supprimer définitivement la demande de ${a.prenom} ${a.nom} ?`)) return;
    try {
      await api.delete(`/v1/adhesions/${a.id}`);
      setAdhesions((prev) => prev?.filter((x) => x.id !== a.id) ?? null);
      toast.success('Demande supprimée.');
      if (selected?.id === a.id) setSelected(null);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Suppression impossible.');
    }
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Demandes d'adhésion</h1>
          <p className="text-slate-500 text-sm">Examinez et traitez les candidatures reçues.</p>
        </div>
      </div>

      <Tabs value={filter} onValueChange={(v) => setFilter(v as FilterTab)} className="mb-5">
        <TabsList>
          <TabsTrigger value="tous">Toutes</TabsTrigger>
          <TabsTrigger value="en_attente">En attente</TabsTrigger>
          <TabsTrigger value="approuvee">Approuvées</TabsTrigger>
          <TabsTrigger value="rejetee">Rejetées</TabsTrigger>
        </TabsList>
      </Tabs>

      {adhesions === null ? (
        <div className="flex items-center gap-2 text-slate-500">
          <Loader2 className="w-4 h-4 animate-spin" /> Chargement…
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-slate-400 bg-white rounded-xl border border-brand-green-100">
          Aucune demande dans cette catégorie.
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-brand-green-100 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Candidat</TableHead>
                <TableHead className="hidden md:table-cell">Ville</TableHead>
                <TableHead className="hidden md:table-cell">Profession</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((a) => (
                <TableRow key={a.id}>
                  <TableCell>
                    <div className="font-medium text-slate-900">
                      {a.prenom} {a.nom}
                    </div>
                    <div className="text-xs text-slate-400">{a.email}</div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-slate-600">{a.ville}</TableCell>
                  <TableCell className="hidden md:table-cell text-slate-600">
                    {a.profession}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={STATUT_BADGE[a.statut]}>
                      {STATUT_LABELS[a.statut]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" onClick={() => openDetail(a)}>
                        <Eye className="w-4 h-4" />
                      </Button>
                      {canDelete && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-brand-red-600 hover:text-brand-red-700"
                          onClick={() => remove(a)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle>
                  {selected.prenom} {selected.nom}
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-3 text-sm">
                <Badge variant="outline" className={STATUT_BADGE[selected.statut]}>
                  {STATUT_LABELS[selected.statut]}
                </Badge>

                <dl className="grid grid-cols-2 gap-x-4 gap-y-2 mt-3">
                  <Info label="Email" value={selected.email} />
                  <Info label="Téléphone" value={selected.telephone} />
                  <Info label="Ville" value={selected.ville} />
                  <Info label="Nationalité" value={selected.nationalite} />
                  <Info label="Profession" value={selected.profession} />
                  <Info label="Niveau d'étude" value={selected.niveau_etude} />
                  {selected.etablissement && (
                    <Info label="Établissement" value={selected.etablissement} />
                  )}
                  <Info label="Adresse" value={selected.adresse} />
                </dl>

                <div>
                  <p className="text-slate-400 text-xs mb-1">Motivation</p>
                  <p className="text-slate-700 whitespace-pre-wrap">{selected.motivation}</p>
                </div>

                {selected.statut === 'en_attente' && canTraiter && (
                  <div className="pt-2">
                    <Label htmlFor="commentaire" className="text-xs text-slate-400 mb-1 block">
                      Commentaire (optionnel, envoyé au candidat par email)
                    </Label>
                    <Textarea
                      id="commentaire"
                      value={commentaire}
                      onChange={(e) => setCommentaire(e.target.value)}
                      rows={3}
                      placeholder="Ex : motivation claire, bienvenue à l'AJDCB !"
                    />
                  </div>
                )}

                {selected.statut !== 'en_attente' && selected.commentaire_traitement && (
                  <div>
                    <p className="text-slate-400 text-xs mb-1">Commentaire de traitement</p>
                    <p className="text-slate-700">{selected.commentaire_traitement}</p>
                  </div>
                )}
              </div>

              {selected.statut === 'en_attente' && canTraiter && (
                <DialogFooter className="gap-2 sm:gap-2">
                  <Button
                    variant="outline"
                    disabled={processing}
                    onClick={() => traiter('rejetee')}
                    className="border-brand-red-200 text-brand-red-600 hover:bg-brand-red-50"
                  >
                    <X className="w-4 h-4" /> Rejeter
                  </Button>
                  <Button
                    disabled={processing}
                    onClick={() => traiter('approuvee')}
                    className="bg-brand-green-600 hover:bg-brand-green-700"
                  >
                    <Check className="w-4 h-4" /> Approuver
                  </Button>
                </DialogFooter>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-slate-400 text-xs">{label}</p>
      <p className="text-slate-700">{value}</p>
    </div>
  );
}
