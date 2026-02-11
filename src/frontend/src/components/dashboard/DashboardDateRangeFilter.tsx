import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import type { DateRangeFilter } from '../../types/reports';

interface DashboardDateRangeFilterProps {
  value: DateRangeFilter;
  onChange: (range: DateRangeFilter) => void;
}

export function DashboardDateRangeFilter({ value, onChange }: DashboardDateRangeFilterProps) {
  const [isOpen, setIsOpen] = useState(false);

  const presets: Array<{ label: string; value: DateRangeFilter['preset'] }> = [
    { label: 'Last 7 Days', value: 'last-7-days' },
    { label: 'Last 30 Days', value: 'last-30-days' },
    { label: 'Last 90 Days', value: 'last-90-days' },
    { label: 'This Month', value: 'this-month' },
    { label: 'Last Month', value: 'last-month' },
    { label: 'This Quarter', value: 'this-quarter' },
    { label: 'Last Quarter', value: 'last-quarter' },
    { label: 'This Year', value: 'this-year' },
  ];

  const handlePresetClick = (preset: DateRangeFilter['preset']) => {
    const now = new Date();
    let startDate: Date;
    let endDate = now;

    switch (preset) {
      case 'last-7-days':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'last-30-days':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case 'last-90-days':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case 'this-month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'last-month':
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        endDate = new Date(now.getFullYear(), now.getMonth(), 0);
        break;
      case 'this-quarter':
        const currentQuarter = Math.floor(now.getMonth() / 3);
        startDate = new Date(now.getFullYear(), currentQuarter * 3, 1);
        break;
      case 'last-quarter':
        const lastQuarter = Math.floor(now.getMonth() / 3) - 1;
        const year = lastQuarter < 0 ? now.getFullYear() - 1 : now.getFullYear();
        const quarter = lastQuarter < 0 ? 3 : lastQuarter;
        startDate = new Date(year, quarter * 3, 1);
        endDate = new Date(year, quarter * 3 + 3, 0);
        break;
      case 'this-year':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        return;
    }

    onChange({ startDate, endDate, preset });
    setIsOpen(false);
  };

  const handleCustomDateChange = (date: Date | undefined, type: 'start' | 'end') => {
    if (!date) return;
    
    const newRange: DateRangeFilter = {
      startDate: type === 'start' ? date : value.startDate,
      endDate: type === 'end' ? date : value.endDate,
      preset: 'custom',
    };
    
    onChange(newRange);
  };

  const displayText = value.preset && value.preset !== 'custom'
    ? presets.find(p => p.value === value.preset)?.label || 'Select range'
    : `${format(value.startDate, 'MMM d, yyyy')} - ${format(value.endDate, 'MMM d, yyyy')}`;

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="justify-start text-left font-normal">
          <CalendarIcon className="mr-2 h-4 w-4" />
          {displayText}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="flex">
          <div className="border-r p-3 space-y-1">
            <div className="text-sm font-medium mb-2">Presets</div>
            {presets.map((preset) => (
              <Button
                key={preset.value}
                variant={value.preset === preset.value ? 'secondary' : 'ghost'}
                size="sm"
                className="w-full justify-start"
                onClick={() => handlePresetClick(preset.value)}
              >
                {preset.label}
              </Button>
            ))}
          </div>
          <div className="p-3">
            <div className="text-sm font-medium mb-2">Custom Range</div>
            <div className="space-y-3">
              <div>
                <div className="text-xs text-muted-foreground mb-1">Start Date</div>
                <Calendar
                  mode="single"
                  selected={value.startDate}
                  onSelect={(date) => handleCustomDateChange(date, 'start')}
                  initialFocus
                />
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-1">End Date</div>
                <Calendar
                  mode="single"
                  selected={value.endDate}
                  onSelect={(date) => handleCustomDateChange(date, 'end')}
                />
              </div>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
