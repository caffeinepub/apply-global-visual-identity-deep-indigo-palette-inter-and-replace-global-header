import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useStage1Client } from './useStage1Client';
import type { KanbanCard, CardInput } from '../types/kanbanCards';
import { toast } from 'sonner';
import { strings } from '../i18n/strings.ptBR';

export function useKanbanCards(orgId: string | null | undefined, boardId: string | null | undefined) {
  const { client, isReady } = useStage1Client();
  const queryClient = useQueryClient();

  const cardsQuery = useQuery<KanbanCard[]>({
    queryKey: ['kanbanCards', orgId, boardId],
    queryFn: async () => {
      if (!orgId || !boardId) return [];
      return await client.listCardsByBoard(orgId, boardId);
    },
    enabled: isReady && !!orgId && !!boardId,
  });

  const createCardMutation = useMutation({
    mutationFn: async (input: CardInput) => {
      return await client.createCard(input);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kanbanCards', orgId, boardId] });
      queryClient.invalidateQueries({ queryKey: ['kanbanBoard', boardId] });
      toast.success(strings.success.cardCreated);
    },
    onError: (error: Error) => {
      toast.error(`${strings.error.createCardFailed}: ${error.message}`);
    },
  });

  const updateCardMutation = useMutation({
    mutationFn: async ({ cardId, input }: { cardId: string; input: CardInput }) => {
      return await client.updateCard(cardId, input);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kanbanCards', orgId, boardId] });
      queryClient.invalidateQueries({ queryKey: ['kanbanBoard', boardId] });
      toast.success(strings.success.cardUpdated);
    },
    onError: (error: Error) => {
      toast.error(`${strings.error.updateCardFailed}: ${error.message}`);
    },
  });

  const moveCardMutation = useMutation({
    mutationFn: async ({ cardId, destinationColumnId }: { cardId: string; destinationColumnId: string }) => {
      return await client.moveCard(cardId, destinationColumnId);
    },
    onMutate: async ({ cardId, destinationColumnId }) => {
      await queryClient.cancelQueries({ queryKey: ['kanbanCards', orgId, boardId] });
      const previousCards = queryClient.getQueryData<KanbanCard[]>(['kanbanCards', orgId, boardId]);

      if (previousCards) {
        const updatedCards = previousCards.map((card) =>
          card.id === cardId ? { ...card, columnId: destinationColumnId } : card
        );
        queryClient.setQueryData(['kanbanCards', orgId, boardId], updatedCards);
      }

      return { previousCards };
    },
    onError: (error: Error, _variables, context) => {
      if (context?.previousCards) {
        queryClient.setQueryData(['kanbanCards', orgId, boardId], context.previousCards);
      }
      toast.error(`${strings.error.moveCardFailed}: ${error.message}`);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['kanbanCards', orgId, boardId] });
    },
  });

  const deleteCardMutation = useMutation({
    mutationFn: async (cardId: string) => {
      return await client.deleteCard(cardId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kanbanCards', orgId, boardId] });
      toast.success(strings.success.cardDeleted);
    },
    onError: (error: Error) => {
      toast.error(`${strings.error.deleteCardFailed}: ${error.message}`);
    },
  });

  return {
    cards: cardsQuery.data || [],
    isLoading: cardsQuery.isLoading,
    isError: cardsQuery.isError,
    error: cardsQuery.error,
    createCard: createCardMutation.mutate,
    updateCard: updateCardMutation.mutate,
    moveCard: moveCardMutation.mutate,
    deleteCard: deleteCardMutation.mutate,
    isCreating: createCardMutation.isPending,
    isUpdating: updateCardMutation.isPending,
    isDeleting: deleteCardMutation.isPending,
  };
}
