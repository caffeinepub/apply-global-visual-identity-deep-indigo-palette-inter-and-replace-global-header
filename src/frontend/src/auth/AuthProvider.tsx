import React, { createContext, useContext, ReactNode, useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { isMockMode } from '../config/dataMode';
import { MockAuthProvider, useMockAuth } from './MockAuthProvider';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useActor } from '../hooks/useActor';
import type { AppRole } from './roles';
import type { IIAuthUser } from './InternetIdentityAuthAdapter';
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

// Provider para modo MOCK
function MockAuthWrapper({ children }: { children: ReactNode }) {
  const mockAuth = useMockAuth();
  const queryClient = useQueryClient();

  const logout = () => {
    mockAuth.logout();
    queryClient.clear();
  };

  const user: AuthUser | null = mockAuth.user
    ? {
        id: mockAuth.user.id,
        name: mockAuth.user.name,
        email: mockAuth.user.email,
        role: mockAuth.user.role,
      }
    : null;

  const value: AuthContextValue = {
    user,
    isAuthenticated: mockAuth.isAuthenticated,
    isLoading: false,
    login: () => {}, // No modo MOCK, login é feito via MockRoleSelector
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

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

        const iiUser = adaptIdentityToUser(identity!, profile, undefined);
        
        setUser({
          id: iiUser.principal,
          name: iiUser.name || 'Usuário',
          role: iiUser.role,
          principal: iiUser.principal,
        });
      } catch (error) {
        console.error('Erro ao carregar perfil:', error);
        if (!cancelled) {
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

// Provider principal que escolhe entre MOCK e BACKEND
export function AuthProvider({ children }: { children: ReactNode }) {
  if (isMockMode()) {
    return (
      <MockAuthProvider>
        <MockAuthWrapper>{children}</MockAuthWrapper>
      </MockAuthProvider>
    );
  }

  return <BackendAuthWrapper>{children}</BackendAuthWrapper>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider');
  }
  return context;
}
