import React from 'react';
import type { ChartDataPoint } from '../../../utils/dashboardMetrics';

interface BarTrendChartProps {
  data: ChartDataPoint[];
  title: string;
  color?: string;
}

export function BarTrendChart({ data, title, color = 'hsl(var(--primary))' }: BarTrendChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-sm text-muted-foreground">
        Sem dados para exibir
      </div>
    );
  }

  const maxValue = Math.max(...data.map(d => d.value));
  const barWidth = Math.max(20, Math.min(60, 100 / data.length));

  const formatMonth = (dateStr: string) => {
    const [year, month] = dateStr.split('-');
    return `${month}/${year.slice(2)}`;
  };

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold">{title}</h3>
      <div className="relative h-48">
        <svg width="100%" height="100%" className="overflow-visible">
          <g>
            {data.map((point, i) => {
              const height = maxValue > 0 ? (point.value / maxValue) * 160 : 0;
              const x = (i / data.length) * 100;
              
              return (
                <g key={point.date}>
                  <rect
                    x={`${x}%`}
                    y={180 - height}
                    width={`${barWidth}%`}
                    height={height}
                    fill={color}
                    opacity="0.8"
                    rx="2"
                  />
                  <text
                    x={`${x + barWidth / 2}%`}
                    y="195"
                    textAnchor="middle"
                    className="text-xs fill-muted-foreground"
                  >
                    {formatMonth(point.date)}
                  </text>
                  <text
                    x={`${x + barWidth / 2}%`}
                    y={175 - height}
                    textAnchor="middle"
                    className="text-xs font-medium fill-foreground"
                  >
                    {point.value}
                  </text>
                </g>
              );
            })}
          </g>
        </svg>
      </div>
    </div>
  );
}
