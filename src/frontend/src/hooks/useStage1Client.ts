import { useMemo, useState, useCallback } from 'react';
import { useActor } from './useActor';
import { createBackendClient, type DataClient } from '../data/client';

interface UseStage1ClientResult {
  client: DataClient;
  isReady: boolean;
  isFetching: boolean;
  error: Error | null;
  retry: () => void;
}

/**
 * Hook that provides the backend data client with proper initialization state management.
 * Returns a proxy that throws helpful errors when accessed before actor is ready.
 */
export function useStage1Client(): UseStage1ClientResult {
  const { actor, isFetching } = useActor();
  const [error, setError] = useState<Error | null>(null);
  
  const client = useMemo(() => {
    if (!actor) {
      // Return a proxy that throws helpful errors
      return new Proxy({} as DataClient, {
        get() {
          const err = new Error('Backend client not ready - actor is still loading');
          setError(err);
          throw err;
        }
      });
    }
    
    // Clear error when actor becomes available
    setError(null);
    return createBackendClient(actor);
  }, [actor]);
  
  const isReady = !!actor && !isFetching;
  
  const retry = useCallback(() => {
    setError(null);
    // The actor hook will handle re-initialization
  }, []);
  
  return {
    client,
    isReady,
    isFetching,
    error,
    retry,
  };
}
