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
