import React, { useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useAuth } from '../../auth/AuthProvider';
import { useCurrentOrg } from '../../org/OrgProvider';
import { LoadingState } from '../../components/states/UiStates';

/**
 * Componente que redireciona usuários autenticados para a tela apropriada:
 * - Se não tem org: vai para seleção/criação de org
 * - Se tem org: vai para dashboard
 * - Se não autenticado: vai para login
 */
export function PostAuthLanding() {
  const { isAuthenticated, isLoading } = useAuth();
  const { currentOrg, needsOrgSelection } = useCurrentOrg();
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      navigate({ to: '/login' });
      return;
    }

    if (needsOrgSelection) {
      navigate({ to: '/selecionar-organizacao' });
      return;
    }

    if (currentOrg) {
      navigate({ to: '/dashboard' });
    }
  }, [isAuthenticated, isLoading, currentOrg, needsOrgSelection, navigate]);

  return <LoadingState message="Redirecionando..." />;
}
