import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useStage1Client } from '../../hooks/useStage1Client';
import { useActiveProject } from '../../portal/useActiveProject';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { QueryBoundary } from '../../components/states/QueryBoundary';
import { TrendingUp, TrendingDown, Minus, Calendar } from 'lucide-react';
import { strings } from '../../i18n/strings.ptBR';

export default function KpisPage() {
  const { client, isReady } = useStage1Client();
  const { activeProjectId } = useActiveProject();

  const { data: kpis, isLoading, isError, error } = useQuery({
    queryKey: ['kpis', activeProjectId],
    queryFn: () => client.listKpis(activeProjectId!),
    enabled: isReady && !!activeProjectId,
  });

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-5 h-5 text-green-600" />;
      case 'down':
        return <TrendingDown className="w-5 h-5 text-red-600" />;
      case 'flat':
        return <Minus className="w-5 h-5 text-muted-foreground" />;
      default:
        return null;
    }
  };

  const getTrendLabel = (trend: string) => {
    const trendMap: Record<string, string> = {
      up: 'Em Alta',
      down: 'Em Baixa',
      flat: 'Estável',
    };
    return trendMap[trend] || trend;
  };

  const getTrendVariant = (trend: string): 'default' | 'secondary' | 'destructive' => {
    const variantMap: Record<string, 'default' | 'secondary' | 'destructive'> = {
      up: 'default',
      down: 'destructive',
      flat: 'secondary',
    };
    return variantMap[trend] || 'secondary';
  };

  if (!activeProjectId) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">{strings.nav.kpis}</h1>
          <p className="text-muted-foreground">Indicadores de desempenho do projeto</p>
        </div>
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">
              Selecione um projeto ativo no Dashboard para visualizar os KPIs
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{strings.nav.kpis}</h1>
        <p className="text-muted-foreground">Indicadores de desempenho do projeto</p>
      </div>

      <QueryBoundary
        isLoading={isLoading}
        isError={isError}
        error={error as Error}
        isEmpty={!kpis || kpis.length === 0}
        emptyTitle="Nenhum KPI encontrado"
        emptyDescription="Os indicadores do projeto aparecerão aqui"
      >
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {kpis?.map((kpi) => (
            <Card key={kpi.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-base">{kpi.name}</CardTitle>
                  {getTrendIcon(kpi.trend)}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-3xl font-bold">{kpi.value}</div>
                <Badge variant={getTrendVariant(kpi.trend)}>
                  {getTrendLabel(kpi.trend)}
                </Badge>
                {kpi.note && (
                  <p className="text-sm text-muted-foreground">{kpi.note}</p>
                )}
                <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2 border-t">
                  <Calendar className="w-3 h-3" />
                  <span>
                    Atualizado em {new Date(kpi.updatedAt).toLocaleDateString('pt-BR')}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </QueryBoundary>
    </div>
  );
}
