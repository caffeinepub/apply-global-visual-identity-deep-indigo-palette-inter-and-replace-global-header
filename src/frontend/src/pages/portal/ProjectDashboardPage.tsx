import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useStage1Client } from '../../hooks/useStage1Client';
import { useCurrentOrg } from '../../org/OrgProvider';
import { useActiveProject } from '../../portal/useActiveProject';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { QueryBoundary } from '../../components/states/QueryBoundary';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Briefcase, Calendar, Users, TrendingUp } from 'lucide-react';
import type { Project } from '../../types/model';

const stageLabels: Record<Project['stage'], string> = {
  onboarding: 'Onboarding',
  execution_30: 'Execução 30 dias',
  execution_continuous: 'Execução Contínua',
  followup: 'Follow-up',
  closing: 'Encerramento',
};

export default function ProjectDashboardPage() {
  const { client, isReady } = useStage1Client();
  const { currentOrgId } = useCurrentOrg();
  const { activeProjectId, setActiveProjectId } = useActiveProject();

  const { data: projects, isLoading, isError, error } = useQuery({
    queryKey: ['projects', currentOrgId],
    queryFn: () => client.listProjects(currentOrgId!),
    enabled: isReady && !!currentOrgId,
  });

  // Validate active project ID
  const validActiveProjectId = React.useMemo(() => {
    if (!projects || projects.length === 0) return null;
    if (!activeProjectId) return null;
    const projectExists = projects.some(p => p.id === activeProjectId);
    if (!projectExists) {
      // Clear invalid stored project ID
      setActiveProjectId(null);
      return null;
    }
    return activeProjectId;
  }, [projects, activeProjectId, setActiveProjectId]);

  const activeProject = projects?.find(p => p.id === validActiveProjectId);

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    }).format(new Date(date));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Portal do Cliente</h1>
        <p className="text-muted-foreground">Acompanhe o progresso do seu projeto</p>
      </div>

      <QueryBoundary
        isLoading={isLoading}
        isError={isError}
        error={error as Error}
        isEmpty={!projects || projects.length === 0}
        emptyTitle="Nenhum projeto encontrado"
        emptyDescription="Não há projetos disponíveis no momento"
      >
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Selecione um Projeto</CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={validActiveProjectId || ''} onValueChange={setActiveProjectId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um projeto" />
                </SelectTrigger>
                <SelectContent>
                  {projects?.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {activeProject ? (
            <>
              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-2xl">{activeProject.name}</CardTitle>
                      <p className="text-muted-foreground mt-1">{activeProject.clientName}</p>
                    </div>
                    <Badge variant="outline">{stageLabels[activeProject.stage]}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="flex items-center gap-3">
                      <Calendar className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Início</p>
                        <p className="font-medium">{formatDate(activeProject.startDate)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Briefcase className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Perfil</p>
                        <p className="font-medium capitalize">{activeProject.businessProfile}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <TrendingUp className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Jornada</p>
                        <p className="font-medium">{activeProject.journeyMonths} meses</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="grid gap-4 md:grid-cols-3">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Tarefas Pendentes</CardTitle>
                    <Briefcase className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">0</div>
                    <p className="text-xs text-muted-foreground">Nenhuma tarefa pendente</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Próxima Reunião</CardTitle>
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">-</div>
                    <p className="text-xs text-muted-foreground">Nenhuma agendada</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Entregáveis</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">0</div>
                    <p className="text-xs text-muted-foreground">Nenhum entregável</p>
                  </CardContent>
                </Card>
              </div>
            </>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Users className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Selecione um projeto</h3>
                <p className="text-sm text-muted-foreground text-center max-w-sm">
                  Escolha um projeto acima para visualizar suas informações e acompanhar o progresso
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </QueryBoundary>
    </div>
  );
}
