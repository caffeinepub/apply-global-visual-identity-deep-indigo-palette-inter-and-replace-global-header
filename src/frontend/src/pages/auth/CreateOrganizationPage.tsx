import React, { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useQueryClient } from '@tanstack/react-query';
import { useStage1Client } from '../../hooks/useStage1Client';
import { useCurrentOrg } from '../../org/OrgProvider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { isMockMode } from '../../config/dataMode';

export default function CreateOrganizationPage() {
  const [name, setName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const { client } = useStage1Client();
  const { setCurrentOrg } = useCurrentOrg();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast.error('Digite o nome da organização');
      return;
    }

    setIsCreating(true);
    try {
      const org = await client.createOrg(name.trim());
      
      // In BACKEND mode, call selectOrg to update backend auth context
      if (!isMockMode()) {
        try {
          await client.selectOrg(org.id);
        } catch (error) {
          console.error('Failed to select org in backend:', error);
        }
      }
      
      setCurrentOrg(org);
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
      toast.success('Organização criada com sucesso!');
      navigate({ to: '/dashboard' });
    } catch (error) {
      console.error('Erro ao criar organização:', error);
      toast.error('Erro ao criar organização');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Criar Organização</CardTitle>
          <CardDescription>
            Crie sua primeira organização para começar
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome da Organização</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Minha Empresa"
                disabled={isCreating}
              />
            </div>
            <Button type="submit" className="w-full" disabled={isCreating}>
              {isCreating ? 'Criando...' : 'Criar Organização'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
