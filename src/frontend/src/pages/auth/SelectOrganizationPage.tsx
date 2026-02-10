import React from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { useStage1Client } from '../../hooks/useStage1Client';
import { useCurrentOrg } from '../../org/OrgProvider';
import { useAuth } from '../../auth/AuthProvider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { QueryBoundary } from '../../components/states/QueryBoundary';
import { Building2 } from 'lucide-react';
import type { Organization } from '../../types/model';

export default function SelectOrganizationPage() {
  const { client, isReady } = useStage1Client();
  const { setCurrentOrg } = useCurrentOrg();
  const { user } = useAuth();
  const navigate = useNavigate();

  const isFirstyRole = user?.role === 'FIRSTY_ADMIN' || user?.role === 'FIRSTY_CONSULTANT';

  const { data: orgs, isLoading, isError, error } = useQuery({
    queryKey: ['organizations'],
    queryFn: () => {
      if (!client) throw new Error('Client not ready');
      return client.listOrgs();
    },
    enabled: isReady && !!client,
  });

  const handleSelect = async (org: Organization) => {
    if (!client) return;
    
    try {
      await client.selectOrg(org.id);
    } catch (error) {
      console.error('Failed to select org in backend:', error);
    }
    
    setCurrentOrg(org);
    navigate({ to: '/dashboard' });
  };

  const handleCreate = () => {
    navigate({ to: '/criar-organizacao' });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold">Selecionar Organização</CardTitle>
          <CardDescription>
            {isFirstyRole 
              ? 'Escolha a organização que deseja gerenciar'
              : 'Escolha sua organização para continuar'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <QueryBoundary
            isLoading={isLoading}
            isError={isError}
            error={error as Error}
            isEmpty={!orgs || orgs.length === 0}
            emptyTitle="Nenhuma organização encontrada"
            emptyDescription={isFirstyRole ? "Não há organizações disponíveis no momento." : "Você ainda não possui uma organização."}
          >
            <div className="space-y-3">
              {orgs?.map((org) => (
                <button
                  key={org.id}
                  onClick={() => handleSelect(org)}
                  className="w-full p-4 text-left border rounded-lg hover:bg-accent hover:border-primary transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Building2 className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{org.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Criada em {new Date(org.createdAt).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {!isFirstyRole && (
              <div className="mt-6 pt-6 border-t">
                <Button onClick={handleCreate} variant="outline" className="w-full">
                  Criar Nova Organização
                </Button>
              </div>
            )}
          </QueryBoundary>
        </CardContent>
      </Card>
    </div>
  );
}
