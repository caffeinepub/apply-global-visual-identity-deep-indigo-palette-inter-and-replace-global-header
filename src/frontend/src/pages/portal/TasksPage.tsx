import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useStage1Client } from '../../hooks/useStage1Client';
import { useActiveProject } from '../../portal/useActiveProject';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { QueryBoundary } from '../../components/states/QueryBoundary';
import { Plus, Calendar } from 'lucide-react';
import { strings } from '../../i18n/strings.ptBR';
import type { Task, Pillar, TaskStatus } from '../../types/model';

export default function TasksPage() {
  const { client, isReady } = useStage1Client();
  const { activeProjectId } = useActiveProject();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newTask, setNewTask] = useState<{
    title: string;
    description: string;
    pillar: Pillar;
    dueDate: string;
  }>({
    title: '',
    description: '',
    pillar: 'Estratégia',
    dueDate: '',
  });

  const { data: tasks, isLoading, isError, error } = useQuery({
    queryKey: ['tasks', activeProjectId],
    queryFn: () => client.listTasks(activeProjectId!),
    enabled: isReady && !!activeProjectId,
  });

  const createTaskMutation = useMutation({
    mutationFn: (task: Partial<Task>) => client.createTask(activeProjectId!, task),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', activeProjectId] });
      setIsDialogOpen(false);
      setNewTask({ title: '', description: '', pillar: 'Estratégia', dueDate: '' });
    },
  });

  const updateTaskStatusMutation = useMutation({
    mutationFn: ({ taskId, status }: { taskId: string; status: TaskStatus }) =>
      client.updateTaskStatus(taskId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', activeProjectId] });
    },
  });

  const handleCreateTask = () => {
    if (!newTask.title.trim()) return;
    
    createTaskMutation.mutate({
      title: newTask.title,
      description: newTask.description,
      pillar: newTask.pillar,
      dueDate: newTask.dueDate ? new Date(newTask.dueDate) : undefined,
      status: 'todo',
    });
  };

  const handleStatusChange = (taskId: string, newStatus: TaskStatus) => {
    updateTaskStatusMutation.mutate({ taskId, status: newStatus });
  };

  const getStatusLabel = (status: string) => {
    const statusMap: Record<string, string> = {
      todo: 'A Fazer',
      doing: 'Em Andamento',
      done: 'Concluído',
    };
    return statusMap[status] || status;
  };

  const getStatusVariant = (status: string): 'default' | 'secondary' | 'outline' => {
    const variantMap: Record<string, 'default' | 'secondary' | 'outline'> = {
      todo: 'outline',
      doing: 'secondary',
      done: 'default',
    };
    return variantMap[status] || 'outline';
  };

  const groupedTasks = {
    todo: tasks?.filter((t) => t.status === 'todo') || [],
    doing: tasks?.filter((t) => t.status === 'doing') || [],
    done: tasks?.filter((t) => t.status === 'done') || [],
  };

  if (!activeProjectId) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">{strings.nav.tasks}</h1>
          <p className="text-muted-foreground">Gerencie suas tarefas do projeto</p>
        </div>
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">
              Selecione um projeto ativo no Dashboard para visualizar as tarefas
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{strings.nav.tasks}</h1>
          <p className="text-muted-foreground">Gerencie suas tarefas do projeto</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Nova Tarefa
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar Nova Tarefa</DialogTitle>
              <DialogDescription>
                Adicione uma nova tarefa ao projeto
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Título</Label>
                <Input
                  id="title"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  placeholder="Título da tarefa"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  placeholder="Descreva a tarefa"
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pillar">Pilar</Label>
                <Select value={newTask.pillar} onValueChange={(value) => setNewTask({ ...newTask, pillar: value as Pillar })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Estratégia">Estratégia</SelectItem>
                    <SelectItem value="Financeiro">Financeiro</SelectItem>
                    <SelectItem value="Operações">Operações</SelectItem>
                    <SelectItem value="Tecnologia">Tecnologia</SelectItem>
                    <SelectItem value="Pessoas">Pessoas</SelectItem>
                    <SelectItem value="Produto">Produto</SelectItem>
                    <SelectItem value="Experiência">Experiência</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="dueDate">Data de Vencimento</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={newTask.dueDate}
                  onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                {strings.cancel}
              </Button>
              <Button onClick={handleCreateTask} disabled={createTaskMutation.isPending}>
                {createTaskMutation.isPending ? strings.saving : strings.create}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <QueryBoundary
        isLoading={isLoading}
        isError={isError}
        error={error as Error}
        isEmpty={!tasks || tasks.length === 0}
        emptyTitle="Nenhuma tarefa encontrada"
        emptyDescription="Crie a primeira tarefa para começar"
      >
        <div className="grid gap-6 md:grid-cols-3">
          {(['todo', 'doing', 'done'] as const).map((status) => (
            <div key={status} className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">{getStatusLabel(status)}</h2>
                <Badge variant={getStatusVariant(status)}>
                  {groupedTasks[status].length}
                </Badge>
              </div>
              <div className="space-y-3">
                {groupedTasks[status].map((task) => (
                  <Card key={task.id}>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">{task.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {task.description && (
                        <p className="text-sm text-muted-foreground">{task.description}</p>
                      )}
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {task.pillar}
                        </Badge>
                        {task.dueDate && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Calendar className="w-3 h-3" />
                            {new Date(task.dueDate).toLocaleDateString('pt-BR')}
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2">
                        {status !== 'todo' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleStatusChange(task.id, status === 'doing' ? 'todo' : 'doing')}
                            className="flex-1 text-xs"
                          >
                            ← {status === 'doing' ? 'A Fazer' : 'Em Andamento'}
                          </Button>
                        )}
                        {status !== 'done' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleStatusChange(task.id, status === 'todo' ? 'doing' : 'done')}
                            className="flex-1 text-xs"
                          >
                            {status === 'todo' ? 'Em Andamento' : 'Concluído'} →
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      </QueryBoundary>
    </div>
  );
}
