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
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, CheckCircle2, Clock, Calendar, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import type { Activity, ActivityType, ActivityStatus } from '../../types/model';

const activityTypeLabels: Record<ActivityType, string> = {
  task: 'Tarefa',
  meeting: 'Reunião',
  followup: 'Follow-up',
};

const activityTypeIcons: Record<ActivityType, React.ReactNode> = {
  task: <CheckCircle2 className="h-4 w-4" />,
  meeting: <Calendar className="h-4 w-4" />,
  followup: <Clock className="h-4 w-4" />,
};

export default function ActivitiesPage() {
  const { client, isReady } = useStage1Client();
  const { currentOrgId } = useCurrentOrg();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<ActivityStatus>('open');

  // Form state
  const [formData, setFormData] = useState({
    type: 'task' as ActivityType,
    relatedType: 'none',
    relatedId: '',
    dueDate: '',
    notes: '',
  });

  const { data: activities, isLoading, isError, error } = useQuery({
    queryKey: ['activities', currentOrgId],
    queryFn: () => {
      if (!client) throw new Error('Client not ready');
      return client.listActivities(currentOrgId!);
    },
    enabled: isReady && !!currentOrgId && !!client,
  });

  const { data: contacts } = useQuery({
    queryKey: ['contacts', currentOrgId],
    queryFn: () => {
      if (!client) throw new Error('Client not ready');
      return client.listContacts(currentOrgId!);
    },
    enabled: isReady && !!currentOrgId && !!client,
  });

  const { data: deals } = useQuery({
    queryKey: ['deals', currentOrgId],
    queryFn: () => {
      if (!client) throw new Error('Client not ready');
      return client.listDeals(currentOrgId!);
    },
    enabled: isReady && !!currentOrgId && !!client,
  });

  const createActivityMutation = useMutation({
    mutationFn: async (activity: Partial<Activity>) => {
      if (!client) throw new Error('Client not ready');
      return client.createActivity(currentOrgId!, activity);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activities', currentOrgId] });
      toast.success('Atividade criada com sucesso!');
      setIsDialogOpen(false);
      setFormData({
        type: 'task',
        relatedType: 'none',
        relatedId: '',
        dueDate: '',
        notes: '',
      });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao criar atividade');
    },
  });

  const handleSubmit = () => {
    if (!formData.dueDate) {
      toast.error('Por favor, selecione uma data e hora');
      return;
    }

    let relatedType: Activity['relatedType'] | undefined;
    let relatedId: string | undefined;

    if (formData.relatedType !== 'none') {
      const [type, id] = formData.relatedType.split('-');
      relatedType = type as Activity['relatedType'];
      relatedId = id;
    }

    createActivityMutation.mutate({
      type: formData.type,
      dueDate: new Date(formData.dueDate),
      status: 'open',
      relatedType: relatedType || 'contact',
      relatedId: relatedId || '',
      notes: formData.notes,
    });
  };

  const filteredActivities = activities?.filter(a => a.status === activeTab) || [];
  
  const sortedActivities = [...filteredActivities].sort((a, b) => 
    new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
  );

  const getRelatedName = (activity: Activity) => {
    if (activity.relatedType === 'contact') {
      return contacts?.find(c => c.id === activity.relatedId)?.name || 'Contato';
    }
    if (activity.relatedType === 'deal') {
      return deals?.find(d => d.id === activity.relatedId)?.title || 'Oportunidade';
    }
    return 'Relacionado';
  };

  const isOverdue = (date: Date) => {
    return new Date(date) < new Date() && activeTab === 'open';
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Atividades</h1>
          <p className="text-muted-foreground">Gerencie suas tarefas, reuniões e follow-ups</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nova Atividade
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Nova Atividade</DialogTitle>
              <DialogDescription>
                Crie uma nova tarefa, reunião ou follow-up
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="type">Tipo</Label>
                <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value as ActivityType })}>
                  <SelectTrigger id="type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="task">Tarefa</SelectItem>
                    <SelectItem value="meeting">Reunião</SelectItem>
                    <SelectItem value="followup">Follow-up</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="related">Relacionado a</Label>
                <Select value={formData.relatedType} onValueChange={(value) => setFormData({ ...formData, relatedType: value })}>
                  <SelectTrigger id="related">
                    <SelectValue placeholder="Selecione contato ou deal" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Nenhum</SelectItem>
                    {contacts?.map((contact) => (
                      <SelectItem key={contact.id} value={`contact-${contact.id}`}>
                        {contact.name}
                      </SelectItem>
                    ))}
                    {deals?.map((deal) => (
                      <SelectItem key={deal.id} value={`deal-${deal.id}`}>
                        {deal.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="dueDate">Data e hora</Label>
                <Input 
                  id="dueDate" 
                  type="datetime-local" 
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="notes">Observações</Label>
                <Textarea 
                  id="notes" 
                  placeholder="Detalhes da atividade..." 
                  rows={3}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={createActivityMutation.isPending}>
                Cancelar
              </Button>
              <Button onClick={handleSubmit} disabled={createActivityMutation.isPending}>
                {createActivityMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Criar Atividade
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Abertas</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {activities?.filter(a => a.status === 'open').length || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {activities?.filter(a => a.status === 'open' && isOverdue(a.dueDate)).length || 0} atrasadas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Concluídas</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {activities?.filter(a => a.status === 'done').length || 0}
            </div>
            <p className="text-xs text-muted-foreground">Este mês</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hoje</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {activities?.filter(a => {
                const today = new Date().toDateString();
                return new Date(a.dueDate).toDateString() === today && a.status === 'open';
              }).length || 0}
            </div>
            <p className="text-xs text-muted-foreground">Atividades agendadas</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as ActivityStatus)}>
        <TabsList>
          <TabsTrigger value="open">Abertas</TabsTrigger>
          <TabsTrigger value="done">Concluídas</TabsTrigger>
          <TabsTrigger value="canceled">Canceladas</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          <QueryBoundary
            isLoading={isLoading}
            isError={isError}
            error={error as Error}
            isEmpty={sortedActivities.length === 0}
            emptyTitle="Nenhuma atividade encontrada"
            emptyDescription={`Não há atividades ${activeTab === 'open' ? 'abertas' : activeTab === 'done' ? 'concluídas' : 'canceladas'} no momento`}
          >
            <div className="space-y-3">
              {sortedActivities.map((activity) => (
                <Card key={activity.id} className={`hover:shadow-md transition-shadow ${isOverdue(activity.dueDate) ? 'border-destructive' : ''}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="mt-1">
                          {activityTypeIcons[activity.type]}
                        </div>
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">
                              {activityTypeLabels[activity.type]}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              {getRelatedName(activity)}
                            </span>
                          </div>
                          <p className="text-sm font-medium">{activity.notes || 'Sem descrição'}</p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            <span className={isOverdue(activity.dueDate) ? 'text-destructive font-medium' : ''}>
                              {formatDate(activity.dueDate)}
                              {isOverdue(activity.dueDate) && ' (Atrasada)'}
                            </span>
                          </div>
                        </div>
                      </div>
                      {activeTab === 'open' && (
                        <Button size="sm" variant="outline">
                          Concluir
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </QueryBoundary>
        </TabsContent>
      </Tabs>
    </div>
  );
}
