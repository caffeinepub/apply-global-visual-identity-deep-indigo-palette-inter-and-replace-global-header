import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useStage1Client } from './useStage1Client';
import type { PipelineStage, PipelineStageReorderUpdate } from '../types/pipelineStages';
import { toast } from 'sonner';

export function usePipelineStages(orgId: string | null | undefined, boardId: string | null | undefined) {
  const { client, isReady } = useStage1Client();
  const queryClient = useQueryClient();

  const stagesQuery = useQuery<PipelineStage[]>({
    queryKey: ['pipelineStages', orgId, boardId],
    queryFn: async () => {
      if (!orgId || !boardId) return [];
      return client.listPipelineStages(orgId, boardId);
    },
    enabled: isReady && !!orgId && !!boardId,
  });

  const createStageMutation = useMutation({
    mutationFn: async (name: string) => {
      if (!orgId || !boardId) throw new Error('Organization ID and Board ID are required');
      return client.createPipelineStage(orgId, boardId, name);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pipelineStages', orgId, boardId] });
      toast.success('Coluna criada com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao criar coluna');
    },
  });

  const renameStageMutation = useMutation({
    mutationFn: async ({ columnId, newName }: { columnId: string; newName: string }) => {
      if (!boardId) throw new Error('Board ID is required');
      return client.renamePipelineStage(columnId, boardId, newName);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pipelineStages', orgId, boardId] });
      toast.success('Coluna renomeada com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao renomear coluna');
    },
  });

  const deleteStageMutation = useMutation({
    mutationFn: async (columnId: string) => {
      if (!boardId) throw new Error('Board ID is required');
      return client.deletePipelineStage(columnId, boardId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pipelineStages', orgId, boardId] });
      toast.success('Coluna excluída com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao excluir coluna');
    },
  });

  const reorderStagesMutation = useMutation({
    mutationFn: async (updates: PipelineStageReorderUpdate[]) => {
      if (!orgId || !boardId) throw new Error('Organization ID and Board ID are required');
      return client.reorderPipelineStages(orgId, boardId, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pipelineStages', orgId, boardId] });
      toast.success('Ordem das colunas atualizada!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao reordenar colunas');
    },
  });

  return {
    stages: stagesQuery.data || [],
    isLoading: stagesQuery.isLoading,
    isError: stagesQuery.isError,
    error: stagesQuery.error,
    createStage: createStageMutation.mutate,
    renameStage: (columnId: string, newName: string) => {
      renameStageMutation.mutate({ columnId, newName });
    },
    deleteStage: deleteStageMutation.mutate,
    reorderStages: reorderStagesMutation.mutate,
    isCreating: createStageMutation.isPending,
    isRenaming: renameStageMutation.isPending,
    isDeleting: deleteStageMutation.isPending,
    isReordering: reorderStagesMutation.isPending,
  };
}
