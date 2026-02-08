import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Settings, Users, Bell, Shield, Palette, Database } from 'lucide-react';

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Configurações</h1>
        <p className="text-muted-foreground">Gerencie as configurações da sua organização</p>
      </div>

      <Tabs defaultValue="general">
        <TabsList>
          <TabsTrigger value="general">Geral</TabsTrigger>
          <TabsTrigger value="team">Equipe</TabsTrigger>
          <TabsTrigger value="notifications">Notificações</TabsTrigger>
          <TabsTrigger value="security">Segurança</TabsTrigger>
          <TabsTrigger value="integrations">Integrações</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Informações da Organização</CardTitle>
              <CardDescription>
                Atualize as informações básicas da sua organização
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="org-name">Nome da Organização</Label>
                <Input id="org-name" defaultValue="Empresa Demo" />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="org-email">E-mail de Contato</Label>
                <Input id="org-email" type="email" defaultValue="contato@empresa.com.br" />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="org-phone">Telefone</Label>
                <Input id="org-phone" defaultValue="(11) 98765-4321" />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="org-website">Website</Label>
                <Input id="org-website" defaultValue="https://empresa.com.br" />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="org-description">Descrição</Label>
                <Textarea 
                  id="org-description" 
                  rows={3}
                  defaultValue="Empresa de consultoria empresarial focada em crescimento e inovação."
                />
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="text-sm font-medium">Preferências</h4>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Fuso Horário</Label>
                    <p className="text-sm text-muted-foreground">
                      Defina o fuso horário padrão
                    </p>
                  </div>
                  <Select defaultValue="america-sao-paulo">
                    <SelectTrigger className="w-[200px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="america-sao-paulo">São Paulo (GMT-3)</SelectItem>
                      <SelectItem value="america-new-york">Nova York (GMT-5)</SelectItem>
                      <SelectItem value="europe-london">Londres (GMT+0)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Idioma</Label>
                    <p className="text-sm text-muted-foreground">
                      Idioma da interface
                    </p>
                  </div>
                  <Select defaultValue="pt-br">
                    <SelectTrigger className="w-[200px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pt-br">Português (Brasil)</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Español</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Moeda</Label>
                    <p className="text-sm text-muted-foreground">
                      Moeda padrão para valores
                    </p>
                  </div>
                  <Select defaultValue="brl">
                    <SelectTrigger className="w-[200px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="brl">Real (BRL)</SelectItem>
                      <SelectItem value="usd">Dólar (USD)</SelectItem>
                      <SelectItem value="eur">Euro (EUR)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button>Salvar Alterações</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="team" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Membros da Equipe</CardTitle>
                  <CardDescription>
                    Gerencie os membros e permissões da sua organização
                  </CardDescription>
                </div>
                <Button>Convidar Membro</Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Users className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Ana Silva</p>
                      <p className="text-sm text-muted-foreground">ana.silva@empresa.com.br</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Select defaultValue="owner">
                      <SelectTrigger className="w-[150px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="owner">Proprietário</SelectItem>
                        <SelectItem value="admin">Administrador</SelectItem>
                        <SelectItem value="member">Membro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Users className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Carlos Santos</p>
                      <p className="text-sm text-muted-foreground">carlos.santos@empresa.com.br</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Select defaultValue="member">
                      <SelectTrigger className="w-[150px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="owner">Proprietário</SelectItem>
                        <SelectItem value="admin">Administrador</SelectItem>
                        <SelectItem value="member">Membro</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button variant="ghost" size="sm">Remover</Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Preferências de Notificação</CardTitle>
              <CardDescription>
                Configure como e quando você deseja receber notificações
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h4 className="text-sm font-medium">E-mail</h4>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Novos contatos</Label>
                    <p className="text-sm text-muted-foreground">
                      Receba notificação quando um novo contato for adicionado
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Deals ganhos</Label>
                    <p className="text-sm text-muted-foreground">
                      Notificação quando uma oportunidade for fechada
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Atividades atrasadas</Label>
                    <p className="text-sm text-muted-foreground">
                      Alerta quando uma atividade passar do prazo
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Renovações de contrato</Label>
                    <p className="text-sm text-muted-foreground">
                      Lembrete 30 dias antes da renovação
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="text-sm font-medium">Resumos</h4>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Resumo diário</Label>
                    <p className="text-sm text-muted-foreground">
                      Receba um resumo das atividades do dia
                    </p>
                  </div>
                  <Switch />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Resumo semanal</Label>
                    <p className="text-sm text-muted-foreground">
                      Relatório semanal de métricas e atividades
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button>Salvar Preferências</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Segurança e Privacidade</CardTitle>
              <CardDescription>
                Gerencie configurações de segurança da sua conta
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h4 className="text-sm font-medium">Autenticação</h4>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Autenticação de dois fatores</Label>
                    <p className="text-sm text-muted-foreground">
                      Adicione uma camada extra de segurança
                    </p>
                  </div>
                  <Button variant="outline">Configurar</Button>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Sessões ativas</Label>
                    <p className="text-sm text-muted-foreground">
                      Gerencie dispositivos conectados
                    </p>
                  </div>
                  <Button variant="outline">Ver Sessões</Button>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="text-sm font-medium">Dados</h4>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Exportar dados</Label>
                    <p className="text-sm text-muted-foreground">
                      Baixe uma cópia de todos os seus dados
                    </p>
                  </div>
                  <Button variant="outline">Exportar</Button>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Excluir conta</Label>
                    <p className="text-sm text-muted-foreground">
                      Remova permanentemente sua conta e dados
                    </p>
                  </div>
                  <Button variant="destructive">Excluir</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integrations" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Integrações</CardTitle>
              <CardDescription>
                Conecte ferramentas e serviços externos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                      <Database className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium">Google Calendar</p>
                      <p className="text-sm text-muted-foreground">Sincronize reuniões e eventos</p>
                    </div>
                  </div>
                  <Button variant="outline">Conectar</Button>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
                      <Database className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium">Slack</p>
                      <p className="text-sm text-muted-foreground">Receba notificações no Slack</p>
                    </div>
                  </div>
                  <Button variant="outline">Conectar</Button>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center">
                      <Database className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="font-medium">Zapier</p>
                      <p className="text-sm text-muted-foreground">Automatize workflows</p>
                    </div>
                  </div>
                  <Button variant="outline">Conectar</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
