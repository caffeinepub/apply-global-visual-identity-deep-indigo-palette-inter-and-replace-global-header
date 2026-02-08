import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart3, Download, FileText, TrendingUp, Users, DollarSign, Calendar } from 'lucide-react';

export default function ReportsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('current-month');
  const [selectedFormat, setSelectedFormat] = useState('pdf');

  const reports = [
    {
      id: '1',
      name: 'Relatório de Vendas',
      description: 'Pipeline, conversões e receita',
      icon: <TrendingUp className="h-5 w-5" />,
      category: 'sales',
      lastGenerated: '2 dias atrás',
    },
    {
      id: '2',
      name: 'Relatório Financeiro',
      description: 'Receitas, despesas e fluxo de caixa',
      icon: <DollarSign className="h-5 w-5" />,
      category: 'finance',
      lastGenerated: '1 semana atrás',
    },
    {
      id: '3',
      name: 'Relatório de Customer Success',
      description: 'NPS, churn e health scores',
      icon: <Users className="h-5 w-5" />,
      category: 'cs',
      lastGenerated: '3 dias atrás',
    },
    {
      id: '4',
      name: 'Relatório de Projetos',
      description: 'Status, entregas e KPIs dos projetos',
      icon: <FileText className="h-5 w-5" />,
      category: 'project',
      lastGenerated: '5 dias atrás',
    },
  ];

  const exportHistory = [
    { id: '1', name: 'Vendas - Janeiro 2025', type: 'sales', format: 'PDF', date: '05/02/2025', size: '2.3 MB' },
    { id: '2', name: 'Financeiro - Janeiro 2025', type: 'finance', format: 'XLSX', date: '03/02/2025', size: '1.8 MB' },
    { id: '3', name: 'CS - Q4 2024', type: 'cs', format: 'PDF', date: '28/01/2025', size: '3.1 MB' },
    { id: '4', name: 'Projetos - Janeiro 2025', type: 'project', format: 'CSV', date: '25/01/2025', size: '0.5 MB' },
  ];

  const handleGenerateReport = (reportId: string) => {
    console.log(`Generating report ${reportId} for period ${selectedPeriod} in format ${selectedFormat}`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Relatórios e Exportações</h1>
        <p className="text-muted-foreground">Gere relatórios e exporte dados para análise</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Relatórios Gerados</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
            <p className="text-xs text-muted-foreground">Este mês</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Exportações</CardTitle>
            <Download className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">18</div>
            <p className="text-xs text-muted-foreground">Últimos 30 dias</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Formatos</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">PDF, XLSX, CSV</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Agendados</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5</div>
            <p className="text-xs text-muted-foreground">Relatórios automáticos</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="generate">
        <TabsList>
          <TabsTrigger value="generate">Gerar Relatório</TabsTrigger>
          <TabsTrigger value="history">Histórico</TabsTrigger>
          <TabsTrigger value="scheduled">Agendados</TabsTrigger>
        </TabsList>

        <TabsContent value="generate" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Configurar Relatório</CardTitle>
              <CardDescription>
                Selecione o período e formato para gerar seu relatório
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 mb-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Período</label>
                  <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="current-month">Mês Atual</SelectItem>
                      <SelectItem value="last-month">Mês Anterior</SelectItem>
                      <SelectItem value="current-quarter">Trimestre Atual</SelectItem>
                      <SelectItem value="last-quarter">Trimestre Anterior</SelectItem>
                      <SelectItem value="current-year">Ano Atual</SelectItem>
                      <SelectItem value="custom">Período Personalizado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Formato</label>
                  <Select value={selectedFormat} onValueChange={setSelectedFormat}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pdf">PDF</SelectItem>
                      <SelectItem value="xlsx">Excel (XLSX)</SelectItem>
                      <SelectItem value="csv">CSV</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {reports.map((report) => (
                  <Card key={report.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-primary/10 text-primary">
                            {report.icon}
                          </div>
                          <div>
                            <CardTitle className="text-base">{report.name}</CardTitle>
                            <CardDescription className="text-xs mt-1">
                              {report.description}
                            </CardDescription>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-muted-foreground">
                          Último: {report.lastGenerated}
                        </p>
                        <Button size="sm" onClick={() => handleGenerateReport(report.id)}>
                          <Download className="mr-2 h-3 w-3" />
                          Gerar
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Exportações</CardTitle>
              <CardDescription>
                Acesse relatórios gerados anteriormente
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {exportHistory.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-4">
                      <div className="p-2 rounded-lg bg-muted">
                        <FileText className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="font-medium">{item.name}</h4>
                        <div className="flex items-center gap-3 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {item.format}
                          </Badge>
                          <span className="text-xs text-muted-foreground">{item.date}</span>
                          <span className="text-xs text-muted-foreground">{item.size}</span>
                        </div>
                      </div>
                    </div>
                    <Button size="sm" variant="outline">
                      <Download className="mr-2 h-3 w-3" />
                      Baixar
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scheduled" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Relatórios Agendados</CardTitle>
              <CardDescription>
                Configure relatórios para serem gerados automaticamente
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Relatório Mensal de Vendas</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      Todo dia 1º do mês às 09:00 • Formato: PDF
                    </p>
                  </div>
                  <Badge>Ativo</Badge>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Relatório Semanal de CS</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      Toda segunda-feira às 08:00 • Formato: XLSX
                    </p>
                  </div>
                  <Badge>Ativo</Badge>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Relatório Trimestral Financeiro</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      Primeiro dia de cada trimestre • Formato: PDF
                    </p>
                  </div>
                  <Badge variant="secondary">Pausado</Badge>
                </div>

                <Button className="w-full" variant="outline">
                  <Calendar className="mr-2 h-4 w-4" />
                  Agendar Novo Relatório
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
