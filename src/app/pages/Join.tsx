import React, { useState } from 'react';
import { Check, ChevronLeft, ChevronRight, Loader2, Upload, X, Plus, Users, Handshake, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { api, ApiError } from '../../lib/api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Checkbox } from '../components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '../components/ui/radio-group';
import { Progress } from '../components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';

// ---------- Options (issues du formulaire d'origine) ----------

const COMPETENCES = [
  'Analyse et Gestion financière', 'Bricolage', 'Communication', 'Construction', 'Excel',
  'Gestion projet', 'Graphisme', 'Illustrator', 'Levée de fonds', "Organisation d'événements",
  'Photoshop', 'Rédaction', 'Saisie et Traitement de Données (Data Entry)',
];
const DOMAINES_INTERET = [
  'Culture', 'Développement local', 'Diplomatie', 'Education', 'Entrepreneuriat',
  'Littérature', 'Média/Communication', 'Social', 'Sport',
];
const LOISIRS = [
  'Basketball', 'Cinéma', 'Cuisine', 'Dessiner', 'Football', 'Lecture', 'Les voyages',
  'Musique', 'Tennis',
];
const DISPONIBILITES = [
  { value: 'Régulière (Disponible pour des tâches hebdomadaires/mensuelles)', label: 'Régulière — tâches hebdomadaires/mensuelles' },
  { value: 'Ponctuelle (Disponible pour des événements spécifiques ou des missions courtes)', label: 'Ponctuelle — événements ou missions courtes' },
  { value: 'Selon le calendrier (Disponibilité variable, à définir selon le besoin)', label: 'Selon le calendrier — variable' },
  { value: 'Très limitée (Principalement pour information)', label: 'Très limitée — pour information' },
];
const NIVEAUX_ETUDE = [
  'Baccalauréat (ou équivalent)', 'BTS / DUT (Bac+2)', 'Licence (Bac+3)',
  'Master 1 / Maîtrise (Bac+4)', 'Master 2 (ou équivalent Bac+5)', 'Doctorat (ou Ph.D.)', 'Autre',
];
const COMMENT_CONNU = ['Réseaux sociaux', 'Un ami/membre', 'Un parent/ami(e)/connaissance', 'Événement', 'Site web', 'Autre'];
const COMMISSIONS = ['Culture et Identité', 'Formation et Éducation', 'Solidarité et Intégration', 'Communication et Partenariats', 'Aucune'];
const ANNEES_ETUDE = ['1ère année de Licence', '2ème année de Licence', '3ème année de Licence', '1ère année de Master', '2ème année de Master', 'Doctorat'];

const STEPS = [
  'Nationalité', 'Informations civiles', 'Vos pièces', 'Statut professionnel',
  'Compétences & intérêts', 'Langues', 'Engagement associatif', 'Coordonnées', 'Déclaration',
];

interface FormState {
  // Nationalité
  estCongolais: string; // 'oui' | 'non'
  nationalite: string;
  possedeCarteConsulaire: string;
  dureeAuBenin: string;
  possedeCipr: string;
  // Identité
  nom: string;
  prenom: string;
  nomMarital: string;
  sexe: string;
  dateNaissance: string;
  lieuNaissance: string;
  adresse: string;
  ville: string;
  situationMatrimoniale: string;
  nombreEnfantsCharge: string;
  // Pièces
  photo: File | null;
  carteConsulaireFichier: File | null;
  ciprFichier: File | null;
  // Statut pro
  profession: string;
  professionAutre: string;
  niveauEtude: string;
  niveauEtudeAutre: string;
  dernierDiplome: string;
  dernierDiplomeAutre: string;
  // Entrepreneur
  entrepreneurDomaine: string;
  entrepreneurDomaineAutre: string;
  entrepreneurDuree: string;
  entrepreneurNomEntreprise: string;
  entrepreneurFonction: string;
  // Étudiant
  etablissement: string;
  etudiantFiliere: string;
  etudiantAnnee: string;
  // Compétences / intérêts
  competences: string[];
  competencesAutre: string;
  domainesInteret: string[];
  domainesInteretAutre: string;
  loisirs: string[];
  loisirsAutre: string;
  disponibilite: string;
  langues: string[];
  // Engagement
  commentConnu: string;
  commentConnuAutre: string;
  recommandePar: string;
  motivation: string;
  experienceAssociative: string;
  experienceAssociativeDetails: string;
  commissionsSouhaitees: string[];
  attentes: string;
  // Coordonnées
  email: string;
  telephone: string;
  autreTelephone: string;
  // Déclaration
  declarantNomComplet: string;
  accepteConditions: boolean;
  souhaiteRecevoirActualites: string;
  lettreDemandeFichiers: File[];
}

function emptyForm(): FormState {
  return {
    estCongolais: 'oui', nationalite: '', possedeCarteConsulaire: 'non', dureeAuBenin: '', possedeCipr: 'non',
    nom: '', prenom: '', nomMarital: '', sexe: '', dateNaissance: '', lieuNaissance: '',
    adresse: '', ville: '', situationMatrimoniale: '', nombreEnfantsCharge: '0',
    photo: null, carteConsulaireFichier: null, ciprFichier: null,
    profession: '', professionAutre: '', niveauEtude: '', niveauEtudeAutre: '',
    dernierDiplome: '', dernierDiplomeAutre: '',
    entrepreneurDomaine: '', entrepreneurDomaineAutre: '', entrepreneurDuree: '',
    entrepreneurNomEntreprise: '', entrepreneurFonction: '',
    etablissement: '', etudiantFiliere: '', etudiantAnnee: '',
    competences: [], competencesAutre: '', domainesInteret: [], domainesInteretAutre: '',
    loisirs: [], loisirsAutre: '', disponibilite: '', langues: [],
    commentConnu: '', commentConnuAutre: '', recommandePar: '', motivation: '',
    experienceAssociative: 'non', experienceAssociativeDetails: '', commissionsSouhaitees: [], attentes: '',
    email: '', telephone: '', autreTelephone: '',
    declarantNomComplet: '', accepteConditions: false, souhaiteRecevoirActualites: 'oui', lettreDemandeFichiers: [],
  };
}

function toggleInArray(arr: string[], value: string) {
  return arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value];
}

function MembreForm({ onBack }: { onBack: () => void }) {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormState>(emptyForm());
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [langueInput, setLangueInput] = useState('');

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function validateStep(): string | null {
    switch (step) {
      case 0:
        if (!form.dureeAuBenin.trim()) return 'Indiquez depuis combien de temps vous êtes au Bénin.';
        return null;
      case 1:
        if (!form.nom.trim() || !form.prenom.trim()) return 'Nom et prénom sont obligatoires.';
        if (!form.sexe) return 'Le sexe est obligatoire.';
        if (!form.dateNaissance) return 'La date de naissance est obligatoire.';
        if (!form.lieuNaissance.trim()) return 'Le lieu de naissance est obligatoire.';
        if (!form.adresse.trim() || !form.ville.trim()) return 'Le lieu de résidence est obligatoire.';
        if (!form.situationMatrimoniale) return 'La situation matrimoniale est obligatoire.';
        return null;
      case 2:
        if (!form.photo) return 'Une photo récente est obligatoire (utilisée pour votre badge).';
        if (form.possedeCarteConsulaire === 'oui' && !form.carteConsulaireFichier) return 'Merci d\'importer votre carte consulaire.';
        return null;
      case 3:
        if (!form.profession) return 'La profession est obligatoire.';
        if (form.profession === 'autre' && !form.professionAutre.trim()) return 'Précisez votre profession.';
        if (!form.niveauEtude) return "Le niveau d'études est obligatoire.";
        if (form.niveauEtude === 'Autre' && !form.niveauEtudeAutre.trim()) return "Précisez votre niveau d'études.";
        if (!form.dernierDiplome) return 'Le dernier diplôme est obligatoire.';
        if (form.dernierDiplome === 'Autre' && !form.dernierDiplomeAutre.trim()) return 'Précisez votre dernier diplôme.';
        if (form.profession === 'entrepreneur') {
          if (!form.entrepreneurDomaine.trim() || !form.entrepreneurDuree.trim() || !form.entrepreneurNomEntreprise.trim()) {
            return 'Complétez les informations sur votre activité.';
          }
        }
        if (form.profession === 'etudiant') {
          if (!form.etablissement.trim() || !form.etudiantFiliere.trim() || !form.etudiantAnnee) {
            return 'Complétez les informations sur vos études.';
          }
        }
        return null;
      case 4:
        if (form.competences.length === 0) return 'Sélectionnez au moins une compétence.';
        if (form.loisirs.length === 0) return 'Sélectionnez au moins un loisir.';
        if (!form.disponibilite) return 'Indiquez votre disponibilité.';
        return null;
      case 6:
        if (!form.commentConnu) return 'Indiquez comment vous avez connu l\'AJDCB.';
        if (form.experienceAssociative === 'oui' && !form.experienceAssociativeDetails.trim()) {
          return 'Décrivez brièvement votre expérience associative.';
        }
        return null;
      case 7:
        if (!form.email.trim() || !form.telephone.trim()) return 'Email et téléphone sont obligatoires.';
        return null;
      case 8:
        if (!form.declarantNomComplet.trim()) return 'Indiquez vos noms et prénoms.';
        if (!form.accepteConditions) return 'Vous devez accepter les conditions pour continuer.';
        return null;
      default:
        return null;
    }
  }

  function next() {
    const err = validateStep();
    if (err) {
      toast.error(err);
      return;
    }
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }

  function back() {
    setStep((s) => Math.max(s - 1, 0));
  }

  async function submit() {
    const err = validateStep();
    if (err) {
      toast.error(err);
      return;
    }
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('est_congolais', form.estCongolais === 'oui' ? '1' : '0');
      if (form.estCongolais === 'non' && form.nationalite) fd.append('nationalite', form.nationalite);
      fd.append('possede_carte_consulaire', form.possedeCarteConsulaire === 'oui' ? '1' : '0');
      fd.append('duree_au_benin', form.dureeAuBenin);
      fd.append('possede_cipr', form.possedeCipr === 'oui' ? '1' : '0');

      fd.append('nom', form.nom);
      fd.append('prenom', form.prenom);
      if (form.nomMarital) fd.append('nom_marital', form.nomMarital);
      fd.append('sexe', form.sexe);
      fd.append('date_naissance', form.dateNaissance);
      fd.append('lieu_naissance', form.lieuNaissance);
      fd.append('adresse', form.adresse);
      fd.append('ville', form.ville);
      fd.append('situation_matrimoniale', form.situationMatrimoniale);
      fd.append('nombre_enfants_charge', form.nombreEnfantsCharge || '0');

      if (form.photo) fd.append('photo', form.photo);
      if (form.carteConsulaireFichier) fd.append('carte_consulaire_fichier', form.carteConsulaireFichier);
      if (form.ciprFichier) fd.append('cipr_fichier', form.ciprFichier);

      fd.append('profession', form.profession);
      if (form.professionAutre) fd.append('profession_autre', form.professionAutre);
      fd.append('niveau_etude', form.niveauEtude === 'Autre' ? form.niveauEtudeAutre : form.niveauEtude);
      if (form.niveauEtudeAutre) fd.append('niveau_etude_autre', form.niveauEtudeAutre);
      fd.append('dernier_diplome', form.dernierDiplome === 'Autre' ? form.dernierDiplomeAutre : form.dernierDiplome);
      if (form.dernierDiplomeAutre) fd.append('dernier_diplome_autre', form.dernierDiplomeAutre);

      if (form.profession === 'entrepreneur') {
        fd.append('entrepreneur_domaine', form.entrepreneurDomaine);
        if (form.entrepreneurDomaineAutre) fd.append('entrepreneur_domaine_autre', form.entrepreneurDomaineAutre);
        fd.append('entrepreneur_duree', form.entrepreneurDuree);
        fd.append('entrepreneur_nom_entreprise', form.entrepreneurNomEntreprise);
        if (form.entrepreneurFonction) fd.append('entrepreneur_fonction', form.entrepreneurFonction);
      }
      if (form.profession === 'etudiant') {
        fd.append('etablissement', form.etablissement);
        fd.append('etudiant_filiere', form.etudiantFiliere);
        fd.append('etudiant_annee', form.etudiantAnnee);
      }

      form.competences.forEach((v) => fd.append('competences[]', v));
      if (form.competencesAutre) fd.append('competences_autre', form.competencesAutre);
      form.domainesInteret.forEach((v) => fd.append('centres_interet[]', v));
      if (form.domainesInteretAutre) fd.append('domaines_interet_autre', form.domainesInteretAutre);
      form.loisirs.forEach((v) => fd.append('loisirs[]', v));
      if (form.loisirsAutre) fd.append('loisirs_autre', form.loisirsAutre);
      fd.append('disponibilite', form.disponibilite);
      form.langues.forEach((v) => fd.append('langues[]', v));

      fd.append('comment_connu', form.commentConnu === 'Autre' ? form.commentConnuAutre : form.commentConnu);
      if (form.commentConnuAutre) fd.append('comment_connu_autre', form.commentConnuAutre);
      if (form.recommandePar) fd.append('recommande_par', form.recommandePar);
      if (form.motivation) fd.append('motivation', form.motivation);
      fd.append('experience_associative', form.experienceAssociative === 'oui' ? '1' : '0');
      if (form.experienceAssociativeDetails) fd.append('experience_associative_details', form.experienceAssociativeDetails);
      form.commissionsSouhaitees.forEach((v) => fd.append('commissions_souhaitees[]', v));
      if (form.attentes) fd.append('attentes', form.attentes);

      fd.append('email', form.email);
      fd.append('telephone', form.telephone);
      if (form.autreTelephone) fd.append('autre_telephone', form.autreTelephone);

      fd.append('declarant_nom_complet', form.declarantNomComplet);
      fd.append('accepte_conditions', '1');
      fd.append('souhaite_recevoir_actualites', form.souhaiteRecevoirActualites === 'oui' ? '1' : '0');
      form.lettreDemandeFichiers.forEach((f) => fd.append('lettre_demande_fichiers[]', f));

      await api.postForm('/v1/adhesions', fd, 'POST');
      setSubmitted(true);
    } catch (err) {
      if (err instanceof ApiError && err.errors) {
        const firstError = Object.values(err.errors)[0]?.[0];
        toast.error(firstError || err.message);
      } else {
        toast.error(err instanceof ApiError ? err.message : 'Une erreur est survenue.');
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="bg-slate-50 min-h-screen pt-32 pb-20 flex items-center justify-center px-4">
        <div className="bg-white rounded-3xl p-10 max-w-lg text-center shadow-lg border border-slate-100">
          <div className="w-16 h-16 rounded-full bg-brand-green-100 text-brand-green-600 flex items-center justify-center mx-auto mb-6">
            <Check className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-3">Demande envoyée !</h1>
          <p className="text-slate-500">
            Merci {form.prenom}, votre demande d'adhésion a bien été reçue. Un email de confirmation
            vous a été envoyé, et le Bureau Exécutif reviendra vers vous prochainement.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen pt-28 pb-20">
      <div className="container mx-auto px-4 max-w-2xl">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 mb-4"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Retour
        </button>
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-2 text-center">Fiche d'adhésion</h1>
        <p className="text-slate-500 text-center mb-8">
          L'AJDCB est un cadre d'unité, de solidarité, de réflexion et d'action des jeunes congolais vivant au Bénin.
        </p>

        <div className="mb-8">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>{STEPS[step]}</span>
            <span>{step + 1} / {STEPS.length}</span>
          </div>
          <Progress value={((step + 1) / STEPS.length) * 100} />
        </div>

        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-100">
          {step === 0 && (
            <div className="space-y-5">
              <RadioField
                label="Êtes-vous congolais(e) ?"
                value={form.estCongolais}
                onChange={(v) => set('estCongolais', v)}
                options={[{ value: 'oui', label: 'Oui' }, { value: 'non', label: 'Non' }]}
              />
              {form.estCongolais === 'non' && (
                <Field label="Précisez votre nationalité">
                  <Input value={form.nationalite} onChange={(e) => set('nationalite', e.target.value)} />
                </Field>
              )}
              <RadioField
                label="Possédez-vous une carte consulaire ?"
                value={form.possedeCarteConsulaire}
                onChange={(v) => set('possedeCarteConsulaire', v)}
                options={[{ value: 'oui', label: 'Oui' }, { value: 'non', label: 'Non' }]}
              />
              <Field label="Depuis combien de temps êtes-vous au Bénin ?" hint="Exemple : 1 mois, 1 an, 2 ans, 10 ans.">
                <Input value={form.dureeAuBenin} onChange={(e) => set('dureeAuBenin', e.target.value)} placeholder="Ex : 2 ans" />
              </Field>
              <RadioField
                label="Possédez-vous un Certificat d'Identification Personnelle du Résident (CIPR) ?"
                value={form.possedeCipr}
                onChange={(v) => set('possedeCipr', v)}
                options={[{ value: 'oui', label: 'Oui' }, { value: 'non', label: 'Non' }]}
              />
            </div>
          )}

          {step === 1 && (
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <Field label="Prénoms" hint="Conformément à votre pièce d'identité.">
                  <Input value={form.prenom} onChange={(e) => set('prenom', e.target.value)} />
                </Field>
                <Field label="Noms" hint="Conformément à votre pièce d'identité.">
                  <Input value={form.nom} onChange={(e) => set('nom', e.target.value)} />
                </Field>
              </div>
              <Field label="Nom marital" hint="Si vous êtes marié(e).">
                <Input value={form.nomMarital} onChange={(e) => set('nomMarital', e.target.value)} />
              </Field>
              <RadioField
                label="Sexe"
                value={form.sexe}
                onChange={(v) => set('sexe', v)}
                options={[{ value: 'masculin', label: 'Masculin' }, { value: 'feminin', label: 'Féminin' }]}
              />
              <div className="grid grid-cols-2 gap-4">
                <Field label="Date de naissance">
                  <Input type="date" value={form.dateNaissance} onChange={(e) => set('dateNaissance', e.target.value)} />
                </Field>
                <Field label="Lieu de naissance">
                  <Input value={form.lieuNaissance} onChange={(e) => set('lieuNaissance', e.target.value)} />
                </Field>
              </div>
              <Field label="Lieu de résidence actuel" hint="Lot, carré, quartier. Exemple : lot 654-655, C04, Jéricho.">
                <Input value={form.adresse} onChange={(e) => set('adresse', e.target.value)} />
              </Field>
              <Field label="Ville">
                <Input value={form.ville} onChange={(e) => set('ville', e.target.value)} placeholder="Cotonou" />
              </Field>
              <Field label="Situation matrimoniale">
                <Select value={form.situationMatrimoniale} onValueChange={(v) => set('situationMatrimoniale', v)}>
                  <SelectTrigger><SelectValue placeholder="Sélectionnez" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="marie">Marié(e)</SelectItem>
                    <SelectItem value="divorce">Divorcé(e)</SelectItem>
                    <SelectItem value="union_libre">Union libre</SelectItem>
                    <SelectItem value="celibataire">Célibataire</SelectItem>
                    <SelectItem value="veuf">Veuf(ve)</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Nombre d'enfant(s) à charge">
                <Input type="number" min="0" value={form.nombreEnfantsCharge} onChange={(e) => set('nombreEnfantsCharge', e.target.value)} />
              </Field>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5">
              <p className="text-sm text-slate-500">Merci de fournir des documents bien lisibles.</p>
              <FileField
                label="Ajoutez une photo récente de vous"
                hint="Cette photo sera utilisée pour votre badge."
                file={form.photo}
                onChange={(f) => set('photo', f)}
                accept="image/jpeg,image/png,image/jpg"
              />
              {form.possedeCarteConsulaire === 'oui' && (
                <FileField
                  label="Importez votre carte consulaire"
                  file={form.carteConsulaireFichier}
                  onChange={(f) => set('carteConsulaireFichier', f)}
                  accept="image/jpeg,image/png,image/jpg,application/pdf"
                />
              )}
              {form.possedeCipr === 'oui' && (
                <FileField
                  label="Importez votre CIPR"
                  file={form.ciprFichier}
                  onChange={(f) => set('ciprFichier', f)}
                  accept="image/jpeg,image/png,image/jpg,application/pdf"
                />
              )}
            </div>
          )}

          {step === 3 && (
            <div className="space-y-5">
              <Field label="Quelle est votre profession ?">
                <Select value={form.profession} onValueChange={(v) => set('profession', v)}>
                  <SelectTrigger><SelectValue placeholder="Sélectionnez" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="etudiant">Étudiant(e)</SelectItem>
                    <SelectItem value="employe">Employé(e)</SelectItem>
                    <SelectItem value="entrepreneur">Entrepreneur(e)</SelectItem>
                    <SelectItem value="commercant">Commerçant(e)</SelectItem>
                    <SelectItem value="sans_emploi">Sans emploi</SelectItem>
                    <SelectItem value="autre">Autre</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              {form.profession === 'autre' && (
                <Field label="Précisez votre profession">
                  <Input value={form.professionAutre} onChange={(e) => set('professionAutre', e.target.value)} />
                </Field>
              )}

              <Field label="Quel est votre niveau d'études ?">
                <Select value={form.niveauEtude} onValueChange={(v) => set('niveauEtude', v)}>
                  <SelectTrigger><SelectValue placeholder="Sélectionnez" /></SelectTrigger>
                  <SelectContent>
                    {NIVEAUX_ETUDE.map((n) => <SelectItem key={n} value={n}>{n}</SelectItem>)}
                  </SelectContent>
                </Select>
              </Field>
              {form.niveauEtude === 'Autre' && (
                <Field label="Précisez">
                  <Input value={form.niveauEtudeAutre} onChange={(e) => set('niveauEtudeAutre', e.target.value)} />
                </Field>
              )}

              <Field label="Dernier diplôme">
                <Select value={form.dernierDiplome} onValueChange={(v) => set('dernierDiplome', v)}>
                  <SelectTrigger><SelectValue placeholder="Sélectionnez" /></SelectTrigger>
                  <SelectContent>
                    {NIVEAUX_ETUDE.map((n) => <SelectItem key={n} value={n}>{n}</SelectItem>)}
                  </SelectContent>
                </Select>
              </Field>
              {form.dernierDiplome === 'Autre' && (
                <Field label="Précisez">
                  <Input value={form.dernierDiplomeAutre} onChange={(e) => set('dernierDiplomeAutre', e.target.value)} />
                </Field>
              )}

              {form.profession === 'entrepreneur' && (
                <div className="pt-4 border-t border-slate-100 space-y-5">
                  <p className="text-sm font-medium text-slate-700">Votre activité</p>
                  <Field label="Dans quel domaine opérez-vous principalement ?">
                    <Input value={form.entrepreneurDomaine} onChange={(e) => set('entrepreneurDomaine', e.target.value)} />
                  </Field>
                  <Field label="Depuis combien de temps opérez-vous dans ce domaine ?" hint="Exemple : 6 mois, 1 an, 3 ans…">
                    <Input value={form.entrepreneurDuree} onChange={(e) => set('entrepreneurDuree', e.target.value)} />
                  </Field>
                  <Field label="Nom (légal) de votre entreprise ou structure">
                    <Input value={form.entrepreneurNomEntreprise} onChange={(e) => set('entrepreneurNomEntreprise', e.target.value)} />
                  </Field>
                  <Field label="Votre fonction au sein de la structure" hint="Exemple : Gérant, Fondateur, CEO, Consultant, Freelance…">
                    <Input value={form.entrepreneurFonction} onChange={(e) => set('entrepreneurFonction', e.target.value)} />
                  </Field>
                </div>
              )}

              {form.profession === 'etudiant' && (
                <div className="pt-4 border-t border-slate-100 space-y-5">
                  <p className="text-sm font-medium text-slate-700">Vos études</p>
                  <Field label="Dans quel établissement fréquentez-vous ?">
                    <Input value={form.etablissement} onChange={(e) => set('etablissement', e.target.value)} />
                  </Field>
                  <Field label="Dans quelle filière êtes-vous ?">
                    <Input value={form.etudiantFiliere} onChange={(e) => set('etudiantFiliere', e.target.value)} />
                  </Field>
                  <Field label="En quelle année êtes-vous ?">
                    <Select value={form.etudiantAnnee} onValueChange={(v) => set('etudiantAnnee', v)}>
                      <SelectTrigger><SelectValue placeholder="Sélectionnez" /></SelectTrigger>
                      <SelectContent>
                        {ANNEES_ETUDE.map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </Field>
                </div>
              )}
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6">
              <CheckboxGroup
                label="Quelles sont vos compétences spécifiques ?"
                options={COMPETENCES}
                values={form.competences}
                onToggle={(v) => set('competences', toggleInArray(form.competences, v))}
              />
              <Field label="Autre compétence (optionnel)">
                <Input value={form.competencesAutre} onChange={(e) => set('competencesAutre', e.target.value)} />
              </Field>

              <CheckboxGroup
                label="Quels domaines d'intérêt vous motivent le plus ?"
                options={DOMAINES_INTERET}
                values={form.domainesInteret}
                onToggle={(v) => set('domainesInteret', toggleInArray(form.domainesInteret, v))}
              />
              <Field label="Autre domaine (optionnel)">
                <Input value={form.domainesInteretAutre} onChange={(e) => set('domainesInteretAutre', e.target.value)} />
              </Field>

              <CheckboxGroup
                label="Quels sont vos loisirs ?"
                options={LOISIRS}
                values={form.loisirs}
                onToggle={(v) => set('loisirs', toggleInArray(form.loisirs, v))}
              />
              <Field label="Autre loisir (optionnel)">
                <Input value={form.loisirsAutre} onChange={(e) => set('loisirsAutre', e.target.value)} />
              </Field>

              <Field label="Disponibilité pour les activités de l'AJDCB">
                <RadioGroup value={form.disponibilite} onValueChange={(v) => set('disponibilite', v)}>
                  {DISPONIBILITES.map((d) => (
                    <label key={d.value} className="flex items-start gap-2.5 text-sm text-slate-700 py-1 cursor-pointer">
                      <RadioGroupItem value={d.value} className="mt-0.5" />
                      {d.label}
                    </label>
                  ))}
                </RadioGroup>
              </Field>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-5">
              <div>
                <p className="text-sm font-medium text-slate-700 mb-1">Quelle(s) langue(s) parlez-vous et quel est votre niveau ?</p>
                <p className="text-xs text-slate-400 mb-3">
                  Exemple : Français — langue maternelle, Anglais — Professionnelle. Si vous ne parlez que le français, ajoutez juste une ligne.
                </p>
                <div className="flex gap-2 mb-3">
                  <Input
                    value={langueInput}
                    onChange={(e) => setLangueInput(e.target.value)}
                    placeholder="Ex : Anglais - Professionnelle"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        if (langueInput.trim()) {
                          set('langues', [...form.langues, langueInput.trim()]);
                          setLangueInput('');
                        }
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      if (langueInput.trim()) {
                        set('langues', [...form.langues, langueInput.trim()]);
                        setLangueInput('');
                      }
                    }}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="space-y-1.5">
                  {form.langues.map((l, i) => (
                    <div key={i} className="flex items-center justify-between bg-slate-50 rounded-lg px-3 py-2 text-sm text-slate-700">
                      {l}
                      <button
                        type="button"
                        onClick={() => set('langues', form.langues.filter((_, idx) => idx !== i))}
                        className="text-slate-400 hover:text-brand-red-600"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 6 && (
            <div className="space-y-5">
              <Field label="Comment avez-vous entendu parler de l'AJDCB ?">
                <Select value={form.commentConnu} onValueChange={(v) => set('commentConnu', v)}>
                  <SelectTrigger><SelectValue placeholder="Sélectionnez" /></SelectTrigger>
                  <SelectContent>
                    {COMMENT_CONNU.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </Field>
              {form.commentConnu === 'Autre' && (
                <Field label="Précisez">
                  <Input value={form.commentConnuAutre} onChange={(e) => set('commentConnuAutre', e.target.value)} />
                </Field>
              )}
              <Field label="Si recommandé(e) par quelqu'un, son nom (optionnel)">
                <Input value={form.recommandePar} onChange={(e) => set('recommandePar', e.target.value)} />
              </Field>
              <Field label="Votre motivation principale à rejoindre l'AJDCB" hint="Qu'est-ce qui vous inspire dans nos missions ?">
                <Textarea rows={4} value={form.motivation} onChange={(e) => set('motivation', e.target.value)} />
              </Field>
              <RadioField
                label="Avez-vous une expérience associative antérieure ?"
                value={form.experienceAssociative}
                onChange={(v) => set('experienceAssociative', v)}
                options={[{ value: 'oui', label: 'Oui' }, { value: 'non', label: 'Non' }]}
              />
              {form.experienceAssociative === 'oui' && (
                <Field label="Nommez l'association et décrivez votre rôle">
                  <Textarea rows={3} value={form.experienceAssociativeDetails} onChange={(e) => set('experienceAssociativeDetails', e.target.value)} />
                </Field>
              )}
              <CheckboxGroup
                label="Dans quelle(s) commission(s) souhaitez-vous vous investir en priorité ?"
                options={COMMISSIONS}
                values={form.commissionsSouhaitees}
                onToggle={(v) => set('commissionsSouhaitees', toggleInArray(form.commissionsSouhaitees, v))}
              />
              <Field label="Vos attentes principales vis-à-vis de l'AJDCB" hint="Exemple : développer mon réseau, acquérir des compétences…">
                <Textarea rows={3} value={form.attentes} onChange={(e) => set('attentes', e.target.value)} />
              </Field>
            </div>
          )}

          {step === 7 && (
            <div className="space-y-5">
              <Field label="Votre adresse e-mail">
                <Input type="email" value={form.email} onChange={(e) => set('email', e.target.value)} />
              </Field>
              <Field label="Numéro de téléphone principal">
                <Input value={form.telephone} onChange={(e) => set('telephone', e.target.value)} placeholder="+229 …" />
              </Field>
              <Field label="Autre numéro de téléphone (optionnel)">
                <Input value={form.autreTelephone} onChange={(e) => set('autreTelephone', e.target.value)} />
              </Field>
            </div>
          )}

          {step === 8 && (
            <div className="space-y-5">
              <div className="bg-slate-50 rounded-xl p-4 text-sm text-slate-600">
                Je soussigné(e), certifie sur l'honneur que les informations fournies dans cette fiche
                d'adhésion sont exactes et sincères. Je m'engage à respecter les statuts, le règlement
                intérieur ainsi que les valeurs de l'AJDCB.
              </div>
              <Field label="Vos noms et prénoms (déclarant)">
                <Input value={form.declarantNomComplet} onChange={(e) => set('declarantNomComplet', e.target.value)} />
              </Field>
              <label className="flex items-start gap-2.5 text-sm text-slate-700 cursor-pointer">
                <Checkbox
                  checked={form.accepteConditions}
                  onCheckedChange={(v) => set('accepteConditions', !!v)}
                  className="mt-0.5"
                />
                Je confirme et j'accepte les conditions ci-dessus.
              </label>
              <RadioField
                label="Souhaitez-vous recevoir les actualités de l'AJDCB par e-mail ?"
                value={form.souhaiteRecevoirActualites}
                onChange={(v) => set('souhaiteRecevoirActualites', v)}
                options={[{ value: 'oui', label: 'Oui' }, { value: 'non', label: 'Non' }]}
              />
              <div>
                <p className="text-sm font-medium text-slate-700 mb-1">
                  Demande écrite à l'attention du Président (optionnel)
                </p>
                <p className="text-xs text-slate-400 mb-2">Jusqu'à 5 fichiers.</p>
                <input
                  type="file"
                  multiple
                  accept="image/jpeg,image/png,image/jpg,application/pdf,.doc,.docx"
                  onChange={(e) => set('lettreDemandeFichiers', Array.from(e.target.files || []).slice(0, 5))}
                  className="text-sm text-slate-600 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:bg-slate-100 file:text-slate-700 file:text-sm"
                />
              </div>
            </div>
          )}

          <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={back} disabled={step === 0}>
              <ChevronLeft className="w-4 h-4" /> Retour
            </Button>
            {step < STEPS.length - 1 ? (
              <Button type="button" onClick={next} className="bg-brand-green-600 hover:bg-brand-green-700">
                Suivant <ChevronRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button type="button" disabled={submitting} onClick={submit} className="bg-brand-green-600 hover:bg-brand-green-700">
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                Envoyer ma demande
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------- Choix Membre / Partenaire ----------

export function Join() {
  const [mode, setMode] = useState<'choix' | 'membre' | 'partenaire'>('choix');

  if (mode === 'membre') return <MembreForm onBack={() => setMode('choix')} />;
  if (mode === 'partenaire') return <PartenaireForm onBack={() => setMode('choix')} />;

  return (
    <div className="bg-slate-50 min-h-screen pt-32 pb-20">
      <div className="container mx-auto px-4 text-center max-w-4xl">
        <h1 className="text-5xl font-bold text-slate-900 mb-6">Rejoignez l'Élite.</h1>
        <p className="text-xl text-slate-500 mb-12">
          Choisissez votre niveau d'engagement. Que vous soyez étudiant, professionnel ou
          partenaire, vous avez votre place parmi nous.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch max-w-3xl mx-auto">
          <button
            onClick={() => setMode('membre')}
            className="bg-white p-10 rounded-[2.5rem] text-left shadow-lg border-2 border-transparent hover:border-brand-green-500 transition-all"
          >
            <div className="w-12 h-12 rounded-2xl bg-brand-green-100 text-brand-green-600 flex items-center justify-center mb-5">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-2">Devenir membre</h3>
            <p className="text-slate-500 mb-6">
              Pour les jeunes congolais résidant au Bénin qui veulent s'intégrer, s'engager et
              grandir avec la communauté.
            </p>
            <span className="inline-flex items-center gap-2 text-brand-green-600 font-bold">
              Remplir la fiche d'adhésion <ChevronRight className="w-4 h-4" />
            </span>
          </button>

          <button
            onClick={() => setMode('partenaire')}
            className="bg-slate-900 p-10 rounded-[2.5rem] text-left shadow-lg border-2 border-transparent hover:border-brand-gold-500 transition-all text-white"
          >
            <div className="w-12 h-12 rounded-2xl bg-brand-gold-500/20 text-brand-gold-500 flex items-center justify-center mb-5">
              <Handshake className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-bold mb-2">Devenir partenaire</h3>
            <p className="text-slate-400 mb-6">
              Pour les entreprises, institutions et organisations souhaitant soutenir la
              jeunesse congolaise au Bénin.
            </p>
            <span className="inline-flex items-center gap-2 text-brand-gold-500 font-bold">
              Nous contacter <ChevronRight className="w-4 h-4" />
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------- Formulaire Partenaire (simple, ne remplit pas la fiche membre) ----------

function PartenaireForm({ onBack }: { onBack: () => void }) {
  const [prenom, setPrenom] = useState('');
  const [nom, setNom] = useState('');
  const [organisation, setOrganisation] = useState('');
  const [email, setEmail] = useState('');
  const [telephone, setTelephone] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!prenom.trim() || !nom.trim() || !email.trim() || !telephone.trim() || !message.trim()) {
      toast.error('Merci de compléter tous les champs.');
      return;
    }
    setSubmitting(true);
    try {
      const texte = organisation.trim()
        ? `Organisation : ${organisation.trim()}\n\n${message.trim()}`
        : message.trim();
      await api.post('/v1/messages', {
        prenom, nom, email, telephone,
        objet: 'partenariat',
        message: texte,
      });
      setSubmitted(true);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Une erreur est survenue.');
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="bg-slate-50 min-h-screen pt-32 pb-20 flex items-center justify-center px-4">
        <div className="bg-white rounded-3xl p-10 max-w-lg text-center shadow-lg border border-slate-100">
          <div className="w-16 h-16 rounded-full bg-brand-gold-500/10 text-brand-gold-500 flex items-center justify-center mx-auto mb-6">
            <Check className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-3">Message envoyé !</h1>
          <p className="text-slate-500">
            Merci {prenom}, votre demande de partenariat a bien été transmise au Bureau Exécutif.
            Nous reviendrons vers vous rapidement.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen pt-28 pb-20">
      <div className="container mx-auto px-4 max-w-lg">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 mb-4"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Retour
        </button>
        <h1 className="text-3xl font-bold text-slate-900 mb-2 text-center">Devenir partenaire</h1>
        <p className="text-slate-500 text-center mb-8">
          Parlez-nous de votre organisation, le Bureau Exécutif vous recontactera.
        </p>

        <form onSubmit={submit} className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-100 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Prénom">
              <Input value={prenom} onChange={(e) => setPrenom(e.target.value)} />
            </Field>
            <Field label="Nom">
              <Input value={nom} onChange={(e) => setNom(e.target.value)} />
            </Field>
          </div>
          <Field label="Organisation / entreprise (optionnel)">
            <Input value={organisation} onChange={(e) => setOrganisation(e.target.value)} />
          </Field>
          <Field label="Email">
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </Field>
          <Field label="Téléphone">
            <Input value={telephone} onChange={(e) => setTelephone(e.target.value)} placeholder="+229 …" />
          </Field>
          <Field label="Votre message" hint="Décrivez le type de partenariat envisagé.">
            <Textarea rows={5} value={message} onChange={(e) => setMessage(e.target.value)} />
          </Field>
          <Button type="submit" disabled={submitting} className="w-full bg-brand-gold-500 hover:bg-brand-gold-400 text-slate-900">
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            Envoyer
          </Button>
        </form>
      </div>
    </div>
  );
}

// ---------- Petits composants réutilisés ----------

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {hint && <p className="text-xs text-slate-400">{hint}</p>}
      {children}
    </div>
  );
}

function RadioField({
  label, value, onChange, options,
}: { label: string; value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }) {
  return (
    <Field label={label}>
      <RadioGroup value={value} onValueChange={onChange} className="flex gap-6">
        {options.map((o) => (
          <label key={o.value} className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
            <RadioGroupItem value={o.value} />
            {o.label}
          </label>
        ))}
      </RadioGroup>
    </Field>
  );
}

function CheckboxGroup({
  label, options, values, onToggle,
}: { label: string; options: string[]; values: string[]; onToggle: (v: string) => void }) {
  return (
    <div>
      <p className="text-sm font-medium text-slate-700 mb-2">{label}</p>
      <div className="grid grid-cols-2 gap-2">
        {options.map((o) => (
          <label key={o} className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
            <Checkbox checked={values.includes(o)} onCheckedChange={() => onToggle(o)} />
            {o}
          </label>
        ))}
      </div>
    </div>
  );
}

function FileField({
  label, hint, file, onChange, accept,
}: { label: string; hint?: string; file: File | null; onChange: (f: File | null) => void; accept: string }) {
  return (
    <div>
      <p className="text-sm font-medium text-slate-700 mb-1">{label}</p>
      {hint && <p className="text-xs text-slate-400 mb-2">{hint}</p>}
      <label className="flex items-center gap-3 border border-dashed border-slate-300 rounded-xl px-4 py-3 cursor-pointer hover:border-brand-green-400 transition-colors">
        <Upload className="w-4 h-4 text-slate-400 shrink-0" />
        <span className="text-sm text-slate-600 truncate">{file ? file.name : 'Choisir un fichier…'}</span>
        <input
          type="file"
          accept={accept}
          className="hidden"
          onChange={(e) => onChange(e.target.files?.[0] || null)}
        />
      </label>
    </div>
  );
}
