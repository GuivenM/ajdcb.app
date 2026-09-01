import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { membreApi, ApiError, getMembreToken, setMembreToken } from '../../lib/memberApi';

export interface MembreUser {
  id: number;
  nom: string;
  prenom: string;
  nom_complet: string;
  email: string;
  photo: string | null;
  whatsapp: string | null;
  facebook: string | null;
  instagram: string | null;
  linkedin: string | null;
  twitter: string | null;
  poste: string | null;
  commission: string | null;
  role: string;
  statut: 'actif' | 'inactif' | 'en_attente_paiement';
  en_attente_paiement: boolean;
  derniere_connexion: string | null;
}

interface LoginResponse {
  membre: MembreUser;
  token: string;
}

interface MemberAuthContextValue {
  membre: MembreUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string, remember?: boolean) => Promise<void>;
  activerCompte: (token: string, password: string, passwordConfirmation: string) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
}

const MemberAuthContext = createContext<MemberAuthContextValue | undefined>(undefined);

export function MemberAuthProvider({ children }: { children: React.ReactNode }) {
  const [membre, setMembre] = useState<MembreUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadMe = useCallback(async () => {
    if (!getMembreToken()) {
      setIsLoading(false);
      return;
    }
    try {
      const data = await membreApi.get<{ membre: MembreUser }>('/v1/membre/auth/me');
      setMembre(data.membre);
    } catch {
      setMembreToken(null);
      setMembre(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMe();
  }, [loadMe]);

  const login = useCallback(async (email: string, password: string, remember = false) => {
    const data = await membreApi.post<LoginResponse>('/v1/membre/auth/login', {
      email,
      password,
      remember,
    });
    setMembreToken(data.token);
    setMembre(data.membre);
  }, []);

  const activerCompte = useCallback(
    async (token: string, password: string, passwordConfirmation: string) => {
      const data = await membreApi.post<LoginResponse>('/v1/membre/auth/activer-compte', {
        token,
        password,
        password_confirmation: passwordConfirmation,
      });
      setMembreToken(data.token);
      setMembre(data.membre);
    },
    []
  );

  const logout = useCallback(async () => {
    try {
      await membreApi.post('/v1/membre/auth/logout');
    } catch (e) {
      // même si l'appel échoue (token déjà invalide), on nettoie la session locale
      if (!(e instanceof ApiError)) throw e;
    } finally {
      setMembreToken(null);
      setMembre(null);
    }
  }, []);

  return (
    <MemberAuthContext.Provider
      value={{
        membre,
        isLoading,
        isAuthenticated: !!membre,
        login,
        activerCompte,
        logout,
        refresh: loadMe,
      }}
    >
      {children}
    </MemberAuthContext.Provider>
  );
}

export function useMemberAuth() {
  const ctx = useContext(MemberAuthContext);
  if (!ctx) throw new Error('useMemberAuth doit être utilisé dans un MemberAuthProvider');
  return ctx;
}
