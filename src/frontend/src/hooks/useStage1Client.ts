import { useMemo } from 'react';
import { useActor } from './useActor';
import { createMockClient, createBackendClient, type DataClient } from '../data/client';
import { isMockMode } from '../config/dataMode';

interface UseStage1ClientResult {
  client: DataClient;
  isReady: boolean;
  isFetching: boolean;
}

/**
 * Hook que fornece o cliente de dados apropriado (MOCK ou BACKEND)
 * e indica quando está pronto para uso.
 */
export function useStage1Client(): UseStage1ClientResult {
  const { actor, isFetching } = useActor();
  
  const client = useMemo(() => {
    if (isMockMode()) {
      return createMockClient();
    }
    
    if (!actor) {
      // Retorna um cliente mock temporário enquanto o actor carrega
      return createMockClient();
    }
    
    return createBackendClient(actor);
  }, [actor]);
  
  const isReady = isMockMode() || !!actor;
  
  return {
    client,
    isReady,
    isFetching: !isMockMode() && isFetching,
  };
}
