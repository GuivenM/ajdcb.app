import React, { useEffect, useMemo, useState } from 'react';
import { Loader2, Plus, Pencil, Trash2, UserX, UserCheck } from 'lucide-react';
import { api, ApiError } from '../../../lib/api';
import { useAuth } from '../../context/AuthContext';
import type { Membre, StatutMembre } from '../types';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '../../components/ui/avatar';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { toast } from 'sonner';

type FilterTab = 'tous' | StatutMembre;

const NONE = '__aucun__';

interface FormState {
  nom: string;
  prenom: string;
  poste: string;
  commission: string;
  whatsapp: string;
  facebook: string;
  instagram: string;
  linkedin: string;
  twitter: string;
  photoFile: File | null;
}

const EMPTY_FORM: FormState = {
  nom: '',
  prenom: '',
  poste: NONE,
  commission: NONE,
  whatsapp: '',
  facebook: '',
  instagram: '',
  linkedin: '',
  twitter: '',
  photoFile: null,
};

export function AdminMembres() {
  const { hasRole } = useAuth();
  const canWrite = hasRole('super_admin', 'admin');
  const canDelete = hasRole('super_admin');

  const [membres, setMembres] = useState<Membre[] | null>(null);
  const [postes, setPostes] = useState<string[]>([]);
  const [commissions, setCommissions] = useState<string[]>([]);
  const [filter, setFilter] = useState<FilterTab>('tous');

  const [editing, setEditing] = useState<Membre | 'new' | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  async function load() {
    try {
      const [m, p, c] = await Promise.all([
        api.get<Membre[]>('/v1/membres-admin/tous'),
        api.get<string[]>('/v1/membres/postes-bureau'),
        api.get<string[]>('/v1/membres/commissions'),
      ]);
      setMembres(m);
      setPostes(p);
      setCommissions(c);
    } catch {
      toast.error('Impossible de charger les membres.');
    }
  }

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    if (!membres) return [];
    if (filter === 'tous') return membres;
    return membres.filter((m) => m.statut === filter);
  }, [membres, filter]);

  function openCreate() {
    setForm(EMPTY_FORM);
    setEditing('new');
  }

  function openEdit(m: Membre) {
    setForm({
      nom: m.nom,
      prenom: m.prenom,
      poste: m.poste || NONE,
      commission: m.commission || NONE,
      whatsapp: m.whatsapp || '',
      facebook: m.facebook || '',
      instagram: m.instagram || '',
      linkedin: m.linkedin || '',
      twitter: m.twitter || '',
      photoFile: null,
    });
    setEditing(m);
  }

  function buildFormData() {
    const fd = new FormData();
    fd.append('nom', form.nom);
    fd.append('prenom', form.prenom);
    if (form.poste !== NONE) fd.append('poste', form.poste);
    if (form.commission !== NONE) fd.append('commission', form.commission);
    if (form.whatsapp) fd.append('whatsapp', form.whatsapp);
    if (form.facebook) fd.append('facebook', form.facebook);
    if (form.instagram) fd.append('instagram', form.instagram);
    if (form.linkedin) fd.append('linkedin', form.linkedin);
    if (form.twitter) fd.append('twitter', form.twitter);
    if (form.photoFile) fd.append('photo', form.photoFile);
    return fd;
  }

  async function save() {
    if (!form.nom.trim() || !form.prenom.trim()) {
      toast.error('Nom et prénom sont obligatoires.');
      return;
    }
    setSaving(true);
    try {
      const fd = buildFormData();
      if (editing === 'new') {
        const created = await api.postForm<Membre>('/v1/membres', fd, 'POST');
        setMembres((prev) => (prev ? [created, ...prev] : [created]));
        toast.success('Membre ajouté avec succès.');
      } else if (editing) {
        const updated = await api.postForm<Membre>(`/v1/membres/${editing.id}`, fd, 'PUT');
        setMembres((prev) => prev?.map((m) => (m.id === updated.id ? updated : m)) ?? null);
        toast.success('Membre mis à jour.');
      }
      setEditing(null);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Une erreur est survenue.');
    } finally {
      setSaving(false);
    }
  }

  async function toggleStatut(m: Membre) {
    const nouveauStatut: StatutMembre = m.statut === 'actif' ? 'inactif' : 'actif';
    try {
      const updated = await api.put<Membre>(`/v1/membres/${m.id}`, { statut: nouveauStatut });
      setMembres((prev) => prev?.map((x) => (x.id === updated.id ? updated : x)) ?? null);
      toast.success(
        nouveauStatut === 'actif' ? 'Membre réactivé.' : 'Membre désactivé.'
      );
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Action impossible.');
    }
  }

  async function remove(m: Membre) {
    if (!confirm(`Supprimer définitivement ${m.prenom} ${m.nom} ?`)) return;
    try {
      await api.delete(`/v1/membres/${m.id}`);
      setMembres((prev) => prev?.filter((x) => x.id !== m.id) ?? null);
      toast.success('Membre supprimé.');
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Suppression impossible.');
    }
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Membres</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Bureau exécutif, commissions et membres actifs de l'AJDCB.
          </p>
        </div>
        {canWrite && (
          <Button onClick={openCreate} className="bg-brand-green-600 hover:bg-brand-green-700">
            <Plus className="w-4 h-4" /> Ajouter un membre
          </Button>
        )}
      </div>

      <Tabs value={filter} onValueChange={(v) => setFilter(v as FilterTab)} className="mb-5">
        <TabsList>
          <TabsTrigger value="tous">Tous</TabsTrigger>
          <TabsTrigger value="actif">Actifs</TabsTrigger>
          <TabsTrigger value="inactif">Inactifs</TabsTrigger>
        </TabsList>
      </Tabs>

      {membres === null ? (
        <div className="flex items-center gap-2 text-slate-500 text-sm">
          <Loader2 className="w-4 h-4 animate-spin" /> Chargement…
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-slate-400 bg-white rounded-xl border border-brand-green-100">
          Aucun membre dans cette catégorie.
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-brand-green-100 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Membre</TableHead>
                <TableHead className="hidden md:table-cell">Rôle</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((m) => (
                <TableRow key={m.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="w-8 h-8">
                        {m.photo_url && <AvatarImage src={m.photo_url} alt={m.nom_complet} />}
                        <AvatarFallback className="text-xs bg-brand-green-50 text-brand-green-700">
                          {m.prenom[0]}
                          {m.nom[0]}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium text-slate-900">{m.nom_complet}</span>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-slate-600">{m.role}</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        m.statut === 'actif'
                          ? 'bg-brand-green-50 text-brand-green-600 border-brand-green-200'
                          : 'bg-slate-100 text-slate-500 border-slate-200'
                      }
                    >
                      {m.statut === 'actif' ? 'Actif' : 'Inactif'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      {canWrite && (
                        <>
                          <Button variant="ghost" size="icon" onClick={() => openEdit(m)}>
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => toggleStatut(m)}>
                            {m.statut === 'actif' ? (
                              <UserX className="w-4 h-4" />
                            ) : (
                              <UserCheck className="w-4 h-4" />
                            )}
                          </Button>
                        </>
                      )}
                      {canDelete && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-brand-red-600 hover:text-brand-red-700"
                          onClick={() => remove(m)}
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
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing === 'new' ? 'Ajouter un membre' : 'Modifier le membre'}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="prenom">Prénom</Label>
                <Input
                  id="prenom"
                  value={form.prenom}
                  onChange={(e) => setForm((f) => ({ ...f, prenom: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="nom">Nom</Label>
                <Input
                  id="nom"
                  value={form.nom}
                  onChange={(e) => setForm((f) => ({ ...f, nom: e.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="photo">Photo</Label>
              <Input
                id="photo"
                type="file"
                accept="image/jpeg,image/png,image/jpg"
                onChange={(e) => setForm((f) => ({ ...f, photoFile: e.target.files?.[0] || null }))}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Poste au bureau</Label>
                <Select
                  value={form.poste}
                  onValueChange={(v) => setForm((f) => ({ ...f, poste: v }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={NONE}>Aucun</SelectItem>
                    {postes.map((p) => (
                      <SelectItem key={p} value={p}>
                        {p}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Commission</Label>
                <Select
                  value={form.commission}
                  onValueChange={(v) => setForm((f) => ({ ...f, commission: v }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={NONE}>Aucune</SelectItem>
                    {commissions.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="whatsapp">WhatsApp</Label>
              <Input
                id="whatsapp"
                value={form.whatsapp}
                onChange={(e) => setForm((f) => ({ ...f, whatsapp: e.target.value }))}
                placeholder="+229 00 00 00 00"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="facebook">Facebook</Label>
                <Input
                  id="facebook"
                  value={form.facebook}
                  onChange={(e) => setForm((f) => ({ ...f, facebook: e.target.value }))}
                  placeholder="https://facebook.com/…"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="instagram">Instagram</Label>
                <Input
                  id="instagram"
                  value={form.instagram}
                  onChange={(e) => setForm((f) => ({ ...f, instagram: e.target.value }))}
                  placeholder="https://instagram.com/…"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="linkedin">LinkedIn</Label>
                <Input
                  id="linkedin"
                  value={form.linkedin}
                  onChange={(e) => setForm((f) => ({ ...f, linkedin: e.target.value }))}
                  placeholder="https://linkedin.com/…"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="twitter">X / Twitter</Label>
                <Input
                  id="twitter"
                  value={form.twitter}
                  onChange={(e) => setForm((f) => ({ ...f, twitter: e.target.value }))}
                  placeholder="https://x.com/…"
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              disabled={saving}
              onClick={save}
              className="bg-brand-green-600 hover:bg-brand-green-700"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {editing === 'new' ? 'Ajouter' : 'Enregistrer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
