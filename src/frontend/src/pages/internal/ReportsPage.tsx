import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { BarChart3, Download, FileText, TrendingUp, Users, DollarSign, Calendar, Loader2 } from 'lucide-react';
import { useCurrentOrg } from '../../org/OrgProvider';
import { DashboardDateRangeFilter } from '../../components/dashboard/DashboardDateRangeFilter';
import { 
  useReportHistory, 
  useGenerateReport, 
  useDownloadReport, 
  useReportSchedules,
  useCreateReportSchedule,
  useUpdateReportSchedule,
  useDeleteReportSchedule,
} from '../../hooks/useReports';
import type { DateRangeFilter, ReportType, ReportFormat, ScheduleFrequency, ReportScheduleInput } from '../../types/reports';
import { toast } from 'sonner';
import { downloadReportFile, getMimeTypeForFormat, generateFilename } from '../../utils/reportDownload';
import { format } from 'date-fns';

export default function ReportsPage() {
  const { currentOrgId } = useCurrentOrg();
  const [selectedFormat, setSelectedFormat] = useState<ReportFormat>('pdf');
  const [dateRange, setDateRange] = useState<DateRangeFilter>({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    endDate: new Date(),
    preset: 'this-month',
  });
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  const [newSchedule, setNewSchedule] = useState<Partial<ReportScheduleInput>>({
    name: '',
    reportType: 'sales',
    format: 'pdf',
    frequency: 'monthly',
    timeOfDay: '09:00',
    enabled: true,
  });

  const { data: reportHistory = [], isLoading: historyLoading } = useReportHistory();
  const { data: schedules = [], isLoading: schedulesLoading } = useReportSchedules();
  const generateMutation = useGenerateReport();
  const downloadMutation = useDownloadReport();
  const createScheduleMutation = useCreateReportSchedule();
  const updateScheduleMutation = useUpdateReportSchedule();
  const deleteScheduleMutation = useDeleteReportSchedule();

  const reports = [
    {
      id: 'sales',
      name: 'Sales Report',
      description: 'Pipeline, conversions, and revenue',
      icon: <TrendingUp className="h-5 w-5" />,
      category: 'sales' as ReportType,
    },
    {
      id: 'finance',
      name: 'Financial Report',
      description: 'Revenue, expenses, and cash flow',
      icon: <DollarSign className="h-5 w-5" />,
      category: 'finance' as ReportType,
    },
    {
      id: 'customer_success',
      name: 'Customer Success Report',
      description: 'NPS, churn, and health scores',
      icon: <Users className="h-5 w-5" />,
      category: 'customer_success' as ReportType,
    },
    {
      id: 'projects',
      name: 'Projects Report',
      description: 'Status, deliverables, and project KPIs',
      icon: <FileText className="h-5 w-5" />,
      category: 'projects' as ReportType,
    },
  ];

  const handleGenerateReport = async (reportType: ReportType) => {
    if (!currentOrgId) {
      toast.error('No organization selected');
      return;
    }

    try {
      await generateMutation.mutateAsync({
        reportType,
        format: selectedFormat,
        filters: { dateRange },
        orgId: currentOrgId,
      });
      toast.success('Report generated successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to generate report');
    }
  };

  const handleDownloadReport = async (reportId: string, reportType: string, format: string) => {
    try {
      const { blob, filename, mimeType } = await downloadMutation.mutateAsync(reportId);
      downloadReportFile(blob, filename, mimeType);
      toast.success('Report downloaded');
    } catch (error: any) {
      toast.error(error.message || 'Failed to download report');
    }
  };

  const handleCreateSchedule = async () => {
    if (!currentOrgId || !newSchedule.name || !newSchedule.reportType) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      await createScheduleMutation.mutateAsync({
        name: newSchedule.name,
        reportType: newSchedule.reportType,
        format: newSchedule.format || 'pdf',
        frequency: newSchedule.frequency || 'monthly',
        timeOfDay: newSchedule.timeOfDay || '09:00',
        dayOfWeek: newSchedule.dayOfWeek,
        dayOfMonth: newSchedule.dayOfMonth,
        customCron: newSchedule.customCron,
        filters: { dateRange },
        enabled: newSchedule.enabled ?? true,
      });
      toast.success('Schedule created successfully');
      setScheduleDialogOpen(false);
      setNewSchedule({
        name: '',
        reportType: 'sales',
        format: 'pdf',
        frequency: 'monthly',
        timeOfDay: '09:00',
        enabled: true,
      });
    } catch (error: any) {
      toast.error(error.message || 'Failed to create schedule');
    }
  };

  const handleToggleSchedule = async (scheduleId: string, currentEnabled: boolean) => {
    try {
      await updateScheduleMutation.mutateAsync({
        scheduleId,
        updates: { enabled: !currentEnabled },
      });
      toast.success(currentEnabled ? 'Schedule disabled' : 'Schedule enabled');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update schedule');
    }
  };

  const handleDeleteSchedule = async (scheduleId: string) => {
    try {
      await deleteScheduleMutation.mutateAsync(scheduleId);
      toast.success('Schedule deleted');
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete schedule');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Reports & Exports</h1>
        <p className="text-muted-foreground">Generate reports and export data for analysis</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reports Generated</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reportHistory.length}</div>
            <p className="text-xs text-muted-foreground">Total</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Exports</CardTitle>
            <Download className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reportHistory.length}</div>
            <p className="text-xs text-muted-foreground">Available</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Formats</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2</div>
            <p className="text-xs text-muted-foreground">PDF, CSV</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Scheduled</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{schedules.filter(s => s.enabled).length}</div>
            <p className="text-xs text-muted-foreground">Active schedules</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="generate">
        <TabsList>
          <TabsTrigger value="generate">Generate Report</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
        </TabsList>

        <TabsContent value="generate" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Configure Report</CardTitle>
              <CardDescription>
                Select date range and format to generate your report
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 mb-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Date Range</label>
                  <DashboardDateRangeFilter value={dateRange} onChange={setDateRange} />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Format</label>
                  <Select value={selectedFormat} onValueChange={(v) => setSelectedFormat(v as ReportFormat)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pdf">PDF</SelectItem>
                      <SelectItem value="csv">CSV</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {reports.map((report) => (
                  <Card key={report.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-primary/10 text-primary">
                            {report.icon}
                          </div>
                          <div>
                            <CardTitle className="text-base">{report.name}</CardTitle>
                            <CardDescription className="text-xs mt-1">
                              {report.description}
                            </CardDescription>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-end">
                        <Button 
                          size="sm" 
                          onClick={() => handleGenerateReport(report.category)}
                          disabled={generateMutation.isPending}
                        >
                          {generateMutation.isPending ? (
                            <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                          ) : (
                            <Download className="mr-2 h-3 w-3" />
                          )}
                          Generate
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Export History</CardTitle>
              <CardDescription>
                Access previously generated reports
              </CardDescription>
            </CardHeader>
            <CardContent>
              {historyLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : reportHistory.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No reports generated yet
                </div>
              ) : (
                <div className="space-y-3">
                  {reportHistory.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg hover:shadow-md transition-shadow">
                      <div className="flex items-center gap-4">
                        <div className="p-2 rounded-lg bg-muted">
                          <FileText className="h-5 w-5" />
                        </div>
                        <div>
                          <h4 className="font-medium capitalize">{item.reportType.replace('_', ' ')} Report</h4>
                          <div className="flex items-center gap-3 mt-1">
                            <Badge variant="outline" className="text-xs uppercase">
                              {item.format}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {format(item.generatedAt, 'MMM d, yyyy HH:mm')}
                            </span>
                            {item.fileSize && (
                              <span className="text-xs text-muted-foreground">{item.fileSize}</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleDownloadReport(item.id, item.reportType, item.format)}
                        disabled={downloadMutation.isPending}
                      >
                        {downloadMutation.isPending ? (
                          <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                        ) : (
                          <Download className="mr-2 h-3 w-3" />
                        )}
                        Download
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scheduled" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Scheduled Reports</CardTitle>
              <CardDescription>
                Configure reports to be generated automatically
              </CardDescription>
            </CardHeader>
            <CardContent>
              {schedulesLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <div className="space-y-4">
                  {schedules.map((schedule) => (
                    <div key={schedule.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-medium">{schedule.name}</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          {schedule.frequency.charAt(0).toUpperCase() + schedule.frequency.slice(1)} at {schedule.timeOfDay} UTC • Format: {schedule.format.toUpperCase()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={schedule.enabled}
                          onCheckedChange={() => handleToggleSchedule(schedule.id, schedule.enabled)}
                        />
                        <Badge variant={schedule.enabled ? 'default' : 'secondary'}>
                          {schedule.enabled ? 'Active' : 'Paused'}
                        </Badge>
                      </div>
                    </div>
                  ))}

                  <Dialog open={scheduleDialogOpen} onOpenChange={setScheduleDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="w-full" variant="outline">
                        <Calendar className="mr-2 h-4 w-4" />
                        Schedule New Report
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Schedule Report</DialogTitle>
                        <DialogDescription>
                          Configure automatic report generation
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="schedule-name">Schedule Name</Label>
                          <Input
                            id="schedule-name"
                            placeholder="e.g., Monthly Sales Report"
                            value={newSchedule.name}
                            onChange={(e) => setNewSchedule({ ...newSchedule, name: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="report-type">Report Type</Label>
                          <Select
                            value={newSchedule.reportType}
                            onValueChange={(v) => setNewSchedule({ ...newSchedule, reportType: v as ReportType })}
                          >
                            <SelectTrigger id="report-type">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="sales">Sales</SelectItem>
                              <SelectItem value="finance">Finance</SelectItem>
                              <SelectItem value="customer_success">Customer Success</SelectItem>
                              <SelectItem value="projects">Projects</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="format">Format</Label>
                            <Select
                              value={newSchedule.format}
                              onValueChange={(v) => setNewSchedule({ ...newSchedule, format: v as ReportFormat })}
                            >
                              <SelectTrigger id="format">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pdf">PDF</SelectItem>
                                <SelectItem value="csv">CSV</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="frequency">Frequency</Label>
                            <Select
                              value={newSchedule.frequency}
                              onValueChange={(v) => setNewSchedule({ ...newSchedule, frequency: v as ScheduleFrequency })}
                            >
                              <SelectTrigger id="frequency">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="daily">Daily</SelectItem>
                                <SelectItem value="weekly">Weekly</SelectItem>
                                <SelectItem value="monthly">Monthly</SelectItem>
                                <SelectItem value="custom">Custom</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="time">Time (UTC)</Label>
                          <Input
                            id="time"
                            type="time"
                            value={newSchedule.timeOfDay}
                            onChange={(e) => setNewSchedule({ ...newSchedule, timeOfDay: e.target.value })}
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setScheduleDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button 
                          onClick={handleCreateSchedule}
                          disabled={createScheduleMutation.isPending}
                        >
                          {createScheduleMutation.isPending ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : null}
                          Create Schedule
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
