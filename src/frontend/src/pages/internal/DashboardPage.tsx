import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useStage1Client } from '../../hooks/useStage1Client';
import { useCurrentOrg } from '../../org/OrgProvider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Users, DollarSign, FileText, Calendar, CheckCircle2 } from 'lucide-react';

export default function DashboardPage() {
  const { client, isReady } = useStage1Client();
  const { currentOrgId } = useCurrentOrg();

  const { data: contacts } = useQuery({
    queryKey: ['contacts', currentOrgId],
    queryFn: () => client.listContacts(currentOrgId!),
    enabled: isReady && !!currentOrgId,
  });

  const { data: deals } = useQuery({
    queryKey: ['deals', currentOrgId],
    queryFn: () => client.listDeals(currentOrgId!),
    enabled: isReady && !!currentOrgId,
  });

  const { data: contracts } = useQuery({
    queryKey: ['contracts', currentOrgId],
    queryFn: () => client.listContracts(currentOrgId!),
    enabled: isReady && !!currentOrgId,
  });

  const { data: activities } = useQuery({
    queryKey: ['activities', currentOrgId],
    queryFn: () => client.listActivities(currentOrgId!),
    enabled: isReady && !!currentOrgId,
  });

  const activeContracts = contracts?.filter(c => c.status === 'active') || [];
  const totalMRR = activeContracts.reduce((sum, c) => sum + c.mrr, 0);
  const openDeals = deals?.filter(d => d.status === 'open') || [];
  const totalPipeline = openDeals.reduce((sum, d) => sum + d.value, 0);
  const todayActivities = activities?.filter(a => {
    const today = new Date().toDateString();
    return new Date(a.dueDate).toDateString() === today && a.status === 'open';
  }) || [];

  const recentActivities = activities?.slice(0, 5) || [];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Dashboard</h1>
        <p className="text-muted-foreground font-medium">Visão geral do seu negócio</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">MRR Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{formatCurrency(totalMRR)}</div>
            <p className="text-xs text-muted-foreground font-normal">
              {activeContracts.length} contratos ativos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Contatos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{contacts?.length || 0}</div>
            <p className="text-xs text-muted-foreground font-normal">
              {contacts?.filter(c => c.status === 'lead').length || 0} leads ativos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pipeline</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{formatCurrency(totalPipeline)}</div>
            <p className="text-xs text-muted-foreground font-normal">
              {openDeals.length} oportunidades abertas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Atividades Hoje</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{todayActivities.length}</div>
            <p className="text-xs text-muted-foreground font-normal">
              {activities?.filter(a => a.status === 'open').length || 0} abertas no total
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="font-semibold">Atividades Recentes</CardTitle>
            <CardDescription className="font-medium">Últimas interações e tarefas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.length > 0 ? (
                recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-center gap-4">
                    <div className={`h-2 w-2 rounded-full ${activity.status === 'done' ? 'bg-accent' : 'bg-primary'}`} />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{activity.notes || 'Atividade'}</p>
                      <p className="text-xs text-muted-foreground font-normal">{formatDate(activity.dueDate)}</p>
                    </div>
                    {activity.status === 'done' && (
                      <CheckCircle2 className="h-4 w-4 text-accent" />
                    )}
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground font-normal">Nenhuma atividade recente</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-semibold">Contratos por Renovar</CardTitle>
            <CardDescription className="font-medium">Próximas renovações (30 dias)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activeContracts
                .filter(c => {
                  const daysUntil = Math.ceil((new Date(c.renewalDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                  return daysUntil <= 30 && daysUntil > 0;
                })
                .slice(0, 5)
                .map((contract) => {
                  const daysUntil = Math.ceil((new Date(contract.renewalDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                  return (
                    <div key={contract.id} className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">{contract.name}</p>
                        <p className="text-xs text-muted-foreground font-normal">{formatCurrency(contract.mrr)}/mês</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{daysUntil} dias</p>
                        <p className="text-xs text-muted-foreground font-normal">
                          {new Intl.DateTimeFormat('pt-BR').format(new Date(contract.renewalDate))}
                        </p>
                      </div>
                    </div>
                  );
                })}
              {activeContracts.filter(c => {
                const daysUntil = Math.ceil((new Date(c.renewalDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                return daysUntil <= 30 && daysUntil > 0;
              }).length === 0 && (
                <p className="text-sm text-muted-foreground font-normal">Nenhuma renovação próxima</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
