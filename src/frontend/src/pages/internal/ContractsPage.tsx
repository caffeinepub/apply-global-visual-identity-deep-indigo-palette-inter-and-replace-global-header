import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useStage1Client } from '../../hooks/useStage1Client';
import { useCurrentOrg } from '../../org/OrgProvider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { QueryBoundary } from '../../components/states/QueryBoundary';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, FileText, DollarSign, Calendar, TrendingUp } from 'lucide-react';
import type { Contract, ContractStatus } from '../../types/model';

const statusLabels: Record<ContractStatus, string> = {
  active: 'Ativo',
  paused: 'Pausado',
  canceled: 'Cancelado',
};

const statusColors: Record<ContractStatus, 'default' | 'secondary' | 'destructive'> = {
  active: 'default',
  paused: 'secondary',
  canceled: 'destructive',
};

export default function ContractsPage() {
  const { client, isReady } = useStage1Client();
  const { currentOrgId } = useCurrentOrg();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<ContractStatus | 'all'>('all');

  const { data: contracts, isLoading, isError, error } = useQuery({
    queryKey: ['contracts', currentOrgId],
    queryFn: () => client.listContracts(currentOrgId!),
    enabled: isReady && !!currentOrgId,
  });

  const { data: contacts } = useQuery({
    queryKey: ['contacts', currentOrgId],
    queryFn: () => client.listContacts(currentOrgId!),
    enabled: isReady && !!currentOrgId,
  });

  const filteredContracts = contracts?.filter(c => 
    statusFilter === 'all' || c.status === statusFilter
  ) || [];

  const activeContracts = contracts?.filter(c => c.status === 'active') || [];
  const totalMRR = activeContracts.reduce((sum, c) => sum + c.mrr, 0);
  const avgMRR = activeContracts.length > 0 ? totalMRR / activeContracts.length : 0;

  const getContactName = (contactId: string) => {
    return contacts?.find(c => c.id === contactId)?.name || 'Cliente';
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(new Date(date));
  };

  const getDaysUntilRenewal = (renewalDate: Date) => {
    const today = new Date();
    const renewal = new Date(renewalDate);
    const diffTime = renewal.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Contratos Recorrentes</h1>
          <p className="text-muted-foreground">Gerencie seus contratos e receita recorrente</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Novo Contrato
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Novo Contrato</DialogTitle>
              <DialogDescription>
                Adicione um novo contrato recorrente
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Nome do contrato</Label>
                <Input id="name" placeholder="Consultoria Mensal - Cliente X" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="contact">Cliente</Label>
                <Select>
                  <SelectTrigger id="contact">
                    <SelectValue placeholder="Selecione um cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    {contacts?.map((contact) => (
                      <SelectItem key={contact.id} value={contact.id}>
                        {contact.name} - {contact.company}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="mrr">MRR - Receita Mensal (R$)</Label>
                <Input id="mrr" type="number" placeholder="3500" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="startDate">Data de início</Label>
                <Input id="startDate" type="date" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="renewalDate">Data de renovação</Label>
                <Input id="renewalDate" type="date" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={() => setIsDialogOpen(false)}>
                Criar Contrato
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Contratos Ativos</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeContracts.length}</div>
            <p className="text-xs text-muted-foreground">
              {contracts?.filter(c => c.status === 'paused').length || 0} pausados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">MRR Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalMRR)}
            </div>
            <p className="text-xs text-muted-foreground">Receita mensal recorrente</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">MRR Médio</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(avgMRR)}
            </div>
            <p className="text-xs text-muted-foreground">Por contrato ativo</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Renovações</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {activeContracts.filter(c => getDaysUntilRenewal(c.renewalDate) <= 30).length}
            </div>
            <p className="text-xs text-muted-foreground">Próximos 30 dias</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center gap-4">
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as ContractStatus | 'all')}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filtrar por status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os status</SelectItem>
            <SelectItem value="active">Ativos</SelectItem>
            <SelectItem value="paused">Pausados</SelectItem>
            <SelectItem value="canceled">Cancelados</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <QueryBoundary
        isLoading={isLoading}
        isError={isError}
        error={error as Error}
        isEmpty={filteredContracts.length === 0}
        emptyTitle="Nenhum contrato encontrado"
        emptyDescription={statusFilter !== 'all' 
          ? "Tente ajustar o filtro de status" 
          : "Adicione seu primeiro contrato para começar"}
      >
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredContracts.map((contract) => {
            const daysUntilRenewal = getDaysUntilRenewal(contract.renewalDate);
            const isRenewalSoon = daysUntilRenewal <= 30 && daysUntilRenewal > 0;
            
            return (
              <Card key={contract.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg line-clamp-2">{contract.name}</CardTitle>
                    <Badge variant={statusColors[contract.status]}>
                      {statusLabels[contract.status]}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-sm text-muted-foreground">Cliente</p>
                    <p className="font-medium">{getContactName(contract.contactId)}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-muted-foreground">MRR</p>
                    <p className="text-xl font-bold text-primary">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(contract.mrr)}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2 border-t">
                    <div>
                      <p className="text-xs text-muted-foreground">Início</p>
                      <p className="text-sm font-medium">{formatDate(contract.startDate)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Renovação</p>
                      <p className={`text-sm font-medium ${isRenewalSoon ? 'text-orange-600' : ''}`}>
                        {formatDate(contract.renewalDate)}
                      </p>
                    </div>
                  </div>

                  {isRenewalSoon && contract.status === 'active' && (
                    <div className="pt-2 border-t">
                      <Badge variant="outline" className="text-orange-600 border-orange-600">
                        Renovação em {daysUntilRenewal} dias
                      </Badge>
                    </div>
                  )}

                  {contract.status === 'canceled' && contract.cancelReason && (
                    <div className="pt-2 border-t">
                      <p className="text-xs text-muted-foreground">Motivo do cancelamento</p>
                      <p className="text-sm">{contract.cancelReason}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </QueryBoundary>
    </div>
  );
}
