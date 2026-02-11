/**
 * Shared utilities for managing opportunity Value custom field
 */

import type { CustomField, CustomFieldDefinition, FieldType } from '../backend';
import type { CardCustomField } from '../types/kanbanCards';

// Canonical field name for opportunity value
export const OPPORTUNITY_VALUE_FIELD_NAME = 'Valor';

/**
 * Safely extracts the numeric value from a card's custom fields
 * Returns 0 if the field is not found or not a number
 */
export function getOpportunityValue(customFields: CustomField[]): number {
  const valueField = customFields.find(f => f.name === OPPORTUNITY_VALUE_FIELD_NAME);
  if (!valueField) return 0;
  
  if ('number' in valueField.value) {
    return valueField.value.number;
  }
  
  return 0;
}

/**
 * Safely extracts the numeric value from frontend CardCustomField array
 */
export function getOpportunityValueFromCardFields(customFields: CardCustomField[]): number {
  const valueField = customFields.find(f => f.name === OPPORTUNITY_VALUE_FIELD_NAME);
  if (!valueField) return 0;
  
  return valueField.value.number ?? 0;
}

/**
 * Formats a number as Brazilian currency
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

/**
 * Creates a numeric CustomFieldDefinition for the Value field
 */
export function createValueFieldDefinition(): CustomFieldDefinition {
  return {
    name: OPPORTUNITY_VALUE_FIELD_NAME,
    fieldType: { __kind__: 'number', number: 0 },
    options: [],
  };
}

/**
 * Upserts the Value field in a CardCustomField array
 * If the field exists, updates its value; otherwise adds it
 */
export function upsertValueField(
  fields: CardCustomField[],
  value: number | undefined
): CardCustomField[] {
  const existingIndex = fields.findIndex(f => f.name === OPPORTUNITY_VALUE_FIELD_NAME);
  
  const valueField: CardCustomField = {
    id: existingIndex >= 0 ? fields[existingIndex].id : `field-value-${Date.now()}`,
    name: OPPORTUNITY_VALUE_FIELD_NAME,
    type: 'number',
    value: { number: value },
  };
  
  if (existingIndex >= 0) {
    const updated = [...fields];
    updated[existingIndex] = valueField;
    return updated;
  }
  
  return [...fields, valueField];
}

/**
 * Removes the Value field from a CardCustomField array
 */
export function removeValueField(fields: CardCustomField[]): CardCustomField[] {
  return fields.filter(f => f.name !== OPPORTUNITY_VALUE_FIELD_NAME);
}

/**
 * Aggregates opportunity values from multiple cards
 */
export function aggregateOpportunityValues(cards: Array<{ customFields: CustomField[] }>): number {
  return cards.reduce((sum, card) => sum + getOpportunityValue(card.customFields), 0);
}
