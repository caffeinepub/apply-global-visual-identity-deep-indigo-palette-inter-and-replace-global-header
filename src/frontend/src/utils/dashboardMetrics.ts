import type { Contact, Activity, Contract } from '../types/model';
import type { KanbanCard } from '../types/kanbanCards';
import type { DateRange } from './dashboardDateRange';
import { isDateInRange } from './dashboardDateRange';
import { aggregateOpportunityValues } from './opportunityValue';
import { convertToBackendCustomFields } from './kanbanCustomFields';

export interface DashboardMetrics {
  totalMRR: number;
  activeContractsCount: number;
  totalContacts: number;
  activeLeadsCount: number;
  openPipelineValue: number;
  openDealsCount: number;
  todayActivitiesCount: number;
  openActivitiesCount: number;
  upcomingRenewalsCount: number;
}

export interface ChartDataPoint {
  date: string;
  value: number;
  label?: string;
}

export function computeDashboardMetrics(
  contacts: Contact[],
  cards: KanbanCard[],
  activities: Activity[],
  contracts: Contract[],
  dateRange: DateRange | null
): DashboardMetrics {
  // Filter data by date range where applicable
  const filteredContracts = contracts.filter(c => 
    isDateInRange(c.startDate, dateRange)
  );
  
  const filteredCards = cards.filter(card => 
    isDateInRange(card.createdAt, dateRange)
  );
  
  const filteredActivities = activities.filter(a => 
    isDateInRange(a.dueDate, dateRange)
  );

  // Contacts don't have reliable date filtering in current schema
  const filteredContacts = contacts;

  const activeContracts = filteredContracts.filter(c => c.status === 'active');
  const totalMRR = activeContracts.reduce((sum, c) => sum + c.mrr, 0);
  
  // Compute pipeline value from Kanban cards - convert to backend format for aggregation
  const backendCards = filteredCards.map(card => ({
    ...card,
    customFields: convertToBackendCustomFields(card.customFields)
  }));
  const totalPipeline = aggregateOpportunityValues(backendCards);
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayActivities = filteredActivities.filter(a => {
    if (!a.dueDate) return false;
    const activityDate = new Date(a.dueDate);
    activityDate.setHours(0, 0, 0, 0);
    return activityDate.getTime() === today.getTime() && a.status === 'open';
  });

  const upcomingRenewals = activeContracts.filter(c => {
    const daysUntil = Math.ceil((new Date(c.renewalDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return daysUntil <= 30 && daysUntil > 0;
  });

  return {
    totalMRR,
    activeContractsCount: activeContracts.length,
    totalContacts: filteredContacts.length,
    activeLeadsCount: filteredContacts.filter(c => c.status === 'lead').length,
    openPipelineValue: totalPipeline,
    openDealsCount: filteredCards.length,
    todayActivitiesCount: todayActivities.length,
    openActivitiesCount: filteredActivities.filter(a => a.status === 'open').length,
    upcomingRenewalsCount: upcomingRenewals.length,
  };
}

export function computeMRRTrendData(
  contracts: Contract[],
  dateRange: DateRange | null
): ChartDataPoint[] {
  const activeContracts = contracts.filter(c => c.status === 'active');
  
  if (activeContracts.length === 0) return [];
  
  // Group by month
  const monthlyData = new Map<string, number>();
  
  activeContracts.forEach(contract => {
    const date = new Date(contract.startDate);
    if (dateRange && !isDateInRange(date, dateRange)) return;
    
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    monthlyData.set(monthKey, (monthlyData.get(monthKey) || 0) + contract.mrr);
  });
  
  return Array.from(monthlyData.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([date, value]) => ({ date, value }));
}

export function computePipelineTrendData(
  cards: KanbanCard[],
  dateRange: DateRange | null
): ChartDataPoint[] {
  if (cards.length === 0) return [];
  
  // Group by month
  const monthlyData = new Map<string, number>();
  
  cards.forEach(card => {
    const date = card.createdAt;
    if (dateRange && !isDateInRange(date, dateRange)) return;
    
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    // Convert to backend format for aggregation
    const backendCard = {
      ...card,
      customFields: convertToBackendCustomFields(card.customFields)
    };
    const cardValue = aggregateOpportunityValues([backendCard]);
    monthlyData.set(monthKey, (monthlyData.get(monthKey) || 0) + cardValue);
  });
  
  return Array.from(monthlyData.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([date, value]) => ({ date, value }));
}

export function computeActivityVolumeData(
  activities: Activity[],
  dateRange: DateRange | null
): ChartDataPoint[] {
  if (activities.length === 0) return [];
  
  // Group by month
  const monthlyData = new Map<string, number>();
  
  activities.forEach(activity => {
    if (!activity.dueDate) return;
    const date = new Date(activity.dueDate);
    if (dateRange && !isDateInRange(date, dateRange)) return;
    
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    monthlyData.set(monthKey, (monthlyData.get(monthKey) || 0) + 1);
  });
  
  return Array.from(monthlyData.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([date, value]) => ({ date, value }));
}

export function computeRenewalsTrendData(
  contracts: Contract[],
  dateRange: DateRange | null
): ChartDataPoint[] {
  const activeContracts = contracts.filter(c => c.status === 'active');
  
  if (activeContracts.length === 0) return [];
  
  // Group by renewal month
  const monthlyData = new Map<string, number>();
  
  activeContracts.forEach(contract => {
    const date = new Date(contract.renewalDate);
    if (dateRange && !isDateInRange(date, dateRange)) return;
    
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    monthlyData.set(monthKey, (monthlyData.get(monthKey) || 0) + 1);
  });
  
  return Array.from(monthlyData.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([date, value]) => ({ date, value }));
}
