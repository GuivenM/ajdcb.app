import React, { useEffect, useState } from 'react';
import {
  Loader2,
  Plus,
  Pencil,
  Trash2,
  FileText,
  Download,
  Eye,
} from 'lucide-react';
import { api, ApiError } from '../../../lib/api';
import { useAuth } from '../../context/AuthContext';
import type { GuideSection, GuideSousSection, GuideDocument, StatutGuide } from '../types';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '../../components/ui/accordion';
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

const STATUT_LABELS: Record<StatutGuide, string> = { publie: 'Publié', brouillon: 'Brouillon' };
const STATUT_BADGE: Record<StatutGuide, string> = {
  publie: 'bg-brand-green-50 text-brand-green-600 border-brand-green-200',
  brouillon: 'bg-slate-100 text-slate-500 border-slate-200',
};

type SectionForm = {
  titre: string;
  description: string;
  categorie: string;
  contenu: string;
  ordre: string;
  statut: StatutGuide;
  imageFile: File | null;
};
type SousSectionForm = {
  section_id: number;
  titre: string;
  contenu: string;
  ordre: string;
  statut: StatutGuide;
  imageFile: File | null;
};
type DocumentForm = {
  sous_section_id: number;
  titre: string;
  description: string;
  statut: StatutGuide;
  fichier: File | null;
};

export function AdminGuide() {
  const { hasRole } = useAuth();
  const canWrite = hasRole('super_admin', 'admin');
  const canDelete = hasRole('super_admin');

  const [sections, setSections] = useState<GuideSection[] | null>(null);

  const [sectionEditing, setSectionEditing] = useState<GuideSection | 'new' | null>(null);
  const [sectionForm, setSectionForm] = useState<SectionForm>({
    titre: '', description: '', categorie: '', contenu: '', ordre: '0', statut: 'brouillon', imageFile: null,
  });

  const [sousEditing, setSousEditing] = useState<GuideSousSection | { section_id: number } | null>(null);
  const [sousForm, setSousForm] = useState<SousSectionForm>({
    section_id: 0, titre: '', contenu: '', ordre: '0', statut: 'brouillon', imageFile: null,
  });

  const [docEditing, setDocEditing] = useState<GuideDocument | { sous_section_id: number } | null>(null);
  const [docForm, setDocForm] = useState<DocumentForm>({
    sous_section_id: 0, titre: '', description: '', statut: 'brouillon', fichier: null,
  });

  const [saving, setSaving] = useState(false);
  const [viewingSection, setViewingSection] = useState<GuideSection | null>(null);
  const [viewingSous, setViewingSous] = useState<GuideSousSection | null>(null);

  async function load() {
    try {
      const data = await api.get<GuideSection[]>('/v1/guide?all=1');
      setSections(data.slice().sort((a, b) => a.ordre - b.ordre));
    } catch {
      toast.error('Impossible de charger le guide.');
    }
  }

  useEffect(() => {
    load();
  }, []);

  // ---------- Sections ----------

  function openCreateSection() {
    setSectionForm({ titre: '', description: '', categorie: '', contenu: '', ordre: '0', statut: 'brouillon', imageFile: null });
    setSectionEditing('new');
  }

  function openEditSection(s: GuideSection) {
    setSectionForm({
      titre: s.titre,
      description: s.description || '',
      categorie: s.categorie || '',
      contenu: s.contenu || '',
      ordre: String(s.ordre),
      statut: s.statut,
      imageFile: null,
    });
    setSectionEditing(s);
  }

  async function saveSection() {
    if (!sectionForm.titre.trim()) {
      toast.error('Le titre est obligatoire.');
      return;
    }
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('titre', sectionForm.titre);
      if (sectionForm.description) fd.append('description', sectionForm.description);
      if (sectionForm.categorie) fd.append('categorie', sectionForm.categorie);
      if (sectionForm.contenu) fd.append('contenu', sectionForm.contenu);
      fd.append('ordre', sectionForm.ordre || '0');
      fd.append('statut', sectionForm.statut);
      if (sectionForm.imageFile) fd.append('image', sectionForm.imageFile);

      if (sectionEditing === 'new') {
        await api.postForm('/v1/guide/sections', fd, 'POST');
        toast.success('Section créée.');
      } else if (sectionEditing) {
        await api.postForm(`/v1/guide/sections/${sectionEditing.id}`, fd, 'PUT');
        toast.success('Section mise à jour.');
      }
      setSectionEditing(null);
      load();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Une erreur est survenue.');
    } finally {
      setSaving(false);
    }
  }

  async function removeSection(s: GuideSection) {
    if (!confirm(`Supprimer « ${s.titre} » et tout son contenu (sous-sections, documents) ?`)) return;
    try {
      await api.delete(`/v1/guide/sections/${s.id}`);
      toast.success('Section supprimée.');
      load();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Suppression impossible.');
    }
  }

  // ---------- Sous-sections ----------

  function openCreateSous(sectionId: number) {
    setSousForm({ section_id: sectionId, titre: '', contenu: '', ordre: '0', statut: 'brouillon', imageFile: null });
    setSousEditing({ section_id: sectionId });
  }

  function openEditSous(s: GuideSousSection) {
    setSousForm({
      section_id: s.section_id,
      titre: s.titre,
      contenu: s.contenu || '',
      ordre: String(s.ordre),
      statut: s.statut,
      imageFile: null,
    });
    setSousEditing(s);
  }

  async function saveSous() {
    if (!sousForm.titre.trim()) {
      toast.error('Le titre est obligatoire.');
      return;
    }
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('section_id', String(sousForm.section_id));
      fd.append('titre', sousForm.titre);
      if (sousForm.contenu) fd.append('contenu', sousForm.contenu);
      fd.append('ordre', sousForm.ordre || '0');
      fd.append('statut', sousForm.statut);
      if (sousForm.imageFile) fd.append('image', sousForm.imageFile);

      const isNew = sousEditing && !('titre' in sousEditing);
      if (isNew) {
        await api.postForm('/v1/guide/sous-sections', fd, 'POST');
        toast.success('Sous-section créée.');
      } else if (sousEditing && 'id' in sousEditing) {
        await api.postForm(`/v1/guide/sous-sections/${sousEditing.id}`, fd, 'PUT');
        toast.success('Sous-section mise à jour.');
      }
      setSousEditing(null);
      load();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Une erreur est survenue.');
    } finally {
      setSaving(false);
    }
  }

  async function removeSous(s: GuideSousSection) {
    if (!confirm(`Supprimer « ${s.titre} » et ses documents ?`)) return;
    try {
      await api.delete(`/v1/guide/sous-sections/${s.id}`);
      toast.success('Sous-section supprimée.');
      load();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Suppression impossible.');
    }
  }

  // ---------- Documents ----------

  function openCreateDoc(sousSectionId: number) {
    setDocForm({ sous_section_id: sousSectionId, titre: '', description: '', statut: 'brouillon', fichier: null });
    setDocEditing({ sous_section_id: sousSectionId });
  }

  function openEditDoc(d: GuideDocument) {
    setDocForm({
      sous_section_id: d.sous_section_id,
      titre: d.titre,
      description: d.description || '',
      statut: d.statut,
      fichier: null,
    });
    setDocEditing(d);
  }

  async function saveDoc() {
    if (!docForm.titre.trim()) {
      toast.error('Le titre est obligatoire.');
      return;
    }
    const isNew = docEditing && !('titre' in docEditing);
    if (isNew && !docForm.fichier) {
      toast.error('Un fichier est requis pour créer un document.');
      return;
    }
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('sous_section_id', String(docForm.sous_section_id));
      fd.append('titre', docForm.titre);
      if (docForm.description) fd.append('description', docForm.description);
      fd.append('statut', docForm.statut);
      if (docForm.fichier) fd.append('fichier', docForm.fichier);

      if (isNew) {
        await api.postForm('/v1/guide/documents', fd, 'POST');
        toast.success('Document ajouté.');
      } else if (docEditing && 'id' in docEditing) {
        // La route de mise à jour des documents est en POST côté backend (pas de spoof PUT nécessaire).
        await api.postForm(`/v1/guide/documents/${docEditing.id}`, fd, 'POST');
        toast.success('Document mis à jour.');
      }
      setDocEditing(null);
      load();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Une erreur est survenue.');
    } finally {
      setSaving(false);
    }
  }

  async function removeDoc(d: GuideDocument) {
    if (!confirm(`Supprimer le document « ${d.titre} » ?`)) return;
    try {
      await api.delete(`/v1/guide/documents/${d.id}`);
      toast.success('Document supprimé.');
      load();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Suppression impossible.');
    }
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Guide</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Sections, sous-sections et documents à disposition des membres.
          </p>
        </div>
        {canWrite && (
          <Button onClick={openCreateSection} className="bg-brand-green-600 hover:bg-brand-green-700">
            <Plus className="w-4 h-4" /> Nouvelle section
          </Button>
        )}
      </div>

      {sections === null ? (
        <div className="flex items-center gap-2 text-slate-500 text-sm">
          <Loader2 className="w-4 h-4 animate-spin" /> Chargement…
        </div>
      ) : sections.length === 0 ? (
        <div className="text-center py-16 text-slate-400 bg-white rounded-xl border border-brand-green-100">
          Aucune section pour l'instant.
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-brand-green-100 overflow-hidden">
          <Accordion type="multiple" className="px-2">
            {sections.map((section) => (
              <AccordionItem key={section.id} value={`section-${section.id}`} className="border-brand-green-100">
                <div className="flex items-center gap-2 pr-2">
                  <AccordionTrigger className="py-3.5 hover:no-underline">
                    <div className="flex items-center gap-3">
                      <span className="font-medium text-slate-900">{section.titre}</span>
                      {section.categorie && <Badge variant="secondary">{section.categorie}</Badge>}
                      <Badge variant="outline" className={STATUT_BADGE[section.statut]}>
                        {STATUT_LABELS[section.statut]}
                      </Badge>
                      <span className="text-xs text-slate-400">
                        {section.sous_sections.length} sous-section{section.sous_sections.length > 1 ? 's' : ''}
                      </span>
                    </div>
                  </AccordionTrigger>
                  <div className="flex gap-1 shrink-0">
                    <Button variant="ghost" size="icon" onClick={() => setViewingSection(section)}>
                      <Eye className="w-4 h-4" />
                    </Button>
                    {canWrite && (
                      <>
                        <Button variant="ghost" size="icon" onClick={() => openEditSection(section)}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                        {canDelete && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-brand-red-600 hover:text-brand-red-700"
                            onClick={() => removeSection(section)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </>
                    )}
                  </div>
                </div>

                <AccordionContent>
                  <div className="pl-4 border-l-2 border-brand-green-100 space-y-2">
                    <Accordion type="multiple">
                      {section.sous_sections.map((sous) => (
                        <AccordionItem key={sous.id} value={`sous-${sous.id}`} className="border-brand-green-100">
                          <div className="flex items-center gap-2 pr-2">
                            <AccordionTrigger className="py-2.5 hover:no-underline">
                              <div className="flex items-center gap-3">
                                <span className="text-sm font-medium text-slate-800">{sous.titre}</span>
                                <Badge variant="outline" className={STATUT_BADGE[sous.statut]}>
                                  {STATUT_LABELS[sous.statut]}
                                </Badge>
                                <span className="text-xs text-slate-400">
                                  {sous.documents.length} document{sous.documents.length > 1 ? 's' : ''}
                                </span>
                              </div>
                            </AccordionTrigger>
                            <div className="flex gap-1 shrink-0">
                              <Button variant="ghost" size="icon" onClick={() => setViewingSous(sous)}>
                                <Eye className="w-3.5 h-3.5" />
                              </Button>
                              {canWrite && (
                                <>
                                  <Button variant="ghost" size="icon" onClick={() => openEditSous(sous)}>
                                    <Pencil className="w-3.5 h-3.5" />
                                  </Button>
                                  {canDelete && (
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="text-brand-red-600 hover:text-brand-red-700"
                                      onClick={() => removeSous(sous)}
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </Button>
                                  )}
                                </>
                              )}
                            </div>
                          </div>

                          <AccordionContent>
                            <div className="pl-4 border-l-2 border-brand-green-100 space-y-1.5">
                              {sous.documents.map((doc) => (
                                <div
                                  key={doc.id}
                                  className="flex items-center justify-between gap-2 py-1.5 text-sm"
                                >
                                  <a
                                    href={doc.fichier_url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="flex items-center gap-2 text-slate-700 hover:text-brand-green-600 min-w-0"
                                  >
                                    <FileText className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                                    <span className="truncate">{doc.titre}</span>
                                    <span className="text-xs text-slate-400 shrink-0">
                                      {doc.type_fichier?.toUpperCase()} · {doc.taille_formatee}
                                    </span>
                                    <Download className="w-3 h-3 shrink-0 text-slate-300" />
                                  </a>
                                  {canWrite && (
                                    <div className="flex gap-1 shrink-0">
                                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEditDoc(doc)}>
                                        <Pencil className="w-3.5 h-3.5" />
                                      </Button>
                                      {canDelete && (
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className="h-7 w-7 text-brand-red-600 hover:text-brand-red-700"
                                          onClick={() => removeDoc(doc)}
                                        >
                                          <Trash2 className="w-3.5 h-3.5" />
                                        </Button>
                                      )}
                                    </div>
                                  )}
                                </div>
                              ))}
                              {canWrite && (
                                <button
                                  onClick={() => openCreateDoc(sous.id)}
                                  className="flex items-center gap-1.5 text-xs font-medium text-brand-green-600 py-1.5"
                                >
                                  <Plus className="w-3.5 h-3.5" /> Ajouter un document
                                </button>
                              )}
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                    {canWrite && (
                      <button
                        onClick={() => openCreateSous(section.id)}
                        className="flex items-center gap-1.5 text-xs font-medium text-brand-green-600 py-2"
                      >
                        <Plus className="w-3.5 h-3.5" /> Ajouter une sous-section
                      </button>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      )}

      {/* Détail Section (lecture seule) */}
      <Dialog open={!!viewingSection} onOpenChange={(open) => !open && setViewingSection(null)}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          {viewingSection && (
            <>
              {viewingSection.image_url && (
                <img
                  src={viewingSection.image_url}
                  alt={viewingSection.titre}
                  className="w-full h-40 object-cover rounded-xl -mt-2"
                />
              )}
              <DialogHeader>
                <div className="flex items-center gap-2 flex-wrap">
                  <DialogTitle>{viewingSection.titre}</DialogTitle>
                  <Badge variant="outline" className={STATUT_BADGE[viewingSection.statut]}>
                    {STATUT_LABELS[viewingSection.statut]}
                  </Badge>
                </div>
              </DialogHeader>
              <div className="space-y-3 text-sm">
                {viewingSection.categorie && <Badge variant="secondary">{viewingSection.categorie}</Badge>}
                {viewingSection.description && <p className="text-slate-600">{viewingSection.description}</p>}
                {viewingSection.contenu && (
                  <p className="text-slate-700 whitespace-pre-wrap pt-2 border-t border-slate-100">
                    {viewingSection.contenu}
                  </p>
                )}
              </div>
              {canWrite && (
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setViewingSection(null);
                      openEditSection(viewingSection);
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

      {/* Détail Sous-section (lecture seule) */}
      <Dialog open={!!viewingSous} onOpenChange={(open) => !open && setViewingSous(null)}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          {viewingSous && (
            <>
              {viewingSous.image_url && (
                <img
                  src={viewingSous.image_url}
                  alt={viewingSous.titre}
                  className="w-full h-40 object-cover rounded-xl -mt-2"
                />
              )}
              <DialogHeader>
                <div className="flex items-center gap-2 flex-wrap">
                  <DialogTitle>{viewingSous.titre}</DialogTitle>
                  <Badge variant="outline" className={STATUT_BADGE[viewingSous.statut]}>
                    {STATUT_LABELS[viewingSous.statut]}
                  </Badge>
                </div>
              </DialogHeader>
              <div className="space-y-3 text-sm">
                {viewingSous.contenu && (
                  <p className="text-slate-700 whitespace-pre-wrap">{viewingSous.contenu}</p>
                )}
                <p className="text-xs text-slate-400">
                  {viewingSous.documents.length} document{viewingSous.documents.length > 1 ? 's' : ''}
                </p>
              </div>
              {canWrite && (
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setViewingSous(null);
                      openEditSous(viewingSous);
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

      {/* Dialog Section */}
      <Dialog open={!!sectionEditing} onOpenChange={(open) => !open && setSectionEditing(null)}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{sectionEditing === 'new' ? 'Nouvelle section' : 'Modifier la section'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Titre</Label>
              <Input value={sectionForm.titre} onChange={(e) => setSectionForm((f) => ({ ...f, titre: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>Description</Label>
              <Textarea rows={2} value={sectionForm.description} onChange={(e) => setSectionForm((f) => ({ ...f, description: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>Contenu</Label>
              <Textarea rows={4} value={sectionForm.contenu} onChange={(e) => setSectionForm((f) => ({ ...f, contenu: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>Image</Label>
              <Input type="file" accept="image/jpeg,image/png,image/jpg" onChange={(e) => setSectionForm((f) => ({ ...f, imageFile: e.target.files?.[0] || null }))} />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label>Catégorie</Label>
                <Input value={sectionForm.categorie} onChange={(e) => setSectionForm((f) => ({ ...f, categorie: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label>Ordre</Label>
                <Input type="number" value={sectionForm.ordre} onChange={(e) => setSectionForm((f) => ({ ...f, ordre: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label>Statut</Label>
                <Select value={sectionForm.statut} onValueChange={(v) => setSectionForm((f) => ({ ...f, statut: v as StatutGuide }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="brouillon">Brouillon</SelectItem>
                    <SelectItem value="publie">Publié</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button disabled={saving} onClick={saveSection} className="bg-brand-green-600 hover:bg-brand-green-700">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {sectionEditing === 'new' ? 'Créer' : 'Enregistrer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Sous-section */}
      <Dialog open={!!sousEditing} onOpenChange={(open) => !open && setSousEditing(null)}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{sousEditing && 'titre' in sousEditing ? 'Modifier la sous-section' : 'Nouvelle sous-section'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Titre</Label>
              <Input value={sousForm.titre} onChange={(e) => setSousForm((f) => ({ ...f, titre: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>Contenu</Label>
              <Textarea rows={4} value={sousForm.contenu} onChange={(e) => setSousForm((f) => ({ ...f, contenu: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>Image</Label>
              <Input type="file" accept="image/jpeg,image/png,image/jpg" onChange={(e) => setSousForm((f) => ({ ...f, imageFile: e.target.files?.[0] || null }))} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Ordre</Label>
                <Input type="number" value={sousForm.ordre} onChange={(e) => setSousForm((f) => ({ ...f, ordre: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label>Statut</Label>
                <Select value={sousForm.statut} onValueChange={(v) => setSousForm((f) => ({ ...f, statut: v as StatutGuide }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="brouillon">Brouillon</SelectItem>
                    <SelectItem value="publie">Publié</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button disabled={saving} onClick={saveSous} className="bg-brand-green-600 hover:bg-brand-green-700">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {sousEditing && 'titre' in sousEditing ? 'Enregistrer' : 'Créer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Document */}
      <Dialog open={!!docEditing} onOpenChange={(open) => !open && setDocEditing(null)}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{docEditing && 'titre' in docEditing ? 'Modifier le document' : 'Nouveau document'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Titre</Label>
              <Input value={docForm.titre} onChange={(e) => setDocForm((f) => ({ ...f, titre: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>Description</Label>
              <Textarea rows={2} value={docForm.description} onChange={(e) => setDocForm((f) => ({ ...f, description: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>Fichier {docEditing && 'titre' in docEditing ? '(laisser vide pour garder l\'actuel)' : ''}</Label>
              <Input
                type="file"
                accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
                onChange={(e) => setDocForm((f) => ({ ...f, fichier: e.target.files?.[0] || null }))}
              />
              <p className="text-xs text-slate-400">PDF, Word, Excel ou PowerPoint — 20 Mo max.</p>
            </div>
            <div className="space-y-1.5">
              <Label>Statut</Label>
              <Select value={docForm.statut} onValueChange={(v) => setDocForm((f) => ({ ...f, statut: v as StatutGuide }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="brouillon">Brouillon</SelectItem>
                  <SelectItem value="publie">Publié</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button disabled={saving} onClick={saveDoc} className="bg-brand-green-600 hover:bg-brand-green-700">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {docEditing && 'titre' in docEditing ? 'Enregistrer' : 'Ajouter'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
