import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import type { OrgId, Organization } from '../types/model';
import { useAuth } from '../auth/AuthProvider';
import { useStage1Client } from '../hooks/useStage1Client';
import { isMockMode } from '../config/dataMode';

interface OrgContextValue {
  currentOrg: Organization | null;
  currentOrgId: OrgId | null;
  setCurrentOrg: (org: Organization | null) => void;
  needsOrgSelection: boolean;
  isLoadingOrg: boolean;
}

const OrgContext = createContext<OrgContextValue | undefined>(undefined);

export function OrgProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated, user } = useAuth();
  const { client, isReady } = useStage1Client();
  const [currentOrg, setCurrentOrgState] = useState<Organization | null>(null);
  const [isLoadingOrg, setIsLoadingOrg] = useState(false);

  // Hydrate organization from backend profile or persisted selection on app load
  useEffect(() => {
    if (!isAuthenticated || !isReady) {
      return;
    }

    // In BACKEND mode, try to get currentOrgId from user profile first
    if (!isMockMode()) {
      setIsLoadingOrg(true);
      client.getUserProfile()
        .then((profile) => {
          if (profile?.currentOrgId && !currentOrg) {
            return client.getOrg(profile.currentOrgId).then((org) => {
              if (org) {
                setCurrentOrgState(org);
                sessionStorage.setItem('currentOrgId', org.id);
              }
            });
          }
        })
        .catch((error) => {
          console.error('Failed to load org from profile:', error);
        })
        .finally(() => {
          setIsLoadingOrg(false);
        });
    } else {
      // In MOCK mode, use sessionStorage
      const persistedOrgId = sessionStorage.getItem('currentOrgId');
      if (persistedOrgId && !currentOrg) {
        setIsLoadingOrg(true);
        client.getOrg(persistedOrgId)
          .then((org) => {
            if (org) {
              setCurrentOrgState(org);
            } else {
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

  // Determine if org selection is needed
  // Firsty roles need to select an org; non-Firsty roles should have one automatically
  const isFirstyRole = user?.role === 'FIRSTY_ADMIN' || user?.role === 'FIRSTY_CONSULTANT';
  const needsOrgSelection = isAuthenticated && !currentOrg && !isLoadingOrg && isFirstyRole;

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
