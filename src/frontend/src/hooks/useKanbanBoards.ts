import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useStage1Client } from './useStage1Client';
import { toast } from 'sonner';
import { strings } from '../i18n/strings.ptBR';

export interface KanbanBoard {
  id: string;
  name: string;
  orgId: string;
  createdBy: string;
  createdAt: Date;
}

export function useKanbanBoards(orgId: string | null | undefined) {
  const { client, isReady } = useStage1Client();
  const queryClient = useQueryClient();

  const boardsQuery = useQuery<KanbanBoard[]>({
    queryKey: ['kanbanBoards', orgId],
    queryFn: async () => {
      if (!orgId) return [];
      return client.listKanbanBoards(orgId);
    },
    enabled: isReady && !!orgId,
  });

  const createBoardMutation = useMutation({
    mutationFn: async (name: string) => {
      if (!orgId) throw new Error('Organization ID is required');
      return client.createKanbanBoard(orgId, name);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kanbanBoards', orgId] });
      toast.success(strings.success.boardCreated);
    },
    onError: (error: any) => {
      toast.error(error.message || strings.error.createBoardFailed);
    },
  });

  const renameBoardMutation = useMutation({
    mutationFn: async ({ boardId, name }: { boardId: string; name: string }) => {
      return client.renameKanbanBoard(boardId, name);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kanbanBoards', orgId] });
      toast.success(strings.success.boardRenamed);
    },
    onError: (error: any) => {
      toast.error(error.message || strings.error.renameBoardFailed);
    },
  });

  return {
    boards: boardsQuery.data || [],
    isLoading: boardsQuery.isLoading,
    isError: boardsQuery.isError,
    error: boardsQuery.error,
    createBoard: createBoardMutation.mutate,
    renameBoard: (boardId: string, name: string) => {
      renameBoardMutation.mutate({ boardId, name });
    },
    isCreating: createBoardMutation.isPending,
    isRenaming: renameBoardMutation.isPending,
  };
}
