import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import type { AppRole } from './roles';
import { ROLE_INFO } from './roles';

export interface MockAuthUser {
  id: string;
  name: string;
  email: string;
  role: AppRole;
}

interface MockAuthContextValue {
  user: MockAuthUser | null;
  isAuthenticated: boolean;
  login: (role: AppRole) => void;
  logout: () => void;
}

const MockAuthContext = createContext<MockAuthContextValue | undefined>(undefined);

// Usuários mock para teste
const MOCK_USERS: Record<AppRole, MockAuthUser> = {
  OWNER_ADMIN: {
    id: 'user-owner-1',
    name: 'Ana Silva',
    email: 'ana.silva@empresa.com.br',
    role: 'OWNER_ADMIN',
  },
  MEMBER: {
    id: 'user-member-1',
    name: 'Carlos Santos',
    email: 'carlos.santos@empresa.com.br',
    role: 'MEMBER',
  },
  FIRSTY_CONSULTANT: {
    id: 'user-consultant-1',
    name: 'João Ferreira',
    email: 'joao.ferreira@firsty.com.br',
    role: 'FIRSTY_CONSULTANT',
  },
  FIRSTY_ADMIN: {
    id: 'user-admin-1',
    name: 'Paula Costa',
    email: 'paula.costa@firsty.com.br',
    role: 'FIRSTY_ADMIN',
  },
};

export function MockAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<MockAuthUser | null>(null);

  const login = useCallback((role: AppRole) => {
    setUser(MOCK_USERS[role]);
  }, []);

  const logout = useCallback(() => {
    setUser(null);
  }, []);

  const value: MockAuthContextValue = {
    user,
    isAuthenticated: !!user,
    login,
    logout,
  };

  return <MockAuthContext.Provider value={value}>{children}</MockAuthContext.Provider>;
}

export function useMockAuth() {
  const context = useContext(MockAuthContext);
  if (!context) {
    throw new Error('useMockAuth deve ser usado dentro de MockAuthProvider');
  }
  return context;
}

// Componente para seleção de papel em modo MOCK
export function MockRoleSelector() {
  const { user, login, logout, isAuthenticated } = useMockAuth();

  if (isAuthenticated) {
    return (
      <div className="flex items-center gap-3">
        <div className="text-sm">
          <div className="font-medium">{user?.name}</div>
          <div className="text-muted-foreground">{ROLE_INFO[user!.role].label}</div>
        </div>
        <button
          onClick={logout}
          className="px-3 py-1.5 text-sm rounded-md bg-muted hover:bg-muted/80 transition-colors"
        >
          Sair
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <p className="text-sm text-muted-foreground mb-3">Selecione um papel para testar:</p>
      <div className="grid gap-2">
        {(Object.keys(MOCK_USERS) as AppRole[]).map((role) => (
          <button
            key={role}
            onClick={() => login(role)}
            className="px-4 py-2 text-sm text-left rounded-md border hover:bg-accent transition-colors"
          >
            <div className="font-medium">{MOCK_USERS[role].name}</div>
            <div className="text-xs text-muted-foreground">{ROLE_INFO[role].label}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
