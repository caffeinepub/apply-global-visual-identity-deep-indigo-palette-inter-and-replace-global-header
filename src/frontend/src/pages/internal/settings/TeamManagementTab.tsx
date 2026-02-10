import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, MoreVertical, UserPlus, Trash2, Mail, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { useStage1Client } from '../../../hooks/useStage1Client';
import { useCurrentOrg } from '../../../org/OrgProvider';
import { QueryBoundary } from '../../../components/states/QueryBoundary';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

export function TeamManagementTab() {
  const { client, isReady } = useStage1Client();
  const { currentOrgId } = useCurrentOrg();
  const queryClient = useQueryClient();

  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');

  // Query for team members
  const membersQuery = useQuery({
    queryKey: ['orgMembers', currentOrgId],
    queryFn: async () => {
      if (!currentOrgId) return [];
      return client.listOrgMembers(currentOrgId);
    },
    enabled: isReady && !!currentOrgId,
  });

  // Query for pending invitations
  const invitationsQuery = useQuery({
    queryKey: ['teamInvitations', currentOrgId],
    queryFn: async () => {
      if (!currentOrgId) return [];
      return client.listTeamInvitations(currentOrgId);
    },
    enabled: isReady && !!currentOrgId,
  });

  // Invite mutation
  const inviteMutation = useMutation({
    mutationFn: async (email: string) => {
      if (!currentOrgId) throw new Error('No organization selected');
      return client.inviteTeamMember(currentOrgId, { email });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teamInvitations', currentOrgId] });
      setIsInviteOpen(false);
      setInviteEmail('');
      toast.success('Invitation sent successfully');
    },
    onError: (error: Error) => {
      toast.error(`Error sending invitation: ${error.message}`);
    },
  });

  const handleInvite = () => {
    if (!inviteEmail || !inviteEmail.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }
    inviteMutation.mutate(inviteEmail);
  };

  return (
    <div className="space-y-6">
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Team member management is not yet fully implemented in the backend. This interface will be functional once the backend supports member invitations and management.
        </AlertDescription>
      </Alert>

      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Team Members</h3>
          <p className="text-sm text-muted-foreground">
            Manage members and permissions for your organization
          </p>
        </div>
        <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
          <DialogTrigger asChild>
            <Button disabled={!isReady || !currentOrgId}>
              <UserPlus className="mr-2 h-4 w-4" />
              Invite Member
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Invite Team Member</DialogTitle>
              <DialogDescription>
                Send an invitation to join your organization
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="invite-email">Email Address</Label>
                <Input
                  id="invite-email"
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="colleague@example.com"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setIsInviteOpen(false);
                  setInviteEmail('');
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleInvite} disabled={inviteMutation.isPending}>
                {inviteMutation.isPending ? 'Sending...' : 'Send Invitation'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <QueryBoundary
        isLoading={membersQuery.isLoading}
        isError={membersQuery.isError}
        error={membersQuery.error}
        isEmpty={!membersQuery.data || membersQuery.data.length === 0}
        emptyTitle="No team members yet"
        emptyDescription="Invite your first member to get started."
      >
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {membersQuery.data && membersQuery.data.length > 0 ? (
                membersQuery.data.map((member: any) => (
                  <TableRow key={member.id}>
                    <TableCell className="font-medium">{member.name}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        {member.email}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge>{member.role}</Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(member.joinedAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem className="text-destructive">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Remove
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                    No team members found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </QueryBoundary>

      <Separator />

      <div>
        <h3 className="text-lg font-semibold mb-4">Pending Invitations</h3>
        <QueryBoundary
          isLoading={invitationsQuery.isLoading}
          isError={invitationsQuery.isError}
          error={invitationsQuery.error}
          isEmpty={!invitationsQuery.data || invitationsQuery.data.length === 0}
          emptyTitle="No pending invitations"
        >
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Invited By</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invitationsQuery.data && invitationsQuery.data.length > 0 ? (
                  invitationsQuery.data.map((invitation: any) => (
                    <TableRow key={invitation.id}>
                      <TableCell className="font-medium">{invitation.email}</TableCell>
                      <TableCell>{invitation.invitedBy}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          {new Date(invitation.invitedAt).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{invitation.status}</Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem className="text-destructive">
                              <Trash2 className="mr-2 h-4 w-4" />
                              Revoke
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                      No pending invitations
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </QueryBoundary>
      </div>
    </div>
  );
}
