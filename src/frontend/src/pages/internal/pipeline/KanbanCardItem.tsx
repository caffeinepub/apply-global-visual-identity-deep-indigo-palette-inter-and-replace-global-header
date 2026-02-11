import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, DollarSign } from 'lucide-react';
import { format } from 'date-fns';
import type { KanbanCard, CardInput } from '../../../types/kanbanCards';
import { CardEditDialog } from './CardEditDialog';
import { getOpportunityValueFromCardFields, formatCurrency } from '../../../utils/opportunityValue';

interface KanbanCardItemProps {
  card: KanbanCard;
  onUpdate: (cardId: string, input: CardInput) => void;
  onDelete: (cardId: string) => void;
  isUpdating: boolean;
  isDeleting: boolean;
}

export function KanbanCardItem({ card, onUpdate, onDelete, isUpdating, isDeleting }: KanbanCardItemProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('cardId', card.id);
    e.dataTransfer.setData('sourceColumnId', card.columnId);
  };

  const opportunityValue = getOpportunityValueFromCardFields(card.customFields);

  return (
    <>
      <Card
        className="cursor-pointer hover:shadow-md transition-shadow"
        draggable
        onDragStart={handleDragStart}
        onClick={() => setIsEditDialogOpen(true)}
      >
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {card.description && (
            <p className="text-xs text-muted-foreground line-clamp-2">{card.description}</p>
          )}
          {card.dueDate && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3" />
              <span>{format(card.dueDate, 'MMM d, yyyy')}</span>
            </div>
          )}
          {card.customFields && card.customFields.length > 0 && (
            <div className="flex flex-wrap gap-1 pt-1">
              {card.customFields.slice(0, 3).map((field) => (
                <Badge key={field.id} variant="outline" className="text-xs">
                  {field.name}
                </Badge>
              ))}
              {card.customFields.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{card.customFields.length - 3}
                </Badge>
              )}
            </div>
          )}
          
          {/* Value section at the bottom */}
          <div className="flex items-center gap-1 pt-2 border-t text-sm font-medium">
            <DollarSign className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Valor:</span>
            <span className={opportunityValue > 0 ? 'text-foreground' : 'text-muted-foreground'}>
              {opportunityValue > 0 ? formatCurrency(opportunityValue) : '—'}
            </span>
          </div>
        </CardContent>
      </Card>

      <CardEditDialog
        card={card}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onSave={onUpdate}
        onDelete={onDelete}
        isSaving={isUpdating}
        isDeleting={isDeleting}
      />
    </>
  );
}
