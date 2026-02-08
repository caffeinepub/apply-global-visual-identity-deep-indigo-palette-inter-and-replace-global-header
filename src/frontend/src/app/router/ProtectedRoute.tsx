import React, { type ReactNode, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useAuth } from '../../auth/AuthProvider';
import { useCurrentOrg } from '../../org/OrgProvider';
import { LoadingState } from '../../components/states/UiStates';
import { AccessDeniedScreen } from '../../components/states/AccessDeniedScreen';

interface ProtectedRouteProps {
  children: ReactNode;
  requireOrg?: boolean;
}

export function ProtectedRoute({ children, requireOrg = false }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const { needsOrgSelection } = useCurrentOrg();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate({ to: '/login' });
    }
  }, [isAuthenticated, isLoading, navigate]);

  if (isLoading) {
    return <LoadingState message="Carregando..." />;
  }

  if (!isAuthenticated) {
    return null;
  }

  if (requireOrg && needsOrgSelection) {
    return (
      <AccessDeniedScreen message="Selecione uma organização para continuar." />
    );
  }

  return <>{children}</>;
}
