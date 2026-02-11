export type ReportType = 'sales' | 'finance' | 'customer_success' | 'projects';
export type ReportFormat = 'pdf' | 'csv';
export type ScheduleFrequency = 'daily' | 'weekly' | 'monthly' | 'custom';

export interface DateRangeFilter {
  startDate: Date;
  endDate: Date;
  preset?: 'last-7-days' | 'last-30-days' | 'last-90-days' | 'this-month' | 'last-month' | 'this-quarter' | 'last-quarter' | 'this-year' | 'custom';
}

export interface ReportFilters {
  dateRange: DateRangeFilter;
  // Extensible for future filters
  [key: string]: any;
}

export interface ReportHistoryItem {
  id: string;
  reportType: ReportType;
  format: ReportFormat;
  generatedAt: Date;
  generatedBy: string;
  orgId: string;
  filters: ReportFilters;
  fileSize?: string;
}

export interface ReportSchedule {
  id: string;
  name: string;
  reportType: ReportType;
  format: ReportFormat;
  frequency: ScheduleFrequency;
  timeOfDay: string; // HH:mm format in UTC
  dayOfWeek?: number; // 0-6 for weekly
  dayOfMonth?: number; // 1-31 for monthly
  customCron?: string; // For custom frequency
  filters: ReportFilters;
  enabled: boolean;
  orgId: string;
  createdBy: string;
  createdAt: Date;
  lastRun?: Date;
  nextRun?: Date;
}

export interface ReportScheduleInput {
  name: string;
  reportType: ReportType;
  format: ReportFormat;
  frequency: ScheduleFrequency;
  timeOfDay: string;
  dayOfWeek?: number;
  dayOfMonth?: number;
  customCron?: string;
  filters: ReportFilters;
  enabled: boolean;
}

export interface GenerateReportInput {
  reportType: ReportType;
  format: ReportFormat;
  filters: ReportFilters;
  orgId: string;
}
