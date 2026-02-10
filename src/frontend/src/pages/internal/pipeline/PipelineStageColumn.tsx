import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { MoreVertical, Pencil, Trash2, ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import type { PipelineStage } from '../../../types/pipelineStages';
import type { KanbanCard, CardInput } from '../../../types/kanbanCards';
import { KanbanCardItem } from './KanbanCardItem';
import { AddCardDialog } from './AddCardDialog';

interface PipelineStageColumnProps {
  stage: PipelineStage;
  cards: KanbanCard[];
  canMoveLeft: boolean;
  canMoveRight: boolean;
  onRename: (columnId: string, newName: string) => void;
  onDelete: (columnId: string) => void;
  onMoveLeft: (columnId: string) => void;
  onMoveRight: (columnId: string) => void;
  onCreateCard: (input: CardInput) => void;
  onUpdateCard: (cardId: string, input: CardInput) => void;
  onDeleteCard: (cardId: string) => void;
  onMoveCard: (cardId: string, destinationColumnId: string) => void;
  isRenaming: boolean;
  isDeleting: boolean;
  isCreatingCard: boolean;
  isUpdatingCard: boolean;
  isDeletingCard: boolean;
  orgId: string;
  boardId: string;
}

export function PipelineStageColumn({
  stage,
  cards,
  canMoveLeft,
  canMoveRight,
  onRename,
  onDelete,
  onMoveLeft,
  onMoveRight,
  onCreateCard,
  onUpdateCard,
  onDeleteCard,
  onMoveCard,
  isRenaming,
  isDeleting,
  isCreatingCard,
  isUpdatingCard,
  isDeletingCard,
  orgId,
  boardId,
}: PipelineStageColumnProps) {
  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isAddCardDialogOpen, setIsAddCardDialogOpen] = useState(false);
  const [newName, setNewName] = useState(stage.name);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleRenameSubmit = () => {
    if (!newName.trim()) {
      return;
    }
    onRename(stage.id, newName.trim());
    setIsRenameDialogOpen(false);
  };

  const handleDeleteConfirm = () => {
    onDelete(stage.id);
    setIsDeleteDialogOpen(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const cardId = e.dataTransfer.getData('cardId');
    const sourceColumnId = e.dataTransfer.getData('sourceColumnId');

    if (cardId && sourceColumnId !== stage.id) {
      onMoveCard(cardId, stage.id);
    }
  };

  return (
    <>
      <Card className={`flex-shrink-0 w-80 bg-muted/30 ${isDragOver ? 'ring-2 ring-primary' : ''}`}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold">
              {stage.name}
              <span className="ml-2 text-xs font-normal text-muted-foreground">({cards.length})</span>
            </CardTitle>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => onMoveLeft(stage.id)}
                disabled={!canMoveLeft}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => onMoveRight(stage.id)}
                disabled={!canMoveRight}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-7 w-7">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() => {
                      setNewName(stage.name);
                      setIsRenameDialogOpen(true);
                    }}
                  >
                    <Pencil className="mr-2 h-4 w-4" />
                    Rename
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setIsDeleteDialogOpen(true)} className="text-destructive">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div
            className="min-h-[400px] space-y-2"
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {cards.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No cards in this column</p>
            ) : (
              cards.map((card) => (
                <KanbanCardItem
                  key={card.id}
                  card={card}
                  onUpdate={onUpdateCard}
                  onDelete={onDeleteCard}
                  isUpdating={isUpdatingCard}
                  isDeleting={isDeletingCard}
                />
              ))
            )}
            <Button
              variant="ghost"
              className="w-full justify-start text-muted-foreground hover:text-foreground"
              onClick={() => setIsAddCardDialogOpen(true)}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add card
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Rename Dialog */}
      <Dialog open={isRenameDialogOpen} onOpenChange={setIsRenameDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename Column</DialogTitle>
            <DialogDescription>Enter a new name for the column</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="column-name">Column Name</Label>
              <Input
                id="column-name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Column name"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRenameDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleRenameSubmit} disabled={isRenaming || !newName.trim()}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Column</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the column "{stage.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm} disabled={isDeleting}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Card Dialog */}
      <AddCardDialog
        open={isAddCardDialogOpen}
        onOpenChange={setIsAddCardDialogOpen}
        columnId={stage.id}
        orgId={orgId}
        boardId={boardId}
        onSubmit={onCreateCard}
        isCreating={isCreatingCard}
      />
    </>
  );
}
