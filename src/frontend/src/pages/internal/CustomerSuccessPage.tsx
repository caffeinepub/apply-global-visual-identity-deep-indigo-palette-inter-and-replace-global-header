import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useStage1Client } from '../../hooks/useStage1Client';
import { useCurrentOrg } from '../../org/OrgProvider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { QueryBoundary } from '../../components/states/QueryBoundary';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Plus, TrendingUp, TrendingDown, AlertTriangle, Smile, Loader2, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import type { NpsCampaign } from '../../types/model';
import { NpsResponseDialog } from './customer-success/NpsResponseDialog';

export default function CustomerSuccessPage() {
  const { client, isReady } = useStage1Client();
  const { currentOrgId } = useCurrentOrg();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isNpsDialogOpen, setIsNpsDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'health' | 'nps' | 'churn'>('health');

  // Period filter state (default: last 3 months)
  const [periodStart, setPeriodStart] = useState<string>(() => {
    const date = new Date();
    date.setMonth(date.getMonth() - 3);
    return date.toISOString().split('T')[0];
  });
  const [periodEnd, setPeriodEnd] = useState<string>(() => {
    return new Date().toISOString().split('T')[0];
  });

  // Form state for campaign creation
  const [formData, setFormData] = useState({
    periodKey: '',
  });

  const { data: contracts } = useQuery({
    queryKey: ['contracts', currentOrgId],
    queryFn: () => client.listContracts(currentOrgId!),
    enabled: isReady && !!currentOrgId,
  });

  const { data: contacts } = useQuery({
    queryKey: ['contacts', currentOrgId],
    queryFn: () => client.listContacts(currentOrgId!),
    enabled: isReady && !!currentOrgId,
  });

  const { data: campaigns, isLoading: campaignsLoading, isError: campaignsError, error: campaignsErrorObj } = useQuery({
    queryKey: ['npsCampaigns', currentOrgId],
    queryFn: () => client.listNpsCampaigns(currentOrgId!),
    enabled: isReady && !!currentOrgId,
  });

  // Fetch NPS responses for the selected period
  const { data: npsResponses } = useQuery({
    queryKey: ['npsResponses', currentOrgId, periodStart, periodEnd],
    queryFn: () => client.listNpsResponses(
      currentOrgId!,
      new Date(periodStart),
      new Date(periodEnd)
    ),
    enabled: isReady && !!currentOrgId && !!periodStart && !!periodEnd,
  });

  const activeCampaign = useMemo(() => {
    return campaigns?.find(c => c.status === 'active');
  }, [campaigns]);

  const createCampaignMutation = useMutation({
    mutationFn: async (campaign: Partial<NpsCampaign>) => {
      return client.createNpsCampaign(currentOrgId!, campaign);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['npsCampaigns', currentOrgId] });
      toast.success('Campanha NPS criada com sucesso!');
      setIsDialogOpen(false);
      setFormData({ periodKey: '' });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao criar campanha NPS');
    },
  });

  const createNpsResponseMutation = useMutation({
    mutationFn: async (response: { contactId: string; score: number; comment: string }) => {
      if (!activeCampaign) {
        throw new Error('Nenhuma campanha ativa encontrada');
      }
      return client.createNpsResponse(currentOrgId!, {
        campaignId: activeCampaign.id,
        contactId: response.contactId,
        score: response.score,
        comment: response.comment,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['npsResponses', currentOrgId, periodStart, periodEnd] });
      toast.success('Resposta NPS submetida com sucesso!');
      setIsNpsDialogOpen(false);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao submeter resposta NPS');
    },
  });

  const handleSubmit = () => {
    if (!formData.periodKey) {
      toast.error('Por favor, selecione um período');
      return;
    }

    createCampaignMutation.mutate({
      periodKey: formData.periodKey,
      status: 'active',
    });
  };

  const handleNpsSubmit = (data: { contactId: string; score: number; comment: string }) => {
    if (!data.contactId) {
      toast.error('Por favor, selecione um cliente');
      return;
    }
    if (isNaN(data.score) || data.score < 0 || data.score > 10) {
      toast.error('A pontuação deve estar entre 0 e 10');
      return;
    }

    createNpsResponseMutation.mutate(data);
  };

  // Calculate metrics based on NPS responses and contracts for the selected period
  const metrics = useMemo(() => {
    if (!npsResponses || !contracts) {
      return {
        avgNps: 0,
        healthyClients: 0,
        atRiskClients: 0,
        churnRate: 0,
      };
    }

    // Average NPS: mean of all scores in period
    const avgNps = npsResponses.length > 0
      ? Math.round(npsResponses.reduce((sum, r) => sum + r.score, 0) / npsResponses.length)
      : 0;

    // Healthy/At-risk: based on NPS score < 7
    const healthyClients = npsResponses.filter(r => r.score >= 7).length;
    const atRiskClients = npsResponses.filter(r => r.score < 7).length;

    // Churn rate: contracts canceled within the period / total contracts active at period start
    // Definition: periodCanceledContracts / periodTotalContracts
    const periodStartDate = new Date(periodStart);
    const periodEndDate = new Date(periodEnd);
    
    const contractsActiveAtStart = contracts.filter(c => 
      new Date(c.startDate) <= periodStartDate
    );
    
    const contractsCanceledInPeriod = contracts.filter(c => 
      c.status === 'canceled' && 
      c.cancelDate && 
      new Date(c.cancelDate) >= periodStartDate && 
      new Date(c.cancelDate) <= periodEndDate
    );

    const churnRate = contractsActiveAtStart.length > 0
      ? (contractsCanceledInPeriod.length / contractsActiveAtStart.length) * 100
      : 0;

    return {
      avgNps,
      healthyClients,
      atRiskClients,
      churnRate: Math.round(churnRate * 10) / 10,
    };
  }, [npsResponses, contracts, periodStart, periodEnd]);

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(new Date(date));
  };

  const formatPeriodLabel = () => {
    const start = new Date(periodStart);
    const end = new Date(periodEnd);
    return `${formatDate(start)} - ${formatDate(end)}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Customer Success</h1>
          <p className="text-muted-foreground">Monitore a saúde dos clientes, NPS e churn</p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => setIsNpsDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Submeter NPS
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-2 justify-end">
        <Calendar className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">Período:</span>
        <Input
          type="date"
          value={periodStart}
          onChange={(e) => setPeriodStart(e.target.value)}
          className="w-40"
        />
        <span className="text-sm text-muted-foreground">até</span>
        <Input
          type="date"
          value={periodEnd}
          onChange={(e) => setPeriodEnd(e.target.value)}
          className="w-40"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pontuação NPS</CardTitle>
            <Smile className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{metrics.avgNps}</div>
            <p className="text-xs text-muted-foreground">
              {metrics.avgNps >= 70 ? 'Excelente' : metrics.avgNps >= 50 ? 'Bom' : metrics.avgNps >= 30 ? 'Regular' : 'Precisa melhorar'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clientes Saudáveis</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.healthyClients}</div>
            <p className="text-xs text-muted-foreground">NPS ≥ 7</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Em Risco</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{metrics.atRiskClients}</div>
            <p className="text-xs text-muted-foreground">NPS &lt; 7</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Churn</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.churnRate}%</div>
            <p className="text-xs text-muted-foreground">{formatPeriodLabel()}</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'health' | 'nps' | 'churn')}>
        <TabsList>
          <TabsTrigger value="health">Saúde do Cliente</TabsTrigger>
          <TabsTrigger value="nps">NPS</TabsTrigger>
          <TabsTrigger value="churn">Churn</TabsTrigger>
        </TabsList>

        <TabsContent value="health" className="mt-6">
          <div className="space-y-3">
            {npsResponses && npsResponses.length > 0 ? (
              npsResponses.map((response) => {
                const contact = contacts?.find(c => c.id === response.contactId);
                const isAtRisk = response.score < 7;
                
                return (
                  <Card key={response.id} className={`hover:shadow-md transition-shadow ${isAtRisk ? 'border-orange-500' : ''}`}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 flex-1">
                          {isAtRisk ? (
                            <AlertTriangle className="h-5 w-5 text-orange-600" />
                          ) : (
                            <TrendingUp className="h-5 w-5 text-green-600" />
                          )}
                          <div className="flex-1">
                            <p className="font-medium">{contact?.name || 'Cliente Desconhecido'}</p>
                            <p className="text-sm text-muted-foreground">
                              Pontuação NPS: {response.score} • {formatDate(response.createdAt)}
                            </p>
                            {response.comment && (
                              <p className="text-sm text-muted-foreground mt-1 italic">"{response.comment}"</p>
                            )}
                          </div>
                        </div>
                        <Badge variant={isAtRisk ? 'destructive' : 'default'}>
                          {isAtRisk ? 'Em Risco' : 'Saudável'}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <p className="text-muted-foreground">Nenhuma resposta NPS para o período selecionado</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="nps" className="mt-6">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-muted-foreground">Campanhas e Respostas NPS</p>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Nova Campanha
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[400px]">
                <DialogHeader>
                  <DialogTitle>Nova Campanha NPS</DialogTitle>
                  <DialogDescription>
                    Crie uma nova campanha para coletar feedback dos clientes
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="period">Período (AAAA-MM)</Label>
                    <Input 
                      id="period" 
                      type="month"
                      value={formData.periodKey}
                      onChange={(e) => setFormData({ periodKey: e.target.value })}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={createCampaignMutation.isPending}>
                    Cancelar
                  </Button>
                  <Button onClick={handleSubmit} disabled={createCampaignMutation.isPending}>
                    {createCampaignMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Criar Campanha
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <QueryBoundary
            isLoading={campaignsLoading}
            isError={campaignsError}
            error={campaignsErrorObj as Error}
            isEmpty={!campaigns || campaigns.length === 0}
            emptyTitle="Nenhuma campanha NPS"
            emptyDescription="Crie sua primeira campanha para começar a coletar feedback dos clientes"
          >
            <div className="space-y-3">
              {campaigns?.map((campaign) => (
                <Card key={campaign.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{campaign.periodKey}</p>
                        <p className="text-sm text-muted-foreground">
                          Criada em {formatDate(campaign.createdAt)}
                        </p>
                      </div>
                      <Badge variant={campaign.status === 'active' ? 'default' : 'secondary'}>
                        {campaign.status === 'active' ? 'Ativa' : 'Inativa'}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </QueryBoundary>
        </TabsContent>

        <TabsContent value="churn" className="mt-6">
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">
                Taxa de churn: {metrics.churnRate}% no período selecionado
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Baseado em contratos cancelados durante o período
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <NpsResponseDialog
        open={isNpsDialogOpen}
        onOpenChange={setIsNpsDialogOpen}
        contacts={contacts}
        onSubmit={handleNpsSubmit}
        isPending={createNpsResponseMutation.isPending}
        hasActiveCampaign={!!activeCampaign}
      />
    </div>
  );
}
