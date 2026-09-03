import React, { useState } from 'react';
import { toast } from 'sonner';
import { Loader2, CreditCard } from 'lucide-react';
import { api, ApiError } from '../../lib/api';
import { Button } from './ui/button';

interface FedaPayButtonProps {
  /** Chemin de l'API à appeler, ex: '/v1/paiements/cotisation' ou '/v1/paiements/evenements/12' */
  endpoint: string;
  /** Corps additionnel envoyé avec la requête, ex: { membre_id, mois: [...] } */
  extraPayload?: Record<string, unknown>;
  montant: number;
  devise?: string;
  label?: string;
  className?: string;
  /**
   * Coordonnées du payeur déjà connues (ex: fiche membre) — transmises telles
   * quelles pour pré-remplir la page FedaPay. Jamais redemandées ici : quand
   * elles manquent, FedaPay les collecte lui-même sur sa page de paiement
   * (obligatoire de toute façon pour le Mobile Money).
   */
  payeur?: {
    nom_payeur?: string;
    telephone_payeur?: string;
    email_payeur?: string;
  };
}

/**
 * Un clic, une redirection : initie le paiement côté API puis envoie
 * directement vers la page de paiement sécurisée FedaPay (checkout_url).
 * Aucune saisie côté site — FedaPay demande lui-même ce qui manque.
 */
export function FedaPayButton({
  endpoint,
  extraPayload,
  montant,
  devise = 'XOF',
  label = 'Payer avec FedaPay',
  className,
  payeur,
}: FedaPayButtonProps) {
  const [loading, setLoading] = useState(false);

  async function lancerPaiement() {
    setLoading(true);
    try {
      const result = await api.post<{ paiement_id: number; checkout_url: string }>(endpoint, {
        ...payeur,
        ...extraPayload,
      });
      window.location.href = result.checkout_url;
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Impossible d'initier le paiement pour l'instant.";
      toast.error(message);
      setLoading(false);
    }
  }

  return (
    <Button className={className} disabled={loading} onClick={lancerPaiement}>
      {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CreditCard className="w-4 h-4 mr-2" />}
      {label} — {montant.toLocaleString('fr-FR')} {devise}
    </Button>
  );
}
