import type { DateRange } from './dashboardDateRange';
import type { ChartDataPoint } from './dashboardMetrics';

export interface ComparisonPeriods {
  current: DateRange;
  previous: DateRange;
}

export interface ComparisonResult {
  currentValue: number;
  previousValue: number;
  delta: number;
  percentChange: number | null;
  hasData: boolean;
}

export function getComparisonPeriods(dateRange: DateRange | null): ComparisonPeriods | null {
  if (!dateRange) {
    // Default to last 3 months vs previous 3 months
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    const currentStart = new Date(today.getFullYear(), today.getMonth() - 3, today.getDate());
    const currentEnd = today;
    
    const previousStart = new Date(today.getFullYear(), today.getMonth() - 6, today.getDate());
    const previousEnd = new Date(currentStart);
    previousEnd.setDate(previousEnd.getDate() - 1);
    
    return {
      current: { start: currentStart, end: currentEnd },
      previous: { start: previousStart, end: previousEnd },
    };
  }
  
  // Calculate previous period based on current range duration
  const durationMs = dateRange.end.getTime() - dateRange.start.getTime();
  
  const previousEnd = new Date(dateRange.start);
  previousEnd.setDate(previousEnd.getDate() - 1);
  
  const previousStart = new Date(previousEnd.getTime() - durationMs);
  
  return {
    current: dateRange,
    previous: { start: previousStart, end: previousEnd },
  };
}

export function computeComparison(
  currentValue: number,
  previousValue: number
): ComparisonResult {
  const delta = currentValue - previousValue;
  
  let percentChange: number | null = null;
  if (previousValue !== 0) {
    percentChange = (delta / previousValue) * 100;
  }
  
  return {
    currentValue,
    previousValue,
    delta,
    percentChange,
    hasData: true,
  };
}

export function aggregateChartData(data: ChartDataPoint[]): number {
  return data.reduce((sum, point) => sum + point.value, 0);
}

export function formatPercentChange(percentChange: number | null): string {
  if (percentChange === null) return 'N/A';
  const sign = percentChange >= 0 ? '+' : '';
  return `${sign}${percentChange.toFixed(1)}%`;
}

export function formatDelta(delta: number, isCurrency: boolean = false): string {
  const sign = delta >= 0 ? '+' : '';
  if (isCurrency) {
    return `${sign}${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(delta)}`;
  }
  return `${sign}${delta}`;
}
