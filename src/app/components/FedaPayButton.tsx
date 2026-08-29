import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Loader2, CreditCard } from 'lucide-react';
import { api, ApiError } from '../../lib/api';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';

interface PayeurForm {
  nom_payeur: string;
  telephone_payeur: string;
  email_payeur?: string;
}

interface FedaPayButtonProps {
  /** Chemin de l'API à appeler, ex: '/paiements/cotisation' ou '/paiements/evenements/12' */
  endpoint: string;
  /** Corps additionnel envoyé avec les coordonnées du payeur, ex: { mois: '2026-08' } */
  extraPayload?: Record<string, unknown>;
  montant: number;
  devise?: string;
  label?: string;
  className?: string;
  /** Pré-remplit le petit formulaire (ex: coordonnées déjà saisies dans un formulaire précédent) */
  defaultValues?: Partial<PayeurForm>;
}

/**
 * Bouton générique qui ouvre un petit formulaire (nom, téléphone, email),
 * initie un paiement FedaPay côté API, puis redirige vers la page de
 * paiement sécurisée renvoyée par FedaPay (checkout_url).
 */
export function FedaPayButton({
  endpoint,
  extraPayload,
  montant,
  devise = 'XOF',
  label = 'Payer avec FedaPay',
  className,
  defaultValues,
}: FedaPayButtonProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<PayeurForm>({ defaultValues });
  const nomConnu = defaultValues?.nom_payeur;
  const telephoneConnu = defaultValues?.telephone_payeur;
  // Membre déjà identifié (lien personnel avec membre_id) et son numéro est
  // en base : plus rien à demander, on part direct sur FedaPay au clic.
  const coordonneesCompletes = Boolean(nomConnu && telephoneConnu);

  const lancerPaiement = async (data: Partial<PayeurForm>) => {
    setLoading(true);
    try {
      const result = await api.post<{ paiement_id: number; checkout_url: string }>(
        endpoint,
        {
          nom_payeur: nomConnu || data.nom_payeur,
          telephone_payeur: telephoneConnu || data.telephone_payeur,
          email_payeur: data.email_payeur,
          ...extraPayload,
        }
      );
      // Redirection vers la page de paiement sécurisée FedaPay.
      window.location.href = result.checkout_url;
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Impossible d'initier le paiement pour l'instant.";
      toast.error(message);
      setLoading(false);
    }
  };

  if (coordonneesCompletes) {
    return (
      <Button className={className} disabled={loading} onClick={() => lancerPaiement({})}>
        {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CreditCard className="w-4 h-4 mr-2" />}
        {label} — {montant.toLocaleString('fr-FR')} {devise}
      </Button>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className={className}>
          <CreditCard className="w-4 h-4 mr-2" />
          {label} — {montant.toLocaleString('fr-FR')} {devise}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Vos coordonnées</DialogTitle>
          <DialogDescription>
            Nécessaires pour générer votre lien de paiement FedaPay ({montant.toLocaleString('fr-FR')} {devise}).
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(lancerPaiement)} className="space-y-4">
          {nomConnu ? (
            <div className="text-sm text-slate-500 -mt-1">
              Paiement au nom de <span className="font-medium text-slate-700">{nomConnu}</span>
            </div>
          ) : (
            <div>
              <Label htmlFor="nom_payeur">Nom complet</Label>
              <Input id="nom_payeur" {...register('nom_payeur', { required: true })} />
              {errors.nom_payeur && <span className="text-red-500 text-xs">Requis</span>}
            </div>
          )}
          <div>
            <Label htmlFor="telephone_payeur">Téléphone (Mobile Money)</Label>
            <Input id="telephone_payeur" placeholder="+229 00 00 00 00" {...register('telephone_payeur', { required: true })} />
            {errors.telephone_payeur && <span className="text-red-500 text-xs">Requis</span>}
          </div>
          <div>
            <Label htmlFor="email_payeur">Email (optionnel)</Label>
            <Input id="email_payeur" type="email" {...register('email_payeur')} />
          </div>
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CreditCard className="w-4 h-4 mr-2" />}
            Continuer vers le paiement
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
