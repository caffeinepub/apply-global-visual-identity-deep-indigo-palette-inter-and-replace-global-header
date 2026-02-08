import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useStage1Client } from '../../hooks/useStage1Client';
import { useActiveProject } from '../../portal/useActiveProject';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { QueryBoundary } from '../../components/states/QueryBoundary';
import { Send } from 'lucide-react';
import { strings } from '../../i18n/strings.ptBR';
import type { Message } from '../../types/model';

export default function MessagesPage() {
  const { client, isReady } = useStage1Client();
  const { activeProjectId } = useActiveProject();
  const queryClient = useQueryClient();
  const [newMessage, setNewMessage] = useState('');

  const { data: messages, isLoading, isError, error } = useQuery({
    queryKey: ['messages', activeProjectId],
    queryFn: () => client.listMessages(activeProjectId!),
    enabled: isReady && !!activeProjectId,
  });

  const sendMessageMutation = useMutation({
    mutationFn: (text: string) => client.sendMessage(activeProjectId!, text),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages', activeProjectId] });
      setNewMessage('');
    },
  });

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    sendMessageMutation.mutate(newMessage);
  };

  const getRoleLabel = (role: string) => {
    const roleMap: Record<string, string> = {
      client: 'Cliente',
      firsty: 'First-Y',
      admin: 'Admin',
      member: 'Membro',
    };
    return roleMap[role] || role;
  };

  const getRoleBadgeVariant = (role: string): 'default' | 'secondary' | 'outline' => {
    const variantMap: Record<string, 'default' | 'secondary' | 'outline'> = {
      client: 'outline',
      firsty: 'default',
      admin: 'secondary',
      member: 'secondary',
    };
    return variantMap[role] || 'outline';
  };

  if (!activeProjectId) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">{strings.nav.messages}</h1>
          <p className="text-muted-foreground">Comunicação com a equipe</p>
        </div>
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">
              Selecione um projeto ativo no Dashboard para visualizar as mensagens
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{strings.nav.messages}</h1>
        <p className="text-muted-foreground">Comunicação com a equipe</p>
      </div>

      <QueryBoundary
        isLoading={isLoading}
        isError={isError}
        error={error as Error}
        isEmpty={false}
      >
        <Card>
          <CardHeader>
            <CardTitle>Thread de Mensagens</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4 max-h-[500px] overflow-y-auto">
              {messages && messages.length > 0 ? (
                messages.map((message) => (
                  <div key={message.id} className="flex flex-col gap-2 p-4 rounded-lg bg-muted/50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{message.createdBy}</span>
                        <Badge variant={getRoleBadgeVariant(message.createdByRole)}>
                          {getRoleLabel(message.createdByRole)}
                        </Badge>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {new Date(message.createdAt).toLocaleString('pt-BR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    <p className="text-sm">{message.text}</p>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  Nenhuma mensagem ainda. Seja o primeiro a enviar!
                </div>
              )}
            </div>

            <div className="flex gap-2 pt-4 border-t">
              <Textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Digite sua mensagem..."
                rows={3}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
              />
              <Button
                onClick={handleSendMessage}
                disabled={sendMessageMutation.isPending || !newMessage.trim()}
                className="self-end"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </QueryBoundary>
    </div>
  );
}
