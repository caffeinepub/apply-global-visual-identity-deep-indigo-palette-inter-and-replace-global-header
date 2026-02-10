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

export default function CreateOrganizationPage() {
  const { client, isReady } = useStage1Client();
  const { setCurrentOrg } = useCurrentOrg();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast.error('Por favor, insira um nome para a organização');
      return;
    }

    if (!client) {
      toast.error('Sistema não está pronto. Aguarde...');
      return;
    }

    setIsSubmitting(true);
    try {
      const org = await client.createOrg(name.trim());
      
      // In BACKEND mode, call selectOrg to update backend profile
      try {
        await client.selectOrg(org.id);
      } catch (error) {
        console.error('Failed to select org in backend:', error);
      }
      
      setCurrentOrg(org);
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
      
      toast.success('Organização criada com sucesso!');
      navigate({ to: '/dashboard' });
    } catch (error: any) {
      console.error('Erro ao criar organização:', error);
      toast.error(error.message || 'Erro ao criar organização');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold">Criar Organização</CardTitle>
          <CardDescription>
            Crie sua organização para começar a usar o sistema
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
                disabled={isSubmitting || !isReady}
              />
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting || !isReady || !name.trim()}
            >
              {isSubmitting ? 'Criando...' : 'Criar Organização'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
