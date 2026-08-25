export type StatutAdhesion = 'en_attente' | 'approuvee' | 'rejetee';

export interface Adhesion {
  id: number;
  nom: string;
  prenom: string;
  date_naissance: string;
  lieu_naissance: string;
  nationalite: string;
  email: string;
  telephone: string;
  adresse: string;
  ville: string;
  profession: string;
  niveau_etude: string;
  etablissement: string | null;
  motivation: string;
  competences: string[] | null;
  centres_interet: string[] | null;
  disponibilite: string | null;
  commentaire: string | null;
  statut: StatutAdhesion;
  date_traitement: string | null;
  commentaire_traitement: string | null;
  traite_par: number | null;
  created_at: string;
  updated_at: string;
}

export type StatutCotisation = 'payee' | 'impayee';
export type ModePaiement = 'especes' | 'mobile_money' | 'virement' | 'autre';

export interface CotisationMembre {
  membre_id: number;
  nom_complet: string;
  photo_url: string | null;
  mois: string;
  cotisation_id: number | null;
  montant: number;
  statut: StatutCotisation;
  date_paiement: string | null;
  mode_paiement: ModePaiement | null;
  commentaire: string | null;
}

export interface CotisationStats {
  mois: string;
  nb_membres: number;
  nb_payees: number;
  nb_impayees: number;
  taux_a_jour: number;
  montant_collecte: number;
  montant_attendu: number;
}

export interface CotisationHistoriqueEntry {
  mois: string;
  statut: StatutCotisation;
  date_paiement: string | null;
  montant: number | null;
}

export type StatutEvenement = 'publie' | 'brouillon' | 'annule';

export interface Evenement {
  id: number;
  titre: string;
  description: string | null;
  contenu: string | null;
  image: string | null;
  image_url: string | null;
  date_debut: string;
  date_fin: string;
  heure_debut: string | null;
  heure_fin: string | null;
  lieu: string | null;
  adresse: string | null;
  ville: string | null;
  type: string | null;
  categorie: string | null;
  capacite_max: number | null;
  nombre_inscrits: number;
  prix: number | null;
  devise: string | null;
  lien_billet: string | null;
  organisateur: string | null;
  contact_organisateur: string | null;
  email_contact: string | null;
  telephone_contact: string | null;
  statut: StatutEvenement;
  statut_evenement: 'passé' | 'à_venir' | 'en_cours';
  created_at: string;
  updated_at: string;
}

export type StatutMembre = 'actif' | 'inactif';

export interface Membre {
  id: number;
  nom: string;
  prenom: string;
  nom_complet: string;
  photo: string | null;
  photo_url: string | null;
  facebook: string | null;
  instagram: string | null;
  linkedin: string | null;
  twitter: string | null;
  whatsapp: string | null;
  poste: string | null;
  commission: string | null;
  role: string;
  statut: StatutMembre;
  created_at: string;
  updated_at: string;
}
export type ObjetMessage =
  | 'question'
  | 'partenariat'
  | 'adhesion'
  | 'urgence'
  | 'information'
  | 'reclamation'
  | 'autre';

export interface Message {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  objet: ObjetMessage;
  message: string;
  reponse: string | null;
  date_reponse: string | null;
  statut: StatutMessage;
  lu_le: string | null;
  traite_par: number | null;
  created_at: string;
  updated_at: string;
}
