import React, { useEffect, useMemo, useState } from 'react';
import { Loader2, Check, X, Trash2, Eye, FileText, Download, Search, ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react';
import { api, ApiError } from '../../../lib/api';
import { useAuth } from '../../context/AuthContext';
import type { Adhesion, StatutAdhesion } from '../types';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '../../components/ui/avatar';
import { Tabs, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Input } from '../../components/ui/input';
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

const PROFESSION_LABELS: Record<string, string> = {
  etudiant: 'Étudiant(e)',
  employe: 'Employé(e)',
  entrepreneur: 'Entrepreneur(e)',
  commercant: 'Commerçant(e)',
  sans_emploi: 'Sans emploi',
  autre: 'Autre',
};

const SEXE_LABELS: Record<string, string> = { masculin: 'Masculin', feminin: 'Féminin' };

const SITUATION_LABELS: Record<string, string> = {
  marie: 'Marié(e)', divorce: 'Divorcé(e)', union_libre: 'Union libre',
  celibataire: 'Célibataire', veuf: 'Veuf(ve)',
};

type FilterTab = 'tous' | StatutAdhesion;

export function AdminAdhesions() {
  const { hasRole } = useAuth();
  const canTraiter = hasRole('super_admin', 'admin');
  const canDelete = hasRole('super_admin');

  const [adhesions, setAdhesions] = useState<Adhesion[] | null>(null);
  const [filter, setFilter] = useState<FilterTab>('tous');
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<'nom' | 'ville' | 'statut'>('nom');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [selected, setSelected] = useState<Adhesion | null>(null);
  const [commentaire, setCommentaire] = useState('');
  const [processing, setProcessing] = useState(false);

  async function load() {
    try {
      const data = await api.get<Adhesion[]>('/v1/adhesions');
      setAdhesions(data);
    } catch {
      toast.error("Impossible de charger les demandes d'adhésion.");
    }
  }

  useEffect(() => {
    load();
  }, []);

  function toggleSort(key: 'nom' | 'ville' | 'statut') {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  }

  const filtered = useMemo(() => {
    if (!adhesions) return [];
    let list = filter === 'tous' ? adhesions : adhesions.filter((a) => a.statut === filter);

    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (a) =>
          `${a.prenom} ${a.nom}`.toLowerCase().includes(q) ||
          a.email.toLowerCase().includes(q) ||
          (a.ville || '').toLowerCase().includes(q) ||
          (a.profession || '').toLowerCase().includes(q)
      );
    }

    const sorted = [...list].sort((a, b) => {
      let cmp = 0;
      if (sortKey === 'nom') cmp = `${a.prenom} ${a.nom}`.localeCompare(`${b.prenom} ${b.nom}`);
      else if (sortKey === 'ville') cmp = (a.ville || '').localeCompare(b.ville || '');
      else cmp = a.statut.localeCompare(b.statut);
      return sortDir === 'asc' ? cmp : -cmp;
    });

    return sorted;
  }, [adhesions, filter, search, sortKey, sortDir]);

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
      toast.success(statut === 'approuvee' ? 'Demande approuvée avec succès.' : 'Demande rejetée avec succès.');
      setSelected(updated);
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
          <h1 className="text-xl font-bold text-slate-900">Demandes d'adhésion</h1>
          <p className="text-slate-500 text-sm mt-0.5">Examinez et traitez les candidatures reçues.</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
        <Tabs value={filter} onValueChange={(v) => setFilter(v as FilterTab)}>
          <TabsList>
            <TabsTrigger value="tous">Toutes</TabsTrigger>
            <TabsTrigger value="en_attente">En attente</TabsTrigger>
            <TabsTrigger value="approuvee">Approuvées</TabsTrigger>
            <TabsTrigger value="rejetee">Rejetées</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="relative sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher une demande…"
            className="pl-9"
          />
        </div>
      </div>

      {adhesions === null ? (
        <div className="flex items-center gap-2 text-slate-500 text-sm">
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
                <TableHead>
                  <SortableHeader label="Candidat" active={sortKey === 'nom'} dir={sortDir} onClick={() => toggleSort('nom')} />
                </TableHead>
                <TableHead className="hidden md:table-cell">
                  <SortableHeader label="Ville" active={sortKey === 'ville'} dir={sortDir} onClick={() => toggleSort('ville')} />
                </TableHead>
                <TableHead className="hidden md:table-cell">Profession</TableHead>
                <TableHead>
                  <SortableHeader label="Statut" active={sortKey === 'statut'} dir={sortDir} onClick={() => toggleSort('statut')} />
                </TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((a) => (
                <TableRow key={a.id} className="cursor-pointer" onClick={() => openDetail(a)}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="w-8 h-8">
                        {a.photo_url && <AvatarImage src={a.photo_url} alt={a.nom} />}
                        <AvatarFallback className="text-xs bg-brand-green-50 text-brand-green-700">
                          {a.prenom[0]}{a.nom[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium text-slate-900">{a.prenom} {a.nom}</div>
                        <div className="text-xs text-slate-400">{a.email}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-slate-600">{a.ville}</TableCell>
                  <TableCell className="hidden md:table-cell text-slate-600">
                    {PROFESSION_LABELS[a.profession] || a.profession}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={STATUT_BADGE[a.statut]}>
                      {STATUT_LABELS[a.statut]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
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
        <DialogContent className="max-w-2xl max-h-[88vh] overflow-y-auto">
          {selected && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-3">
                  <Avatar className="w-14 h-14">
                    {selected.photo_url && <AvatarImage src={selected.photo_url} alt={selected.nom} />}
                    <AvatarFallback className="bg-brand-green-50 text-brand-green-700">
                      {selected.prenom[0]}{selected.nom[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <DialogTitle>{selected.prenom} {selected.nom}</DialogTitle>
                    <Badge variant="outline" className={`${STATUT_BADGE[selected.statut]} mt-1`}>
                      {STATUT_LABELS[selected.statut]}
                    </Badge>
                  </div>
                </div>
              </DialogHeader>

              <div className="space-y-6 text-sm">
                <Section title="Nationalité & pièces">
                  <Info label="Nationalité" value={selected.nationalite} />
                  <Info label="Congolais(e)" value={selected.est_congolais ? 'Oui' : 'Non'} />
                  <Info label="Depuis au Bénin" value={selected.duree_au_benin} />
                  <Info label="Carte consulaire" value={selected.possede_carte_consulaire ? 'Oui' : 'Non'} />
                  <Info label="CIPR" value={selected.possede_cipr ? 'Oui' : 'Non'} />
                  <DocLinks
                    docs={[
                      { label: 'Carte consulaire', url: selected.carte_consulaire_fichier_url },
                      { label: 'CIPR', url: selected.cipr_fichier_url },
                    ]}
                  />
                </Section>

                <Section title="État civil">
                  <Info label="Sexe" value={selected.sexe ? SEXE_LABELS[selected.sexe] : null} />
                  <Info label="Date de naissance" value={new Date(selected.date_naissance).toLocaleDateString('fr-FR')} />
                  <Info label="Lieu de naissance" value={selected.lieu_naissance} />
                  <Info label="Nom marital" value={selected.nom_marital} />
                  <Info
                    label="Situation matrimoniale"
                    value={selected.situation_matrimoniale ? SITUATION_LABELS[selected.situation_matrimoniale] : null}
                  />
                  <Info label="Enfants à charge" value={selected.nombre_enfants_charge?.toString()} />
                  <Info label="Lieu de résidence" value={selected.adresse} />
                  <Info label="Ville" value={selected.ville} />
                </Section>

                <Section title="Statut professionnel">
                  <Info
                    label="Profession"
                    value={selected.profession === 'autre' ? selected.profession_autre : PROFESSION_LABELS[selected.profession]}
                  />
                  <Info label="Niveau d'études" value={selected.niveau_etude_autre || selected.niveau_etude} />
                  <Info label="Dernier diplôme" value={selected.dernier_diplome_autre || selected.dernier_diplome} />
                  {selected.profession === 'entrepreneur' && (
                    <>
                      <Info label="Domaine d'activité" value={selected.entrepreneur_domaine_autre || selected.entrepreneur_domaine} />
                      <Info label="Depuis" value={selected.entrepreneur_duree} />
                      <Info label="Entreprise" value={selected.entrepreneur_nom_entreprise} />
                      <Info label="Fonction" value={selected.entrepreneur_fonction} />
                    </>
                  )}
                  {selected.profession === 'etudiant' && (
                    <>
                      <Info label="Établissement" value={selected.etablissement} />
                      <Info label="Filière" value={selected.etudiant_filiere} />
                      <Info label="Année" value={selected.etudiant_annee} />
                    </>
                  )}
                </Section>

                <Section title="Compétences, intérêts & langues">
                  <TagList label="Compétences" values={selected.competences} autre={selected.competences_autre} />
                  <TagList label="Domaines d'intérêt" values={selected.centres_interet} autre={selected.domaines_interet_autre} />
                  <TagList label="Loisirs" values={selected.loisirs} autre={selected.loisirs_autre} />
                  <Info label="Disponibilité" value={selected.disponibilite} full />
                  <TagList label="Langues" values={selected.langues} />
                </Section>

                <Section title="Engagement associatif">
                  <Info label="Connu via" value={selected.comment_connu_autre || selected.comment_connu} />
                  <Info label="Recommandé par" value={selected.recommande_par} />
                  <Info label="Expérience associative" value={selected.experience_associative ? 'Oui' : 'Non'} />
                  {selected.experience_associative_details && (
                    <Info label="Détails" value={selected.experience_associative_details} full />
                  )}
                  <TagList label="Commissions souhaitées" values={selected.commissions_souhaitees} />
                  {selected.motivation && <Info label="Motivation" value={selected.motivation} full />}
                  {selected.attentes && <Info label="Attentes" value={selected.attentes} full />}
                </Section>

                <Section title="Coordonnées">
                  <Info label="Email" value={selected.email} />
                  <Info label="Téléphone" value={selected.telephone} />
                  <Info label="Autre téléphone" value={selected.autre_telephone} />
                  <Info label="Reçoit les actualités" value={selected.souhaite_recevoir_actualites ? 'Oui' : 'Non'} />
                </Section>

                {(selected.declarant_nom_complet || (selected.lettre_demande_fichiers_urls?.length ?? 0) > 0) && (
                  <Section title="Déclaration">
                    <Info label="Déclarant" value={selected.declarant_nom_complet} />
                    <DocLinks
                      docs={(selected.lettre_demande_fichiers_urls || []).map((url, i) => ({
                        label: `Lettre au Président (${i + 1})`,
                        url,
                      }))}
                    />
                  </Section>
                )}

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

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-2.5">{title}</h3>
      <dl className="grid grid-cols-2 gap-x-4 gap-y-2.5">{children}</dl>
    </div>
  );
}

function Info({ label, value, full = false }: { label: string; value?: string | null; full?: boolean }) {
  if (!value) return null;
  return (
    <div className={full ? 'col-span-2' : undefined}>
      <p className="text-slate-400 text-xs">{label}</p>
      <p className="text-slate-700 whitespace-pre-wrap">{value}</p>
    </div>
  );
}

function TagList({ label, values, autre }: { label: string; values?: string[] | null; autre?: string | null }) {
  const all = [...(values || []), ...(autre ? [autre] : [])];
  if (all.length === 0) return null;
  return (
    <div className="col-span-2">
      <p className="text-slate-400 text-xs mb-1.5">{label}</p>
      <div className="flex flex-wrap gap-1.5">
        {all.map((v, i) => (
          <Badge key={i} variant="secondary" className="font-normal">{v}</Badge>
        ))}
      </div>
    </div>
  );
}

function DocLinks({ docs }: { docs: { label: string; url: string | null }[] }) {
  const available = docs.filter((d) => d.url);
  if (available.length === 0) return null;
  return (
    <div className="col-span-2 flex flex-wrap gap-2 pt-1">
      {available.map((d) => (
        <a
          key={d.label}
          href={d.url!}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-1.5 text-xs bg-slate-50 hover:bg-slate-100 rounded-lg px-2.5 py-1.5 text-slate-600"
        >
          <FileText className="w-3.5 h-3.5 text-slate-400" />
          {d.label}
          <Download className="w-3 h-3 text-slate-300" />
        </a>
      ))}
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
