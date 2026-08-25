import React, { useEffect, useMemo, useState } from 'react';
import { Loader2, Plus, Pencil, Trash2 } from 'lucide-react';
import { api, ApiError } from '../../../lib/api';
import { useAuth } from '../../context/AuthContext';
import type { Action, StatutAction, SectionAction } from '../types';
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
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { toast } from 'sonner';

const SECTION_LABELS: Record<SectionAction, string> = {
  solidarite: 'Solidarité & Intégration',
  education: 'Éducation & Formation',
  culture: 'Culture & Identité',
  communication: 'Communication & Partenariats',
};

const STATUT_LABELS: Record<StatutAction, string> = {
  actif: 'En cours',
  a_venir: 'À venir',
  termine: 'Terminé',
  inactif: 'Inactif',
};

const STATUT_BADGE: Record<StatutAction, string> = {
  actif: 'bg-brand-green-50 text-brand-green-600 border-brand-green-200',
  a_venir: 'bg-brand-gold-50 text-brand-gold-500 border-brand-gold-200',
  termine: 'bg-slate-100 text-slate-500 border-slate-200',
  inactif: 'bg-brand-red-50 text-brand-red-600 border-brand-red-200',
};

type FilterTab = 'toutes' | SectionAction;

interface FormState {
  titre: string;
  description: string;
  section: SectionAction;
  dateDebut: string;
  dateFin: string;
  dateEvenement: string;
  lieu: string;
  objectifs: string;
  activitesCles: string;
  resultats: string;
  statut: StatutAction;
  imageFile: File | null;
}

function emptyForm(): FormState {
  return {
    titre: '', description: '', section: 'solidarite', dateDebut: '', dateFin: '',
    dateEvenement: '', lieu: '', objectifs: '', activitesCles: '', resultats: '',
    statut: 'a_venir', imageFile: null,
  };
}

function toLines(v: string) {
  return v.split('\n').map((l) => l.trim()).filter(Boolean);
}

export function AdminActions() {
  const { hasRole } = useAuth();
  const canWrite = hasRole('super_admin', 'admin');
  const canDelete = hasRole('super_admin');

  const [actions, setActions] = useState<Action[] | null>(null);
  const [filter, setFilter] = useState<FilterTab>('toutes');
  const [editing, setEditing] = useState<Action | 'new' | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm());
  const [saving, setSaving] = useState(false);

  async function load() {
    try {
      const data = await api.get<Action[]>('/v1/actions');
      setActions(data);
    } catch {
      toast.error('Impossible de charger les actions.');
    }
  }

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    if (!actions) return [];
    if (filter === 'toutes') return actions;
    return actions.filter((a) => a.section === filter);
  }, [actions, filter]);

  function openCreate() {
    setForm(emptyForm());
    setEditing('new');
  }

  function openEdit(a: Action) {
    setForm({
      titre: a.titre,
      description: a.description,
      section: a.section,
      dateDebut: a.date_debut ? a.date_debut.slice(0, 10) : '',
      dateFin: a.date_fin ? a.date_fin.slice(0, 10) : '',
      dateEvenement: a.date_evenement ? a.date_evenement.slice(0, 10) : '',
      lieu: a.lieu || '',
      objectifs: (a.objectifs || []).join('\n'),
      activitesCles: (a.activites_cles || []).join('\n'),
      resultats: (a.resultats || []).join('\n'),
      statut: a.statut,
      imageFile: null,
    });
    setEditing(a);
  }

  function buildFormData() {
    const fd = new FormData();
    fd.append('titre', form.titre);
    fd.append('description', form.description);
    fd.append('section', form.section);
    if (form.dateDebut) fd.append('date_debut', form.dateDebut);
    if (form.dateFin) fd.append('date_fin', form.dateFin);
    if (form.dateEvenement) fd.append('date_evenement', form.dateEvenement);
    if (form.lieu) fd.append('lieu', form.lieu);
    toLines(form.objectifs).forEach((v) => fd.append('objectifs[]', v));
    toLines(form.activitesCles).forEach((v) => fd.append('activites_cles[]', v));
    toLines(form.resultats).forEach((v) => fd.append('resultats[]', v));
    fd.append('statut', form.statut);
    if (form.imageFile) fd.append('image', form.imageFile);
    return fd;
  }

  async function save() {
    if (!form.titre.trim() || !form.description.trim()) {
      toast.error('Titre et description sont obligatoires.');
      return;
    }
    setSaving(true);
    try {
      const fd = buildFormData();
      if (editing === 'new') {
        const created = await api.postForm<Action>('/v1/actions', fd, 'POST');
        setActions((prev) => (prev ? [created, ...prev] : [created]));
        toast.success('Action créée avec succès.');
      } else if (editing) {
        // La route de mise à jour est en POST côté backend (pas de PUT).
        const updated = await api.postForm<Action>(`/v1/actions/${editing.id}`, fd, 'POST');
        setActions((prev) => prev?.map((a) => (a.id === updated.id ? updated : a)) ?? null);
        toast.success('Action mise à jour.');
      }
      setEditing(null);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Une erreur est survenue.');
    } finally {
      setSaving(false);
    }
  }

  async function remove(a: Action) {
    if (!confirm(`Supprimer définitivement « ${a.titre} » ?`)) return;
    try {
      await api.delete(`/v1/actions/${a.id}`);
      setActions((prev) => prev?.filter((x) => x.id !== a.id) ?? null);
      toast.success('Action supprimée.');
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Suppression impossible.');
    }
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Actions</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Projets et réalisations de l'AJDCB, par commission.
          </p>
        </div>
        {canWrite && (
          <Button onClick={openCreate} className="bg-brand-green-600 hover:bg-brand-green-700">
            <Plus className="w-4 h-4" /> Créer une action
          </Button>
        )}
      </div>

      <Tabs value={filter} onValueChange={(v) => setFilter(v as FilterTab)} className="mb-5">
        <TabsList className="flex-wrap h-auto">
          <TabsTrigger value="toutes">Toutes</TabsTrigger>
          {Object.entries(SECTION_LABELS).map(([value, label]) => (
            <TabsTrigger key={value} value={value}>{label}</TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {actions === null ? (
        <div className="flex items-center gap-2 text-slate-500 text-sm">
          <Loader2 className="w-4 h-4 animate-spin" /> Chargement…
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-slate-400 bg-white rounded-xl border border-brand-green-100">
          Aucune action dans cette catégorie.
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-brand-green-100 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Action</TableHead>
                <TableHead className="hidden md:table-cell">Commission</TableHead>
                <TableHead className="hidden lg:table-cell">Lieu</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((a) => (
                <TableRow key={a.id}>
                  <TableCell>
                    <div className="font-medium text-slate-900 line-clamp-1">{a.titre}</div>
                    <div className="text-xs text-slate-400 line-clamp-1">{a.description}</div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <Badge variant="secondary">{SECTION_LABELS[a.section]}</Badge>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell text-slate-600 text-sm">
                    {a.lieu || '—'}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={STATUT_BADGE[a.statut]}>
                      {STATUT_LABELS[a.statut]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      {canWrite && (
                        <Button variant="ghost" size="icon" onClick={() => openEdit(a)}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                      )}
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

      <Dialog open={!!editing} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent className="max-w-xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing === 'new' ? 'Créer une action' : "Modifier l'action"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="titre">Titre</Label>
              <Input id="titre" value={form.titre} onChange={(e) => setForm((f) => ({ ...f, titre: e.target.value }))} />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" rows={3} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="image">Image</Label>
              <Input id="image" type="file" accept="image/jpeg,image/png,image/jpg" onChange={(e) => setForm((f) => ({ ...f, imageFile: e.target.files?.[0] || null }))} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Commission</Label>
                <Select value={form.section} onValueChange={(v) => setForm((f) => ({ ...f, section: v as SectionAction }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(SECTION_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Statut</Label>
                <Select value={form.statut} onValueChange={(v) => setForm((f) => ({ ...f, statut: v as StatutAction }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(STATUT_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="date-debut">Date de début (optionnel)</Label>
                <Input id="date-debut" type="date" value={form.dateDebut} onChange={(e) => setForm((f) => ({ ...f, dateDebut: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="date-fin">Date de fin (optionnel)</Label>
                <Input id="date-fin" type="date" value={form.dateFin} onChange={(e) => setForm((f) => ({ ...f, dateFin: e.target.value }))} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="date-evenement">Date ponctuelle (optionnel)</Label>
                <Input id="date-evenement" type="date" value={form.dateEvenement} onChange={(e) => setForm((f) => ({ ...f, dateEvenement: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="lieu">Lieu</Label>
                <Input id="lieu" value={form.lieu} onChange={(e) => setForm((f) => ({ ...f, lieu: e.target.value }))} />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="objectifs">Objectifs <span className="text-slate-400 font-normal">(un par ligne)</span></Label>
              <Textarea id="objectifs" rows={3} value={form.objectifs} onChange={(e) => setForm((f) => ({ ...f, objectifs: e.target.value }))} placeholder={'Renforcer l\'insertion des jeunes\nFavoriser l\'entraide communautaire'} />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="activites">Activités clés <span className="text-slate-400 font-normal">(une par ligne)</span></Label>
              <Textarea id="activites" rows={3} value={form.activitesCles} onChange={(e) => setForm((f) => ({ ...f, activitesCles: e.target.value }))} />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="resultats">Résultats <span className="text-slate-400 font-normal">(un par ligne)</span></Label>
              <Textarea id="resultats" rows={3} value={form.resultats} onChange={(e) => setForm((f) => ({ ...f, resultats: e.target.value }))} />
            </div>
          </div>

          <DialogFooter>
            <Button disabled={saving} onClick={save} className="bg-brand-green-600 hover:bg-brand-green-700">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {editing === 'new' ? 'Créer' : 'Enregistrer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
