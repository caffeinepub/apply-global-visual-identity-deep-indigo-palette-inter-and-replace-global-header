import React, { createContext, useContext, ReactNode, useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useActor } from '../hooks/useActor';
import type { AppRole } from './roles';
import { adaptIdentityToUser } from './InternetIdentityAuthAdapter';

// Tipo unificado de usuário
export type AuthUser = {
  id: string;
  name: string;
  email?: string;
  role: AppRole;
  principal?: string;
};

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// Provider para modo BACKEND (Internet Identity)
function BackendAuthWrapper({ children }: { children: ReactNode }) {
  const { identity, login: iiLogin, clear, loginStatus, isInitializing } = useInternetIdentity();
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);

  const isAuthenticated = !!identity && !identity.getPrincipal().isAnonymous();

  // Carregar perfil do usuário quando autenticado
  useEffect(() => {
    if (!isAuthenticated || !actor) {
      setUser(null);
      return;
    }

    let cancelled = false;
    setIsLoadingProfile(true);

    (async () => {
      try {
        const profile = await actor.getCallerUserProfile();

        if (cancelled) return;

        // Adaptar identidade usando o perfil do backend (que inclui appRole)
        const iiUser = adaptIdentityToUser(identity!, profile, undefined);
        
        setUser({
          id: iiUser.principal,
          name: iiUser.name || 'Usuário',
          email: profile?.email,
          role: iiUser.role,
          principal: iiUser.principal,
        });
      } catch (error) {
        console.error('Erro ao carregar perfil:', error);
        if (!cancelled) {
          // Fallback: criar usuário com role padrão
          setUser({
            id: identity!.getPrincipal().toString(),
            name: 'Usuário',
            role: 'MEMBER',
            principal: identity!.getPrincipal().toString(),
          });
        }
      } finally {
        if (!cancelled) {
          setIsLoadingProfile(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, actor, identity]);

  const logout = async () => {
    await clear();
    queryClient.clear();
    setUser(null);
  };

  const value: AuthContextValue = {
    user,
    isAuthenticated,
    isLoading: isInitializing || isLoadingProfile,
    login: iiLogin,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Provider principal que usa apenas BACKEND
export function AuthProvider({ children }: { children: ReactNode }) {
  return <BackendAuthWrapper>{children}</BackendAuthWrapper>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider');
  }
  return context;
}
