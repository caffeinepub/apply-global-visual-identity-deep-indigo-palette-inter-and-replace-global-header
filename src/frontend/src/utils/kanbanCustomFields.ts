import type { CustomFieldDefinition, CustomField, FieldType } from '../backend';
import type { CardCustomField, CustomFieldValue } from '../types/kanbanCards';

/**
 * Normalizes board-level custom field definitions with card-level values
 * to produce a consistent list of fields for rendering.
 */
export function normalizeCustomFields(
  boardDefinitions: CustomFieldDefinition[],
  cardFields: CustomField[]
): CardCustomField[] {
  const cardFieldsMap = new Map<string, CustomField>();
  cardFields.forEach((field) => {
    cardFieldsMap.set(field.name, field);
  });

  return boardDefinitions.map((def, index) => {
    const cardField = cardFieldsMap.get(def.name);
    const value = cardField ? mapBackendFieldTypeToFrontend(cardField.value) : getEmptyValueForType(def.fieldType);

    return {
      id: `field-${index}`,
      name: def.name,
      type: getFieldTypeFromBackend(def.fieldType),
      options: def.options,
      value,
    };
  });
}

/**
 * Extracts the field type string from backend FieldType
 */
function getFieldTypeFromBackend(fieldType: FieldType): CardCustomField['type'] {
  if ('text' in fieldType) return 'text';
  if ('number' in fieldType) return 'number';
  if ('date' in fieldType) return 'date';
  if ('singleSelect' in fieldType) return 'singleSelect';
  if ('multiSelect' in fieldType) return 'multiSelect';
  if ('tags' in fieldType) return 'tags';
  return 'text';
}

/**
 * Returns an empty value for a given field type
 * For number fields, returns undefined instead of 0 to support true empty state
 */
function getEmptyValueForType(fieldType: FieldType): CustomFieldValue {
  if ('text' in fieldType) return { text: '' };
  if ('number' in fieldType) return {}; // Empty object for unset number
  if ('date' in fieldType) return {};
  if ('singleSelect' in fieldType) return { singleSelect: '' };
  if ('multiSelect' in fieldType) return { multiSelect: [] };
  if ('tags' in fieldType) return { tags: [] };
  return {};
}

/**
 * Maps backend FieldType to frontend CustomFieldValue
 */
function mapBackendFieldTypeToFrontend(fieldType: FieldType): CustomFieldValue {
  if ('text' in fieldType) {
    return { text: fieldType.text };
  } else if ('number' in fieldType) {
    // Only set number if it's non-zero or explicitly set
    return fieldType.number !== 0 ? { number: fieldType.number } : {};
  } else if ('date' in fieldType) {
    return { date: new Date(Number(fieldType.date)) };
  } else if ('singleSelect' in fieldType) {
    return { singleSelect: fieldType.singleSelect };
  } else if ('multiSelect' in fieldType) {
    return { multiSelect: fieldType.multiSelect };
  } else if ('tags' in fieldType) {
    return { tags: fieldType.tags };
  }
  return {};
}

/**
 * Maps frontend CustomFieldValue to backend FieldType
 */
export function mapFrontendFieldTypeToBackend(value: CustomFieldValue): FieldType {
  if (value.text !== undefined) {
    return { __kind__: 'text', text: value.text };
  } else if (value.number !== undefined) {
    return { __kind__: 'number', number: value.number };
  } else if (value.date !== undefined) {
    return { __kind__: 'date', date: BigInt(value.date.getTime()) };
  } else if (value.singleSelect !== undefined) {
    return { __kind__: 'singleSelect', singleSelect: value.singleSelect };
  } else if (value.multiSelect !== undefined) {
    return { __kind__: 'multiSelect', multiSelect: value.multiSelect };
  } else if (value.tags !== undefined) {
    return { __kind__: 'tags', tags: value.tags };
  }
  return { __kind__: 'text', text: '' };
}

/**
 * Converts CardCustomField array to backend CustomField array
 */
export function convertToBackendCustomFields(fields: CardCustomField[]): CustomField[] {
  return fields.map((field) => ({
    name: field.name,
    value: mapFrontendFieldTypeToBackend(field.value),
  }));
}

/**
 * Creates a CustomFieldDefinition from a CardCustomField
 */
export function createDefinitionFromField(field: CardCustomField): CustomFieldDefinition {
  return {
    name: field.name,
    fieldType: mapFrontendFieldTypeToBackend(field.value),
    options: field.options || [],
  };
}
