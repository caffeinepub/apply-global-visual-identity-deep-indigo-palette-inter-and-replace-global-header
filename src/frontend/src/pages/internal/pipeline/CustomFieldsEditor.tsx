import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, X, Calendar as CalendarIcon, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { CardCustomField, CustomFieldType } from '../../../types/kanbanCards';
import { strings } from '../../../i18n/strings.ptBR';

interface CustomFieldsEditorProps {
  fields: CardCustomField[];
  onChange: (fields: CardCustomField[]) => void;
  onAddFieldDefinition?: (field: CardCustomField) => void;
}

export function CustomFieldsEditor({ fields, onChange, onAddFieldDefinition }: CustomFieldsEditorProps) {
  const [isAddingField, setIsAddingField] = useState(false);
  const [newFieldName, setNewFieldName] = useState('');
  const [newFieldType, setNewFieldType] = useState<CustomFieldType>('text');

  const handleAddField = () => {
    if (!newFieldName.trim()) return;

    const newField: CardCustomField = {
      id: `field-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: newFieldName.trim(),
      type: newFieldType,
      options: newFieldType === 'singleSelect' || newFieldType === 'multiSelect' ? [] : undefined,
      value: {},
    };

    onChange([...fields, newField]);
    
    // Notify parent to add this as a board-level definition
    if (onAddFieldDefinition) {
      onAddFieldDefinition(newField);
    }
    
    setNewFieldName('');
    setNewFieldType('text');
    setIsAddingField(false);
  };

  const handleRemoveField = (fieldId: string) => {
    onChange(fields.filter((f) => f.id !== fieldId));
  };

  const handleUpdateFieldValue = (fieldId: string, value: CardCustomField['value']) => {
    onChange(
      fields.map((f) =>
        f.id === fieldId ? { ...f, value } : f
      )
    );
  };

  const handleUpdateFieldName = (fieldId: string, name: string) => {
    const updatedFields = fields.map((f) =>
      f.id === fieldId ? { ...f, name } : f
    );
    onChange(updatedFields);
    
    // Notify parent to update the board-level definition
    if (onAddFieldDefinition) {
      const updatedField = updatedFields.find(f => f.id === fieldId);
      if (updatedField) {
        onAddFieldDefinition(updatedField);
      }
    }
  };

  const handleAddOption = (fieldId: string, option: string) => {
    if (!option.trim()) return;
    
    const updatedFields = fields.map((f) => {
      if (f.id === fieldId) {
        const newOptions = [...(f.options || []), option.trim()];
        return { ...f, options: newOptions };
      }
      return f;
    });
    
    onChange(updatedFields);
    
    // Notify parent to update the board-level definition
    if (onAddFieldDefinition) {
      const updatedField = updatedFields.find(f => f.id === fieldId);
      if (updatedField) {
        onAddFieldDefinition(updatedField);
      }
    }
  };

  const handleRemoveOption = (fieldId: string, optionIndex: number) => {
    const updatedFields = fields.map((f) => {
      if (f.id === fieldId) {
        const newOptions = (f.options || []).filter((_, i) => i !== optionIndex);
        return { ...f, options: newOptions };
      }
      return f;
    });
    
    onChange(updatedFields);
    
    // Notify parent to update the board-level definition
    if (onAddFieldDefinition) {
      const updatedField = updatedFields.find(f => f.id === fieldId);
      if (updatedField) {
        onAddFieldDefinition(updatedField);
      }
    }
  };

  const renderFieldValueEditor = (field: CardCustomField) => {
    switch (field.type) {
      case 'text':
        return (
          <Input
            value={field.value.text || ''}
            onChange={(e) => handleUpdateFieldValue(field.id, { text: e.target.value })}
            placeholder={strings.customFields.enterText}
          />
        );

      case 'number':
        return (
          <Input
            type="number"
            value={field.value.number || ''}
            onChange={(e) => handleUpdateFieldValue(field.id, { number: parseFloat(e.target.value) || 0 })}
            placeholder={strings.customFields.enterNumber}
          />
        );

      case 'date':
        return (
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-start text-left font-normal">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {field.value.date ? format(field.value.date, 'PPP', { locale: ptBR }) : <span>{strings.card.pickDate}</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={field.value.date}
                onSelect={(date) => handleUpdateFieldValue(field.id, { date: date || new Date() })}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        );

      case 'singleSelect':
        return (
          <div className="space-y-2">
            <Select
              value={field.value.singleSelect || ''}
              onValueChange={(value) => handleUpdateFieldValue(field.id, { singleSelect: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder={strings.customFields.selectOption} />
              </SelectTrigger>
              <SelectContent>
                {(field.options || []).map((option, idx) => (
                  <SelectItem key={idx} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <OptionManager
              options={field.options || []}
              onAddOption={(option) => handleAddOption(field.id, option)}
              onRemoveOption={(idx) => handleRemoveOption(field.id, idx)}
            />
          </div>
        );

      case 'multiSelect':
        return (
          <div className="space-y-2">
            <div className="space-y-2">
              {(field.options || []).map((option, idx) => (
                <div key={idx} className="flex items-center space-x-2">
                  <Checkbox
                    id={`${field.id}-${idx}`}
                    checked={(field.value.multiSelect || []).includes(option)}
                    onCheckedChange={(checked) => {
                      const current = field.value.multiSelect || [];
                      const updated = checked
                        ? [...current, option]
                        : current.filter((v) => v !== option);
                      handleUpdateFieldValue(field.id, { multiSelect: updated });
                    }}
                  />
                  <label htmlFor={`${field.id}-${idx}`} className="text-sm">
                    {option}
                  </label>
                </div>
              ))}
            </div>
            <OptionManager
              options={field.options || []}
              onAddOption={(option) => handleAddOption(field.id, option)}
              onRemoveOption={(idx) => handleRemoveOption(field.id, idx)}
            />
          </div>
        );

      case 'tags':
        return (
          <TagsEditor
            tags={field.value.tags || []}
            onChange={(tags) => handleUpdateFieldValue(field.id, { tags })}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">{strings.customFields.title}</h3>
        {!isAddingField && (
          <Button variant="outline" size="sm" onClick={() => setIsAddingField(true)}>
            <Plus className="mr-2 h-4 w-4" />
            {strings.customFields.addField}
          </Button>
        )}
      </div>

      {isAddingField && (
        <Card>
          <CardContent className="pt-6 space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="field-name">{strings.customFields.fieldName}</Label>
              <Input
                id="field-name"
                value={newFieldName}
                onChange={(e) => setNewFieldName(e.target.value)}
                placeholder={strings.customFields.fieldNamePlaceholder}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="field-type">{strings.customFields.fieldType}</Label>
              <Select value={newFieldType} onValueChange={(value) => setNewFieldType(value as CustomFieldType)}>
                <SelectTrigger id="field-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="text">{strings.customFields.text}</SelectItem>
                  <SelectItem value="number">{strings.customFields.number}</SelectItem>
                  <SelectItem value="date">{strings.customFields.date}</SelectItem>
                  <SelectItem value="singleSelect">{strings.customFields.singleSelect}</SelectItem>
                  <SelectItem value="multiSelect">{strings.customFields.multiSelect}</SelectItem>
                  <SelectItem value="tags">{strings.customFields.tags}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleAddField} disabled={!newFieldName.trim()}>
                {strings.add}
              </Button>
              <Button variant="outline" onClick={() => setIsAddingField(false)}>
                {strings.cancel}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {fields.map((field) => (
        <Card key={field.id}>
          <CardContent className="pt-6 space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <Input
                    value={field.name}
                    onChange={(e) => handleUpdateFieldName(field.id, e.target.value)}
                    className="font-medium"
                  />
                  <Badge variant="outline">{field.type}</Badge>
                </div>
                {renderFieldValueEditor(field)}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleRemoveField(field.id)}
                className="ml-2"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function OptionManager({
  options,
  onAddOption,
  onRemoveOption,
}: {
  options: string[];
  onAddOption: (option: string) => void;
  onRemoveOption: (index: number) => void;
}) {
  const [newOption, setNewOption] = useState('');

  const handleAdd = () => {
    if (newOption.trim()) {
      onAddOption(newOption.trim());
      setNewOption('');
    }
  };

  return (
    <div className="space-y-2 pt-2 border-t">
      <div className="flex flex-wrap gap-1">
        {options.map((option, idx) => (
          <Badge key={idx} variant="secondary" className="gap-1">
            {option}
            <button
              onClick={() => onRemoveOption(idx)}
              className="ml-1 hover:text-destructive"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
      </div>
      <div className="flex gap-2">
        <Input
          value={newOption}
          onChange={(e) => setNewOption(e.target.value)}
          placeholder={strings.customFields.optionPlaceholder}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleAdd();
            }
          }}
        />
        <Button size="sm" onClick={handleAdd} disabled={!newOption.trim()}>
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

function TagsEditor({ tags, onChange }: { tags: string[]; onChange: (tags: string[]) => void }) {
  const [newTag, setNewTag] = useState('');

  const handleAdd = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      onChange([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const handleRemove = (index: number) => {
    onChange(tags.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1">
        {tags.map((tag, idx) => (
          <Badge key={idx} variant="secondary" className="gap-1">
            {tag}
            <button
              onClick={() => handleRemove(idx)}
              className="ml-1 hover:text-destructive"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
      </div>
      <div className="flex gap-2">
        <Input
          value={newTag}
          onChange={(e) => setNewTag(e.target.value)}
          placeholder={strings.customFields.tagPlaceholder}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleAdd();
            }
          }}
        />
        <Button size="sm" onClick={handleAdd} disabled={!newTag.trim()}>
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
