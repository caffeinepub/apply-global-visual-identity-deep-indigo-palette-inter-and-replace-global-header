import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { useStage1Client } from '../../hooks/useStage1Client';
import { useCurrentOrg } from '../../org/OrgProvider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { QueryBoundary } from '../../components/states/QueryBoundary';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, DollarSign, TrendingUp, MoreVertical, Pencil, Trash2, Eye } from 'lucide-react';
import { toast } from 'sonner';
import type { Deal, DealStage, DealStatus } from '../../types/model';

const stageLabels: Record<DealStage, string> = {
  'Lead': 'Lead',
  'Qualificação': 'Qualificação',
  'Proposta': 'Proposta',
  'Negociação': 'Negociação',
  'Fechado': 'Fechado',
};

export default function PipelinePage() {
  const { client, isReady } = useStage1Client();
  const { currentOrgId } = useCurrentOrg();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const [activeStage, setActiveStage] = useState<DealStage | 'all'>('all');

  const [createFormData, setCreateFormData] = useState({
    title: '',
    contactId: '',
    stage: 'Lead' as DealStage,
    value: '',
    probability: '50',
  });

  const [editFormData, setEditFormData] = useState({
    title: '',
    stage: 'Lead' as DealStage,
    value: '',
    probability: '50',
    status: 'open' as DealStatus,
  });

  const { data: deals, isLoading, isError, error } = useQuery({
    queryKey: ['deals', currentOrgId],
    queryFn: () => client.listDeals(currentOrgId!),
    enabled: isReady && !!currentOrgId,
  });

  const { data: contacts } = useQuery({
    queryKey: ['contacts', currentOrgId],
    queryFn: () => client.listContacts(currentOrgId!),
    enabled: isReady && !!currentOrgId,
  });

  const createDealMutation = useMutation({
    mutationFn: (deal: Partial<Deal>) => client.createDeal(currentOrgId!, deal),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deals', currentOrgId] });
      toast.success('Oportunidade criada com sucesso!');
      setIsCreateDialogOpen(false);
      setCreateFormData({ title: '', contactId: '', stage: 'Lead', value: '', probability: '50' });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao criar oportunidade');
    },
  });

  const updateDealMutation = useMutation({
    mutationFn: ({ dealId, deal }: { dealId: string; deal: Partial<Deal> }) => 
      client.updateDeal(dealId, deal),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deals', currentOrgId] });
      toast.success('Oportunidade atualizada com sucesso!');
      setIsEditDialogOpen(false);
      setSelectedDeal(null);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao atualizar oportunidade');
    },
  });

  const deleteDealMutation = useMutation({
    mutationFn: (dealId: string) => client.deleteDeal(dealId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deals', currentOrgId] });
      toast.success('Oportunidade excluída com sucesso!');
      setIsDeleteDialogOpen(false);
      setSelectedDeal(null);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao excluir oportunidade');
    },
  });

  const handleCreateSubmit = () => {
    if (!createFormData.title || !createFormData.contactId || !createFormData.value) {
      toast.error('Por favor, preencha todos os campos obrigatórios');
      return;
    }

    createDealMutation.mutate({
      title: createFormData.title,
      contactId: createFormData.contactId,
      stage: createFormData.stage,
      value: parseFloat(createFormData.value),
      probability: parseInt(createFormData.probability),
      status: 'open',
    });
  };

  const handleEditSubmit = () => {
    if (!selectedDeal || !editFormData.title || !editFormData.value) {
      toast.error('Por favor, preencha todos os campos obrigatórios');
      return;
    }

    updateDealMutation.mutate({
      dealId: selectedDeal.id,
      deal: {
        title: editFormData.title,
        stage: editFormData.stage,
        value: parseFloat(editFormData.value),
        probability: parseInt(editFormData.probability),
        status: editFormData.status,
      },
    });
  };

  const handleEdit = (deal: Deal) => {
    setSelectedDeal(deal);
    setEditFormData({
      title: deal.title,
      stage: deal.stage,
      value: deal.value.toString(),
      probability: deal.probability.toString(),
      status: deal.status,
    });
    setIsEditDialogOpen(true);
  };

  const handleDelete = (deal: Deal) => {
    setSelectedDeal(deal);
    setIsDeleteDialogOpen(true);
  };

  const handleViewDetails = (deal: Deal) => {
    navigate({ to: '/pipeline/$dealId', params: { dealId: deal.id } });
  };

  const filteredDeals = deals?.filter(d => 
    activeStage === 'all' || d.stage === activeStage
  ) || [];

  const totalValue = filteredDeals.reduce((sum, d) => sum + d.value, 0);
  const avgProbability = filteredDeals.length > 0 
    ? filteredDeals.reduce((sum, d) => sum + d.probability, 0) / filteredDeals.length 
    : 0;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Pipeline de Vendas</h1>
          <p className="text-muted-foreground">Gerencie suas oportunidades de negócio</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nova Oportunidade
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Nova Oportunidade</DialogTitle>
              <DialogDescription>
                Adicione uma nova oportunidade ao pipeline
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="create-title">Título</Label>
                <Input 
                  id="create-title" 
                  placeholder="Nome da oportunidade"
                  value={createFormData.title}
                  onChange={(e) => setCreateFormData({ ...createFormData, title: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="create-contact">Contato</Label>
                <Select value={createFormData.contactId} onValueChange={(value) => setCreateFormData({ ...createFormData, contactId: value })}>
                  <SelectTrigger id="create-contact">
                    <SelectValue placeholder="Selecione um contato" />
                  </SelectTrigger>
                  <SelectContent>
                    {contacts?.map((contact) => (
                      <SelectItem key={contact.id} value={contact.id}>
                        {contact.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="create-stage">Estágio</Label>
                <Select value={createFormData.stage} onValueChange={(value) => setCreateFormData({ ...createFormData, stage: value as DealStage })}>
                  <SelectTrigger id="create-stage">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(stageLabels).map(([key, label]) => (
                      <SelectItem key={key} value={key}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="create-value">Valor (R$)</Label>
                <Input 
                  id="create-value" 
                  type="number" 
                  placeholder="10000"
                  value={createFormData.value}
                  onChange={(e) => setCreateFormData({ ...createFormData, value: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="create-probability">Probabilidade (%)</Label>
                <Input 
                  id="create-probability" 
                  type="number" 
                  min="0" 
                  max="100"
                  value={createFormData.probability}
                  onChange={(e) => setCreateFormData({ ...createFormData, probability: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleCreateSubmit} disabled={createDealMutation.isPending}>
                Criar Oportunidade
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total em Pipeline</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalValue)}</div>
            <p className="text-xs text-muted-foreground">{filteredDeals.length} oportunidades</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Probabilidade Média</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgProbability.toFixed(0)}%</div>
            <p className="text-xs text-muted-foreground">Chance de fechamento</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor Esperado</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(totalValue * (avgProbability / 100))}
            </div>
            <p className="text-xs text-muted-foreground">Baseado em probabilidade</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-2 flex-wrap">
        <Button
          variant={activeStage === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setActiveStage('all')}
        >
          Todas ({deals?.length || 0})
        </Button>
        {Object.entries(stageLabels).map(([key, label]) => {
          const count = deals?.filter(d => d.stage === key).length || 0;
          return (
            <Button
              key={key}
              variant={activeStage === key ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveStage(key as DealStage)}
            >
              {label} ({count})
            </Button>
          );
        })}
      </div>

      <QueryBoundary
        isLoading={isLoading}
        isError={isError}
        error={error as Error}
        isEmpty={filteredDeals.length === 0}
        emptyTitle="Nenhuma oportunidade encontrada"
        emptyDescription="Crie uma nova oportunidade para começar"
      >
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredDeals.map((deal) => (
            <Card 
              key={deal.id} 
              className="hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => handleViewDetails(deal)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold">{deal.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {contacts?.find(c => c.id === deal.contactId)?.name || 'Sem contato'}
                    </p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleViewDetails(deal); }}>
                        <Eye className="mr-2 h-4 w-4" />
                        Ver detalhes
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleEdit(deal); }}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={(e) => { e.stopPropagation(); handleDelete(deal); }}
                        className="text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Valor</span>
                    <span className="font-semibold">{formatCurrency(deal.value)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Probabilidade</span>
                    <Badge variant="outline">{deal.probability}%</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Estágio</span>
                    <Badge variant="secondary">{stageLabels[deal.stage]}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </QueryBoundary>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Editar Oportunidade</DialogTitle>
            <DialogDescription>
              Atualize as informações da oportunidade
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-title">Título</Label>
              <Input 
                id="edit-title" 
                value={editFormData.title}
                onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-stage">Estágio</Label>
              <Select value={editFormData.stage} onValueChange={(value) => setEditFormData({ ...editFormData, stage: value as DealStage })}>
                <SelectTrigger id="edit-stage">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(stageLabels).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-value">Valor (R$)</Label>
              <Input 
                id="edit-value" 
                type="number"
                value={editFormData.value}
                onChange={(e) => setEditFormData({ ...editFormData, value: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-probability">Probabilidade (%)</Label>
              <Input 
                id="edit-probability" 
                type="number" 
                min="0" 
                max="100"
                value={editFormData.probability}
                onChange={(e) => setEditFormData({ ...editFormData, probability: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-status">Status</Label>
              <Select value={editFormData.status} onValueChange={(value) => setEditFormData({ ...editFormData, status: value as DealStatus })}>
                <SelectTrigger id="edit-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="open">Aberto</SelectItem>
                  <SelectItem value="won">Ganho</SelectItem>
                  <SelectItem value="lost">Perdido</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleEditSubmit} disabled={updateDealMutation.isPending}>
              Salvar Alterações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir Oportunidade</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir a oportunidade "{selectedDeal?.title}"? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancelar
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => selectedDeal && deleteDealMutation.mutate(selectedDeal.id)}
              disabled={deleteDealMutation.isPending}
            >
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
