import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useStage1Client } from '../../hooks/useStage1Client';
import { useActiveProject } from '../../portal/useActiveProject';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { QueryBoundary } from '../../components/states/QueryBoundary';
import { Plus, Calendar, Clock } from 'lucide-react';
import { strings } from '../../i18n/strings.ptBR';
import type { Meeting, MeetingCadence } from '../../types/model';

export default function MeetingsPage() {
  const { client, isReady } = useStage1Client();
  const { activeProjectId } = useActiveProject();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newMeeting, setNewMeeting] = useState<{
    title: string;
    datetime: string;
    cadence: MeetingCadence;
    notes: string;
  }>({
    title: '',
    datetime: '',
    cadence: 'semanal',
    notes: '',
  });

  const { data: meetings, isLoading, isError, error } = useQuery({
    queryKey: ['meetings', activeProjectId],
    queryFn: () => client.listMeetings(activeProjectId!),
    enabled: isReady && !!activeProjectId,
  });

  const createMeetingMutation = useMutation({
    mutationFn: (meeting: Partial<Meeting>) => client.createMeeting(activeProjectId!, meeting),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meetings', activeProjectId] });
      setIsDialogOpen(false);
      setNewMeeting({ title: '', datetime: '', cadence: 'semanal', notes: '' });
    },
  });

  const handleCreateMeeting = () => {
    if (!newMeeting.title.trim() || !newMeeting.datetime) return;
    
    createMeetingMutation.mutate({
      title: newMeeting.title,
      datetime: new Date(newMeeting.datetime),
      cadence: newMeeting.cadence,
      notes: newMeeting.notes,
    });
  };

  const now = new Date();
  const upcomingMeetings = meetings?.filter((m) => new Date(m.datetime) >= now) || [];
  const pastMeetings = meetings?.filter((m) => new Date(m.datetime) < now) || [];

  if (!activeProjectId) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">{strings.nav.meetings}</h1>
          <p className="text-muted-foreground">Próximas reuniões e histórico</p>
        </div>
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">
              Selecione um projeto ativo no Dashboard para visualizar as reuniões
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{strings.nav.meetings}</h1>
          <p className="text-muted-foreground">Próximas reuniões e histórico</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Nova Reunião
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Agendar Nova Reunião</DialogTitle>
              <DialogDescription>
                Adicione uma nova reunião ao calendário do projeto
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Título</Label>
                <Input
                  id="title"
                  value={newMeeting.title}
                  onChange={(e) => setNewMeeting({ ...newMeeting, title: e.target.value })}
                  placeholder="Título da reunião"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="datetime">Data e Hora</Label>
                <Input
                  id="datetime"
                  type="datetime-local"
                  value={newMeeting.datetime}
                  onChange={(e) => setNewMeeting({ ...newMeeting, datetime: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cadence">Cadência</Label>
                <Select value={newMeeting.cadence} onValueChange={(value) => setNewMeeting({ ...newMeeting, cadence: value as MeetingCadence })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="semanal">Semanal</SelectItem>
                    <SelectItem value="quinzenal">Quinzenal</SelectItem>
                    <SelectItem value="ad_hoc">Ad Hoc</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notas</Label>
                <Textarea
                  id="notes"
                  value={newMeeting.notes}
                  onChange={(e) => setNewMeeting({ ...newMeeting, notes: e.target.value })}
                  placeholder="Pauta ou observações"
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                {strings.cancel}
              </Button>
              <Button onClick={handleCreateMeeting} disabled={createMeetingMutation.isPending}>
                {createMeetingMutation.isPending ? strings.saving : strings.create}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <QueryBoundary
        isLoading={isLoading}
        isError={isError}
        error={error as Error}
        isEmpty={!meetings || meetings.length === 0}
        emptyTitle="Nenhuma reunião agendada"
        emptyDescription="Agende a primeira reunião para começar"
      >
        <div className="space-y-6">
          {upcomingMeetings.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Próximas Reuniões</h2>
              <div className="grid gap-4 md:grid-cols-2">
                {upcomingMeetings.map((meeting) => (
                  <Card key={meeting.id}>
                    <CardHeader>
                      <CardTitle className="text-base">{meeting.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span>{new Date(meeting.datetime).toLocaleDateString('pt-BR')}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span>
                          {new Date(meeting.datetime).toLocaleTimeString('pt-BR', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      <Badge variant="outline">{meeting.cadence}</Badge>
                      {meeting.notes && (
                        <p className="text-sm text-muted-foreground mt-2">{meeting.notes}</p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {pastMeetings.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Reuniões Anteriores</h2>
              <div className="grid gap-4 md:grid-cols-2">
                {pastMeetings.map((meeting) => (
                  <Card key={meeting.id} className="opacity-75">
                    <CardHeader>
                      <CardTitle className="text-base">{meeting.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span>{new Date(meeting.datetime).toLocaleDateString('pt-BR')}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span>
                          {new Date(meeting.datetime).toLocaleTimeString('pt-BR', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      <Badge variant="outline">{meeting.cadence}</Badge>
                      {meeting.notes && (
                        <p className="text-sm text-muted-foreground mt-2">{meeting.notes}</p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </QueryBoundary>
    </div>
  );
}
