import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useStage1Client } from '../../hooks/useStage1Client';
import { useCurrentOrg } from '../../org/OrgProvider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { QueryBoundary } from '../../components/states/QueryBoundary';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, FileText, Download, Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { ExternalBlob, DocumentCategory } from '../../backend';
import type { Document } from '../../types/model';
import { isMockMode } from '../../config/dataMode';
import { Alert, AlertDescription } from '@/components/ui/alert';

// Map UI category labels (pt-BR) to backend enum values
const CATEGORY_MAP: Record<string, DocumentCategory> = {
  'Contratos': DocumentCategory.contracts,
  'Faturas': DocumentCategory.invoices,
  'Apresentações': DocumentCategory.presentations,
  'Relatórios': DocumentCategory.reports,
  'Marketing': DocumentCategory.marketing,
  'Mídias': DocumentCategory.mediaAssets,
  'Documentos do Projeto': DocumentCategory.projectDocs,
  'Propostas': DocumentCategory.proposals,
  'Jurídico': DocumentCategory.legal,
  'Outros': DocumentCategory.other,
};

// Reverse map for display (pt-BR)
const CATEGORY_DISPLAY: Record<DocumentCategory, string> = {
  [DocumentCategory.contracts]: 'Contratos',
  [DocumentCategory.invoices]: 'Faturas',
  [DocumentCategory.presentations]: 'Apresentações',
  [DocumentCategory.reports]: 'Relatórios',
  [DocumentCategory.marketing]: 'Marketing',
  [DocumentCategory.mediaAssets]: 'Mídias',
  [DocumentCategory.projectDocs]: 'Documentos do Projeto',
  [DocumentCategory.proposals]: 'Propostas',
  [DocumentCategory.legal]: 'Jurídico',
  [DocumentCategory.other]: 'Outros',
};

export default function DocumentsPage() {
  const { client, isReady } = useStage1Client();
  const { currentOrgId } = useCurrentOrg();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    file: null as File | null,
  });

  const { data: documents, isLoading, isError, error } = useQuery({
    queryKey: ['documents', currentOrgId],
    queryFn: () => client.listDocuments(currentOrgId!),
    enabled: isReady && !!currentOrgId,
  });

  const uploadDocumentMutation = useMutation({
    mutationFn: async (doc: { name: string; category: string; file: File }) => {
      const bytes = new Uint8Array(await doc.file.arrayBuffer());
      const blob = ExternalBlob.fromBytes(bytes).withUploadProgress((percentage) => {
        setUploadProgress(percentage);
      });

      const categoryEnum = CATEGORY_MAP[doc.category];
      if (!categoryEnum) {
        throw new Error('Categoria inválida selecionada');
      }

      await client.uploadDocument(currentOrgId!, {
        name: doc.name,
        category: categoryEnum,
        file: blob,
      });
    },
    onSuccess: async () => {
      // Refetch documents before showing success toast
      await queryClient.invalidateQueries({ queryKey: ['documents', currentOrgId] });
      await queryClient.refetchQueries({ queryKey: ['documents', currentOrgId] });
      
      toast.success('Documento enviado com sucesso!');
      setIsDialogOpen(false);
      setFormData({ name: '', category: '', file: null });
      setUploadProgress(0);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Falha ao enviar documento');
      setUploadProgress(0);
    },
  });

  const handleSubmit = () => {
    if (!formData.name || !formData.category || !formData.file) {
      toast.error('Por favor, preencha todos os campos e selecione um arquivo');
      return;
    }

    uploadDocumentMutation.mutate({
      name: formData.name,
      category: formData.category,
      file: formData.file,
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData({ ...formData, file });
    }
  };

  const groupedDocuments: Record<string, Document[]> = documents?.reduce((acc, doc) => {
    const category = doc.category || 'Sem Categoria';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(doc);
    return acc;
  }, {} as Record<string, Document[]>) || {};

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(new Date(date));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Documentos</h1>
          <p className="text-muted-foreground">Acesse e gerencie documentos do projeto</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Adicionar Documento
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Adicionar Documento</DialogTitle>
              <DialogDescription>
                Envie um novo documento para o projeto
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Nome</Label>
                <Input 
                  id="name" 
                  placeholder="Nome do documento"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="category">Categoria</Label>
                <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Contratos">Contratos</SelectItem>
                    <SelectItem value="Faturas">Faturas</SelectItem>
                    <SelectItem value="Apresentações">Apresentações</SelectItem>
                    <SelectItem value="Relatórios">Relatórios</SelectItem>
                    <SelectItem value="Marketing">Marketing</SelectItem>
                    <SelectItem value="Mídias">Mídias</SelectItem>
                    <SelectItem value="Documentos do Projeto">Documentos do Projeto</SelectItem>
                    <SelectItem value="Propostas">Propostas</SelectItem>
                    <SelectItem value="Jurídico">Jurídico</SelectItem>
                    <SelectItem value="Outros">Outros</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="file">Arquivo</Label>
                <Input 
                  id="file" 
                  type="file"
                  onChange={handleFileChange}
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.jpg,.jpeg,.png"
                />
                {formData.file && (
                  <p className="text-sm text-muted-foreground">
                    Arquivo selecionado: {formData.file.name} ({(formData.file.size / 1024).toFixed(2)} KB)
                  </p>
                )}
              </div>
              {uploadDocumentMutation.isPending && uploadProgress > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Enviando...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setIsDialogOpen(false)} 
                disabled={uploadDocumentMutation.isPending}
              >
                Cancelar
              </Button>
              <Button 
                onClick={handleSubmit} 
                disabled={uploadDocumentMutation.isPending}
              >
                {uploadDocumentMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Enviar Documento
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {isMockMode() && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Modo MOCK ativo: Os documentos são armazenados apenas na memória local e serão perdidos ao recarregar a página.
          </AlertDescription>
        </Alert>
      )}

      <QueryBoundary
        isLoading={isLoading}
        isError={isError}
        error={error as Error}
        isEmpty={!documents || documents.length === 0}
        emptyTitle="Nenhum documento encontrado"
        emptyDescription="Adicione documentos para compartilhar com o projeto"
      >
        <div className="space-y-6">
          {Object.entries(groupedDocuments).map(([category, docs]) => (
            <Card key={category}>
              <CardHeader>
                <CardTitle>{category}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {docs.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <FileText className="h-5 w-5 text-muted-foreground" />
                        <div className="flex-1">
                          <p className="font-medium">{doc.title}</p>
                          <p className="text-sm text-muted-foreground">
                            Enviado em {formatDate(doc.createdAt)}
                          </p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          if (doc.url) {
                            window.open(doc.url, '_blank');
                          }
                        }}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </QueryBoundary>
    </div>
  );
}
