import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { CardInput, CardCustomField } from '../../../types/kanbanCards';
import { CustomFieldsEditor } from './CustomFieldsEditor';
import { useKanbanBoard } from '../../../hooks/useKanbanBoard';
import { normalizeCustomFields, createDefinitionFromField } from '../../../utils/kanbanCustomFields';
import { strings } from '../../../i18n/strings.ptBR';

interface AddCardDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  columnId: string;
  orgId: string;
  boardId: string;
  onSubmit: (input: CardInput) => void;
  isCreating: boolean;
}

export function AddCardDialog({
  open,
  onOpenChange,
  columnId,
  orgId,
  boardId,
  onSubmit,
  isCreating,
}: AddCardDialogProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [customFields, setCustomFields] = useState<CardCustomField[]>([]);

  const { board, addOrUpdateFieldDefinition } = useKanbanBoard(orgId, boardId);

  useEffect(() => {
    if (board && open) {
      // Initialize with board definitions
      const normalized = normalizeCustomFields(board.customFieldDefinitions, []);
      setCustomFields(normalized);
    }
  }, [board, open]);

  const handleAddFieldDefinition = (field: CardCustomField) => {
    // Create or update the board-level definition
    const definition = createDefinitionFromField(field);
    addOrUpdateFieldDefinition(definition);
  };

  const handleSubmit = () => {
    if (!title.trim()) return;

    const input: CardInput = {
      title: title.trim(),
      description: description.trim(),
      columnId,
      orgId,
      boardId,
      customFields,
    };

    onSubmit(input);
    setTitle('');
    setDescription('');
    setCustomFields([]);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{strings.card.newCard}</DialogTitle>
          <DialogDescription>{strings.card.createNewCard}</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="card-title">{strings.card.cardTitle}</Label>
            <Input
              id="card-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={strings.card.cardTitlePlaceholder}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="card-description">{strings.card.cardDescription}</Label>
            <Textarea
              id="card-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={strings.card.cardDescriptionPlaceholder}
              rows={4}
            />
          </div>

          <div className="border-t pt-4">
            <CustomFieldsEditor 
              fields={customFields} 
              onChange={setCustomFields}
              onAddFieldDefinition={handleAddFieldDefinition}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {strings.cancel}
          </Button>
          <Button onClick={handleSubmit} disabled={isCreating || !title.trim()}>
            {isCreating ? strings.creating : strings.card.createCard}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
