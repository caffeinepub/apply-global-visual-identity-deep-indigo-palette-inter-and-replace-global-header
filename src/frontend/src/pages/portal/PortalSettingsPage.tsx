import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { strings } from '../../i18n/strings.ptBR';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function PortalSettingsPage() {
  const [settings, setSettings] = useState({
    emailNotifications: true,
    taskReminders: true,
    meetingReminders: true,
    weeklyDigest: false,
    showCompletedTasks: true,
    compactView: false,
  });

  const handleToggle = (key: keyof typeof settings) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = () => {
    // Em modo MOCK, apenas simula o salvamento
    console.log('Configurações salvas:', settings);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Configurações do Portal</h1>
        <p className="text-muted-foreground">Personalize sua experiência no portal</p>
      </div>

      <Tabs defaultValue="notifications" className="space-y-4">
        <TabsList>
          <TabsTrigger value="notifications">Notificações</TabsTrigger>
          <TabsTrigger value="display">Exibição</TabsTrigger>
          <TabsTrigger value="privacy">Privacidade</TabsTrigger>
        </TabsList>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notificações por E-mail</CardTitle>
              <CardDescription>
                Configure quando você deseja receber notificações por e-mail
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="emailNotifications">Notificações Gerais</Label>
                  <p className="text-sm text-muted-foreground">
                    Receber atualizações importantes do projeto
                  </p>
                </div>
                <Switch
                  id="emailNotifications"
                  checked={settings.emailNotifications}
                  onCheckedChange={() => handleToggle('emailNotifications')}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="taskReminders">Lembretes de Tarefas</Label>
                  <p className="text-sm text-muted-foreground">
                    Receber lembretes de tarefas próximas ao vencimento
                  </p>
                </div>
                <Switch
                  id="taskReminders"
                  checked={settings.taskReminders}
                  onCheckedChange={() => handleToggle('taskReminders')}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="meetingReminders">Lembretes de Reuniões</Label>
                  <p className="text-sm text-muted-foreground">
                    Receber lembretes de reuniões agendadas
                  </p>
                </div>
                <Switch
                  id="meetingReminders"
                  checked={settings.meetingReminders}
                  onCheckedChange={() => handleToggle('meetingReminders')}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="weeklyDigest">Resumo Semanal</Label>
                  <p className="text-sm text-muted-foreground">
                    Receber um resumo semanal do progresso do projeto
                  </p>
                </div>
                <Switch
                  id="weeklyDigest"
                  checked={settings.weeklyDigest}
                  onCheckedChange={() => handleToggle('weeklyDigest')}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="display" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Preferências de Exibição</CardTitle>
              <CardDescription>
                Personalize como as informações são exibidas
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="showCompletedTasks">Mostrar Tarefas Concluídas</Label>
                  <p className="text-sm text-muted-foreground">
                    Exibir tarefas concluídas na visualização de tarefas
                  </p>
                </div>
                <Switch
                  id="showCompletedTasks"
                  checked={settings.showCompletedTasks}
                  onCheckedChange={() => handleToggle('showCompletedTasks')}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="compactView">Visualização Compacta</Label>
                  <p className="text-sm text-muted-foreground">
                    Usar uma visualização mais compacta para listas
                  </p>
                </div>
                <Switch
                  id="compactView"
                  checked={settings.compactView}
                  onCheckedChange={() => handleToggle('compactView')}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="privacy" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Privacidade e Dados</CardTitle>
              <CardDescription>
                Gerencie suas preferências de privacidade
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm">
                  Seus dados são armazenados de forma segura e nunca são compartilhados com terceiros sem seu consentimento explícito.
                </p>
                <p className="text-sm text-muted-foreground">
                  Para solicitar a exclusão de seus dados ou obter uma cópia de suas informações, entre em contato com o suporte.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end">
        <Button onClick={handleSave}>
          {strings.save} Configurações
        </Button>
      </div>
    </div>
  );
}
