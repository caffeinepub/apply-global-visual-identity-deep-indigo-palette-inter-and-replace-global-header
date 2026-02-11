import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { ComparisonResult } from '../../utils/dashboardComparison';
import { formatPercentChange } from '../../utils/dashboardComparison';

interface ComparisonKpiDeltaProps {
  comparison: ComparisonResult | null;
  isCurrency?: boolean;
}

export function ComparisonKpiDelta({ comparison, isCurrency = false }: ComparisonKpiDeltaProps) {
  if (!comparison || !comparison.hasData) {
    return (
      <p className="text-xs text-muted-foreground font-normal">
        Sem dados para comparação
      </p>
    );
  }

  const { delta, percentChange } = comparison;
  
  const isPositive = delta > 0;
  const isNeutral = delta === 0;
  
  const Icon = isNeutral ? Minus : isPositive ? TrendingUp : TrendingDown;
  const colorClass = isNeutral 
    ? 'text-muted-foreground' 
    : isPositive 
      ? 'text-green-600 dark:text-green-400' 
      : 'text-red-600 dark:text-red-400';

  const formatValue = (val: number) => {
    if (isCurrency) {
      return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Math.abs(val));
    }
    return Math.abs(val).toString();
  };

  return (
    <div className={`flex items-center gap-1 text-xs font-medium ${colorClass}`}>
      <Icon className="h-3 w-3" />
      <span>
        {isPositive ? '+' : isNeutral ? '' : '-'}
        {formatValue(delta)}
      </span>
      {percentChange !== null && (
        <span className="text-muted-foreground font-normal">
          ({formatPercentChange(percentChange)})
        </span>
      )}
    </div>
  );
}
