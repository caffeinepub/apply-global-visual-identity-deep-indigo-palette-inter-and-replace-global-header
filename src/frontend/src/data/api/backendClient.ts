import type { backendInterface, DealStage as BackendDealStage, ProjectPhase as BackendProjectPhase, DocumentCategory as BackendDocumentCategory } from '../../backend';
import { ExternalBlob, DocumentCategory } from '../../backend';
import type {
  Organization,
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
  OrgId,
  ProjectId,
  UserProfile,
  NpsCampaign,
} from '../../types/model';

/**
 * Cliente que conecta ao backend Motoko via actor.
 * Mapeia os tipos do backend para os tipos do frontend.
 */

// Map backend DocumentCategory enum to display strings (pt-BR)
const CATEGORY_DISPLAY: Record<BackendDocumentCategory, string> = {
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

export class BackendClient {
  constructor(private actor: backendInterface) {}

  // ============================================================================
  // ORGANIZAÇÕES
  // ============================================================================

  async listOrgs(): Promise<Organization[]> {
    // Backend doesn't have listOrgs yet, return empty for now
    return [];
  }

  async getOrg(orgId: OrgId): Promise<Organization | null> {
    try {
      const org = await this.actor.getOrganization(orgId);
      if (!org) return null;
      return {
        id: org.id,
        name: org.name,
        owner: org.createdBy.toString(),
        createdAt: new Date(Number(org.createdAt) / 1000000),
      };
    } catch {
      return null;
    }
  }

  async createOrg(name: string): Promise<Organization> {
    const timestamp = BigInt(Date.now() * 1000000);
    const orgId = await this.actor.createOrganization(name, timestamp);
    const org = await this.actor.getOrganization(orgId);
    if (!org) throw new Error('Failed to create organization');
    return {
      id: org.id,
      name: org.name,
      owner: org.createdBy.toString(),
      createdAt: new Date(Number(org.createdAt) / 1000000),
    };
  }

  async selectOrg(orgId: OrgId): Promise<void> {
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
  // PERFIL DE USUÁRIO
  // ============================================================================

  async getUserProfile(): Promise<UserProfile | null> {
    const profile = await this.actor.getCallerUserProfile();
    return profile;
  }

  async saveUserProfile(profile: UserProfile): Promise<void> {
    await this.actor.saveCallerUserProfile(profile);
  }

  // ============================================================================
  // PROJETOS
  // ============================================================================

  async listProjects(orgId: OrgId): Promise<Project[]> {
    const projects = await this.actor.listProjects(orgId);
    return projects.map((p) => ({
      id: p.id,
      orgId: p.orgId,
      name: p.name,
      clientName: p.name,
      businessProfile: 'solo' as const,
      journeyMonths: 3,
      stage: this.mapProjectPhase(p.phase),
      startDate: new Date(),
      createdBy: p.createdBy.toString(),
      createdAt: new Date(),
    }));
  }

  async getProject(projectId: ProjectId): Promise<Project | null> {
    const project = await this.actor.getProject(projectId);
    if (!project) return null;
    return {
      id: project.id,
      orgId: project.orgId,
      name: project.name,
      clientName: project.name,
      businessProfile: 'solo' as const,
      journeyMonths: 3,
      stage: this.mapProjectPhase(project.phase),
      startDate: new Date(),
      createdBy: project.createdBy.toString(),
      createdAt: new Date(),
    };
  }

  async createProject(orgId: OrgId, project: Partial<Project>): Promise<Project> {
    const backendProject = {
      id: `project-${Date.now()}`,
      orgId,
      name: project.name || '',
      description: project.clientName || '',
      phase: 'planning' as any,
      createdBy: (await this.actor.getCallerUserProfile())?.currentOrgId || '',
      createdAt: BigInt(0),
    };
    
    await this.actor.createProject(backendProject as any);
    return {
      id: backendProject.id,
      orgId,
      name: backendProject.name,
      clientName: backendProject.description,
      businessProfile: 'solo',
      journeyMonths: 3,
      stage: 'onboarding',
      startDate: new Date(),
      createdBy: backendProject.createdBy,
      createdAt: new Date(),
    };
  }

  private mapProjectPhase(phase: BackendProjectPhase): Project['stage'] {
    const phaseStr = Object.keys(phase)[0];
    if (phaseStr === 'planning') return 'onboarding';
    if (phaseStr === 'inProgress') return 'execution_continuous';
    if (phaseStr === 'completed') return 'closing';
    return 'onboarding';
  }

  // ============================================================================
  // TAREFAS (Stage 1: não implementado no backend ainda)
  // ============================================================================

  async listTasks(_projectId: ProjectId): Promise<Task[]> {
    return [];
  }

  async createTask(_projectId: ProjectId, _task: Partial<Task>): Promise<Task> {
    throw new Error('Not implemented in backend mode');
  }

  async updateTask(_taskId: string, _task: Partial<Task>): Promise<void> {
    throw new Error('Not implemented in backend mode');
  }

  async deleteTask(_taskId: string): Promise<void> {
    throw new Error('Not implemented in backend mode');
  }

  async updateTaskStatus(_taskId: string, _status: string): Promise<void> {
    throw new Error('Not implemented in backend mode');
  }

  // ============================================================================
  // REUNIÕES (Stage 1: não implementado no backend ainda)
  // ============================================================================

  async listMeetings(_projectId: ProjectId): Promise<Meeting[]> {
    return [];
  }

  async createMeeting(_projectId: ProjectId, _meeting: Partial<Meeting>): Promise<Meeting> {
    throw new Error('Not implemented in backend mode');
  }

  async updateMeeting(_meetingId: string, _meeting: Partial<Meeting>): Promise<void> {
    throw new Error('Not implemented in backend mode');
  }

  async deleteMeeting(_meetingId: string): Promise<void> {
    throw new Error('Not implemented in backend mode');
  }

  // ============================================================================
  // ENTREGÁVEIS (Stage 1: não implementado no backend ainda)
  // ============================================================================

  async listDeliverables(_projectId: ProjectId): Promise<Deliverable[]> {
    return [];
  }

  async updateDeliverable(_deliverableId: string, _deliverable: Partial<Deliverable>): Promise<void> {
    throw new Error('Not implemented in backend mode');
  }

  async deleteDeliverable(_deliverableId: string): Promise<void> {
    throw new Error('Not implemented in backend mode');
  }

  // ============================================================================
  // KPIs (Stage 1: não implementado no backend ainda)
  // ============================================================================

  async listKpis(_projectId: ProjectId): Promise<Kpi[]> {
    return [];
  }

  // ============================================================================
  // MENSAGENS (Stage 1: não implementado no backend ainda)
  // ============================================================================

  async listMessages(_projectId: ProjectId): Promise<Message[]> {
    return [];
  }

  async sendMessage(_projectId: ProjectId, _text: string): Promise<Message> {
    throw new Error('Not implemented in backend mode');
  }

  // ============================================================================
  // DOCUMENTOS
  // ============================================================================

  async listDocuments(orgId: OrgId): Promise<Document[]> {
    const docs = await this.actor.listDocuments(orgId);
    return docs.map((d) => {
      // Map backend category enum to display string (pt-BR)
      const categoryDisplay = CATEGORY_DISPLAY[d.category] || 'Outros';
      
      return {
        id: d.id,
        orgId: d.orgId,
        projectId: d.orgId,
        title: d.name,
        url: d.file.getDirectURL(),
        category: categoryDisplay,
        createdBy: d.uploadedBy.toString(),
        createdAt: new Date(Number(d.uploadedAt) / 1000000),
      };
    });
  }

  async createDocument(_projectId: ProjectId, _document: Partial<Document>): Promise<Document> {
    throw new Error('Use uploadDocument for backend mode');
  }

  async uploadDocument(
    orgId: OrgId,
    document: { name: string; category: BackendDocumentCategory; file: ExternalBlob }
  ): Promise<void> {
    await this.actor.uploadDocument({
      orgId,
      name: document.name,
      category: document.category,
      file: document.file,
    });
  }

  async updateDocument(_documentId: string, _document: Partial<Document>): Promise<void> {
    throw new Error('Not implemented in backend mode');
  }

  async deleteDocument(_documentId: string): Promise<void> {
    throw new Error('Not implemented in backend mode');
  }

  // ============================================================================
  // CONTATOS
  // ============================================================================

  async listContacts(orgId: OrgId): Promise<Contact[]> {
    const contacts = await this.actor.listContacts(orgId);
    return contacts.map((c) => ({
      id: c.id,
      orgId: c.orgId,
      name: c.name,
      email: c.email,
      phone: c.phone,
      company: '',
      tags: [],
      status: 'active',
      ownerUserId: c.createdBy.toString(),
      notes: '',
      attachments: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    }));
  }

  async getContact(contactId: string): Promise<Contact | null> {
    const contact = await this.actor.getContact(contactId);
    if (!contact) return null;
    return {
      id: contact.id,
      orgId: contact.orgId,
      name: contact.name,
      email: contact.email,
      phone: contact.phone,
      company: '',
      tags: [],
      status: 'active',
      ownerUserId: contact.createdBy.toString(),
      notes: '',
      attachments: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  async createContact(orgId: OrgId, contact: Partial<Contact>): Promise<Contact> {
    const backendContact = {
      id: `contact-${Date.now()}`,
      orgId,
      name: contact.name || '',
      email: contact.email || '',
      phone: contact.phone || '',
      createdBy: (await this.actor.getCallerUserProfile())?.currentOrgId || '',
    };
    
    await this.actor.createContact(backendContact as any);
    return {
      id: backendContact.id,
      orgId,
      name: backendContact.name,
      email: backendContact.email,
      phone: backendContact.phone,
      company: '',
      tags: [],
      status: 'active',
      ownerUserId: backendContact.createdBy,
      notes: '',
      attachments: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  async updateContact(_contactId: string, _contact: Partial<Contact>): Promise<void> {
    throw new Error('Not implemented in backend mode');
  }

  async deleteContact(_contactId: string): Promise<void> {
    throw new Error('Not implemented in backend mode');
  }

  // ============================================================================
  // DEALS
  // ============================================================================

  async listDeals(orgId: OrgId): Promise<Deal[]> {
    const deals = await this.actor.listDeals(orgId);
    return deals.map((d) => ({
      id: d.id,
      orgId: d.orgId,
      title: d.name,
      contactId: '',
      stage: this.mapDealStage(d.stage),
      status: 'open' as const,
      value: Number(d.value),
      probability: 50,
      ownerUserId: d.createdBy.toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
    }));
  }

  async getDeal(dealId: string): Promise<Deal | null> {
    const deal = await this.actor.getDeal(dealId);
    if (!deal) return null;
    return {
      id: deal.id,
      orgId: deal.orgId,
      title: deal.name,
      contactId: '',
      stage: this.mapDealStage(deal.stage),
      status: 'open',
      value: Number(deal.value),
      probability: 50,
      ownerUserId: deal.createdBy.toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  async createDeal(orgId: OrgId, deal: Partial<Deal>): Promise<Deal> {
    const backendDeal = {
      id: `deal-${Date.now()}`,
      orgId,
      name: deal.title || '',
      value: BigInt(deal.value || 0),
      stage: this.mapDealStageToBackend(deal.stage || 'Lead'),
      createdBy: (await this.actor.getCallerUserProfile())?.currentOrgId || '',
    };
    
    await this.actor.createDeal(backendDeal as any);
    return {
      id: backendDeal.id,
      orgId,
      title: backendDeal.name,
      contactId: '',
      stage: deal.stage || 'Lead',
      status: 'open',
      value: Number(backendDeal.value),
      probability: 50,
      ownerUserId: backendDeal.createdBy,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  async updateDeal(_dealId: string, _deal: Partial<Deal>): Promise<void> {
    throw new Error('Not implemented in backend mode');
  }

  async deleteDeal(_dealId: string): Promise<void> {
    throw new Error('Not implemented in backend mode');
  }

  private mapDealStage(stage: BackendDealStage): Deal['stage'] {
    const stageStr = Object.keys(stage)[0];
    if (stageStr === 'prospecting') return 'Lead';
    if (stageStr === 'negotiation') return 'Negociação';
    if (stageStr === 'closedWon') return 'Fechado';
    if (stageStr === 'closedLost') return 'Fechado';
    return 'Lead';
  }

  private mapDealStageToBackend(stage: Deal['stage']): BackendDealStage {
    if (stage === 'Lead') return { prospecting: null } as any;
    if (stage === 'Qualificação') return { prospecting: null } as any;
    if (stage === 'Proposta') return { negotiation: null } as any;
    if (stage === 'Negociação') return { negotiation: null } as any;
    if (stage === 'Fechado') return { closedWon: null } as any;
    return { prospecting: null } as any;
  }

  // ============================================================================
  // ATIVIDADES
  // ============================================================================

  async listActivities(orgId: OrgId): Promise<Activity[]> {
    const activities = await this.actor.listActivities(orgId);
    return activities.map((a) => ({
      id: a.id,
      orgId: a.orgId,
      type: 'task' as const,
      dueDate: a.dueDate ? new Date(Number(a.dueDate) / 1000000) : new Date(),
      status: a.completed ? 'done' : 'open',
      ownerUserId: a.createdBy.toString(),
      relatedType: 'project' as const,
      relatedId: a.relatedProject || '',
      notes: a.name,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));
  }

  async createActivity(orgId: OrgId, activity: Partial<Activity>): Promise<Activity> {
    const backendActivity = {
      id: `activity-${Date.now()}`,
      orgId,
      name: activity.notes || '',
      dueDate: activity.dueDate ? BigInt(activity.dueDate.getTime() * 1000000) : undefined,
      completed: false,
      relatedProject: activity.relatedId,
      createdBy: (await this.actor.getCallerUserProfile())?.currentOrgId || '',
    };
    
    await this.actor.createActivity(backendActivity as any);
    return {
      id: backendActivity.id,
      orgId,
      type: 'task',
      dueDate: activity.dueDate || new Date(),
      status: 'open',
      ownerUserId: backendActivity.createdBy,
      relatedType: 'project',
      relatedId: activity.relatedId || '',
      notes: backendActivity.name,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  async updateActivity(_activityId: string, _activity: Partial<Activity>): Promise<void> {
    throw new Error('Not implemented in backend mode');
  }

  async deleteActivity(_activityId: string): Promise<void> {
    throw new Error('Not implemented in backend mode');
  }

  // ============================================================================
  // CONTRATOS
  // ============================================================================

  async listContracts(orgId: OrgId): Promise<Contract[]> {
    const contracts = await this.actor.listContracts(orgId);
    return contracts.map((c) => ({
      id: c.id,
      orgId: c.orgId,
      contactId: '',
      name: c.name,
      mrr: Number(c.value),
      startDate: new Date(Number(c.startDate) / 1000000),
      renewalDate: c.endDate ? new Date(Number(c.endDate) / 1000000) : new Date(),
      status: 'active' as const,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));
  }

  async createContract(orgId: OrgId, contract: Partial<Contract>): Promise<Contract> {
    const backendContract = {
      id: `contract-${Date.now()}`,
      orgId,
      name: contract.name || '',
      value: BigInt(contract.mrr || 0),
      startDate: BigInt(contract.startDate?.getTime() || Date.now() * 1000000),
      endDate: contract.renewalDate ? BigInt(contract.renewalDate.getTime() * 1000000) : undefined,
      createdBy: (await this.actor.getCallerUserProfile())?.currentOrgId || '',
    };
    
    await this.actor.createContract(backendContract as any);
    return {
      id: backendContract.id,
      orgId,
      contactId: '',
      name: backendContract.name,
      mrr: Number(backendContract.value),
      startDate: new Date(Number(backendContract.startDate) / 1000000),
      renewalDate: backendContract.endDate ? new Date(Number(backendContract.endDate) / 1000000) : new Date(),
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  async updateContract(_contractId: string, _contract: Partial<Contract>): Promise<void> {
    throw new Error('Not implemented in backend mode');
  }

  async deleteContract(_contractId: string): Promise<void> {
    throw new Error('Not implemented in backend mode');
  }

  // ============================================================================
  // FINANÇAS
  // ============================================================================

  async listFinanceTransactions(orgId: OrgId): Promise<FinanceTransaction[]> {
    const transactions = await this.actor.listFinanceTransactions(orgId);
    return transactions.map((t) => ({
      id: t.id,
      orgId: t.orgId,
      type: 'income' as const,
      value: Number(t.amount),
      description: t.description,
      category: 'other' as const,
      date: new Date(Number(t.createdAt) / 1000000),
      isRecurring: false,
      createdAt: new Date(Number(t.createdAt) / 1000000),
      updatedAt: new Date(Number(t.createdAt) / 1000000),
    }));
  }

  async createFinanceTransaction(
    orgId: OrgId,
    transaction: Partial<FinanceTransaction>
  ): Promise<FinanceTransaction> {
    const backendTransaction = {
      id: `transaction-${Date.now()}`,
      orgId,
      description: transaction.description || '',
      amount: BigInt(transaction.value || 0),
      createdBy: (await this.actor.getCallerUserProfile())?.currentOrgId || '',
      createdAt: BigInt(Date.now() * 1000000),
    };
    
    await this.actor.createFinanceTransaction(backendTransaction as any);
    return {
      id: backendTransaction.id,
      orgId,
      type: 'income',
      value: Number(backendTransaction.amount),
      description: backendTransaction.description,
      category: 'other',
      date: new Date(),
      isRecurring: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  async updateFinanceTransaction(
    _transactionId: string,
    _transaction: Partial<FinanceTransaction>
  ): Promise<void> {
    throw new Error('Not implemented in backend mode');
  }

  async deleteFinanceTransaction(_transactionId: string): Promise<void> {
    throw new Error('Not implemented in backend mode');
  }

  // ============================================================================
  // NPS CAMPAIGNS
  // ============================================================================

  async listNpsCampaigns(orgId: OrgId): Promise<NpsCampaign[]> {
    const campaigns = await this.actor.listNpsCampaigns(orgId);
    return campaigns.map((c) => ({
      id: c.id,
      orgId: c.orgId,
      periodKey: new Date(Number(c.createdAt) / 1000000).toISOString().slice(0, 7),
      status: c.status === 'active' ? 'active' as const : 'closed' as const,
      createdAt: new Date(Number(c.createdAt) / 1000000),
      updatedAt: new Date(Number(c.createdAt) / 1000000),
    }));
  }

  async createNpsCampaign(orgId: OrgId, campaign: Partial<NpsCampaign>): Promise<NpsCampaign> {
    const backendCampaign = {
      id: `nps-${Date.now()}`,
      orgId,
      name: campaign.periodKey || new Date().toISOString().slice(0, 7),
      status: campaign.status || 'active',
      createdAt: BigInt(Date.now() * 1000000),
      createdBy: (await this.actor.getCallerUserProfile())?.currentOrgId || '',
    };
    
    await this.actor.createNpsCampaign(backendCampaign as any);
    return {
      id: backendCampaign.id,
      orgId,
      periodKey: backendCampaign.name,
      status: backendCampaign.status === 'active' ? 'active' : 'closed',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  // ============================================================================
  // REPORTS
  // ============================================================================

  async listReports(orgId: OrgId): Promise<any[]> {
    const reports = await this.actor.listReports(orgId);
    return reports.map((r) => ({
      id: r.id,
      orgId: r.orgId,
      type: r.reportType,
      period: r.period,
      format: r.format,
      generatedAt: new Date(Number(r.generatedAt) / 1000000),
      generatedBy: r.generatedBy.toString(),
    }));
  }

  async generateReport(orgId: OrgId, report: any): Promise<void> {
    const backendReport = {
      id: `report-${Date.now()}`,
      orgId,
      reportType: report.type || 'sales',
      period: report.period || 'monthly',
      format: report.format || 'pdf',
      generatedAt: BigInt(Date.now() * 1000000),
      generatedBy: (await this.actor.getCallerUserProfile())?.currentOrgId || '',
    };
    
    await this.actor.generateReport(backendReport as any);
  }

  // ============================================================================
  // TEAM MANAGEMENT
  // ============================================================================

  async isCallerAdmin(): Promise<boolean> {
    return await this.actor.isCallerAdmin();
  }

  async inviteTeamMember(orgId: OrgId, invitation: any): Promise<void> {
    const backendInvitation = {
      id: `invitation-${Date.now()}`,
      orgId,
      inviteeIdentifier: invitation.email || '',
      invitedBy: (await this.actor.getCallerUserProfile())?.currentOrgId || '',
      invitedAt: BigInt(Date.now() * 1000000),
      status: 'pending',
    };
    
    await this.actor.inviteTeamMember(backendInvitation as any);
  }

  async listOrgMembers(orgId: OrgId): Promise<any[]> {
    const members = await this.actor.listOrgMembers(orgId);
    return members.map((m) => ({
      id: m.toString(),
      principal: m.toString(),
    }));
  }

  async listTeamInvitations(orgId: OrgId): Promise<any[]> {
    const invitations = await this.actor.listTeamInvitations(orgId);
    return invitations.map((i) => ({
      id: i.id,
      orgId: i.orgId,
      email: i.inviteeIdentifier,
      status: i.status,
      invitedAt: new Date(Number(i.invitedAt) / 1000000),
      invitedBy: i.invitedBy.toString(),
    }));
  }
}
