import React, { useState } from 'react';
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
import { Plus, TrendingUp, TrendingDown, AlertTriangle, Smile, Frown, Meh, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import type { NpsCampaign } from '../../types/model';

export default function CustomerSuccessPage() {
  const { client, isReady } = useStage1Client();
  const { currentOrgId } = useCurrentOrg();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'health' | 'nps' | 'churn'>('health');

  // Form state
  const [formData, setFormData] = useState({
    periodKey: '',
  });

  const { data: contracts } = useQuery({
    queryKey: ['contracts', currentOrgId],
    queryFn: () => client.listContracts(currentOrgId!),
    enabled: isReady && !!currentOrgId,
  });

  const { data: campaigns, isLoading: campaignsLoading, isError: campaignsError, error: campaignsErrorObj } = useQuery({
    queryKey: ['npsCampaigns', currentOrgId],
    queryFn: () => client.listNpsCampaigns(currentOrgId!),
    enabled: isReady && !!currentOrgId,
  });

  const createCampaignMutation = useMutation({
    mutationFn: async (campaign: Partial<NpsCampaign>) => {
      return client.createNpsCampaign(currentOrgId!, campaign);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['npsCampaigns', currentOrgId] });
      toast.success('Campanha de NPS criada com sucesso!');
      setIsDialogOpen(false);
      setFormData({ periodKey: '' });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao criar campanha de NPS');
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

  const activeContracts = contracts?.filter(c => c.status === 'active') || [];
  const healthyClients = activeContracts.filter(c => {
    const daysSinceStart = Math.floor((Date.now() - new Date(c.startDate).getTime()) / (1000 * 60 * 60 * 24));
    return daysSinceStart > 30;
  }).length;
  const atRiskClients = activeContracts.filter(c => {
    const daysUntilRenewal = Math.floor((new Date(c.renewalDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return daysUntilRenewal <= 30 && daysUntilRenewal > 0;
  }).length;

  const mockNpsScore = 72;
  const mockChurnRate = 5.2;

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(new Date(date));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Sucesso do Cliente</h1>
          <p className="text-muted-foreground">Monitore saúde, NPS e churn dos clientes</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">NPS Score</CardTitle>
            <Smile className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{mockNpsScore}</div>
            <p className="text-xs text-muted-foreground">Excelente</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clientes Saudáveis</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{healthyClients}</div>
            <p className="text-xs text-muted-foreground">De {activeContracts.length} ativos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Em Risco</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{atRiskClients}</div>
            <p className="text-xs text-muted-foreground">Renovação próxima</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Churn</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockChurnRate}%</div>
            <p className="text-xs text-muted-foreground">Últimos 3 meses</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'health' | 'nps' | 'churn')}>
        <TabsList>
          <TabsTrigger value="health">Saúde dos Clientes</TabsTrigger>
          <TabsTrigger value="nps">NPS</TabsTrigger>
          <TabsTrigger value="churn">Churn</TabsTrigger>
        </TabsList>

        <TabsContent value="health" className="mt-6">
          <div className="space-y-3">
            {activeContracts.map((contract) => {
              const daysUntilRenewal = Math.floor((new Date(contract.renewalDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
              const isAtRisk = daysUntilRenewal <= 30 && daysUntilRenewal > 0;
              
              return (
                <Card key={contract.id} className={`hover:shadow-md transition-shadow ${isAtRisk ? 'border-orange-500' : ''}`}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        {isAtRisk ? (
                          <AlertTriangle className="h-5 w-5 text-orange-600" />
                        ) : (
                          <TrendingUp className="h-5 w-5 text-green-600" />
                        )}
                        <div className="flex-1">
                          <p className="font-medium">{contract.name}</p>
                          <p className="text-sm text-muted-foreground">
                            Renovação: {formatDate(contract.renewalDate)}
                            {isAtRisk && ` (${daysUntilRenewal} dias)`}
                          </p>
                        </div>
                      </div>
                      <Badge variant={isAtRisk ? 'destructive' : 'default'}>
                        {isAtRisk ? 'Em Risco' : 'Saudável'}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="nps" className="mt-6">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-muted-foreground">Campanhas de NPS</p>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Nova Campanha
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[400px]">
                <DialogHeader>
                  <DialogTitle>Nova Campanha de NPS</DialogTitle>
                  <DialogDescription>
                    Crie uma nova campanha para coletar feedback dos clientes
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="period">Período (YYYY-MM)</Label>
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
            emptyTitle="Nenhuma campanha de NPS"
            emptyDescription="Crie uma campanha para começar a coletar feedback dos clientes"
          >
            <div className="space-y-3">
              {campaigns?.map((campaign) => (
                <Card key={campaign.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <Smile className="h-5 w-5 text-muted-foreground" />
                        <div className="flex-1">
                          <p className="font-medium">Campanha {campaign.periodKey}</p>
                          <p className="text-sm text-muted-foreground">
                            Criada em {formatDate(campaign.createdAt)}
                          </p>
                        </div>
                      </div>
                      <Badge variant={campaign.status === 'active' ? 'default' : 'secondary'}>
                        {campaign.status === 'active' ? 'Ativa' : 'Fechada'}
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
            <CardHeader>
              <CardTitle>Análise de Churn</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <span className="text-sm font-medium">Preço</span>
                  <span className="text-sm">35%</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <span className="text-sm font-medium">Falta de uso</span>
                  <span className="text-sm">28%</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <span className="text-sm font-medium">Suporte</span>
                  <span className="text-sm">20%</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <span className="text-sm font-medium">Outros</span>
                  <span className="text-sm">17%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
