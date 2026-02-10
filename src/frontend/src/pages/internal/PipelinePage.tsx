import React, { useState, useEffect } from 'react';
import { useCurrentOrg } from '../../org/OrgProvider';
import { QueryBoundary } from '../../components/states/QueryBoundary';
import { EmptyState } from '../../components/states/UiStates';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Plus, Layers } from 'lucide-react';
import { usePipelineStages } from '../../hooks/usePipelineStages';
import { useKanbanCards } from '../../hooks/useKanbanCards';
import { useKanbanBoards } from '../../hooks/useKanbanBoards';
import { PipelineStageColumn } from './pipeline/PipelineStageColumn';
import { storeSessionParameter, getSessionParameter } from '../../utils/urlParams';
import type { PipelineStageReorderUpdate } from '../../types/pipelineStages';
import type { CardInput } from '../../types/kanbanCards';
import { strings } from '../../i18n/strings.ptBR';

export default function PipelinePage() {
  const { currentOrgId } = useCurrentOrg();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isCreateBoardDialogOpen, setIsCreateBoardDialogOpen] = useState(false);
  const [newColumnName, setNewColumnName] = useState('');
  const [newBoardName, setNewBoardName] = useState('');
  const [selectedBoardId, setSelectedBoardId] = useState<string | null>(null);

  const {
    boards,
    isLoading: isLoadingBoards,
    isError: isErrorBoards,
    error: errorBoards,
    createBoard,
    isCreating: isCreatingBoard,
  } = useKanbanBoards(currentOrgId);

  // Initialize selected board from persistence or default to first board
  useEffect(() => {
    if (!currentOrgId || boards.length === 0) return;

    const storageKey = `selectedBoardId_${currentOrgId}`;
    const persistedBoardId = getSessionParameter(storageKey);
    
    // Check if persisted board exists in the list
    const boardExists = boards.some(b => b.id === persistedBoardId);
    
    if (persistedBoardId && boardExists) {
      setSelectedBoardId(persistedBoardId);
    } else if (!selectedBoardId) {
      // Default to first board
      const firstBoard = boards[0];
      setSelectedBoardId(firstBoard.id);
      storeSessionParameter(storageKey, firstBoard.id);
    }
  }, [boards, currentOrgId, selectedBoardId]);

  const {
    stages,
    isLoading: isLoadingStages,
    isError: isErrorStages,
    error: errorStages,
    createStage,
    renameStage,
    deleteStage,
    reorderStages,
    isCreating,
    isRenaming,
    isDeleting,
    isReordering,
  } = usePipelineStages(currentOrgId, selectedBoardId);

  const {
    cards,
    isLoading: isLoadingCards,
    isError: isErrorCards,
    error: errorCards,
    createCard,
    updateCard,
    moveCard,
    deleteCard,
    isCreating: isCreatingCard,
    isUpdating: isUpdatingCard,
    isDeleting: isDeletingCard,
  } = useKanbanCards(currentOrgId, selectedBoardId);

  const handleBoardChange = (boardId: string) => {
    setSelectedBoardId(boardId);
    if (currentOrgId) {
      const storageKey = `selectedBoardId_${currentOrgId}`;
      storeSessionParameter(storageKey, boardId);
    }
  };

  const handleCreateBoardSubmit = () => {
    if (!newBoardName.trim()) {
      return;
    }
    createBoard(newBoardName.trim());
    setNewBoardName('');
    setIsCreateBoardDialogOpen(false);
  };

  const handleCreateSubmit = () => {
    if (!newColumnName.trim()) {
      return;
    }
    createStage(newColumnName.trim());
    setNewColumnName('');
    setIsCreateDialogOpen(false);
  };

  const handleMoveLeft = (columnId: string) => {
    const currentIndex = stages.findIndex((s) => s.id === columnId);
    if (currentIndex <= 0 || !selectedBoardId) return;

    const updates: PipelineStageReorderUpdate[] = [
      {
        id: stages[currentIndex].id,
        name: stages[currentIndex].name,
        newPosition: currentIndex - 1,
        boardId: selectedBoardId,
      },
      {
        id: stages[currentIndex - 1].id,
        name: stages[currentIndex - 1].name,
        newPosition: currentIndex,
        boardId: selectedBoardId,
      },
    ];

    reorderStages(updates);
  };

  const handleMoveRight = (columnId: string) => {
    const currentIndex = stages.findIndex((s) => s.id === columnId);
    if (currentIndex < 0 || currentIndex >= stages.length - 1 || !selectedBoardId) return;

    const updates: PipelineStageReorderUpdate[] = [
      {
        id: stages[currentIndex].id,
        name: stages[currentIndex].name,
        newPosition: currentIndex + 1,
        boardId: selectedBoardId,
      },
      {
        id: stages[currentIndex + 1].id,
        name: stages[currentIndex + 1].name,
        newPosition: currentIndex,
        boardId: selectedBoardId,
      },
    ];

    reorderStages(updates);
  };

  const handleUpdateCard = (cardId: string, input: CardInput) => {
    updateCard({ cardId, input });
  };

  const handleMoveCard = (cardId: string, destinationColumnId: string) => {
    moveCard({ cardId, destinationColumnId });
  };

  const getCardsForColumn = (columnId: string) => {
    return cards.filter((card) => card.columnId === columnId);
  };

  const isLoading = isLoadingBoards || isLoadingStages || isLoadingCards;
  const isError = isErrorBoards || isErrorStages || isErrorCards;
  const error = errorBoards || errorStages || errorCards;

  // Show empty state if no boards exist
  if (!isLoadingBoards && boards.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Pipeline</h1>
            <p className="text-muted-foreground">{strings.pipeline.description}</p>
          </div>
        </div>
        <EmptyState
          icon={<Layers className="h-12 w-12" />}
          title={strings.emptyState.noBoards}
          description={strings.emptyState.createFirstBoard}
          action={
            <Dialog open={isCreateBoardDialogOpen} onOpenChange={setIsCreateBoardDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  {strings.pipeline.createBoard}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{strings.pipeline.createBoard}</DialogTitle>
                  <DialogDescription>Crie um novo board Kanban para sua organização</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="board-name">{strings.pipeline.boardName}</Label>
                    <Input
                      id="board-name"
                      value={newBoardName}
                      onChange={(e) => setNewBoardName(e.target.value)}
                      placeholder={strings.pipeline.boardNamePlaceholder}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsCreateBoardDialogOpen(false)}>
                    {strings.cancel}
                  </Button>
                  <Button onClick={handleCreateBoardSubmit} disabled={isCreatingBoard || !newBoardName.trim()}>
                    {strings.pipeline.createBoard}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          }
        />
      </div>
    );
  }

  const selectedBoard = boards.find(b => b.id === selectedBoardId);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Pipeline</h1>
          <p className="text-muted-foreground">{strings.pipeline.description}</p>
        </div>
        <div className="flex items-center gap-2">
          <Dialog open={isCreateBoardDialogOpen} onOpenChange={setIsCreateBoardDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Plus className="mr-2 h-4 w-4" />
                {strings.pipeline.newBoard}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{strings.pipeline.createBoard}</DialogTitle>
                <DialogDescription>Crie um novo board Kanban para sua organização</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="board-name">{strings.pipeline.boardName}</Label>
                  <Input
                    id="board-name"
                    value={newBoardName}
                    onChange={(e) => setNewBoardName(e.target.value)}
                    placeholder={strings.pipeline.boardNamePlaceholder}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateBoardDialogOpen(false)}>
                  {strings.cancel}
                </Button>
                <Button onClick={handleCreateBoardSubmit} disabled={isCreatingBoard || !newBoardName.trim()}>
                  {strings.pipeline.createBoard}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button disabled={!selectedBoardId}>
                <Plus className="mr-2 h-4 w-4" />
                {strings.pipeline.newColumn}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{strings.pipeline.newColumn}</DialogTitle>
                <DialogDescription>Adicione uma nova coluna ao seu pipeline</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="column-name">{strings.pipeline.columnName}</Label>
                  <Input
                    id="column-name"
                    value={newColumnName}
                    onChange={(e) => setNewColumnName(e.target.value)}
                    placeholder={strings.pipeline.columnNamePlaceholder}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  {strings.cancel}
                </Button>
                <Button onClick={handleCreateSubmit} disabled={isCreating || !newColumnName.trim()}>
                  {strings.create}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {boards.length > 0 && (
        <div className="flex items-center gap-2">
          <Label htmlFor="board-select">{strings.pipeline.board}:</Label>
          <Select value={selectedBoardId || ''} onValueChange={handleBoardChange}>
            <SelectTrigger id="board-select" className="w-[300px]">
              <SelectValue placeholder="Selecione um board" />
            </SelectTrigger>
            <SelectContent>
              {boards.map((board) => (
                <SelectItem key={board.id} value={board.id}>
                  {board.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <QueryBoundary
        isLoading={isLoading}
        isError={isError}
        error={error}
        isEmpty={stages.length === 0}
        emptyTitle={strings.emptyState.noColumns}
        emptyDescription={strings.pipeline.emptyColumnDescription}
        emptyAction={
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            {strings.pipeline.newColumn}
          </Button>
        }
      >
        <div className="flex gap-4 overflow-x-auto pb-4">
          {stages
            .sort((a, b) => a.position - b.position)
            .map((stage, index) => (
              <PipelineStageColumn
                key={stage.id}
                stage={stage}
                cards={getCardsForColumn(stage.id)}
                canMoveLeft={index > 0}
                canMoveRight={index < stages.length - 1}
                onRename={renameStage}
                onDelete={deleteStage}
                onMoveLeft={handleMoveLeft}
                onMoveRight={handleMoveRight}
                onCreateCard={createCard}
                onUpdateCard={handleUpdateCard}
                onDeleteCard={deleteCard}
                onMoveCard={handleMoveCard}
                isRenaming={isRenaming}
                isDeleting={isDeleting}
                isCreatingCard={isCreatingCard}
                isUpdatingCard={isUpdatingCard}
                isDeletingCard={isDeletingCard}
                orgId={currentOrgId || ''}
                boardId={selectedBoardId || ''}
              />
            ))}
        </div>
      </QueryBoundary>
    </div>
  );
}
