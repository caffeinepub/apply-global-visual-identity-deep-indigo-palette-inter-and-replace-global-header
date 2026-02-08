import React, { type ReactNode } from 'react';
import { LoadingState, ErrorState, EmptyState } from './UiStates';

interface QueryBoundaryProps {
  isLoading: boolean;
  isError: boolean;
  error?: Error | null;
  isEmpty?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: ReactNode;
  loadingMessage?: string;
  errorMessage?: string;
  onRetry?: () => void;
  children: ReactNode;
}

/**
 * Componente que padroniza a exibição de estados de loading, erro e vazio
 * para queries do React Query.
 */
export function QueryBoundary({
  isLoading,
  isError,
  error,
  isEmpty = false,
  emptyTitle = 'Nenhum item encontrado',
  emptyDescription,
  emptyAction,
  loadingMessage,
  errorMessage,
  onRetry,
  children,
}: QueryBoundaryProps) {
  if (isLoading) {
    return <LoadingState message={loadingMessage} />;
  }

  if (isError) {
    return (
      <ErrorState
        message={errorMessage || error?.message}
        onRetry={onRetry}
      />
    );
  }

  if (isEmpty) {
    return (
      <EmptyState
        title={emptyTitle}
        description={emptyDescription}
        action={emptyAction}
      />
    );
  }

  return <>{children}</>;
}
