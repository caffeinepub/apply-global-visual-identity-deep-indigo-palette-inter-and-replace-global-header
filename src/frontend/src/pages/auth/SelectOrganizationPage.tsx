import React from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { useStage1Client } from '../../hooks/useStage1Client';
import { useCurrentOrg } from '../../org/OrgProvider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { QueryBoundary } from '../../components/states/QueryBoundary';
import { Building2 } from 'lucide-react';
import { isMockMode } from '../../config/dataMode';
import type { Organization } from '../../types/model';

export default function SelectOrganizationPage() {
  const { client, isReady } = useStage1Client();
  const { setCurrentOrg } = useCurrentOrg();
  const navigate = useNavigate();

  const { data: orgs, isLoading, isError, error } = useQuery({
    queryKey: ['organizations'],
    queryFn: () => client.listOrgs(),
    enabled: isReady,
  });

  const handleSelect = async (org: Organization) => {
    // In BACKEND mode, call selectOrg to update backend auth context
    if (!isMockMode()) {
      try {
        await client.selectOrg(org.id);
      } catch (error) {
        console.error('Failed to select org in backend:', error);
      }
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
          <CardTitle>Selecionar Organização</CardTitle>
          <CardDescription>
            Escolha uma organização para acessar
          </CardDescription>
        </CardHeader>
        <CardContent>
          <QueryBoundary
            isLoading={isLoading}
            isError={isError}
            error={error as Error}
            isEmpty={!orgs || orgs.length === 0}
            emptyTitle="Nenhuma organização encontrada"
            emptyDescription="Crie sua primeira organização para começar"
            emptyAction={
              <Button onClick={handleCreate}>
                Criar Organização
              </Button>
            }
          >
            <div className="space-y-3">
              {orgs?.map((org) => (
                <button
                  key={org.id}
                  onClick={() => handleSelect(org)}
                  className="w-full p-4 text-left border rounded-lg hover:bg-accent transition-colors flex items-center gap-3"
                >
                  <Building2 className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{org.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Criada em {new Date(org.createdAt).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </button>
              ))}
              <Button onClick={handleCreate} variant="outline" className="w-full">
                Criar Nova Organização
              </Button>
            </div>
          </QueryBoundary>
        </CardContent>
      </Card>
    </div>
  );
}
