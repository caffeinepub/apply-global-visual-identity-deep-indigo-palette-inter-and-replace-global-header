import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useStage1Client } from '../../hooks/useStage1Client';
import { useCurrentOrg } from '../../org/OrgProvider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { QueryBoundary } from '../../components/states/QueryBoundary';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Plus, DollarSign, TrendingUp, TrendingDown, ArrowUpCircle, ArrowDownCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import type { FinanceTransaction, TransactionType } from '../../types/model';

export default function FinancePage() {
  const { client, isReady } = useStage1Client();
  const { currentOrgId } = useCurrentOrg();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TransactionType | 'all'>('all');

  // Form state
  const [formData, setFormData] = useState({
    type: 'income' as TransactionType,
    value: '',
    category: '',
    date: '',
    description: '',
    isRecurring: false,
  });

  const { data: transactions, isLoading, isError, error } = useQuery({
    queryKey: ['financeTransactions', currentOrgId],
    queryFn: () => client.listFinanceTransactions(currentOrgId!),
    enabled: isReady && !!currentOrgId,
  });

  const createTransactionMutation = useMutation({
    mutationFn: async (transaction: Partial<FinanceTransaction>) => {
      return client.createFinanceTransaction(currentOrgId!, transaction);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financeTransactions', currentOrgId] });
      toast.success('Transação salva com sucesso!');
      setIsDialogOpen(false);
      setFormData({
        type: 'income',
        value: '',
        category: '',
        date: '',
        description: '',
        isRecurring: false,
      });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao salvar transação');
    },
  });

  const handleSubmit = () => {
    if (!formData.value || !formData.date) {
      toast.error('Por favor, preencha todos os campos obrigatórios');
      return;
    }

    createTransactionMutation.mutate({
      type: formData.type,
      value: parseFloat(formData.value),
      category: formData.category,
      date: new Date(formData.date),
      description: formData.description,
      isRecurring: formData.isRecurring,
    });
  };

  const filteredTransactions = transactions?.filter(t => 
    activeTab === 'all' || t.type === activeTab
  ) || [];

  const sortedTransactions = [...filteredTransactions].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const totalIncome = transactions?.filter(t => t.type === 'income').reduce((sum, t) => sum + t.value, 0) || 0;
  const totalExpense = transactions?.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.value, 0) || 0;
  const balance = totalIncome - totalExpense;

  const recurringIncome = transactions?.filter(t => t.type === 'income' && t.isRecurring).reduce((sum, t) => sum + t.value, 0) || 0;
  const recurringExpense = transactions?.filter(t => t.type === 'expense' && t.isRecurring).reduce((sum, t) => sum + t.value, 0) || 0;

  const margin = totalIncome > 0 ? ((balance / totalIncome) * 100) : 0;

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(new Date(date));
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Financeiro</h1>
          <p className="text-muted-foreground">Controle de receitas, despesas e fluxo de caixa</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nova Transação
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Nova Transação</DialogTitle>
              <DialogDescription>
                Registre uma receita ou despesa
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="type">Tipo</Label>
                <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value as TransactionType })}>
                  <SelectTrigger id="type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="income">Receita</SelectItem>
                    <SelectItem value="expense">Despesa</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="value">Valor (R$)</Label>
                <Input 
                  id="value" 
                  type="number" 
                  placeholder="1500.00" 
                  step="0.01"
                  value={formData.value}
                  onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="category">Categoria</Label>
                <Input 
                  id="category" 
                  placeholder="Consultoria, Software, etc."
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="date">Data</Label>
                <Input 
                  id="date" 
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea 
                  id="description" 
                  placeholder="Detalhes da transação..." 
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="recurring">Transação recorrente</Label>
                <Switch 
                  id="recurring"
                  checked={formData.isRecurring}
                  onCheckedChange={(checked) => setFormData({ ...formData, isRecurring: checked })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={createTransactionMutation.isPending}>
                Cancelar
              </Button>
              <Button onClick={handleSubmit} disabled={createTransactionMutation.isPending}>
                {createTransactionMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Salvar Transação
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receitas</CardTitle>
            <ArrowUpCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(totalIncome)}
            </div>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(recurringIncome)} recorrente
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Despesas</CardTitle>
            <ArrowDownCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(totalExpense)}
            </div>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(recurringExpense)} recorrente
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saldo</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(balance)}
            </div>
            <p className="text-xs text-muted-foreground">
              {balance >= 0 ? 'Positivo' : 'Negativo'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Margem</CardTitle>
            {margin >= 0 ? <TrendingUp className="h-4 w-4 text-green-600" /> : <TrendingDown className="h-4 w-4 text-red-600" />}
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${margin >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {margin.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Sobre receitas
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TransactionType | 'all')}>
        <TabsList>
          <TabsTrigger value="all">Todas</TabsTrigger>
          <TabsTrigger value="income">Receitas</TabsTrigger>
          <TabsTrigger value="expense">Despesas</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          <QueryBoundary
            isLoading={isLoading}
            isError={isError}
            error={error as Error}
            isEmpty={sortedTransactions.length === 0}
            emptyTitle="Nenhuma transação encontrada"
            emptyDescription="Não há transações registradas no momento"
          >
            <div className="space-y-3">
              {sortedTransactions.map((transaction) => (
                <Card key={transaction.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        {transaction.type === 'income' ? (
                          <ArrowUpCircle className="h-5 w-5 text-green-600" />
                        ) : (
                          <ArrowDownCircle className="h-5 w-5 text-red-600" />
                        )}
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{transaction.description || transaction.category}</p>
                            {transaction.isRecurring && (
                              <Badge variant="secondary" className="text-xs">Recorrente</Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span>{transaction.category}</span>
                            <span>•</span>
                            <span>{formatDate(transaction.date)}</span>
                          </div>
                        </div>
                      </div>
                      <div className={`text-lg font-bold ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                        {transaction.type === 'income' ? '+' : '-'} {formatCurrency(transaction.value)}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </QueryBoundary>
        </TabsContent>
      </Tabs>
    </div>
  );
}
