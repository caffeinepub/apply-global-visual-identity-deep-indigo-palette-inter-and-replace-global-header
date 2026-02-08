import { useState } from 'react';
import type { ProjectId } from '../types/model';

const STORAGE_KEY = 'firsty-active-project';

/**
 * Hook para gerenciar o projeto ativo no Portal.
 * Persiste a seleção em sessionStorage para manter contexto entre navegações.
 * Suporta limpeza/reset do projeto ativo quando o ID armazenado é inválido.
 */
export function useActiveProject() {
  const [activeProjectId, setActiveProjectIdState] = useState<ProjectId | null>(() => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem(STORAGE_KEY);
    }
    return null;
  });

  const setActiveProjectId = (projectId: ProjectId | null) => {
    setActiveProjectIdState(projectId);
    if (typeof window !== 'undefined') {
      if (projectId) {
        sessionStorage.setItem(STORAGE_KEY, projectId);
      } else {
        sessionStorage.removeItem(STORAGE_KEY);
      }
    }
  };

  const clearActiveProject = () => {
    setActiveProjectId(null);
  };

  return {
    activeProjectId,
    setActiveProjectId,
    clearActiveProject,
  };
}
