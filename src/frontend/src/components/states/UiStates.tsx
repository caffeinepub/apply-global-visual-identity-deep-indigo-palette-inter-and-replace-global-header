import React from 'react';
import { Loader2, AlertCircle, Inbox } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { strings } from '../../i18n/strings.ptBR';

interface LoadingStateProps {
  message?: string;
  className?: string;
}

export function LoadingState({ message = strings.loading, className = '' }: LoadingStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center py-12 ${className}`}>
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mb-3" />
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
}

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({
  title = 'Erro',
  message = strings.error.generic,
  onRetry,
  className = '',
}: ErrorStateProps) {
  return (
    <div className={`py-8 ${className}`}>
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>{title}</AlertTitle>
        <AlertDescription className="mt-2">
          {message}
          {onRetry && (
            <button
              onClick={onRetry}
              className="ml-2 underline hover:no-underline"
            >
              Tentar novamente
            </button>
          )}
        </AlertDescription>
      </Alert>
    </div>
  );
}

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className = '',
}: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center py-12 text-center ${className}`}>
      <div className="mb-4 text-muted-foreground">
        {icon || <Inbox className="h-12 w-12" />}
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      {description && (
        <p className="text-sm text-muted-foreground mb-4 max-w-md">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
