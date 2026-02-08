import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useStage1Client } from '../../hooks/useStage1Client';
import { useCurrentOrg } from '../../org/OrgProvider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { QueryBoundary } from '../../components/states/QueryBoundary';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Plus, Mail, Phone, Building2, Search, Filter, MoreVertical, Pencil, Trash2 } from 'lucide-react';
import type { Contact } from '../../types/model';
import { toast } from 'sonner';

export default function ContactsPage() {
  const { client, isReady } = useStage1Client();
  const { currentOrgId } = useCurrentOrg();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [deletingContact, setDeletingContact] = useState<Contact | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    status: 'ativo',
    notes: '',
  });

  const { data: contacts, isLoading, isError, error } = useQuery({
    queryKey: ['contacts', currentOrgId],
    queryFn: () => client.listContacts(currentOrgId!),
    enabled: isReady && !!currentOrgId,
  });

  const createContactMutation = useMutation({
    mutationFn: (contact: Partial<Contact>) => client.createContact(currentOrgId!, contact),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts', currentOrgId] });
      setIsDialogOpen(false);
      resetForm();
      toast.success('Contato criado com sucesso!');
    },
    onError: (error: Error) => {
      toast.error(`Erro ao criar contato: ${error.message}`);
    },
  });

  const updateContactMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Contact> }) => client.updateContact(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts', currentOrgId] });
      setIsDialogOpen(false);
      setEditingContact(null);
      resetForm();
      toast.success('Contato atualizado com sucesso!');
    },
    onError: (error: Error) => {
      toast.error(`Erro ao atualizar contato: ${error.message}`);
    },
  });

  const deleteContactMutation = useMutation({
    mutationFn: (id: string) => client.deleteContact(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts', currentOrgId] });
      setDeletingContact(null);
      toast.success('Contato excluído com sucesso!');
    },
    onError: (error: Error) => {
      toast.error(`Erro ao excluir contato: ${error.message}`);
    },
  });

  const resetForm = () => {
    setFormData({ name: '', email: '', phone: '', company: '', status: 'ativo', notes: '' });
  };

  const handleSubmit = () => {
    if (!formData.name.trim() || !formData.email.trim()) {
      toast.error('Nome e e-mail são obrigatórios');
      return;
    }

    if (editingContact) {
      updateContactMutation.mutate({ id: editingContact.id, data: formData });
    } else {
      createContactMutation.mutate(formData);
    }
  };

  const handleEdit = (contact: Contact) => {
    setEditingContact(contact);
    setFormData({
      name: contact.name,
      email: contact.email,
      phone: contact.phone,
      company: contact.company,
      status: contact.status,
      notes: contact.notes,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (contact: Contact) => {
    setDeletingContact(contact);
  };

  const confirmDelete = () => {
    if (deletingContact) {
      deleteContactMutation.mutate(deletingContact.id);
    }
  };

  const filteredContacts = contacts?.filter((contact) => {
    const matchesSearch = 
      contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.company.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || contact.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Contatos</h1>
          <p className="text-muted-foreground">Gerencie seus contatos e leads</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) {
            setEditingContact(null);
            resetForm();
          }
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Novo Contato
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>{editingContact ? 'Editar Contato' : 'Novo Contato'}</DialogTitle>
              <DialogDescription>
                {editingContact ? 'Atualize as informações do contato' : 'Adicione um novo contato ao seu CRM'}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Nome completo *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="João Silva"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">E-mail *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="joao@empresa.com"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="phone">Telefone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="(11) 98765-4321"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="company">Empresa</Label>
                <Input
                  id="company"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  placeholder="Empresa Ltda"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                  <SelectTrigger id="status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ativo">Ativo</SelectItem>
                    <SelectItem value="inativo">Inativo</SelectItem>
                    <SelectItem value="lead">Lead</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="notes">Observações</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Notas sobre o contato..."
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={createContactMutation.isPending || updateContactMutation.isPending}>
                Cancelar
              </Button>
              <Button onClick={handleSubmit} disabled={createContactMutation.isPending || updateContactMutation.isPending}>
                {createContactMutation.isPending || updateContactMutation.isPending ? 'Salvando...' : editingContact ? 'Atualizar' : 'Salvar Contato'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome, e-mail ou empresa..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Filtrar por status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os status</SelectItem>
            <SelectItem value="ativo">Ativo</SelectItem>
            <SelectItem value="inativo">Inativo</SelectItem>
            <SelectItem value="lead">Lead</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <QueryBoundary
        isLoading={isLoading}
        isError={isError}
        error={error as Error}
        isEmpty={!filteredContacts || filteredContacts.length === 0}
        emptyTitle="Nenhum contato encontrado"
        emptyDescription={searchTerm || statusFilter !== 'all' 
          ? "Tente ajustar os filtros de busca" 
          : "Adicione seu primeiro contato para começar"}
      >
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredContacts?.map((contact) => (
            <Card key={contact.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg">{contact.name}</CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant={contact.status === 'ativo' ? 'default' : 'secondary'}>
                      {contact.status}
                    </Badge>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEdit(contact)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDelete(contact)} className="text-destructive">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  <span className="truncate">{contact.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Phone className="h-4 w-4" />
                  <span>{contact.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Building2 className="h-4 w-4" />
                  <span className="truncate">{contact.company}</span>
                </div>
                {contact.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-2">
                    {contact.tags.map((tag, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
                {contact.notes && (
                  <p className="text-xs text-muted-foreground line-clamp-2 pt-2 border-t">
                    {contact.notes}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </QueryBoundary>

      <AlertDialog open={!!deletingContact} onOpenChange={(open) => !open && setDeletingContact(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o contato <strong>{deletingContact?.name}</strong>? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
