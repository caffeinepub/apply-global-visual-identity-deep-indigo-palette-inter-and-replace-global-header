import React, { useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useAuth } from '../../auth/AuthProvider';
import { useCurrentOrg } from '../../org/OrgProvider';
import { LoadingState } from '../../components/states/UiStates';

/**
 * Componente que redireciona usuários autenticados para a tela apropriada:
 * - Firsty roles sem org selecionada: vai para seleção de org
 * - Não-Firsty sem org: vai para criação de org
 * - Com org: vai para dashboard
 * - Não autenticado: vai para login
 */
export function PostAuthLanding() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const { currentOrg, needsOrgSelection, isLoadingOrg } = useCurrentOrg();
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoading || isLoadingOrg) return;

    if (!isAuthenticated) {
      navigate({ to: '/login' });
      return;
    }

    const isFirstyRole = user?.role === 'FIRSTY_ADMIN' || user?.role === 'FIRSTY_CONSULTANT';

    // Firsty roles need to select an org
    if (isFirstyRole && needsOrgSelection) {
      navigate({ to: '/selecionar-organizacao' });
      return;
    }

    // Non-Firsty roles without org should create one
    if (!isFirstyRole && !currentOrg) {
      navigate({ to: '/criar-organizacao' });
      return;
    }

    if (currentOrg) {
      navigate({ to: '/dashboard' });
    }
  }, [isAuthenticated, isLoading, currentOrg, needsOrgSelection, isLoadingOrg, navigate, user]);

  return <LoadingState message="Redirecionando..." />;
}
