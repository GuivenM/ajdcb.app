import React, { useEffect, useMemo, useState } from 'react';
import { Loader2, Plus, Pencil, Trash2, Eye, Calendar, MapPin, Search, ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react';
import { api, ApiError } from '../../../lib/api';
import { compressImage } from '../../../lib/compressImage';
import { useAuth } from '../../context/AuthContext';
import type { Actualite, StatutActualite, TypeActualite } from '../types';
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

const TYPE_LABELS: Record<TypeActualite, string> = {
  actualite: 'Actualité',
  evenement: 'Événement',
  education: 'Éducation',
  culture: 'Culture',
};

const STATUT_LABELS: Record<StatutActualite, string> = {
  publie: 'Publié',
  brouillon: 'Brouillon',
};

const STATUT_BADGE: Record<StatutActualite, string> = {
  publie: 'bg-brand-green-50 text-brand-green-600 border-brand-green-200',
  brouillon: 'bg-slate-100 text-slate-500 border-slate-200',
};

type FilterTab = 'tous' | StatutActualite;

interface FormState {
  titre: string;
  description: string;
  contenu: string;
  type: TypeActualite;
  dateEvenement: string;
  lieuEvenement: string;
  statut: StatutActualite;
  imageFile: File | null;
}

function emptyForm(): FormState {
  return {
    titre: '',
    description: '',
    contenu: '',
    type: 'actualite',
    dateEvenement: '',
    lieuEvenement: '',
    statut: 'brouillon',
    imageFile: null,
  };
}

export function AdminActualites() {
  const { hasRole } = useAuth();
  const canCreate = hasRole('super_admin', 'admin', 'moderateur');
  const canEdit = hasRole('super_admin', 'admin');
  const canDelete = hasRole('super_admin');

  const [actualites, setActualites] = useState<Actualite[] | null>(null);
  const [filter, setFilter] = useState<FilterTab>('tous');
  const [editing, setEditing] = useState<Actualite | 'new' | null>(null);
  const [viewing, setViewing] = useState<Actualite | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm());
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<'titre' | 'type' | 'created_at' | 'statut'>('created_at');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  async function load() {
    try {
      const data = await api.get<Actualite[]>('/v1/actualites');
      setActualites(data);
    } catch {
      toast.error('Impossible de charger les actualités.');
    }
  }

  useEffect(() => {
    load();
  }, []);

  function toggleSort(key: 'titre' | 'type' | 'created_at' | 'statut') {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  }

  const filtered = useMemo(() => {
    if (!actualites) return [];
    let list = filter === 'tous' ? actualites : actualites.filter((a) => a.statut === filter);

    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (a) =>
          a.titre.toLowerCase().includes(q) ||
          a.description.toLowerCase().includes(q) ||
          a.auteur.toLowerCase().includes(q)
      );
    }

    const sorted = [...list].sort((a, b) => {
      let cmp = 0;
      if (sortKey === 'titre') cmp = a.titre.localeCompare(b.titre);
      else if (sortKey === 'type') cmp = a.type.localeCompare(b.type);
      else if (sortKey === 'statut') cmp = a.statut.localeCompare(b.statut);
      else cmp = a.created_at.localeCompare(b.created_at);
      return sortDir === 'asc' ? cmp : -cmp;
    });

    return sorted;
  }, [actualites, filter, search, sortKey, sortDir]);

  function openCreate() {
    setForm(emptyForm());
    setEditing('new');
  }

  function openEdit(a: Actualite) {
    setForm({
      titre: a.titre,
      description: a.description,
      contenu: a.contenu,
      type: a.type,
      dateEvenement: a.date_evenement ? a.date_evenement.slice(0, 10) : '',
      lieuEvenement: a.lieu_evenement || '',
      statut: a.statut,
      imageFile: null,
    });
    setEditing(a);
  }

  function buildFormData() {
    const fd = new FormData();
    fd.append('titre', form.titre);
    fd.append('description', form.description);
    fd.append('contenu', form.contenu);
    fd.append('type', form.type);
    if (form.dateEvenement) fd.append('date_evenement', form.dateEvenement);
    if (form.lieuEvenement) fd.append('lieu_evenement', form.lieuEvenement);
    fd.append('statut', form.statut);
    if (form.imageFile) fd.append('image', form.imageFile);
    return fd;
  }

  async function save() {
    if (!form.titre.trim() || !form.description.trim() || !form.contenu.trim()) {
      toast.error('Titre, description et contenu sont obligatoires.');
      return;
    }
    setSaving(true);
    try {
      const fd = buildFormData();
      if (editing === 'new') {
        const created = await api.postForm<Actualite>('/v1/actualites', fd, 'POST');
        setActualites((prev) => (prev ? [created, ...prev] : [created]));
        toast.success('Actualité créée avec succès.');
      } else if (editing) {
        const updated = await api.postForm<Actualite>(`/v1/actualites/${editing.id}`, fd, 'PUT');
        setActualites((prev) => prev?.map((a) => (a.id === updated.id ? updated : a)) ?? null);
        toast.success('Actualité mise à jour.');
      }
      setEditing(null);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Une erreur est survenue.');
    } finally {
      setSaving(false);
    }
  }

  async function remove(a: Actualite) {
    if (!confirm(`Supprimer définitivement « ${a.titre} » ?`)) return;
    try {
      await api.delete(`/v1/actualites/${a.id}`);
      setActualites((prev) => prev?.filter((x) => x.id !== a.id) ?? null);
      toast.success('Actualité supprimée.');
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Suppression impossible.');
    }
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Actualités</h1>
          <p className="text-slate-500 text-sm mt-0.5">Articles et annonces publiés sur le site.</p>
        </div>
        {canCreate && (
          <Button onClick={openCreate} className="bg-brand-green-600 hover:bg-brand-green-700">
            <Plus className="w-4 h-4" /> Rédiger une actualité
          </Button>
        )}
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
        <Tabs value={filter} onValueChange={(v) => setFilter(v as FilterTab)}>
          <TabsList>
            <TabsTrigger value="tous">Toutes</TabsTrigger>
            <TabsTrigger value="publie">Publiées</TabsTrigger>
            <TabsTrigger value="brouillon">Brouillons</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="relative sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher une actualité…"
            className="pl-9"
          />
        </div>
      </div>

      {actualites === null ? (
        <div className="flex items-center gap-2 text-slate-500 text-sm">
          <Loader2 className="w-4 h-4 animate-spin" /> Chargement…
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-slate-400 bg-white rounded-xl border border-brand-green-100">
          Aucune actualité dans cette catégorie.
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-brand-green-100 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <SortableHeader label="Titre" active={sortKey === 'titre'} dir={sortDir} onClick={() => toggleSort('titre')} />
                </TableHead>
                <TableHead className="hidden md:table-cell">
                  <SortableHeader label="Type" active={sortKey === 'type'} dir={sortDir} onClick={() => toggleSort('type')} />
                </TableHead>
                <TableHead className="hidden lg:table-cell">
                  <SortableHeader label="Publié le" active={sortKey === 'created_at'} dir={sortDir} onClick={() => toggleSort('created_at')} />
                </TableHead>
                <TableHead>
                  <SortableHeader label="Statut" active={sortKey === 'statut'} dir={sortDir} onClick={() => toggleSort('statut')} />
                </TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((a) => (
                <TableRow key={a.id} className="cursor-pointer" onClick={() => setViewing(a)}>
                  <TableCell>
                    <div className="font-medium text-slate-900 line-clamp-1">{a.titre}</div>
                    <div className="text-xs text-slate-400 line-clamp-1">{a.description}</div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <Badge variant="secondary">{TYPE_LABELS[a.type]}</Badge>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell text-slate-500 text-sm">
                    {new Date(a.created_at).toLocaleDateString('fr-FR')}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={STATUT_BADGE[a.statut]}>
                      {STATUT_LABELS[a.statut]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" onClick={() => setViewing(a)}>
                        <Eye className="w-4 h-4" />
                      </Button>
                      {canEdit && (
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

      <Dialog open={!!viewing} onOpenChange={(open) => !open && setViewing(null)}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          {viewing && (
            <>
              {viewing.image_url && (
                <img
                  src={viewing.image_url}
                  alt={viewing.titre}
                  className="w-full h-44 object-cover rounded-xl -mt-2"
                />
              )}
              <DialogHeader>
                <div className="flex items-center gap-2 flex-wrap">
                  <DialogTitle>{viewing.titre}</DialogTitle>
                  <Badge variant="outline" className={STATUT_BADGE[viewing.statut]}>
                    {STATUT_LABELS[viewing.statut]}
                  </Badge>
                </div>
              </DialogHeader>

              <div className="space-y-4 text-sm">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="secondary">{TYPE_LABELS[viewing.type]}</Badge>
                  <span className="text-xs text-slate-400">
                    Publié le {new Date(viewing.created_at).toLocaleDateString('fr-FR')} — {viewing.auteur}
                  </span>
                </div>

                {(viewing.date_evenement || viewing.lieu_evenement) && (
                  <div className="flex flex-wrap gap-4 text-slate-600">
                    {viewing.date_evenement && (
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        {new Date(viewing.date_evenement).toLocaleDateString('fr-FR')}
                      </span>
                    )}
                    {viewing.lieu_evenement && (
                      <span className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        {viewing.lieu_evenement}
                      </span>
                    )}
                  </div>
                )}

                <p className="text-slate-600 italic">{viewing.description}</p>

                <div className="pt-2 border-t border-slate-100">
                  <p className="text-slate-700 whitespace-pre-wrap">{viewing.contenu}</p>
                </div>
              </div>

              {canEdit && (
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setViewing(null);
                      openEdit(viewing);
                    }}
                  >
                    <Pencil className="w-4 h-4" /> Modifier
                  </Button>
                </DialogFooter>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!editing} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent className="max-w-xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing === 'new' ? 'Rédiger une actualité' : "Modifier l'actualité"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="titre">Titre</Label>
              <Input
                id="titre"
                value={form.titre}
                onChange={(e) => setForm((f) => ({ ...f, titre: e.target.value }))}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="description">Description courte</Label>
              <Textarea
                id="description"
                rows={2}
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="Affichée dans les listes et l'extrait de l'article"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="contenu">Contenu</Label>
              <Textarea
                id="contenu"
                rows={6}
                value={form.contenu}
                onChange={(e) => setForm((f) => ({ ...f, contenu: e.target.value }))}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="image">Image</Label>
              <Input
                id="image"
                type="file"
                accept="image/jpeg,image/png,image/jpg"
                onChange={async (e) => {
                  const raw = e.target.files?.[0] || null;
                  const imageFile = raw ? await compressImage(raw) : null;
                  setForm((f) => ({ ...f, imageFile }));
                }}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Type</Label>
                <Select
                  value={form.type}
                  onValueChange={(v) => setForm((f) => ({ ...f, type: v as TypeActualite }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(TYPE_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Statut</Label>
                <Select
                  value={form.statut}
                  onValueChange={(v) => setForm((f) => ({ ...f, statut: v as StatutActualite }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="brouillon">Brouillon</SelectItem>
                    <SelectItem value="publie">Publié</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {form.type === 'evenement' && (
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="date-evenement">Date de l'événement (optionnel)</Label>
                  <Input
                    id="date-evenement"
                    type="date"
                    value={form.dateEvenement}
                    onChange={(e) => setForm((f) => ({ ...f, dateEvenement: e.target.value }))}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="lieu-evenement">Lieu (optionnel)</Label>
                  <Input
                    id="lieu-evenement"
                    value={form.lieuEvenement}
                    onChange={(e) => setForm((f) => ({ ...f, lieuEvenement: e.target.value }))}
                  />
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              disabled={saving}
              onClick={save}
              className="bg-brand-green-600 hover:bg-brand-green-700"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {editing === 'new' ? 'Publier' : 'Enregistrer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function SortableHeader({
  label,
  active,
  dir,
  onClick,
}: {
  label: string;
  active: boolean;
  dir: 'asc' | 'desc';
  onClick: () => void;
}) {
  return (
    <button onClick={onClick} className="flex items-center gap-1 hover:text-slate-900">
      {label}
      {active ? (
        dir === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
      ) : (
        <ArrowUpDown className="w-3 h-3 text-slate-300" />
      )}
    </button>
  );
}
