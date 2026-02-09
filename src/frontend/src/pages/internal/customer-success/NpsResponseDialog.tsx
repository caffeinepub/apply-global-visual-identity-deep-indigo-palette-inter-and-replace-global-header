import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertTriangle } from 'lucide-react';
import type { Contact } from '../../../types/model';

interface NpsResponseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contacts: Contact[] | undefined;
  onSubmit: (data: { contactId: string; score: number; comment: string }) => void;
  isPending: boolean;
  hasActiveCampaign: boolean;
}

export function NpsResponseDialog({
  open,
  onOpenChange,
  contacts,
  onSubmit,
  isPending,
  hasActiveCampaign,
}: NpsResponseDialogProps) {
  const [formData, setFormData] = useState({
    contactId: '',
    score: '',
    comment: '',
  });

  const handleSubmit = () => {
    const score = parseInt(formData.score);
    if (isNaN(score) || score < 0 || score > 10) {
      return;
    }
    onSubmit({
      contactId: formData.contactId,
      score,
      comment: formData.comment,
    });
  };

  const handleClose = () => {
    if (!isPending) {
      setFormData({ contactId: '', score: '', comment: '' });
      onOpenChange(false);
    }
  };

  const isValid = formData.contactId && formData.score && !isNaN(parseInt(formData.score));

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Submeter NPS</DialogTitle>
          <DialogDescription>
            Registre a pontuação NPS de um cliente
          </DialogDescription>
        </DialogHeader>

        {!hasActiveCampaign && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Nenhuma campanha ativa encontrada. Crie uma campanha NPS primeiro usando o botão "Nova Campanha" na aba NPS.
            </AlertDescription>
          </Alert>
        )}

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="client">Cliente</Label>
            <Select 
              value={formData.contactId} 
              onValueChange={(value) => setFormData({ ...formData, contactId: value })}
              disabled={!hasActiveCampaign}
            >
              <SelectTrigger id="client">
                <SelectValue placeholder="Selecione um cliente" />
              </SelectTrigger>
              <SelectContent>
                {contacts?.map((contact) => (
                  <SelectItem key={contact.id} value={contact.id}>
                    {contact.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="score">Pontuação (0-10)</Label>
            <Input 
              id="score" 
              type="number"
              min="0"
              max="10"
              value={formData.score}
              onChange={(e) => setFormData({ ...formData, score: e.target.value })}
              disabled={!hasActiveCampaign}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="comment">Comentário (opcional)</Label>
            <Textarea 
              id="comment" 
              value={formData.comment}
              onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
              placeholder="Feedback adicional..."
              disabled={!hasActiveCampaign}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isPending}>
            Cancelar
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={isPending || !isValid || !hasActiveCampaign}
          >
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Submeter
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
