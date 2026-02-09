import type { backendInterface, AppUserRole } from '../../backend';
import type {
  Organization,
  UserProfile,
  Project,
  Task,
  Meeting,
  Deliverable,
  Kpi,
  Message,
  Document,
  Contact,
  Deal,
  Activity,
  Contract,
  FinanceTransaction,
  NpsCampaign,
  NpsResponse,
  AppRole,
} from '../../types/model';
import { ExternalBlob } from '../../backend';
import { Principal } from '@dfinity/principal';

/**
 * Map frontend AppRole to backend AppUserRole
 */
function mapFrontendRoleToBackend(frontendRole: AppRole): AppUserRole {
  // The roles are the same, just need to cast
  return frontendRole as AppUserRole;
}

/**
 * Map backend AppUserRole to frontend AppRole
 */
function mapBackendRoleToFrontend(backendRole: AppUserRole): AppRole {
  // The roles are the same, just need to cast
  return backendRole as AppRole;
}

/**
 * Backend client that maps frontend types to backend actor calls
 */
export class BackendClient {
  constructor(private actor: backendInterface) {}

  // Helper: Convert Date to bigint nanoseconds
  private dateToNano(date: Date): bigint {
    return BigInt(date.getTime()) * BigInt(1_000_000);
  }

  // Helper: Convert bigint nanoseconds to Date
  private nanoToDate(nano: bigint): Date {
    return new Date(Number(nano) / 1_000_000);
  }

  // Helper: Get current principal
  private async getCurrentPrincipal(): Promise<Principal> {
    // This is a placeholder - in reality, the principal comes from the identity
    return Principal.anonymous();
  }

  // ============================================================================
  // ORGANIZAÇÕES
  // ============================================================================

  async listOrgs(): Promise<Organization[]> {
    // Backend doesn't expose a global listOrgs for security
    // For Firsty roles, we would need a special backend method
    // For now, return empty and rely on org selection flow
    return [];
  }

  async getOrg(orgId: string): Promise<Organization | null> {
    const org = await this.actor.getOrganization(orgId);
    if (!org) return null;
    return {
      id: org.id,
      name: org.name,
      owner: org.createdBy.toString(),
      createdAt: this.nanoToDate(org.createdAt),
    };
  }

  async createOrg(name: string): Promise<Organization> {
    const timestamp = this.dateToNano(new Date());
    const orgId = await this.actor.createOrganization(name, timestamp);
    return {
      id: orgId,
      name,
      owner: 'current-user',
      createdAt: new Date(),
    };
  }

  async selectOrg(orgId: string): Promise<void> {
    // Update user profile with selected org
    const profile = await this.actor.getCallerUserProfile();
    if (profile) {
      await this.actor.saveCallerUserProfile({
        ...profile,
        currentOrgId: orgId,
      });
    }
  }

  // ============================================================================
  // PERFIL
  // ============================================================================

  async getUserProfile(): Promise<UserProfile | null> {
    const backendProfile = await this.actor.getCallerUserProfile();
    if (!backendProfile) return null;
    
    // Map backend profile to frontend profile
    return {
      firstName: backendProfile.firstName,
      lastName: backendProfile.lastName,
      email: backendProfile.email,
      currentOrgId: backendProfile.currentOrgId,
      appRole: mapBackendRoleToFrontend(backendProfile.appRole),
    };
  }

  async saveUserProfile(profile: UserProfile): Promise<void> {
    // Map frontend profile to backend profile
    await this.actor.saveCallerUserProfile({
      firstName: profile.firstName,
      lastName: profile.lastName,
      email: profile.email,
      currentOrgId: profile.currentOrgId,
      appRole: mapFrontendRoleToBackend(profile.appRole),
    });
  }

  // ============================================================================
  // PROJETOS
  // ============================================================================

  async listProjects(orgId: string): Promise<Project[]> {
    const projects = await this.actor.listProjects(orgId);
    return projects.map(p => ({
      id: p.id,
      orgId: p.orgId,
      name: p.name,
      clientName: p.description,
      businessProfile: 'solo' as const,
      journeyMonths: 3,
      stage: 'execution_30' as const,
      startDate: new Date(),
      createdBy: p.createdBy.toString(),
      createdAt: new Date(),
    }));
  }

  async getProject(projectId: string): Promise<Project | null> {
    const project = await this.actor.getProject(projectId);
    if (!project) return null;
    return {
      id: project.id,
      orgId: project.orgId,
      name: project.name,
      clientName: project.description,
      businessProfile: 'solo' as const,
      journeyMonths: 3,
      stage: 'execution_30' as const,
      startDate: new Date(),
      createdBy: project.createdBy.toString(),
      createdAt: new Date(),
    };
  }

  async createProject(orgId: string, project: Partial<Project>): Promise<Project> {
    throw new Error('Not implemented in backend');
  }

  // ============================================================================
  // TAREFAS, REUNIÕES, ENTREGÁVEIS, KPIs
  // ============================================================================

  async listTasks(projectId: string): Promise<Task[]> {
    return [];
  }

  async createTask(projectId: string, task: Partial<Task>): Promise<Task> {
    throw new Error('Not implemented in backend');
  }

  async updateTask(taskId: string, task: Partial<Task>): Promise<void> {
    throw new Error('Not implemented in backend');
  }

  async deleteTask(taskId: string): Promise<void> {
    throw new Error('Not implemented in backend');
  }

  async updateTaskStatus(taskId: string, status: Task['status']): Promise<void> {
    throw new Error('Not implemented in backend');
  }

  async listMeetings(projectId: string): Promise<Meeting[]> {
    return [];
  }

  async createMeeting(projectId: string, meeting: Partial<Meeting>): Promise<Meeting> {
    throw new Error('Not implemented in backend');
  }

  async updateMeeting(meetingId: string, meeting: Partial<Meeting>): Promise<void> {
    throw new Error('Not implemented in backend');
  }

  async deleteMeeting(meetingId: string): Promise<void> {
    throw new Error('Not implemented in backend');
  }

  async listDeliverables(projectId: string): Promise<Deliverable[]> {
    return [];
  }

  async updateDeliverable(deliverableId: string, deliverable: Partial<Deliverable>): Promise<void> {
    throw new Error('Not implemented in backend');
  }

  async deleteDeliverable(deliverableId: string): Promise<void> {
    throw new Error('Not implemented in backend');
  }

  async listKpis(projectId: string): Promise<Kpi[]> {
    return [];
  }

  // ============================================================================
  // MENSAGENS (Support Messages)
  // ============================================================================

  async listMessages(threadId: string): Promise<Message[]> {
    // In BACKEND mode, threadId is the orgId for support messages
    const supportMessages = await this.actor.getSupportMessages(threadId);
    return supportMessages.map(msg => ({
      id: msg.id,
      orgId: msg.orgId,
      projectId: msg.orgId, // Use orgId as projectId for compatibility
      text: msg.message,
      createdBy: msg.sentBy.toString(),
      createdByRole: 'member' as const, // Default role
      createdAt: this.nanoToDate(msg.sentAt),
    }));
  }

  async sendMessage(threadId: string, text: string): Promise<Message> {
    // In BACKEND mode, threadId is the orgId for support messages
    const timestamp = this.dateToNano(new Date());
    await this.actor.sendSupportMessage(text, threadId, timestamp);
    
    // Return the created message
    return {
      id: `msg-${Date.now()}`,
      orgId: threadId,
      projectId: threadId,
      text,
      createdBy: 'current-user',
      createdByRole: 'member',
      createdAt: new Date(),
    };
  }

  // ============================================================================
  // DOCUMENTOS
  // ============================================================================

  async listDocuments(orgId: string): Promise<Document[]> {
    const docs = await this.actor.listDocuments(orgId);
    return docs.map(d => ({
      id: d.id,
      orgId: d.orgId,
      projectId: d.orgId,
      title: d.name,
      url: d.file.getDirectURL(),
      category: this.mapDocumentCategory(d.category),
      createdBy: d.uploadedBy.toString(),
      createdAt: this.nanoToDate(d.uploadedAt),
    }));
  }

  async createDocument(orgId: string, document: any): Promise<Document> {
    throw new Error('Not implemented in backend');
  }

  async uploadDocument(orgId: string, document: any): Promise<void> {
    await this.actor.uploadDocument({
      orgId,
      name: document.name,
      file: document.file,
      category: this.mapDocumentCategoryToBackend(document.category),
    });
  }

  async deleteDocument(documentId: string): Promise<void> {
    throw new Error('Not implemented in backend');
  }

  private mapDocumentCategory(category: any): string {
    const categoryMap: Record<string, string> = {
      contracts: 'Contratos',
      invoices: 'Faturas',
      presentations: 'Apresentações',
      reports: 'Relatórios',
      marketing: 'Marketing',
      mediaAssets: 'Mídia',
      projectDocs: 'Projetos',
      proposals: 'Propostas',
      legal: 'Jurídico',
      other: 'Outros',
    };
    return categoryMap[category] || 'Outros';
  }

  private mapDocumentCategoryToBackend(category: string): any {
    const categoryMap: Record<string, string> = {
      'Contratos': 'contracts',
      'Faturas': 'invoices',
      'Apresentações': 'presentations',
      'Relatórios': 'reports',
      'Marketing': 'marketing',
      'Mídia': 'mediaAssets',
      'Projetos': 'projectDocs',
      'Propostas': 'proposals',
      'Jurídico': 'legal',
      'Outros': 'other',
    };
    return { [categoryMap[category] || 'other']: null };
  }

  // ============================================================================
  // CRM - CONTATOS
  // ============================================================================

  async listContacts(orgId: string): Promise<Contact[]> {
    const contacts = await this.actor.listContacts(orgId);
    return contacts.map(c => ({
      id: c.id,
      orgId: c.orgId,
      name: c.name,
      email: c.email,
      phone: c.phone,
      company: '',
      tags: [],
      status: 'ativo',
      ownerUserId: c.createdBy.toString(),
      notes: '',
      attachments: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    }));
  }

  async createContact(orgId: string, contact: Partial<Contact>): Promise<Contact> {
    const newContact = {
      id: `contact-${Date.now()}`,
      orgId,
      name: contact.name || '',
      email: contact.email || '',
      phone: contact.phone || '',
      createdBy: await this.getCurrentPrincipal(),
    };
    await this.actor.createContact(newContact);
    return {
      ...newContact,
      company: contact.company || '',
      tags: contact.tags || [],
      status: contact.status || 'ativo',
      ownerUserId: newContact.createdBy.toString(),
      notes: contact.notes || '',
      attachments: contact.attachments || [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  async updateContact(contactId: string, contact: Partial<Contact>): Promise<void> {
    throw new Error('Not implemented in backend');
  }

  async deleteContact(contactId: string): Promise<void> {
    throw new Error('Not implemented in backend');
  }

  // ============================================================================
  // CRM - DEALS
  // ============================================================================

  async listDeals(orgId: string): Promise<Deal[]> {
    const deals = await this.actor.listDeals(orgId);
    return deals.map(d => ({
      id: d.id,
      orgId: d.orgId,
      title: d.name,
      contactId: '',
      stage: 'Lead' as const,
      status: 'open' as const,
      value: Number(d.value),
      probability: 50,
      ownerUserId: d.createdBy.toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
    }));
  }

  async createDeal(orgId: string, deal: Partial<Deal>): Promise<Deal> {
    throw new Error('Not implemented in backend');
  }

  async updateDeal(dealId: string, deal: Partial<Deal>): Promise<void> {
    throw new Error('Not implemented in backend');
  }

  async deleteDeal(dealId: string): Promise<void> {
    throw new Error('Not implemented in backend');
  }

  // ============================================================================
  // CRM - ATIVIDADES
  // ============================================================================

  async listActivities(orgId: string): Promise<Activity[]> {
    const activities = await this.actor.listActivities(orgId);
    return activities.map(a => ({
      id: a.id,
      orgId: a.orgId,
      type: 'task' as const,
      dueDate: a.dueDate ? this.nanoToDate(a.dueDate) : new Date(),
      status: a.completed ? 'done' as const : 'open' as const,
      ownerUserId: a.createdBy.toString(),
      relatedType: 'project' as const,
      relatedId: a.relatedProject || '',
      notes: a.name,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));
  }

  async createActivity(orgId: string, activity: Partial<Activity>): Promise<Activity> {
    throw new Error('Not implemented in backend');
  }

  async updateActivity(activityId: string, activity: Partial<Activity>): Promise<void> {
    throw new Error('Not implemented in backend');
  }

  async deleteActivity(activityId: string): Promise<void> {
    throw new Error('Not implemented in backend');
  }

  // ============================================================================
  // CRM - CONTRATOS
  // ============================================================================

  async listContracts(orgId: string): Promise<Contract[]> {
    const contracts = await this.actor.listContracts(orgId);
    return contracts.map(c => ({
      id: c.id,
      orgId: c.orgId,
      contactId: '',
      name: c.name,
      mrr: Number(c.value),
      startDate: this.nanoToDate(c.startDate),
      renewalDate: c.endDate ? this.nanoToDate(c.endDate) : new Date(),
      status: c.isCancelled ? 'canceled' as const : 'active' as const,
      cancelDate: c.isCancelled ? new Date() : undefined,
      cancelReason: c.cancellationReason || undefined,
      createdAt: this.nanoToDate(c.startDate),
      updatedAt: new Date(),
    }));
  }

  async createContract(orgId: string, contract: Partial<Contract>): Promise<Contract> {
    const newContract = {
      id: `contract-${Date.now()}`,
      orgId,
      name: contract.name || '',
      value: BigInt(contract.mrr || 0),
      startDate: this.dateToNano(contract.startDate || new Date()),
      endDate: contract.renewalDate ? this.dateToNano(contract.renewalDate) : undefined,
      createdBy: await this.getCurrentPrincipal(),
      isCancelled: false,
      cancellationReason: '',
    };
    await this.actor.createContract(newContract);
    return {
      ...contract,
      id: newContract.id,
      orgId,
      contactId: contract.contactId || '',
      name: contract.name || '',
      mrr: contract.mrr || 0,
      startDate: contract.startDate || new Date(),
      renewalDate: contract.renewalDate || new Date(),
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date(),
    } as Contract;
  }

  async updateContract(contractId: string, contract: Partial<Contract>): Promise<void> {
    throw new Error('Not implemented in backend');
  }

  async deleteContract(contractId: string): Promise<void> {
    throw new Error('Not implemented in backend');
  }

  async cancelContract(contractId: string, cancelReason: string): Promise<void> {
    await this.actor.cancelContract(contractId, cancelReason);
  }

  // ============================================================================
  // FINANCEIRO
  // ============================================================================

  async listFinanceTransactions(orgId: string): Promise<FinanceTransaction[]> {
    const transactions = await this.actor.listFinanceTransactions(orgId);
    return transactions.map(t => ({
      id: t.id,
      orgId: t.orgId,
      type: 'income' as const,
      date: this.nanoToDate(t.createdAt),
      value: Number(t.amount),
      category: '',
      description: t.description,
      isRecurring: false,
      createdAt: this.nanoToDate(t.createdAt),
      updatedAt: new Date(),
    }));
  }

  async createFinanceTransaction(orgId: string, transaction: Partial<FinanceTransaction>): Promise<FinanceTransaction> {
    throw new Error('Not implemented in backend');
  }

  async updateFinanceTransaction(transactionId: string, transaction: Partial<FinanceTransaction>): Promise<void> {
    throw new Error('Not implemented in backend');
  }

  async deleteFinanceTransaction(transactionId: string): Promise<void> {
    throw new Error('Not implemented in backend');
  }

  // ============================================================================
  // NPS
  // ============================================================================

  async listNpsCampaigns(orgId: string): Promise<NpsCampaign[]> {
    const campaigns = await this.actor.listNpsCampaigns(orgId);
    return campaigns.map(c => ({
      id: c.id,
      orgId: c.orgId,
      periodKey: '',
      status: c.status === 'active' ? 'active' as const : 'closed' as const,
      createdAt: this.nanoToDate(c.createdAt),
      updatedAt: new Date(),
    }));
  }

  async createNpsCampaign(orgId: string, campaign: Partial<NpsCampaign>): Promise<NpsCampaign> {
    throw new Error('Not implemented in backend');
  }

  async listNpsResponses(orgId: string, startDate: Date, endDate: Date): Promise<NpsResponse[]> {
    const responses = await this.actor.getNpsResponsesForPeriod(
      orgId,
      this.dateToNano(startDate),
      this.dateToNano(endDate)
    );
    return responses.map(r => ({
      id: `${r.campaignId}-${r.contractId}`,
      orgId: r.orgId,
      campaignId: r.campaignId,
      contactId: r.contractId,
      score: Number(r.score),
      comment: r.comment,
      createdAt: this.nanoToDate(r.submittedAt),
    }));
  }

  async createNpsResponse(orgId: string, response: Partial<NpsResponse>): Promise<NpsResponse> {
    throw new Error('Not implemented in backend');
  }

  // ============================================================================
  // REPORTS & TEAM
  // ============================================================================

  async listReports(orgId: string): Promise<any[]> {
    return [];
  }

  async generateReport(orgId: string, report: any): Promise<void> {
    throw new Error('Not implemented in backend');
  }

  async isCallerAdmin(): Promise<boolean> {
    return await this.actor.isCallerAdmin();
  }

  async inviteTeamMember(orgId: string, invitation: any): Promise<void> {
    throw new Error('Not implemented in backend');
  }

  async listOrgMembers(orgId: string): Promise<any[]> {
    const members = await this.actor.listOrgMembers(orgId);
    return members.map(m => ({ id: m.toString() }));
  }

  async listTeamInvitations(orgId: string): Promise<any[]> {
    return [];
  }
}
