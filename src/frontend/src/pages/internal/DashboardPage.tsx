import React, { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useStage1Client } from '../../hooks/useStage1Client';
import { useCurrentOrg } from '../../org/OrgProvider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Users, DollarSign, Calendar, AlertCircle } from 'lucide-react';
import { DashboardDateRangeFilter } from '../../components/dashboard/DashboardDateRangeFilter';
import { ComparisonKpiDelta } from '../../components/dashboard/ComparisonKpiDelta';
import { Sparkline } from '../../components/dashboard/charts/Sparkline';
import { BarTrendChart } from '../../components/dashboard/charts/BarTrendChart';
import { LineComparisonChart } from '../../components/dashboard/charts/LineComparisonChart';
import type { DateRange } from '../../utils/dashboardDateRange';
import type { DateRangeFilter } from '../../types/reports';
import { getPresetDateRange, serializeDateRange, deserializeDateRange } from '../../utils/dashboardDateRange';
import { 
  computeDashboardMetrics, 
  computeMRRTrendData, 
  computePipelineTrendData,
  computeActivityVolumeData,
  computeRenewalsTrendData
} from '../../utils/dashboardMetrics';
import { 
  getComparisonPeriods, 
  computeComparison
} from '../../utils/dashboardComparison';
import type { Contact, Activity, Contract } from '../../types/model';

// Session storage keys for dashboard state
const DATE_RANGE_STORAGE_KEY = 'dashboard_date_range';

function persistDateRange(serialized: string): void {
  try {
    sessionStorage.setItem(DATE_RANGE_STORAGE_KEY, serialized);
  } catch (error) {
    console.warn('Failed to persist date range:', error);
  }
}

function getPersistedDateRange(): string | null {
  try {
    return sessionStorage.getItem(DATE_RANGE_STORAGE_KEY);
  } catch (error) {
    console.warn('Failed to retrieve persisted date range:', error);
    return null;
  }
}

// Convert DateRange to DateRangeFilter
function dateRangeToFilter(range: DateRange | null): DateRangeFilter {
  if (!range) {
    const defaultRange = getPresetDateRange('last3months')!;
    return {
      startDate: defaultRange.start,
      endDate: defaultRange.end,
      preset: 'last-90-days',
    };
  }
  return {
    startDate: range.start,
    endDate: range.end,
    preset: 'custom',
  };
}

// Convert DateRangeFilter to DateRange
function filterToDateRange(filter: DateRangeFilter): DateRange {
  return {
    start: filter.startDate,
    end: filter.endDate,
  };
}

export default function DashboardPage() {
  const { client, isReady } = useStage1Client();
  const { currentOrgId } = useCurrentOrg();

  // Initialize date range from persisted value or default to last 3 months
  const [dateRange, setDateRange] = useState<DateRange | null>(() => {
    const persisted = getPersistedDateRange();
    if (persisted) {
      return deserializeDateRange(persisted);
    }
    return getPresetDateRange('last3months');
  });

  // Persist date range changes
  useEffect(() => {
    if (dateRange) {
      persistDateRange(serializeDateRange(dateRange));
    }
  }, [dateRange]);

  const { data: contacts = [], isLoading: contactsLoading } = useQuery<Contact[]>({
    queryKey: ['contacts', currentOrgId],
    queryFn: () => client.listContacts(currentOrgId!),
    enabled: isReady && !!currentOrgId,
  });

  const { data: contracts = [], isLoading: contractsLoading } = useQuery<Contract[]>({
    queryKey: ['contracts', currentOrgId],
    queryFn: () => client.listContracts(currentOrgId!),
    enabled: isReady && !!currentOrgId,
  });

  const { data: activities = [], isLoading: activitiesLoading } = useQuery<Activity[]>({
    queryKey: ['activities', currentOrgId],
    queryFn: () => client.listActivities(currentOrgId!),
    enabled: isReady && !!currentOrgId,
  });

  // Fetch Kanban boards for pipeline data - let TypeScript infer the type
  const { data: boards = [], isLoading: boardsLoading } = useQuery({
    queryKey: ['kanbanBoards', currentOrgId],
    queryFn: async () => {
      if (!currentOrgId) return [];
      return await client.listKanbanBoards(currentOrgId);
    },
    enabled: isReady && !!currentOrgId,
  });

  // Fetch all cards from all boards - let TypeScript infer the type
  const { data: allCardsData = [], isLoading: cardsLoading } = useQuery({
    queryKey: ['allKanbanCards', currentOrgId, boards.map(b => b.id)],
    queryFn: async () => {
      if (!currentOrgId || boards.length === 0) return [];
      
      // Fetch cards for all boards in parallel
      const cardPromises = boards.map(board => 
        client.listCardsByBoard(currentOrgId, board.id)
      );
      
      const cardArrays = await Promise.all(cardPromises);
      return cardArrays.flat();
    },
    enabled: isReady && !!currentOrgId && boards.length > 0,
  });

  const isLoading = contactsLoading || contractsLoading || activitiesLoading || boardsLoading || cardsLoading;

  // Compute metrics for current period (now using Kanban cards for pipeline)
  const metrics = useMemo(() => 
    computeDashboardMetrics(contacts, allCardsData, activities, contracts, dateRange),
    [contacts, allCardsData, activities, contracts, dateRange]
  );

  // Compute comparison periods
  const comparisonPeriods = useMemo(() => 
    getComparisonPeriods(dateRange),
    [dateRange]
  );

  // Compute previous period metrics
  const previousMetrics = useMemo(() => {
    const prevPeriod = comparisonPeriods?.previous || null;
    return computeDashboardMetrics(contacts, allCardsData, activities, contracts, prevPeriod);
  }, [contacts, allCardsData, activities, contracts, comparisonPeriods]);

  // Compute comparisons
  const mrrComparison = useMemo(() => 
    computeComparison(metrics.totalMRR, previousMetrics.totalMRR),
    [metrics.totalMRR, previousMetrics.totalMRR]
  );

  const pipelineComparison = useMemo(() => 
    computeComparison(metrics.openPipelineValue, previousMetrics.openPipelineValue),
    [metrics.openPipelineValue, previousMetrics.openPipelineValue]
  );

  const contactsComparison = useMemo(() => 
    computeComparison(metrics.totalContacts, previousMetrics.totalContacts),
    [metrics.totalContacts, previousMetrics.totalContacts]
  );

  const activitiesComparison = useMemo(() => 
    computeComparison(metrics.todayActivitiesCount, previousMetrics.todayActivitiesCount),
    [metrics.todayActivitiesCount, previousMetrics.todayActivitiesCount]
  );

  // Compute chart data
  const mrrTrendCurrent = useMemo(() => 
    computeMRRTrendData(contracts, dateRange),
    [contracts, dateRange]
  );

  const mrrTrendPrevious = useMemo(() => {
    const prevPeriod = comparisonPeriods?.previous || null;
    return computeMRRTrendData(contracts, prevPeriod);
  }, [contracts, comparisonPeriods]);

  const pipelineTrendCurrent = useMemo(() => 
    computePipelineTrendData(allCardsData, dateRange),
    [allCardsData, dateRange]
  );

  const pipelineTrendPrevious = useMemo(() => {
    const prevPeriod = comparisonPeriods?.previous || null;
    return computePipelineTrendData(allCardsData, prevPeriod);
  }, [allCardsData, comparisonPeriods]);

  const activityVolumeData = useMemo(() => 
    computeActivityVolumeData(activities, dateRange),
    [activities, dateRange]
  );

  const renewalsTrendData = useMemo(() => 
    computeRenewalsTrendData(contracts, dateRange),
    [contracts, dateRange]
  );

  const handleDateRangeChange = (filter: DateRangeFilter) => {
    setDateRange(filterToDateRange(filter));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Visão geral do seu negócio</p>
        </div>
        <DashboardDateRangeFilter value={dateRangeToFilter(dateRange)} onChange={handleDateRangeChange} />
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">MRR Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(metrics.totalMRR)}
            </div>
            <ComparisonKpiDelta comparison={mrrComparison} />
            <Sparkline data={mrrTrendCurrent} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pipeline Aberto</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(metrics.openPipelineValue)}
            </div>
            <ComparisonKpiDelta comparison={pipelineComparison} />
            <Sparkline data={pipelineTrendCurrent} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Contatos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalContacts}</div>
            <ComparisonKpiDelta comparison={contactsComparison} />
            <p className="text-xs text-muted-foreground mt-2">
              {metrics.activeLeadsCount} leads ativos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Atividades Hoje</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.todayActivitiesCount}</div>
            <ComparisonKpiDelta comparison={activitiesComparison} />
            <p className="text-xs text-muted-foreground mt-2">
              {metrics.openActivitiesCount} abertas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Evolução do MRR</CardTitle>
            <CardDescription>Comparação com período anterior</CardDescription>
          </CardHeader>
          <CardContent>
            <LineComparisonChart
              currentData={mrrTrendCurrent}
              previousData={mrrTrendPrevious}
              title="MRR"
              isCurrency={true}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pipeline</CardTitle>
            <CardDescription>Valor total em negociação</CardDescription>
          </CardHeader>
          <CardContent>
            <LineComparisonChart
              currentData={pipelineTrendCurrent}
              previousData={pipelineTrendPrevious}
              title="Pipeline"
              isCurrency={true}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Volume de Atividades</CardTitle>
            <CardDescription>Atividades criadas por mês</CardDescription>
          </CardHeader>
          <CardContent>
            <BarTrendChart
              data={activityVolumeData}
              title="Atividades"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Renovações</CardTitle>
            <CardDescription>Contratos com renovação próxima</CardDescription>
          </CardHeader>
          <CardContent>
            <BarTrendChart
              data={renewalsTrendData}
              title="Renovações"
            />
            {metrics.upcomingRenewalsCount > 0 && (
              <div className="mt-4 flex items-center gap-2 text-sm text-amber-600">
                <AlertCircle className="h-4 w-4" />
                <span>{metrics.upcomingRenewalsCount} renovações nos próximos 30 dias</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
