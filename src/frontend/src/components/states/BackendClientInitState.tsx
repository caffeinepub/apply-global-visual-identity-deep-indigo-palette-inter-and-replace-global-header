import React from 'react';
import { Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface BackendClientInitStateProps {
  isReady: boolean;
  isFetching: boolean;
  error: Error | null;
  onRetry?: () => void;
  children: React.ReactNode;
}

/**
 * Component that handles backend client initialization states.
 * Shows loading, error with retry, or renders children when ready.
 */
export function BackendClientInitState({
  isReady,
  isFetching,
  error,
  onRetry,
  children,
}: BackendClientInitStateProps) {
  // Show loading state
  if (isFetching && !isReady) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Initializing backend connection...</p>
        </div>
      </div>
    );
  }

  // Show error state with retry
  if (error && !isReady) {
    return (
      <div className="flex items-center justify-center min-h-[400px] p-4">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Backend Connection Error</AlertTitle>
          <AlertDescription className="space-y-4">
            <p>Unable to connect to the backend service. Please try again.</p>
            <p className="text-sm text-muted-foreground">{error.message}</p>
            {onRetry && (
              <Button onClick={onRetry} variant="outline" size="sm" className="mt-2">
                Retry Connection
              </Button>
            )}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Render children when ready
  if (isReady) {
    return <>{children}</>;
  }

  // Fallback loading state
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
        <p className="text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
}
