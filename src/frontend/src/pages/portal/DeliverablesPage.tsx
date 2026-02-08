import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useStage1Client } from '../../hooks/useStage1Client';
import { useActiveProject } from '../../portal/useActiveProject';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { QueryBoundary } from '../../components/states/QueryBoundary';
import { Calendar, FileText } from 'lucide-react';
import { strings } from '../../i18n/strings.ptBR';

export default function DeliverablesPage() {
  const { client, isReady } = useStage1Client();
  const { activeProjectId } = useActiveProject();

  const { data: deliverables, isLoading, isError, error } = useQuery({
    queryKey: ['deliverables', activeProjectId],
    queryFn: () => client.listDeliverables(activeProjectId!),
    enabled: isReady && !!activeProjectId,
  });

  const getStatusLabel = (status: string) => {
    const statusMap: Record<string, string> = {
      planejado: 'Planejado',
      em_andamento: 'Em Andamento',
      entregue: 'Entregue',
    };
    return statusMap[status] || status;
  };

  const getStatusVariant = (status: string): 'default' | 'secondary' | 'outline' => {
    const variantMap: Record<string, 'default' | 'secondary' | 'outline'> = {
      planejado: 'outline',
      em_andamento: 'secondary',
      entregue: 'default',
    };
    return variantMap[status] || 'outline';
  };

  const groupedDeliverables = {
    planejado: deliverables?.filter((d) => d.status === 'planejado') || [],
    em_andamento: deliverables?.filter((d) => d.status === 'em_andamento') || [],
    entregue: deliverables?.filter((d) => d.status === 'entregue') || [],
  };

  if (!activeProjectId) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">{strings.nav.deliverables}</h1>
          <p className="text-muted-foreground">Acompanhe os entregáveis do projeto</p>
        </div>
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">
              Selecione um projeto ativo no Dashboard para visualizar os entregáveis
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{strings.nav.deliverables}</h1>
        <p className="text-muted-foreground">Acompanhe os entregáveis do projeto</p>
      </div>

      <QueryBoundary
        isLoading={isLoading}
        isError={isError}
        error={error as Error}
        isEmpty={!deliverables || deliverables.length === 0}
        emptyTitle="Nenhum entregável encontrado"
        emptyDescription="Os entregáveis do projeto aparecerão aqui"
      >
        <Tabs defaultValue="all" className="space-y-4">
          <TabsList>
            <TabsTrigger value="all">
              Todos ({deliverables?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="planejado">
              Planejado ({groupedDeliverables.planejado.length})
            </TabsTrigger>
            <TabsTrigger value="em_andamento">
              Em Andamento ({groupedDeliverables.em_andamento.length})
            </TabsTrigger>
            <TabsTrigger value="entregue">
              Entregue ({groupedDeliverables.entregue.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              {deliverables?.map((deliverable) => (
                <Card key={deliverable.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-base flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        {deliverable.title}
                      </CardTitle>
                      <Badge variant={getStatusVariant(deliverable.status)}>
                        {getStatusLabel(deliverable.status)}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {deliverable.category}
                      </Badge>
                    </div>
                    {deliverable.dueDate && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        <span>
                          Prazo: {new Date(deliverable.dueDate).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {(['planejado', 'em_andamento', 'entregue'] as const).map((status) => (
            <TabsContent key={status} value={status} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                {groupedDeliverables[status].map((deliverable) => (
                  <Card key={deliverable.id}>
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        {deliverable.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {deliverable.category}
                        </Badge>
                      </div>
                      {deliverable.dueDate && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="w-4 h-4" />
                          <span>
                            Prazo: {new Date(deliverable.dueDate).toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </QueryBoundary>
    </div>
  );
}
