import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useStage1Client } from './useStage1Client';
import { useCurrentOrg } from '../org/OrgProvider';
import type { 
  ReportHistoryItem, 
  ReportSchedule, 
  ReportScheduleInput, 
  GenerateReportInput 
} from '../types/reports';

export function useReportHistory() {
  const { client, isReady } = useStage1Client();
  const { currentOrgId } = useCurrentOrg();

  return useQuery<ReportHistoryItem[]>({
    queryKey: ['reportHistory', currentOrgId],
    queryFn: async () => {
      if (!currentOrgId) return [];
      return client.listReportHistory(currentOrgId);
    },
    enabled: isReady && !!currentOrgId,
  });
}

export function useGenerateReport() {
  const { client } = useStage1Client();
  const queryClient = useQueryClient();
  const { currentOrgId } = useCurrentOrg();

  return useMutation({
    mutationFn: async (input: GenerateReportInput) => {
      return client.generateReport(input);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reportHistory', currentOrgId] });
    },
  });
}

export function useDownloadReport() {
  const { client } = useStage1Client();

  return useMutation({
    mutationFn: async (reportId: string) => {
      return client.downloadReport(reportId);
    },
  });
}

export function useReportSchedules() {
  const { client, isReady } = useStage1Client();
  const { currentOrgId } = useCurrentOrg();

  return useQuery<ReportSchedule[]>({
    queryKey: ['reportSchedules', currentOrgId],
    queryFn: async () => {
      if (!currentOrgId) return [];
      return client.listReportSchedules(currentOrgId);
    },
    enabled: isReady && !!currentOrgId,
  });
}

export function useCreateReportSchedule() {
  const { client } = useStage1Client();
  const queryClient = useQueryClient();
  const { currentOrgId } = useCurrentOrg();

  return useMutation({
    mutationFn: async (input: ReportScheduleInput) => {
      if (!currentOrgId) throw new Error('No organization selected');
      return client.createReportSchedule(currentOrgId, input);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reportSchedules', currentOrgId] });
    },
  });
}

export function useUpdateReportSchedule() {
  const { client } = useStage1Client();
  const queryClient = useQueryClient();
  const { currentOrgId } = useCurrentOrg();

  return useMutation({
    mutationFn: async ({ scheduleId, updates }: { scheduleId: string; updates: Partial<ReportScheduleInput> }) => {
      return client.updateReportSchedule(scheduleId, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reportSchedules', currentOrgId] });
    },
  });
}

export function useDeleteReportSchedule() {
  const { client } = useStage1Client();
  const queryClient = useQueryClient();
  const { currentOrgId } = useCurrentOrg();

  return useMutation({
    mutationFn: async (scheduleId: string) => {
      return client.deleteReportSchedule(scheduleId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reportSchedules', currentOrgId] });
    },
  });
}
