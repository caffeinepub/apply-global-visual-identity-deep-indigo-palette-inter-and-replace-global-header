import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import type { OrgId, Organization } from '../types/model';
import { useAuth } from '../auth/AuthProvider';
import { useStage1Client } from '../hooks/useStage1Client';

interface OrgContextValue {
  currentOrg: Organization | null;
  currentOrgId: OrgId | null;
  setCurrentOrg: (org: Organization | null) => void;
  needsOrgSelection: boolean;
  isLoadingOrg: boolean;
}

const OrgContext = createContext<OrgContextValue | undefined>(undefined);

export function OrgProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const { client, isReady } = useStage1Client();
  const [currentOrg, setCurrentOrgState] = useState<Organization | null>(null);
  const [isLoadingOrg, setIsLoadingOrg] = useState(false);

  // Hydrate organization from persisted selection on app load
  useEffect(() => {
    if (!isAuthenticated || !isReady) {
      return;
    }

    const persistedOrgId = sessionStorage.getItem('currentOrgId');
    if (persistedOrgId && !currentOrg) {
      setIsLoadingOrg(true);
      client.getOrg(persistedOrgId)
        .then((org) => {
          if (org) {
            setCurrentOrgState(org);
          } else {
            // Org no longer exists or user lost access
            sessionStorage.removeItem('currentOrgId');
          }
        })
        .catch((error) => {
          console.error('Failed to load persisted org:', error);
          sessionStorage.removeItem('currentOrgId');
        })
        .finally(() => {
          setIsLoadingOrg(false);
        });
    }
  }, [isAuthenticated, isReady, client, currentOrg]);

  // Clear org on logout
  useEffect(() => {
    if (!isAuthenticated) {
      setCurrentOrgState(null);
      sessionStorage.removeItem('currentOrgId');
    }
  }, [isAuthenticated]);

  const setCurrentOrg = useCallback((org: Organization | null) => {
    setCurrentOrgState(org);
    
    // Persist in sessionStorage
    if (org) {
      sessionStorage.setItem('currentOrgId', org.id);
    } else {
      sessionStorage.removeItem('currentOrgId');
    }
  }, []);

  const needsOrgSelection = isAuthenticated && !currentOrg && !isLoadingOrg;

  const value: OrgContextValue = {
    currentOrg,
    currentOrgId: currentOrg?.id || null,
    setCurrentOrg,
    needsOrgSelection,
    isLoadingOrg,
  };

  return <OrgContext.Provider value={value}>{children}</OrgContext.Provider>;
}

export function useCurrentOrg() {
  const context = useContext(OrgContext);
  if (!context) {
    throw new Error('useCurrentOrg deve ser usado dentro de OrgProvider');
  }
  return context;
}
