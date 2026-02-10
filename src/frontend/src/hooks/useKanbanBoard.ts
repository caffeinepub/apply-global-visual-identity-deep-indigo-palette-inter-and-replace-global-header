import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useStage1Client } from './useStage1Client';
import type { CustomFieldDefinition } from '../backend';
import { toast } from 'sonner';
import { strings } from '../i18n/strings.ptBR';

export interface KanbanBoardWithDefinitions {
  id: string;
  name: string;
  orgId: string;
  createdBy: string;
  createdAt: Date;
  customFieldDefinitions: CustomFieldDefinition[];
}

export function useKanbanBoard(orgId: string | null | undefined, boardId: string | null | undefined) {
  const { client, isReady } = useStage1Client();
  const queryClient = useQueryClient();

  const boardQuery = useQuery<KanbanBoardWithDefinitions | null>({
    queryKey: ['kanbanBoard', boardId],
    queryFn: async () => {
      if (!boardId) return null;
      const board = await client.getKanbanBoard(boardId);
      return board;
    },
    enabled: isReady && !!boardId,
  });

  const addOrUpdateFieldDefinitionMutation = useMutation({
    mutationFn: async (definition: CustomFieldDefinition) => {
      if (!orgId || !boardId) throw new Error('Organization ID and Board ID are required');
      return await client.addOrUpdateCustomFieldDefinition(orgId, boardId, definition);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kanbanBoard', boardId] });
      queryClient.invalidateQueries({ queryKey: ['kanbanCards', orgId, boardId] });
      toast.success(strings.success.updated);
    },
    onError: (error: Error) => {
      toast.error(`${strings.error.saveFailed}: ${error.message}`);
    },
  });

  return {
    board: boardQuery.data,
    isLoading: boardQuery.isLoading,
    isError: boardQuery.isError,
    error: boardQuery.error,
    addOrUpdateFieldDefinition: addOrUpdateFieldDefinitionMutation.mutate,
    isUpdatingDefinition: addOrUpdateFieldDefinitionMutation.isPending,
  };
}
