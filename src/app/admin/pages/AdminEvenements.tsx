import React, { useEffect, useMemo, useState } from 'react';
import { Loader2, Plus, Pencil, Trash2, MapPin, Users } from 'lucide-react';
import { api, ApiError } from '../../../lib/api';
import { useAuth } from '../../context/AuthContext';
import type { Evenement, StatutEvenement } from '../types';
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

const STATUT_LABELS: Record<StatutEvenement, string> = {
  publie: 'Publié',
  brouillon: 'Brouillon',
  annule: 'Annulé',
};

const STATUT_BADGE: Record<StatutEvenement, string> = {
  publie: 'bg-brand-green-50 text-brand-green-600 border-brand-green-200',
  brouillon: 'bg-slate-100 text-slate-500 border-slate-200',
  annule: 'bg-brand-red-50 text-brand-red-600 border-brand-red-200',
};

type FilterTab = 'tous' | StatutEvenement;

interface FormState {
  titre: string;
  description: string;
  contenu: string;
  dateDebut: string;
  dateFin: string;
  heureDebut: string;
  heureFin: string;
  lieu: string;
  adresse: string;
  ville: string;
  categorie: string;
  capaciteMax: string;
  prix: string;
  lienBillet: string;
  organisateur: string;
  emailContact: string;
  telephoneContact: string;
  statut: StatutEvenement;
  imageFile: File | null;
}

function emptyForm(): FormState {
  return {
    titre: '',
    description: '',
    contenu: '',
    dateDebut: '',
    dateFin: '',
    heureDebut: '',
    heureFin: '',
    lieu: '',
    adresse: '',
    ville: '',
    categorie: '',
    capaciteMax: '',
    prix: '',
    lienBillet: '',
    organisateur: '',
    emailContact: '',
    telephoneContact: '',
    statut: 'brouillon',
    imageFile: null,
  };
}

export function AdminEvenements() {
  const { hasRole } = useAuth();
  const canWrite = hasRole('super_admin', 'admin');
  const canDelete = hasRole('super_admin');

  const [evenements, setEvenements] = useState<Evenement[] | null>(null);
  const [filter, setFilter] = useState<FilterTab>('tous');
  const [editing, setEditing] = useState<Evenement | 'new' | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm());
  const [saving, setSaving] = useState(false);

  async function load() {
    try {
      const data = await api.get<Evenement[]>('/v1/evenements');
      setEvenements(data);
    } catch {
      toast.error('Impossible de charger les événements.');
    }
  }

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    if (!evenements) return [];
    const sorted = [...evenements].sort((a, b) => b.date_debut.localeCompare(a.date_debut));
    if (filter === 'tous') return sorted;
    return sorted.filter((e) => e.statut === filter);
  }, [evenements, filter]);

  function openCreate() {
    setForm(emptyForm());
    setEditing('new');
  }

  function openEdit(e: Evenement) {
    setForm({
      titre: e.titre,
      description: e.description || '',
      contenu: e.contenu || '',
      dateDebut: e.date_debut,
      dateFin: e.date_fin,
      heureDebut: e.heure_debut || '',
      heureFin: e.heure_fin || '',
      lieu: e.lieu || '',
      adresse: e.adresse || '',
      ville: e.ville || '',
      categorie: e.categorie || '',
      capaciteMax: e.capacite_max?.toString() || '',
      prix: e.prix?.toString() || '',
      lienBillet: e.lien_billet || '',
      organisateur: e.organisateur || '',
      emailContact: e.email_contact || '',
      telephoneContact: e.telephone_contact || '',
      statut: e.statut,
      imageFile: null,
    });
    setEditing(e);
  }

  function buildFormData() {
    const fd = new FormData();
    fd.append('titre', form.titre);
    if (form.description) fd.append('description', form.description);
    if (form.contenu) fd.append('contenu', form.contenu);
    fd.append('date_debut', form.dateDebut);
    fd.append('date_fin', form.dateFin);
    if (form.heureDebut) fd.append('heure_debut', form.heureDebut);
    if (form.heureFin) fd.append('heure_fin', form.heureFin);
    if (form.lieu) fd.append('lieu', form.lieu);
    if (form.adresse) fd.append('adresse', form.adresse);
    if (form.ville) fd.append('ville', form.ville);
    if (form.categorie) fd.append('categorie', form.categorie);
    if (form.capaciteMax) fd.append('capacite_max', form.capaciteMax);
    if (form.prix) {
      fd.append('prix', form.prix);
      fd.append('devise', 'FCFA');
    }
    if (form.lienBillet) fd.append('lien_billet', form.lienBillet);
    if (form.organisateur) fd.append('organisateur', form.organisateur);
    if (form.emailContact) fd.append('email_contact', form.emailContact);
    if (form.telephoneContact) fd.append('telephone_contact', form.telephoneContact);
    fd.append('statut', form.statut);
    if (form.imageFile) fd.append('image', form.imageFile);
    return fd;
  }

  async function save() {
    if (!form.titre.trim() || !form.dateDebut || !form.dateFin) {
      toast.error('Titre, date de début et date de fin sont obligatoires.');
      return;
    }
    if (form.dateFin < form.dateDebut) {
      toast.error('La date de fin doit être postérieure ou égale à la date de début.');
      return;
    }
    setSaving(true);
    try {
      const fd = buildFormData();
      if (editing === 'new') {
        const created = await api.postForm<Evenement>('/v1/evenements', fd, 'POST');
        setEvenements((prev) => (prev ? [created, ...prev] : [created]));
        toast.success('Événement créé avec succès.');
      } else if (editing) {
        const updated = await api.postForm<Evenement>(`/v1/evenements/${editing.id}`, fd, 'PUT');
        setEvenements((prev) => prev?.map((e) => (e.id === updated.id ? updated : e)) ?? null);
        toast.success('Événement mis à jour.');
      }
      setEditing(null);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Une erreur est survenue.');
    } finally {
      setSaving(false);
    }
  }

  async function remove(e: Evenement) {
    if (!confirm(`Supprimer définitivement « ${e.titre} » ?`)) return;
    try {
      await api.delete(`/v1/evenements/${e.id}`);
      setEvenements((prev) => prev?.filter((x) => x.id !== e.id) ?? null);
      toast.success('Événement supprimé.');
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Suppression impossible.');
    }
  }

  function periode(e: Evenement) {
    const d1 = new Date(e.date_debut).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
    const d2 = new Date(e.date_fin).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
    return e.date_debut === e.date_fin ? d2 : `${d1} → ${d2}`;
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Événements</h1>
          <p className="text-slate-500 text-sm mt-0.5">Calendrier, lieux, capacité et billetterie.</p>
        </div>
        {canWrite && (
          <Button onClick={openCreate} className="bg-brand-green-600 hover:bg-brand-green-700">
            <Plus className="w-4 h-4" /> Créer un événement
          </Button>
        )}
      </div>

      <Tabs value={filter} onValueChange={(v) => setFilter(v as FilterTab)} className="mb-5">
        <TabsList>
          <TabsTrigger value="tous">Tous</TabsTrigger>
          <TabsTrigger value="publie">Publiés</TabsTrigger>
          <TabsTrigger value="brouillon">Brouillons</TabsTrigger>
          <TabsTrigger value="annule">Annulés</TabsTrigger>
        </TabsList>
      </Tabs>

      {evenements === null ? (
        <div className="flex items-center gap-2 text-slate-500 text-sm">
          <Loader2 className="w-4 h-4 animate-spin" /> Chargement…
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-slate-400 bg-white rounded-xl border border-brand-green-100">
          Aucun événement dans cette catégorie.
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-brand-green-100 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Événement</TableHead>
                <TableHead className="hidden md:table-cell">Période</TableHead>
                <TableHead className="hidden lg:table-cell">Lieu</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((e) => (
                <TableRow key={e.id}>
                  <TableCell>
                    <div className="font-medium text-slate-900">{e.titre}</div>
                    {e.capacite_max ? (
                      <div className="flex items-center gap-1 text-xs text-slate-400 mt-0.5">
                        <Users className="w-3 h-3" />
                        {e.nombre_inscrits} / {e.capacite_max} inscrits
                      </div>
                    ) : null}
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-slate-600 text-sm">
                    {periode(e)}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell text-slate-600 text-sm">
                    {e.lieu ? (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400" /> {e.lieu}
                      </span>
                    ) : (
                      '—'
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={STATUT_BADGE[e.statut]}>
                      {STATUT_LABELS[e.statut]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      {canWrite && (
                        <Button variant="ghost" size="icon" onClick={() => openEdit(e)}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                      )}
                      {canDelete && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-brand-red-600 hover:text-brand-red-700"
                          onClick={() => remove(e)}
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
            <DialogTitle>{editing === 'new' ? 'Créer un événement' : "Modifier l'événement"}</DialogTitle>
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
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="contenu">Contenu détaillé</Label>
              <Textarea
                id="contenu"
                rows={4}
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
                onChange={(e) => setForm((f) => ({ ...f, imageFile: e.target.files?.[0] || null }))}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="date-debut">Date de début</Label>
                <Input
                  id="date-debut"
                  type="date"
                  value={form.dateDebut}
                  onChange={(e) => setForm((f) => ({ ...f, dateDebut: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="date-fin">Date de fin</Label>
                <Input
                  id="date-fin"
                  type="date"
                  value={form.dateFin}
                  onChange={(e) => setForm((f) => ({ ...f, dateFin: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="heure-debut">Heure de début</Label>
                <Input
                  id="heure-debut"
                  type="time"
                  value={form.heureDebut}
                  onChange={(e) => setForm((f) => ({ ...f, heureDebut: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="heure-fin">Heure de fin</Label>
                <Input
                  id="heure-fin"
                  type="time"
                  value={form.heureFin}
                  onChange={(e) => setForm((f) => ({ ...f, heureFin: e.target.value }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="lieu">Lieu</Label>
                <Input
                  id="lieu"
                  value={form.lieu}
                  onChange={(e) => setForm((f) => ({ ...f, lieu: e.target.value }))}
                  placeholder="Salle des fêtes, Akpakpa…"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="ville">Ville</Label>
                <Input
                  id="ville"
                  value={form.ville}
                  onChange={(e) => setForm((f) => ({ ...f, ville: e.target.value }))}
                  placeholder="Cotonou"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="adresse">Adresse</Label>
              <Input
                id="adresse"
                value={form.adresse}
                onChange={(e) => setForm((f) => ({ ...f, adresse: e.target.value }))}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="capacite">Capacité max (optionnel)</Label>
                <Input
                  id="capacite"
                  type="number"
                  min="0"
                  value={form.capaciteMax}
                  onChange={(e) => setForm((f) => ({ ...f, capaciteMax: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="prix">Prix en FCFA (optionnel)</Label>
                <Input
                  id="prix"
                  type="number"
                  min="0"
                  value={form.prix}
                  onChange={(e) => setForm((f) => ({ ...f, prix: e.target.value }))}
                  placeholder="0 = gratuit"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="lien-billet">Lien billetterie (optionnel)</Label>
              <Input
                id="lien-billet"
                value={form.lienBillet}
                onChange={(e) => setForm((f) => ({ ...f, lienBillet: e.target.value }))}
                placeholder="https://…"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="organisateur">Organisateur</Label>
                <Input
                  id="organisateur"
                  value={form.organisateur}
                  onChange={(e) => setForm((f) => ({ ...f, organisateur: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Statut</Label>
                <Select
                  value={form.statut}
                  onValueChange={(v) => setForm((f) => ({ ...f, statut: v as StatutEvenement }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="brouillon">Brouillon</SelectItem>
                    <SelectItem value="publie">Publié</SelectItem>
                    <SelectItem value="annule">Annulé</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="email-contact">Email de contact</Label>
                <Input
                  id="email-contact"
                  type="email"
                  value={form.emailContact}
                  onChange={(e) => setForm((f) => ({ ...f, emailContact: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="tel-contact">Téléphone de contact</Label>
                <Input
                  id="tel-contact"
                  value={form.telephoneContact}
                  onChange={(e) => setForm((f) => ({ ...f, telephoneContact: e.target.value }))}
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
              {editing === 'new' ? 'Créer' : 'Enregistrer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
