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

  const onSubmit = async (data: PayeurForm) => {
    setLoading(true);
    try {
      const result = await api.post<{ paiement_id: number; checkout_url: string }>(
        endpoint,
        { ...data, ...extraPayload }
      );
      // Redirection vers la page de paiement sécurisée FedaPay.
      window.location.href = result.checkout_url;
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Impossible d'initier le paiement pour l'instant.";
      toast.error(message);
      setLoading(false);
    }
  };

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
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="nom_payeur">Nom complet</Label>
            <Input id="nom_payeur" {...register('nom_payeur', { required: true })} />
            {errors.nom_payeur && <span className="text-red-500 text-xs">Requis</span>}
          </div>
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
