import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarIcon, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { KanbanCard, CardInput, CardCustomField } from '../../../types/kanbanCards';
import { CustomFieldsEditor } from './CustomFieldsEditor';
import { useKanbanBoard } from '../../../hooks/useKanbanBoard';
import { normalizeCustomFields, convertToBackendCustomFields, createDefinitionFromField } from '../../../utils/kanbanCustomFields';
import { strings } from '../../../i18n/strings.ptBR';

interface CardEditDialogProps {
  card: KanbanCard | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (cardId: string, input: CardInput) => void;
  onDelete: (cardId: string) => void;
  isSaving: boolean;
  isDeleting: boolean;
}

export function CardEditDialog({
  card,
  open,
  onOpenChange,
  onSave,
  onDelete,
  isSaving,
  isDeleting,
}: CardEditDialogProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined);
  const [customFields, setCustomFields] = useState<CardCustomField[]>([]);

  const { board, addOrUpdateFieldDefinition } = useKanbanBoard(
    card?.orgId,
    card?.boardId
  );

  useEffect(() => {
    if (card && board) {
      setTitle(card.title);
      setDescription(card.description);
      setDueDate(card.dueDate);
      
      // Normalize custom fields using board definitions
      const normalized = normalizeCustomFields(
        board.customFieldDefinitions,
        convertToBackendCustomFields(card.customFields)
      );
      setCustomFields(normalized);
    }
  }, [card, board]);

  const handleAddFieldDefinition = (field: CardCustomField) => {
    // Create or update the board-level definition
    const definition = createDefinitionFromField(field);
    addOrUpdateFieldDefinition(definition);
  };

  const handleSave = () => {
    if (!card || !title.trim()) return;

    const input: CardInput = {
      title: title.trim(),
      description: description.trim(),
      dueDate,
      columnId: card.columnId,
      orgId: card.orgId,
      boardId: card.boardId,
      customFields,
    };

    onSave(card.id, input);
    onOpenChange(false);
  };

  const handleDelete = () => {
    if (!card) return;
    onDelete(card.id);
    onOpenChange(false);
  };

  if (!card) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{strings.card.editCard}</DialogTitle>
          <DialogDescription>{strings.card.makeChanges}</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="title">{strings.card.cardTitle}</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={strings.card.cardTitlePlaceholder}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="description">{strings.card.cardDescription}</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={strings.card.cardDescriptionPlaceholder}
              rows={4}
            />
          </div>

          <div className="grid gap-2">
            <Label>{strings.card.dueDate}</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dueDate ? format(dueDate, 'PPP', { locale: ptBR }) : <span>{strings.card.pickDate}</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={dueDate}
                  onSelect={setDueDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            {dueDate && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setDueDate(undefined)}
                className="w-fit"
              >
                {strings.card.clearDate}
              </Button>
            )}
          </div>

          <div className="border-t pt-4">
            <CustomFieldsEditor 
              fields={customFields} 
              onChange={setCustomFields}
              onAddFieldDefinition={handleAddFieldDefinition}
            />
          </div>
        </div>

        <DialogFooter className="flex justify-between">
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            {isDeleting ? strings.deleting : strings.delete}
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              {strings.cancel}
            </Button>
            <Button onClick={handleSave} disabled={isSaving || !title.trim()}>
              {isSaving ? strings.saving : strings.card.saveChanges}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
