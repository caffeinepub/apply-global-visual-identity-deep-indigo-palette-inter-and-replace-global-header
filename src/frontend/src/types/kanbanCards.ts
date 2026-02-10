/**
 * Frontend types for Kanban cards with dynamic custom fields support
 */

export type CustomFieldType = 'text' | 'number' | 'date' | 'singleSelect' | 'multiSelect' | 'tags';

export interface CustomFieldValue {
  text?: string;
  number?: number;
  date?: Date;
  singleSelect?: string;
  multiSelect?: string[];
  tags?: string[];
}

export interface CardCustomField {
  id: string;
  name: string;
  type: CustomFieldType;
  options?: string[]; // For select types
  value: CustomFieldValue;
}

export interface KanbanCard {
  id: string;
  title: string;
  description: string;
  dueDate?: Date;
  columnId: string;
  orgId: string;
  boardId: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  customFields: CardCustomField[];
}

export interface CardInput {
  title: string;
  description: string;
  dueDate?: Date;
  columnId: string;
  orgId: string;
  boardId: string;
  customFields: CardCustomField[];
}

export interface CardUpdateInput extends CardInput {
  id: string;
}
