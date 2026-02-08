import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useStage1Client } from '../../hooks/useStage1Client';
import { useActiveProject } from '../../portal/useActiveProject';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { QueryBoundary } from '../../components/states/QueryBoundary';
import { Calendar, CheckCircle2, Circle } from 'lucide-react';
import { strings } from '../../i18n/strings.ptBR';

export default function StageTimelinePage() {
  const { client, isReady } = useStage1Client();
  const { activeProjectId } = useActiveProject();

  const { data: project, isLoading, isError, error } = useQuery({
    queryKey: ['project', activeProjectId],
    queryFn: () => client.getProject(activeProjectId!),
    enabled: isReady && !!activeProjectId,
  });

  const getStageInfo = (stage: string) => {
    const stageMap: Record<string, { label: string; order: number }> = {
      onboarding: { label: 'Onboarding', order: 1 },
      execution_30: { label: 'Execução 30 dias', order: 2 },
      execution_60: { label: 'Execução 60 dias', order: 3 },
      execution_90: { label: 'Execução 90 dias', order: 4 },
      execution_continuous: { label: 'Execução Contínua', order: 5 },
      completed: { label: 'Concluído', order: 6 },
    };
    return stageMap[stage] || { label: stage, order: 0 };
  };

  const allStages = [
    { key: 'onboarding', label: 'Onboarding', order: 1 },
    { key: 'execution_30', label: 'Execução 30 dias', order: 2 },
    { key: 'execution_60', label: 'Execução 60 dias', order: 3 },
    { key: 'execution_90', label: 'Execução 90 dias', order: 4 },
    { key: 'execution_continuous', label: 'Execução Contínua', order: 5 },
    { key: 'completed', label: 'Concluído', order: 6 },
  ];

  if (!activeProjectId) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">{strings.nav.stageTimeline}</h1>
          <p className="text-muted-foreground">Acompanhe a evolução do projeto</p>
        </div>
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">
              Selecione um projeto ativo no Dashboard para visualizar o cronograma
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{strings.nav.stageTimeline}</h1>
        <p className="text-muted-foreground">Acompanhe a evolução do projeto</p>
      </div>

      <QueryBoundary
        isLoading={isLoading}
        isError={isError}
        error={error as Error}
        isEmpty={!project}
        emptyTitle="Projeto não encontrado"
        emptyDescription="Não foi possível carregar as informações do projeto"
      >
        {project && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Informações do Projeto</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Nome do Projeto</p>
                    <p className="text-base">{project.name}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Cliente</p>
                    <p className="text-base">{project.clientName}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Perfil</p>
                    <Badge variant="outline">
                      {project.businessProfile === 'solo' ? 'Solo' : 'PME'}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Duração</p>
                    <p className="text-base">{project.journeyMonths} meses</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Data de Início</p>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <p className="text-base">
                        {new Date(project.startDate).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Etapa Atual</p>
                    <Badge variant="secondary">{getStageInfo(project.stage).label}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Linha do Tempo</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {allStages.map((stage, index) => {
                    const currentStageOrder = getStageInfo(project.stage).order;
                    const isCompleted = stage.order < currentStageOrder;
                    const isCurrent = stage.key === project.stage;
                    const isPending = stage.order > currentStageOrder;

                    return (
                      <div key={stage.key} className="flex items-start gap-4">
                        <div className="flex flex-col items-center">
                          <div
                            className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                              isCurrent
                                ? 'border-primary bg-primary text-primary-foreground'
                                : isCompleted
                                ? 'border-primary bg-primary text-primary-foreground'
                                : 'border-muted-foreground bg-background'
                            }`}
                          >
                            {isCompleted ? (
                              <CheckCircle2 className="w-5 h-5" />
                            ) : (
                              <Circle className="w-4 h-4" />
                            )}
                          </div>
                          {index < allStages.length - 1 && (
                            <div
                              className={`w-0.5 h-12 ${
                                isCompleted ? 'bg-primary' : 'bg-muted'
                              }`}
                            />
                          )}
                        </div>
                        <div className="flex-1 pb-8">
                          <div className="flex items-center gap-2">
                            <h3
                              className={`font-medium ${
                                isCurrent ? 'text-primary' : isPending ? 'text-muted-foreground' : ''
                              }`}
                            >
                              {stage.label}
                            </h3>
                            {isCurrent && (
                              <Badge variant="default" className="text-xs">
                                Em Andamento
                              </Badge>
                            )}
                            {isCompleted && (
                              <Badge variant="outline" className="text-xs">
                                Concluído
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {isCompleted && 'Etapa concluída com sucesso'}
                            {isCurrent && 'Você está nesta etapa atualmente'}
                            {isPending && 'Próxima etapa do projeto'}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </QueryBoundary>
    </div>
  );
}
