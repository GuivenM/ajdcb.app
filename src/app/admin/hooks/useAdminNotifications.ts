import { useEffect, useState, useCallback } from 'react';
import { api } from '../../../lib/api';
import type { Adhesion, Message, CotisationStats } from '../types';

export type NotificationType = 'adhesion' | 'message' | 'cotisation';

export interface AdminNotification {
  type: NotificationType;
  id: number;
  titre: string;
  sous_titre: string;
  date: string;
  lien: string;
}

interface NotificationsState {
  loading: boolean;
  items: AdminNotification[];
  total: number;
  adhesionsEnAttente: number;
  messagesNonLus: number;
  cotisationsEnRetard: number;
  refresh: () => void;
}

const INTERVALLE_RAFRAICHISSEMENT_MS = 60_000;

/**
 * "Nouveau" est dérivé du statut métier existant (une adhésion en_attente,
 * un message non_lu redeviennent silencieux dès qu'un admin les traite) —
 * pas d'un système de notifications séparé à marquer lu/non lu.
 */
export function useAdminNotifications(): NotificationsState {
  const [loading, setLoading] = useState(true);
  const [adhesions, setAdhesions] = useState<Adhesion[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [cotisationsEnRetard, setCotisationsEnRetard] = useState(0);

  const charger = useCallback(async () => {
    try {
      const moisCourant = new Date().toISOString().slice(0, 7);
      const [adhesionsData, messagesData, stats] = await Promise.all([
        api.get<Adhesion[]>('/v1/adhesions'),
        api.get<Message[]>('/v1/messages'),
        api.get<CotisationStats>(`/v1/cotisations/statistiques?mois=${moisCourant}`),
      ]);
      setAdhesions(adhesionsData);
      setMessages(messagesData);
      setCotisationsEnRetard(stats.nb_impayees);
    } catch {
      // Échec silencieux : la cloche affiche simplement les derniers
      // chiffres connus plutôt qu'une erreur intrusive.
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    charger();
    const interval = setInterval(charger, INTERVALLE_RAFRAICHISSEMENT_MS);
    return () => clearInterval(interval);
  }, [charger]);

  const adhesionsEnAttente = adhesions.filter((a) => a.statut === 'en_attente');
  const messagesNonLus = messages.filter((m) => m.statut === 'non_lu');

  const items: AdminNotification[] = [
    ...adhesionsEnAttente.map((a) => ({
      type: 'adhesion' as const,
      id: a.id,
      titre: `Nouvelle adhésion — ${a.prenom} ${a.nom}`,
      sous_titre: 'En attente de traitement',
      date: a.created_at,
      lien: '/admin/adhesions',
    })),
    ...messagesNonLus.map((m) => ({
      type: 'message' as const,
      id: m.id,
      titre: `Nouveau message — ${m.prenom} ${m.nom}`,
      sous_titre: m.objet,
      date: m.created_at,
      lien: '/admin/messages',
    })),
  ]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 8);

  return {
    loading,
    items,
    total: adhesionsEnAttente.length + messagesNonLus.length,
    adhesionsEnAttente: adhesionsEnAttente.length,
    messagesNonLus: messagesNonLus.length,
    cotisationsEnRetard,
    refresh: charger,
  };
}
