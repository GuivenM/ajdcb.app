import React, { useEffect, useMemo, useState } from 'react';
import {
  Loader2,
  Check,
  X,
  History,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Search,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
  Download,
} from 'lucide-react';
import { api, ApiError, downloadFile } from '../../../lib/api';
import { useAuth } from '../../context/AuthContext';
import type {
  CotisationMembre,
  CotisationStats,
  CotisationHistoriqueEntry,
  ModePaiement,
} from '../types';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '../../components/ui/avatar';
import { VilleSelect } from '../../components/VilleSelect';
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

const MODE_LABELS: Record<ModePaiement, string> = {
  especes: 'Espèces',
  mobile_money: 'Mobile Money',
  virement: 'Virement',
  autre: 'Autre',
};

const MOIS_LABELS = [
  'janvier', 'février', 'mars', 'avril', 'mai', 'juin',
  'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre',
];

function moisLabel(mois: string) {
  const [y, m] = mois.split('-').map(Number);
  return `${MOIS_LABELS[m - 1]} ${y}`;
}

function shiftMois(mois: string, delta: number) {
  const [y, m] = mois.split('-').map(Number);
  const d = new Date(y, m - 1 + delta, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function fmtMontant(v: number) {
  return new Intl.NumberFormat('fr-FR').format(v) + ' FCFA';
}

type FilterTab = 'tous' | 'a_jour' | 'en_retard';

export function AdminCotisations() {
  const { hasRole } = useAuth();
  const canWrite = hasRole('super_admin', 'admin', 'tresorier');

  const [mois, setMois] = useState(() => new Date().toISOString().slice(0, 7));
  const [lignes, setLignes] = useState<CotisationMembre[] | null>(null);
  const [stats, setStats] = useState<CotisationStats | null>(null);
  const [filter, setFilter] = useState<FilterTab>('tous');
  const [search, setSearch] = useState('');
  const [villeFilter, setVilleFilter] = useState<string | null>(null);
  const [sortKey, setSortKey] = useState<'nom' | 'statut' | 'ville'>('nom');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [exporting, setExporting] = useState(false);

  const [paiementTarget, setPaiementTarget] = useState<CotisationMembre | null>(null);
  const [datePaiement, setDatePaiement] = useState('');
  const [modePaiement, setModePaiement] = useState<ModePaiement>('especes');
  const [montant, setMontant] = useState('1000');
  const [commentaire, setCommentaire] = useState('');
  const [saving, setSaving] = useState(false);

  const [historique, setHistorique] = useState<{
    membre_id: number;
    nom: string;
    entries: CotisationHistoriqueEntry[];
    alerte: boolean;
  } | null>(null);
  const [paiementMois, setPaiementMois] = useState<string | null>(null);

  async function load(m: string) {
    setLignes(null);
    setStats(null);
    try {
      const [l, s] = await Promise.all([
        api.get<CotisationMembre[]>(`/v1/cotisations?mois=${m}`),
        api.get<CotisationStats>(`/v1/cotisations/statistiques?mois=${m}`),
      ]);
      setLignes(l);
      setStats(s);
    } catch {
      toast.error('Impossible de charger les cotisations.');
    }
  }

  useEffect(() => {
    load(mois);
  }, [mois]);

  function toggleSort(key: 'nom' | 'statut' | 'ville') {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  }

  const filtered = useMemo(() => {
    if (!lignes) return [];
    let list =
      filter === 'tous'
        ? lignes
        : filter === 'a_jour'
        ? lignes.filter((l) => l.statut === 'payee')
        : lignes.filter((l) => l.statut === 'impayee');

    if (villeFilter) {
      list = list.filter((l) => l.ville === villeFilter);
    }

    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter((l) => l.nom_complet.toLowerCase().includes(q));
    }

    const sorted = [...list].sort((a, b) => {
      const cmp =
        sortKey === 'nom'
          ? a.nom_complet.localeCompare(b.nom_complet)
          : sortKey === 'ville'
          ? (a.ville || '').localeCompare(b.ville || '')
          : a.statut.localeCompare(b.statut);
      return sortDir === 'asc' ? cmp : -cmp;
    });

    return sorted;
  }, [lignes, filter, villeFilter, search, sortKey, sortDir]);

  async function exportCsv() {
    setExporting(true);
    try {
      await downloadFile(`/v1/cotisations/export?mois=${mois}&statut=${filter}`);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Impossible d'exporter les cotisations.");
    } finally {
      setExporting(false);
    }
  }

  const [verifying, setVerifying] = useState(false);

  async function verifierRetards() {
    if (
      !confirm(
        'Envoyer les rappels/avertissements et radier automatiquement les membres à 3 mois consécutifs impayés (Article 3) ?'
      )
    )
      return;
    setVerifying(true);
    try {
      const res = await api.post<{ detail: string }>('/v1/cotisations/verifier-retards', {});
      toast.success(res.detail || 'Vérification effectuée.');
      load(mois);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Impossible de lancer la vérification.');
    } finally {
      setVerifying(false);
    }
  }

  function openPaiement(l: CotisationMembre, moisCible?: string) {
    setPaiementTarget(l);
    setPaiementMois(moisCible || mois);
    setDatePaiement(l.date_paiement || new Date().toISOString().slice(0, 10));
    setModePaiement(l.mode_paiement || 'especes');
    setMontant(String(l.montant ?? 1000));
    setCommentaire(l.commentaire || '');
  }

  async function confirmerPaiement() {
    if (!paiementTarget || !paiementMois) return;
    setSaving(true);
    try {
      await api.post('/v1/cotisations/marquer', {
        membre_id: paiementTarget.membre_id,
        mois: paiementMois,
        statut: 'payee',
        montant: Number(montant) || 1000,
        date_paiement: datePaiement,
        mode_paiement: modePaiement,
        commentaire: commentaire || undefined,
      });
      toast.success('Cotisation marquée payée.');
      setPaiementTarget(null);
      if (paiementMois === mois) load(mois);
      if (historique && historique.membre_id === paiementTarget.membre_id) {
        rafraichirHistorique(historique.membre_id, historique.nom);
      }
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Une erreur est survenue.');
    } finally {
      setSaving(false);
    }
  }

  async function marquerImpayee(l: CotisationMembre, moisCible?: string) {
    try {
      await api.post('/v1/cotisations/marquer', {
        membre_id: l.membre_id,
        mois: moisCible || mois,
        statut: 'impayee',
      });
      toast.success('Cotisation marquée impayée.');
      if (!moisCible || moisCible === mois) load(mois);
      if (historique && historique.membre_id === l.membre_id) {
        rafraichirHistorique(historique.membre_id, historique.nom);
      }
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Action impossible.');
    }
  }

  async function rafraichirHistorique(membreId: number, nom: string) {
    try {
      const data = await api.get<{
        historique: CotisationHistoriqueEntry[];
        alerte_radiation: boolean;
      }>(`/v1/cotisations/membre/${membreId}`);
      setHistorique({
        membre_id: membreId,
        nom,
        entries: data.historique,
        alerte: data.alerte_radiation,
      });
    } catch {
      toast.error("Impossible de charger l'historique.");
    }
  }

  async function voirHistorique(l: CotisationMembre) {
    rafraichirHistorique(l.membre_id, l.nom_complet);
  }

  function moisImpayePlusAncien(): CotisationHistoriqueEntry | null {    if (!historique) return null;
    const impayes = historique.entries.filter((e) => e.statut === 'impayee');
    if (impayes.length === 0) return null;
    return impayes.reduce((plusAncien, e) => (e.mois < plusAncien.mois ? e : plusAncien));
  }

  /**
   * Même contrôle que ouvrirPaiementDepuisHistorique, mais pour le bouton
   * "Marquer payé" du tableau principal (mois affiché en haut de la page) —
   * là on n'a pas l'historique du membre déjà chargé, donc on va le
   * chercher avant d'autoriser le paiement.
   */
  async function ouvrirPaiementDepuisTableau(l: CotisationMembre) {
    try {
      const data = await api.get<{ historique: CotisationHistoriqueEntry[] }>(
        `/v1/cotisations/membre/${l.membre_id}`
      );
      const impayesAnterieurs = data.historique.filter((e) => e.statut === 'impayee' && e.mois < l.mois);

      if (impayesAnterieurs.length > 0) {
        const plusAncien = impayesAnterieurs.reduce((a, b) => (b.mois < a.mois ? b : a));
        toast.info(
          `${moisLabel(l.mois)} ne peut pas être réglé avant ${moisLabel(plusAncien.mois)}, qui est le mois impayé le plus ancien. On règle celui-là d'abord.`
        );
        openPaiement(
          {
            membre_id: l.membre_id,
            nom_complet: l.nom_complet,
            photo_url: l.photo_url,
            ville: l.ville,
            mois: plusAncien.mois,
            cotisation_id: null,
            montant: plusAncien.montant,
            statut: plusAncien.statut,
            date_paiement: plusAncien.date_paiement,
            mode_paiement: null,
            commentaire: null,
          },
          plusAncien.mois
        );
      } else {
        openPaiement(l);
      }
    } catch {
      toast.error("Impossible de vérifier l'historique de ce membre avant paiement.");
    }
  }

  function ouvrirPaiementDepuisHistorique(entry: CotisationHistoriqueEntry) {
    if (!historique) return;

    // On ne peut pas régler un mois impayé si un mois antérieur l'est aussi
    // encore — sinon on casserait le calcul du retard consécutif (Article 3)
    // en payant un mois récent pendant qu'un plus ancien reste en dette.
    const plusAncien = moisImpayePlusAncien();
    let cible = entry;
    if (plusAncien && plusAncien.mois < entry.mois) {
      cible = plusAncien;
      toast.info(
        `${moisLabel(entry.mois)} ne peut pas être réglé avant ${moisLabel(plusAncien.mois)}, qui est le mois impayé le plus ancien. On règle celui-là d'abord.`
      );
    }

    openPaiement(
      {
        membre_id: historique.membre_id,
        nom_complet: historique.nom,
        photo_url: null,
        ville: null,
        mois: cible.mois,
        cotisation_id: null,
        montant: cible.montant,
        statut: cible.statut,
        date_paiement: cible.date_paiement,
        mode_paiement: null,
        commentaire: null,
      },
      cible.mois
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Cotisations</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Suivi mensuel des cotisations — 1 000 FCFA / mois par membre actif.
          </p>
        </div>

        <div className="flex items-center gap-1 bg-white border border-brand-green-100 rounded-xl px-2 py-1.5">
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setMois((m) => shiftMois(m, -1))}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="text-sm font-medium text-slate-900 capitalize w-32 text-center">
            {moisLabel(mois)}
          </span>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setMois((m) => shiftMois(m, 1))}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Bande de stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 mb-5">
        <div className="bg-white border border-brand-green-100 rounded-xl p-[18px]">
          <span className="text-xs text-slate-400">Taux à jour</span>
          <div className="text-2xl font-bold text-slate-900 mt-2">
            {stats ? `${stats.taux_a_jour}%` : '—'}
          </div>
        </div>
        <div className="bg-white border border-brand-green-100 rounded-xl p-[18px]">
          <span className="text-xs text-slate-400">Membres à jour</span>
          <div className="text-2xl font-bold text-brand-green-600 mt-2">
            {stats ? `${stats.nb_payees} / ${stats.nb_membres}` : '—'}
          </div>
        </div>
        <div className="bg-white border border-brand-green-100 rounded-xl p-[18px]">
          <span className="text-xs text-slate-400">En retard</span>
          <div className={`text-2xl font-bold mt-2 ${stats && stats.nb_impayees > 0 ? 'text-brand-red-600' : 'text-slate-900'}`}>
            {stats ? stats.nb_impayees : '—'}
          </div>
        </div>
        <div className="bg-white border border-brand-green-100 rounded-xl p-[18px]">
          <span className="text-xs text-slate-400">Montant collecté</span>
          <div className="text-2xl font-bold text-slate-900 mt-2">
            {stats ? fmtMontant(stats.montant_collecte) : '—'}
          </div>
          {stats && (
            <p className="text-xs text-slate-400 mt-1">sur {fmtMontant(stats.montant_attendu)} attendus</p>
          )}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
        <Tabs value={filter} onValueChange={(v) => setFilter(v as FilterTab)}>
          <TabsList>
            <TabsTrigger value="tous">Tous</TabsTrigger>
            <TabsTrigger value="a_jour">À jour</TabsTrigger>
            <TabsTrigger value="en_retard">En retard</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex items-center gap-2">
          <div className="relative sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher un membre…"
              className="pl-9"
            />
          </div>
          <div className="w-48">
            <VilleSelect value={villeFilter} onChange={setVilleFilter} allowClear clearLabel="Toutes les villes" />
          </div>
          <Button variant="outline" onClick={exportCsv} disabled={exporting}>
            {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            Exporter
          </Button>
          {hasRole('super_admin', 'tresorier') && (
            <Button variant="outline" onClick={verifierRetards} disabled={verifying} title="Envoyer les rappels et radier automatiquement les membres à 3 mois consécutifs impayés">
              {verifying ? <Loader2 className="w-4 h-4 animate-spin" /> : <AlertTriangle className="w-4 h-4" />}
              Vérifier les retards
            </Button>
          )}
        </div>
      </div>

      {lignes === null ? (
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
                <TableHead>
                  <SortableHeader label="Membre" active={sortKey === 'nom'} dir={sortDir} onClick={() => toggleSort('nom')} />
                </TableHead>
                <TableHead className="hidden lg:table-cell">
                  <SortableHeader label="Ville" active={sortKey === 'ville'} dir={sortDir} onClick={() => toggleSort('ville')} />
                </TableHead>
                <TableHead className="hidden md:table-cell">Paiement</TableHead>
                <TableHead>
                  <SortableHeader label="Statut" active={sortKey === 'statut'} dir={sortDir} onClick={() => toggleSort('statut')} />
                </TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((l) => (
                <TableRow key={l.membre_id}>
                  <TableCell>
                    <button
                      onClick={() => voirHistorique(l)}
                      className="flex items-center gap-3 hover:opacity-75 transition-opacity"
                    >
                      <Avatar className="w-8 h-8">
                        {l.photo_url && <AvatarImage src={l.photo_url} alt={l.nom_complet} />}
                        <AvatarFallback className="text-xs bg-brand-green-50 text-brand-green-700">
                          {l.nom_complet.split(' ').map((p) => p[0]).slice(0, 2).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium text-slate-900">{l.nom_complet}</span>
                    </button>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell text-slate-600 text-sm">{l.ville || '—'}</TableCell>
                  <TableCell className="hidden md:table-cell text-slate-600 text-sm">
                    {l.statut === 'payee'
                      ? `${l.date_paiement ? new Date(l.date_paiement).toLocaleDateString('fr-FR') : ''} · ${l.mode_paiement ? MODE_LABELS[l.mode_paiement] : ''}`
                      : '—'}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        l.statut === 'payee'
                          ? 'bg-brand-green-50 text-brand-green-600 border-brand-green-200'
                          : l.statut === 'anterieure_adhesion'
                          ? 'bg-slate-100 text-slate-500 border-slate-200'
                          : 'bg-brand-red-50 text-brand-red-600 border-brand-red-200'
                      }
                    >
                      {l.statut === 'payee'
                        ? 'À jour'
                        : l.statut === 'anterieure_adhesion'
                        ? 'Pas encore membre'
                        : 'En retard'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" onClick={() => voirHistorique(l)} title="Historique">
                        <History className="w-4 h-4" />
                      </Button>
                      {canWrite && l.statut === 'impayee' && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-brand-green-600 hover:text-brand-green-700"
                          onClick={() => ouvrirPaiementDepuisTableau(l)}
                          title="Marquer payé"
                        >
                          <Check className="w-4 h-4" />
                        </Button>
                      )}
                      {canWrite && l.statut === 'payee' && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-brand-red-600 hover:text-brand-red-700"
                          onClick={() => marquerImpayee(l)}
                          title="Marquer impayé"
                        >
                          <X className="w-4 h-4" />
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

      {/* Dialog : marquer payé */}
      <Dialog open={!!paiementTarget} onOpenChange={(open) => !open && setPaiementTarget(null)}>
        <DialogContent className="max-w-sm">
          {paiementTarget && (
            <>
              <DialogHeader>
                <DialogTitle>
                  Marquer payé — {paiementTarget.nom_complet}
                  {paiementMois && <span className="text-slate-400 font-normal"> · {moisLabel(paiementMois)}</span>}
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="date-paiement">Date</Label>
                    <Input
                      id="date-paiement"
                      type="date"
                      value={datePaiement}
                      onChange={(e) => setDatePaiement(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="montant">Montant (FCFA)</Label>
                    <Input
                      id="montant"
                      type="number"
                      value={montant}
                      onChange={(e) => setMontant(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label>Mode de paiement</Label>
                  <Select value={modePaiement} onValueChange={(v) => setModePaiement(v as ModePaiement)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(MODE_LABELS).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="commentaire-paiement">Commentaire (optionnel)</Label>
                  <Textarea
                    id="commentaire-paiement"
                    rows={2}
                    value={commentaire}
                    onChange={(e) => setCommentaire(e.target.value)}
                  />
                </div>
              </div>

              <DialogFooter>
                <Button
                  disabled={saving}
                  onClick={confirmerPaiement}
                  className="bg-brand-green-600 hover:bg-brand-green-700"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  Confirmer le paiement
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog : historique 12 mois */}
      <Dialog open={!!historique} onOpenChange={(open) => !open && setHistorique(null)}>
        <DialogContent className="max-w-sm">
          {historique && (
            <>
              <DialogHeader>
                <DialogTitle>{historique.nom} — historique</DialogTitle>
              </DialogHeader>

              {historique.alerte && (
                <div className="flex items-start gap-2 rounded-lg bg-brand-red-50 border border-brand-red-200 text-brand-red-700 text-sm px-3 py-2.5">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>
                    3 mois consécutifs impayés ou plus — radiation automatique possible (Règlement
                    intérieur, art. 3).
                  </span>
                </div>
              )}

              <div className="grid grid-cols-3 gap-2">
                {historique.entries.map((e) => {
                  const cliquable = e.statut !== 'anterieure_adhesion';
                  return (
                    <button
                      key={e.mois}
                      type="button"
                      disabled={!cliquable}
                      title={
                        e.statut === 'impayee'
                          ? 'Marquer ce mois payé'
                          : e.statut === 'payee'
                          ? 'Annuler ce paiement (repasser impayé)'
                          : undefined
                      }
                      onClick={() => {
                        if (e.statut === 'impayee') ouvrirPaiementDepuisHistorique(e);
                        else if (e.statut === 'payee') {
                          if (confirm(`Repasser ${moisLabel(e.mois)} en impayé ?`)) {
                            marquerImpayee(
                              { membre_id: historique.membre_id, nom_complet: historique.nom } as CotisationMembre,
                              e.mois
                            );
                          }
                        }
                      }}
                      className={`rounded-lg border px-3 py-2 text-center transition-colors ${
                        e.statut === 'payee'
                          ? 'bg-brand-green-50 border-brand-green-200 hover:bg-brand-green-100'
                          : e.statut === 'anterieure_adhesion'
                          ? 'bg-slate-50 border-slate-200 cursor-default'
                          : 'bg-brand-red-50 border-brand-red-200 hover:bg-brand-red-100'
                      }`}
                    >
                      <p className="text-[11px] text-slate-500 capitalize">{moisLabel(e.mois).split(' ')[0]}</p>
                      <p
                        className={`text-xs font-semibold mt-0.5 ${
                          e.statut === 'payee'
                            ? 'text-brand-green-600'
                            : e.statut === 'anterieure_adhesion'
                            ? 'text-slate-400'
                            : 'text-brand-red-600'
                        }`}
                      >
                        {e.statut === 'payee' ? 'Payé' : e.statut === 'anterieure_adhesion' ? '—' : 'Impayé'}
                      </p>
                    </button>
                  );
                })}
              </div>
              <p className="text-xs text-slate-400 text-center">
                Cliquez sur un mois impayé pour le marquer payé (paiement reçu par un autre canal).
              </p>
            </>
          )}
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
