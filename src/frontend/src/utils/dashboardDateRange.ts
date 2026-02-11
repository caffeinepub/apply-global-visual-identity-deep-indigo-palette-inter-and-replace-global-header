// Date range utilities for dashboard filtering
export interface DateRange {
  start: Date;
  end: Date;
}

export type DateRangePreset = 'last3months' | 'last6months' | 'last12months' | 'allTime' | 'custom';

export function getPresetDateRange(preset: DateRangePreset): DateRange | null {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  switch (preset) {
    case 'last3months':
      return {
        start: new Date(today.getFullYear(), today.getMonth() - 3, today.getDate()),
        end: today,
      };
    case 'last6months':
      return {
        start: new Date(today.getFullYear(), today.getMonth() - 6, today.getDate()),
        end: today,
      };
    case 'last12months':
      return {
        start: new Date(today.getFullYear(), today.getMonth() - 12, today.getDate()),
        end: today,
      };
    case 'allTime':
      return null;
    case 'custom':
      return null;
    default:
      return null;
  }
}

export function normalizeDateRange(range: DateRange): DateRange {
  const start = new Date(range.start);
  start.setHours(0, 0, 0, 0);
  
  const end = new Date(range.end);
  end.setHours(23, 59, 59, 999);
  
  return { start, end };
}

export function isDateInRange(date: Date | undefined | null, range: DateRange | null): boolean {
  if (!date) return false;
  if (!range) return true; // No filter = all time
  
  const normalized = normalizeDateRange(range);
  const checkDate = new Date(date);
  
  return checkDate >= normalized.start && checkDate <= normalized.end;
}

export function serializeDateRange(range: DateRange | null): string {
  if (!range) return '';
  return `${range.start.toISOString()},${range.end.toISOString()}`;
}

export function deserializeDateRange(str: string): DateRange | null {
  if (!str) return null;
  const parts = str.split(',');
  if (parts.length !== 2) return null;
  
  try {
    return {
      start: new Date(parts[0]),
      end: new Date(parts[1]),
    };
  } catch {
    return null;
  }
}
