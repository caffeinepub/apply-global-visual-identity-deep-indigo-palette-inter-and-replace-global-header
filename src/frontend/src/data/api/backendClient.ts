import type { backendInterface, AppUserRole as BackendAppUserRole } from '../../backend';
import type { AppRole } from '../../auth/roles';
import type {
  Contact,
  Deal,
  Activity,
  Contract,
  FinanceTransaction,
  Project,
  NpsCampaign,
  NpsResponse,
  Task,
  Meeting,
  Deliverable,
  UserProfile as FrontendUserProfile,
} from '../../types/model';
import { ExternalBlob } from '../../backend';
import { Principal } from '@icp-sdk/core/principal';
import type { DataClient } from '../client';

// Mapeamento de roles entre frontend e backend
function mapFrontendRoleToBackend(role: AppRole): BackendAppUserRole {
  const mapping: Record<AppRole, BackendAppUserRole> = {
    OWNER_ADMIN: 'OWNER_ADMIN' as BackendAppUserRole,
    MEMBER: 'MEMBER' as BackendAppUserRole,
    FIRSTY_CONSULTANT: 'FIRSTY_CONSULTANT' as BackendAppUserRole,
    FIRSTY_ADMIN: 'FIRSTY_ADMIN' as BackendAppUserRole,
  };
  return mapping[role];
}

function mapBackendRoleToFrontend(role: BackendAppUserRole): AppRole {
  const mapping: Record<string, AppRole> = {
    OWNER_ADMIN: 'OWNER_ADMIN',
    MEMBER: 'MEMBER',
    FIRSTY_CONSULTANT: 'FIRSTY_CONSULTANT',
    FIRSTY_ADMIN: 'FIRSTY_ADMIN',
  };
  return mapping[role] || 'MEMBER';
}

export class BackendClient implements DataClient {
  constructor(private actor: backendInterface) {}

  // Organizações
  async listOrgs() {
    const orgs = await this.actor.listOrganizations();
    return orgs.map((org) => ({
      id: org.id,
      name: org.name,
      owner: org.createdBy.toString(),
      createdAt: new Date(Number(org.createdAt)),
    }));
  }

  async getOrg(orgId: string) {
    const org = await this.actor.getOrganization(orgId);
    if (!org) return null;
    return {
      id: org.id,
      name: org.name,
      owner: org.createdBy.toString(),
      createdAt: new Date(Number(org.createdAt)),
    };
  }

  async createOrg(name: string) {
    const timestamp = BigInt(Date.now());
    const orgId = await this.actor.createOrganization(name, timestamp);
    return {
      id: orgId,
      name,
      owner: 'current-user',
      createdAt: new Date(Number(timestamp)),
    };
  }

  async selectOrg(orgId: string) {
    const profile = await this.actor.getCallerUserProfile();
    if (!profile) {
      throw new Error('User profile not found');
    }
    
    await this.actor.saveCallerUserProfile({
      ...profile,
      currentOrgId: orgId,
    });
  }

  // Perfil
  async getUserProfile() {
    const profile = await this.actor.getCallerUserProfile();
    if (!profile) return null;
    
    return {
      firstName: profile.firstName,
      lastName: profile.lastName,
      email: profile.email,
      currentOrgId: profile.currentOrgId || undefined,
      appRole: mapBackendRoleToFrontend(profile.appRole),
    };
  }

  async saveUserProfile(profile: FrontendUserProfile) {
    await this.actor.saveCallerUserProfile({
      firstName: profile.firstName,
      lastName: profile.lastName,
      email: profile.email,
      currentOrgId: profile.currentOrgId || undefined,
      appRole: mapFrontendRoleToBackend(profile.appRole),
    });
  }

  // Projetos
  async listProjects(orgId: string): Promise<Project[]> {
    // Backend doesn't have listProjects yet
    return [];
  }

  async getProject(projectId: string): Promise<Project | null> {
    // Backend doesn't have getProject yet
    return null;
  }

  async createProject(orgId: string, project: Partial<Project>): Promise<Project> {
    throw new Error('Projects not implemented in backend yet');
  }

  // Tarefas (não implementado no backend ainda)
  async listTasks(projectId: string): Promise<Task[]> {
    return [];
  }

  async createTask(projectId: string, task: Partial<Task>): Promise<Task> {
    throw new Error('Tasks not implemented in backend yet');
  }

  async updateTask(taskId: string, task: Partial<Task>): Promise<void> {
    throw new Error('Tasks not implemented in backend yet');
  }

  async deleteTask(taskId: string): Promise<void> {
    throw new Error('Tasks not implemented in backend yet');
  }

  async updateTaskStatus(taskId: string, status: string): Promise<void> {
    throw new Error('Tasks not implemented in backend yet');
  }

  // Reuniões (não implementado no backend ainda)
  async listMeetings(projectId: string): Promise<Meeting[]> {
    return [];
  }

  async createMeeting(projectId: string, meeting: Partial<Meeting>): Promise<Meeting> {
    throw new Error('Meetings not implemented in backend yet');
  }

  async updateMeeting(meetingId: string, meeting: Partial<Meeting>): Promise<void> {
    throw new Error('Meetings not implemented in backend yet');
  }

  async deleteMeeting(meetingId: string): Promise<void> {
    throw new Error('Meetings not implemented in backend yet');
  }

  // Entregáveis (não implementado no backend ainda)
  async listDeliverables(projectId: string): Promise<Deliverable[]> {
    return [];
  }

  async updateDeliverable(deliverableId: string, deliverable: Partial<Deliverable>): Promise<void> {
    throw new Error('Deliverables not implemented in backend yet');
  }

  async deleteDeliverable(deliverableId: string): Promise<void> {
    throw new Error('Deliverables not implemented in backend yet');
  }

  // KPIs (não implementado no backend ainda)
  async listKpis(projectId: string): Promise<any[]> {
    return [];
  }

  // Mensagens
  async listMessages(orgId: string) {
    // Backend doesn't have getSupportMessages yet
    return [];
  }

  async sendMessage(orgId: string, message: string) {
    // Backend doesn't have sendSupportMessage yet
    throw new Error('Messages not implemented in backend yet');
  }

  // Documentos
  async listDocuments(orgId: string) {
    // Backend doesn't have listDocuments yet
    return [];
  }

  async createDocument(orgId: string, document: any) {
    throw new Error('Documents not implemented in backend yet');
  }

  async uploadDocument(orgId: string, document: any) {
    throw new Error('Documents not implemented in backend yet');
  }

  async deleteDocument(documentId: string) {
    throw new Error('Documents not implemented in backend yet');
  }

  // CRM - Contatos
  async listContacts(orgId: string): Promise<Contact[]> {
    const contacts = await this.actor.listContacts(orgId);
    return contacts.map((c) => ({
      id: c.id,
      orgId: c.orgId,
      name: c.name,
      email: c.email,
      phone: c.phone,
      company: '',
      tags: [],
      status: 'active' as const,
      ownerUserId: c.createdBy.toString(),
      notes: '',
      attachments: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    }));
  }

  async createContact(orgId: string, contact: Partial<Contact>): Promise<Contact> {
    // Get current user's principal from the actor
    const profile = await this.actor.getCallerUserProfile();
    if (!profile) {
      throw new Error('User profile not found');
    }
    
    // Create contact with backend-expected structure
    const contactId = `contact-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newContact = {
      id: contactId,
      name: contact.name || '',
      email: contact.email || '',
      phone: contact.phone || '',
      orgId,
      createdBy: Principal.fromText('aaaaa-aa'), // Placeholder - backend will use caller
    };
    
    await this.actor.createContact(newContact);
    
    return {
      id: contactId,
      orgId,
      name: newContact.name,
      email: newContact.email,
      phone: newContact.phone,
      company: '',
      tags: [],
      status: 'active' as const,
      ownerUserId: 'current-user',
      notes: '',
      attachments: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  async updateContact(contactId: string, contact: Partial<Contact>): Promise<void> {
    const existing = await this.actor.getContact(contactId);
    if (!existing) throw new Error('Contact not found');
    
    await this.actor.updateContact(
      contactId,
      contact.name || existing.name,
      contact.email || existing.email,
      contact.phone || existing.phone
    );
  }

  async deleteContact(contactId: string): Promise<void> {
    await this.actor.deleteContact(contactId);
  }

  // CRM - Deals
  async listDeals(orgId: string): Promise<Deal[]> {
    // Backend doesn't have listDeals yet
    return [];
  }

  async createDeal(orgId: string, deal: Partial<Deal>): Promise<Deal> {
    throw new Error('Deals not implemented in backend yet');
  }

  async updateDeal(dealId: string, deal: Partial<Deal>): Promise<void> {
    throw new Error('Deals not implemented in backend yet');
  }

  async deleteDeal(dealId: string): Promise<void> {
    throw new Error('Deals not implemented in backend yet');
  }

  // CRM - Atividades
  async listActivities(orgId: string): Promise<Activity[]> {
    // Backend doesn't have listActivities yet
    return [];
  }

  async createActivity(orgId: string, activity: Partial<Activity>): Promise<Activity> {
    throw new Error('Activities not implemented in backend yet');
  }

  async updateActivity(activityId: string, activity: Partial<Activity>): Promise<void> {
    throw new Error('Activities not implemented in backend yet');
  }

  async deleteActivity(activityId: string): Promise<void> {
    throw new Error('Activities not implemented in backend yet');
  }

  // Contratos
  async listContracts(orgId: string): Promise<Contract[]> {
    // Backend doesn't have listContracts yet
    return [];
  }

  async createContract(orgId: string, contract: Partial<Contract>): Promise<Contract> {
    throw new Error('Contracts not implemented in backend yet');
  }

  async updateContract(contractId: string, contract: Partial<Contract>): Promise<void> {
    throw new Error('Contracts not implemented in backend yet');
  }

  async deleteContract(contractId: string): Promise<void> {
    throw new Error('Contracts not implemented in backend yet');
  }

  async cancelContract(contractId: string, cancelReason: string): Promise<void> {
    throw new Error('Contracts not implemented in backend yet');
  }

  // Financeiro
  async listFinanceTransactions(orgId: string): Promise<FinanceTransaction[]> {
    // Backend doesn't have listFinanceTransactions yet
    return [];
  }

  async createFinanceTransaction(orgId: string, transaction: Partial<FinanceTransaction>): Promise<FinanceTransaction> {
    throw new Error('Finance transactions not implemented in backend yet');
  }

  async updateFinanceTransaction(transactionId: string, transaction: Partial<FinanceTransaction>): Promise<void> {
    throw new Error('Finance transactions not implemented in backend yet');
  }

  async deleteFinanceTransaction(transactionId: string): Promise<void> {
    throw new Error('Finance transactions not implemented in backend yet');
  }

  // NPS Campaigns & Responses
  async listNpsCampaigns(orgId: string): Promise<NpsCampaign[]> {
    // Backend doesn't have listNpsCampaigns yet
    return [];
  }

  async createNpsCampaign(orgId: string, campaign: Partial<NpsCampaign>): Promise<NpsCampaign> {
    throw new Error('NPS campaigns not implemented in backend yet');
  }

  async listNpsResponses(orgId: string, startDate: Date, endDate: Date): Promise<NpsResponse[]> {
    // Backend doesn't have listNpsResponses yet
    return [];
  }

  async createNpsResponse(orgId: string, response: Partial<NpsResponse>): Promise<NpsResponse> {
    throw new Error('NPS responses not implemented in backend yet');
  }

  // Reports
  async listReports(orgId: string): Promise<any[]> {
    // Backend doesn't have listReports yet
    return [];
  }

  async generateReport(orgId: string, report: any): Promise<void> {
    throw new Error('Reports not implemented in backend yet');
  }

  // Team
  async isCallerAdmin(): Promise<boolean> {
    return await this.actor.isCallerAdmin();
  }

  async inviteTeamMember(orgId: string, invitation: any): Promise<void> {
    throw new Error('Team invitations not implemented in backend yet');
  }

  async listOrgMembers(orgId: string): Promise<any[]> {
    // Backend doesn't have listOrgMembers yet
    return [];
  }

  async listTeamInvitations(orgId: string): Promise<any[]> {
    // Backend doesn't have listTeamInvitations yet
    return [];
  }
}
