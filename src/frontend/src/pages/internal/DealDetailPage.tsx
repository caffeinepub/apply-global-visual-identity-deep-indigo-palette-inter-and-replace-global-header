import React from 'react';
import { useParams, useNavigate } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { useStage1Client } from '../../hooks/useStage1Client';
import { useCurrentOrg } from '../../org/OrgProvider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { QueryBoundary } from '../../components/states/QueryBoundary';
import { ArrowLeft, DollarSign, Calendar, User, TrendingUp } from 'lucide-react';
import type { Deal } from '../../types/model';

const stageLabels: Record<Deal['stage'], string> = {
  'Lead': 'Lead',
  'Qualificação': 'Qualificação',
  'Proposta': 'Proposta',
  'Negociação': 'Negociação',
  'Fechado': 'Fechado',
};

const statusLabels: Record<Deal['status'], string> = {
  'open': 'Aberto',
  'won': 'Ganho',
  'lost': 'Perdido',
};

export default function DealDetailPage() {
  const { dealId } = useParams({ from: '/pipeline/$dealId' });
  const navigate = useNavigate();
  const { client, isReady } = useStage1Client();
  const { currentOrgId } = useCurrentOrg();

  const { data: deal, isLoading, isError, error } = useQuery({
    queryKey: ['deal', dealId],
    queryFn: async () => {
      const deals = await client.listDeals(currentOrgId!);
      return deals.find(d => d.id === dealId) || null;
    },
    enabled: isReady && !!currentOrgId && !!dealId,
  });

  const { data: contact } = useQuery({
    queryKey: ['contact', deal?.contactId],
    queryFn: async () => {
      if (!deal?.contactId) return null;
      const contacts = await client.listContacts(currentOrgId!);
      return contacts.find(c => c.id === deal.contactId) || null;
    },
    enabled: isReady && !!currentOrgId && !!deal?.contactId,
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    }).format(new Date(date));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate({ to: '/pipeline' })}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Detalhes da Oportunidade</h1>
          <p className="text-muted-foreground">Informações completas do deal</p>
        </div>
      </div>

      <QueryBoundary
        isLoading={isLoading}
        isError={isError}
        error={error as Error}
        isEmpty={!deal}
        emptyTitle="Oportunidade não encontrada"
        emptyDescription="A oportunidade que você está procurando não existe ou foi removida."
        emptyAction={
          <Button onClick={() => navigate({ to: '/pipeline' })}>
            Voltar para Pipeline
          </Button>
        }
      >
        {deal && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-2xl">{deal.title}</CardTitle>
                    <p className="text-muted-foreground mt-1">
                      Criado em {formatDate(deal.createdAt)}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant={deal.status === 'won' ? 'default' : deal.status === 'lost' ? 'destructive' : 'secondary'}>
                      {statusLabels[deal.status]}
                    </Badge>
                    <Badge variant="outline">
                      {stageLabels[deal.stage]}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <DollarSign className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Valor</p>
                        <p className="text-lg font-semibold">{formatCurrency(deal.value)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <TrendingUp className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Probabilidade</p>
                        <p className="text-lg font-semibold">{deal.probability}%</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    {contact && (
                      <div className="flex items-center gap-3">
                        <User className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">Contato</p>
                          <p className="text-lg font-semibold">{contact.name}</p>
                          <p className="text-sm text-muted-foreground">{contact.email}</p>
                        </div>
                      </div>
                    )}
                    {deal.closedAt && (
                      <div className="flex items-center gap-3">
                        <Calendar className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">Data de Fechamento</p>
                          <p className="text-lg font-semibold">{formatDate(deal.closedAt)}</p>
                        </div>
                      </div>
                    )}
                    {deal.lossReason && (
                      <div className="flex items-start gap-3">
                        <div>
                          <p className="text-sm text-muted-foreground">Motivo da Perda</p>
                          <p className="text-sm">{deal.lossReason}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-3">
              <Button onClick={() => navigate({ to: '/pipeline' })}>
                Voltar para Pipeline
              </Button>
            </div>
          </div>
        )}
      </QueryBoundary>
    </div>
  );
}
