import React from 'react';
import type { ChartDataPoint } from '../../../utils/dashboardMetrics';

interface LineComparisonChartProps {
  currentData: ChartDataPoint[];
  previousData?: ChartDataPoint[];
  title: string;
  isCurrency?: boolean;
}

export function LineComparisonChart({ 
  currentData, 
  previousData, 
  title,
  isCurrency = false 
}: LineComparisonChartProps) {
  if (currentData.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-sm text-muted-foreground">
        Sem dados para exibir
      </div>
    );
  }

  const allValues = [
    ...currentData.map(d => d.value),
    ...(previousData || []).map(d => d.value)
  ];
  const maxValue = Math.max(...allValues);
  const minValue = Math.min(...allValues);
  const range = maxValue - minValue || 1;

  const formatValue = (value: number) => {
    if (isCurrency) {
      return new Intl.NumberFormat('pt-BR', { 
        style: 'currency', 
        currency: 'BRL',
        notation: 'compact',
        maximumFractionDigits: 1
      }).format(value);
    }
    return value.toString();
  };

  const formatMonth = (dateStr: string) => {
    const [year, month] = dateStr.split('-');
    return `${month}/${year.slice(2)}`;
  };

  const createPath = (data: ChartDataPoint[]) => {
    if (data.length === 0) return '';
    
    const points = data.map((d, i) => {
      const x = (i / (data.length - 1 || 1)) * 90 + 5;
      const y = 85 - ((d.value - minValue) / range) * 70;
      return `${x},${y}`;
    });
    
    return `M ${points.join(' L ')}`;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">{title}</h3>
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-0.5 bg-primary" />
            <span>Período atual</span>
          </div>
          {previousData && previousData.length > 0 && (
            <div className="flex items-center gap-2">
              <div className="w-3 h-0.5 bg-muted-foreground opacity-50" />
              <span>Período anterior</span>
            </div>
          )}
        </div>
      </div>
      
      <div className="relative h-64">
        <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none" className="overflow-visible">
          {/* Grid lines */}
          <line x1="5" y1="15" x2="95" y2="15" stroke="currentColor" strokeOpacity="0.1" />
          <line x1="5" y1="50" x2="95" y2="50" stroke="currentColor" strokeOpacity="0.1" />
          <line x1="5" y1="85" x2="95" y2="85" stroke="currentColor" strokeOpacity="0.1" />
          
          {/* Previous period line */}
          {previousData && previousData.length > 0 && (
            <path
              d={createPath(previousData)}
              fill="none"
              stroke="currentColor"
              strokeWidth="0.5"
              strokeOpacity="0.3"
              strokeDasharray="2,2"
            />
          )}
          
          {/* Current period line */}
          <path
            d={createPath(currentData)}
            fill="none"
            stroke="hsl(var(--primary))"
            strokeWidth="0.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          
          {/* Data points */}
          {currentData.map((d, i) => {
            const x = (i / (currentData.length - 1 || 1)) * 90 + 5;
            const y = 85 - ((d.value - minValue) / range) * 70;
            
            return (
              <g key={d.date}>
                <circle
                  cx={x}
                  cy={y}
                  r="1"
                  fill="hsl(var(--primary))"
                />
              </g>
            );
          })}
        </svg>
        
        {/* X-axis labels */}
        <div className="flex justify-between mt-2 px-2">
          {currentData.map((d, i) => (
            i % Math.ceil(currentData.length / 6) === 0 && (
              <span key={d.date} className="text-xs text-muted-foreground">
                {formatMonth(d.date)}
              </span>
            )
          ))}
        </div>
        
        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-muted-foreground -ml-12">
          <span>{formatValue(maxValue)}</span>
          <span>{formatValue((maxValue + minValue) / 2)}</span>
          <span>{formatValue(minValue)}</span>
        </div>
      </div>
    </div>
  );
}
