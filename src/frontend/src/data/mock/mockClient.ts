import type {
  Organization,
  User,
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
  TaskStatus,
  Pillar,
  MeetingCadence,
  NpsCampaign,
} from '../../types/model';
import {
  mockOrganizations,
  mockUsers,
  mockProjects,
  mockProjectMembers,
  mockTasks,
  mockMeetings,
  mockDeliverables,
  mockKpis,
  mockMessages,
  mockDocuments,
  mockContacts,
  mockDeals,
  mockActivities,
  mockContracts,
  mockFinanceTransactions,
} from './seed';
import { DocumentCategory } from '../../backend';

/**
 * Cliente mock que simula as operações do backend usando dados locais.
 * Todas as operações são síncronas mas retornam Promises para manter
 * a mesma interface do cliente real.
 */

// Map backend DocumentCategory enum to display strings (pt-BR)
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

// ============================================================================
// ORGANIZAÇÕES
// ============================================================================

export async function mockListOrgs(): Promise<Organization[]> {
  return Promise.resolve([...mockOrganizations]);
}

export async function mockGetOrg(orgId: OrgId): Promise<Organization | null> {
  const org = mockOrganizations.find((o) => o.id === orgId);
  return Promise.resolve(org || null);
}

export async function mockCreateOrg(name: string): Promise<Organization> {
  const newOrg: Organization = {
    id: `org-${Date.now()}`,
    name,
    owner: 'current-user',
    createdAt: new Date(),
  };
  mockOrganizations.push(newOrg);
  return Promise.resolve(newOrg);
}

// ============================================================================
// PERFIL DE USUÁRIO
// ============================================================================

export async function mockGetUserProfile(userId: string): Promise<UserProfile | null> {
  const user = mockUsers.find((u) => u.id === userId);
  if (!user) return Promise.resolve(null);
  
  return Promise.resolve({
    firstName: user.name.split(' ')[0],
    lastName: user.name.split(' ').slice(1).join(' '),
    email: user.email,
    currentOrgId: user.orgId,
  });
}

export async function mockSaveUserProfile(profile: UserProfile): Promise<void> {
  // Em modo mock, apenas simula o salvamento
  return Promise.resolve();
}

// ============================================================================
// PROJETOS
// ============================================================================

export async function mockListProjects(orgId: OrgId): Promise<Project[]> {
  const projects = mockProjects.filter((p) => p.orgId === orgId);
  return Promise.resolve(projects);
}

export async function mockGetProject(projectId: ProjectId): Promise<Project | null> {
  const project = mockProjects.find((p) => p.id === projectId);
  return Promise.resolve(project || null);
}

export async function mockCreateProject(orgId: OrgId, project: Partial<Project>): Promise<Project> {
  const newProject: Project = {
    id: `project-${Date.now()}`,
    orgId,
    name: project.name || '',
    clientName: project.clientName || '',
    businessProfile: project.businessProfile || 'solo',
    journeyMonths: project.journeyMonths || 3,
    stage: project.stage || 'onboarding',
    startDate: project.startDate || new Date(),
    createdBy: 'current-user',
    createdAt: new Date(),
  };
  mockProjects.push(newProject);
  return Promise.resolve(newProject);
}

// ============================================================================
// TAREFAS
// ============================================================================

export async function mockListTasks(projectId: ProjectId): Promise<Task[]> {
  const tasks = mockTasks.filter((t) => t.projectId === projectId);
  return Promise.resolve(tasks);
}

export async function mockCreateTask(projectId: ProjectId, task: Partial<Task>): Promise<Task> {
  const newTask: Task = {
    id: `task-${Date.now()}`,
    orgId: 'org-1',
    projectId,
    title: task.title || '',
    description: task.description || '',
    status: (task.status as TaskStatus) || 'todo',
    pillar: (task.pillar as Pillar) || 'Estratégia',
    dueDate: task.dueDate,
    ownerUserId: 'user-client-1',
    ownerRole: 'client',
    createdAt: new Date(),
  };
  mockTasks.push(newTask);
  return Promise.resolve(newTask);
}

export async function mockUpdateTask(taskId: string, task: Partial<Task>): Promise<void> {
  const index = mockTasks.findIndex((t) => t.id === taskId);
  if (index !== -1) {
    mockTasks[index] = { ...mockTasks[index], ...task } as Task;
  }
  return Promise.resolve();
}

export async function mockDeleteTask(taskId: string): Promise<void> {
  const index = mockTasks.findIndex((t) => t.id === taskId);
  if (index !== -1) {
    mockTasks.splice(index, 1);
  }
  return Promise.resolve();
}

export async function mockUpdateTaskStatus(taskId: string, status: string): Promise<void> {
  const task = mockTasks.find((t) => t.id === taskId);
  if (task) {
    task.status = status as TaskStatus;
  }
  return Promise.resolve();
}

// ============================================================================
// REUNIÕES
// ============================================================================

export async function mockListMeetings(projectId: ProjectId): Promise<Meeting[]> {
  const meetings = mockMeetings.filter((m) => m.projectId === projectId);
  return Promise.resolve(meetings);
}

export async function mockCreateMeeting(projectId: ProjectId, meeting: Partial<Meeting>): Promise<Meeting> {
  const newMeeting: Meeting = {
    id: `meeting-${Date.now()}`,
    orgId: 'org-1',
    projectId,
    title: meeting.title || '',
    datetime: meeting.datetime || new Date(),
    cadence: (meeting.cadence as MeetingCadence) || 'ad_hoc',
    notes: meeting.notes || '',
    createdAt: new Date(),
  };
  mockMeetings.push(newMeeting);
  return Promise.resolve(newMeeting);
}

export async function mockUpdateMeeting(meetingId: string, meeting: Partial<Meeting>): Promise<void> {
  const index = mockMeetings.findIndex((m) => m.id === meetingId);
  if (index !== -1) {
    mockMeetings[index] = { ...mockMeetings[index], ...meeting } as Meeting;
  }
  return Promise.resolve();
}

export async function mockDeleteMeeting(meetingId: string): Promise<void> {
  const index = mockMeetings.findIndex((m) => m.id === meetingId);
  if (index !== -1) {
    mockMeetings.splice(index, 1);
  }
  return Promise.resolve();
}

// ============================================================================
// ENTREGÁVEIS
// ============================================================================

export async function mockListDeliverables(projectId: ProjectId): Promise<Deliverable[]> {
  const deliverables = mockDeliverables.filter((d) => d.projectId === projectId);
  return Promise.resolve(deliverables);
}

export async function mockUpdateDeliverable(deliverableId: string, deliverable: Partial<Deliverable>): Promise<void> {
  const index = mockDeliverables.findIndex((d) => d.id === deliverableId);
  if (index !== -1) {
    mockDeliverables[index] = { ...mockDeliverables[index], ...deliverable } as Deliverable;
  }
  return Promise.resolve();
}

export async function mockDeleteDeliverable(deliverableId: string): Promise<void> {
  const index = mockDeliverables.findIndex((d) => d.id === deliverableId);
  if (index !== -1) {
    mockDeliverables.splice(index, 1);
  }
  return Promise.resolve();
}

// ============================================================================
// KPIs
// ============================================================================

export async function mockListKpis(projectId: ProjectId): Promise<Kpi[]> {
  const kpis = mockKpis.filter((k) => k.projectId === projectId);
  return Promise.resolve(kpis);
}

// ============================================================================
// MENSAGENS
// ============================================================================

export async function mockListMessages(projectId: ProjectId): Promise<Message[]> {
  const messages = mockMessages.filter((m) => m.projectId === projectId);
  return Promise.resolve(messages);
}

export async function mockSendMessage(projectId: ProjectId, text: string): Promise<Message> {
  const newMessage: Message = {
    id: `message-${Date.now()}`,
    orgId: 'org-1',
    projectId,
    createdBy: 'user-client-1',
    createdByRole: 'client',
    text,
    createdAt: new Date(),
  };
  mockMessages.push(newMessage);
  return Promise.resolve(newMessage);
}

// ============================================================================
// DOCUMENTOS
// ============================================================================

export async function mockListDocuments(orgId: OrgId): Promise<Document[]> {
  const documents = mockDocuments.filter((d) => d.orgId === orgId);
  return Promise.resolve(documents);
}

export async function mockCreateDocument(projectId: ProjectId, document: Partial<Document>): Promise<Document> {
  const newDocument: Document = {
    id: `document-${Date.now()}`,
    orgId: 'org-1',
    projectId,
    title: document.title || '',
    url: document.url || '',
    category: document.category || 'Outros',
    createdBy: 'user-client-1',
    createdAt: new Date(),
  };
  mockDocuments.push(newDocument);
  return Promise.resolve(newDocument);
}

export async function mockUploadDocument(
  orgId: OrgId,
  document: { name: string; category: DocumentCategory; file: any }
): Promise<void> {
  // Generate a unique ID for the document
  const docId = `doc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  // Get the direct URL from the ExternalBlob if available
  let url = '';
  try {
    if (document.file && typeof document.file.getDirectURL === 'function') {
      url = document.file.getDirectURL();
    }
  } catch (e) {
    // If getDirectURL fails, use a placeholder
    url = `#document-${docId}`;
  }
  
  // Map category enum to display string
  const categoryDisplay = CATEGORY_DISPLAY[document.category] || 'Outros';
  
  const newDocument: Document = {
    id: docId,
    orgId,
    projectId: orgId, // Use orgId as projectId for consistency
    title: document.name,
    url,
    category: categoryDisplay,
    createdBy: 'current-user',
    createdAt: new Date(),
  };
  
  mockDocuments.push(newDocument);
  return Promise.resolve();
}

export async function mockUpdateDocument(documentId: string, document: Partial<Document>): Promise<void> {
  const index = mockDocuments.findIndex((d) => d.id === documentId);
  if (index !== -1) {
    mockDocuments[index] = { ...mockDocuments[index], ...document } as Document;
  }
  return Promise.resolve();
}

export async function mockDeleteDocument(documentId: string): Promise<void> {
  const index = mockDocuments.findIndex((d) => d.id === documentId);
  if (index !== -1) {
    mockDocuments.splice(index, 1);
  }
  return Promise.resolve();
}

// ============================================================================
// CONTATOS
// ============================================================================

export async function mockListContacts(orgId: OrgId): Promise<Contact[]> {
  const contacts = mockContacts.filter((c) => c.orgId === orgId);
  return Promise.resolve(contacts);
}

export async function mockGetContact(contactId: string): Promise<Contact | null> {
  const contact = mockContacts.find((c) => c.id === contactId);
  return Promise.resolve(contact || null);
}

export async function mockCreateContact(orgId: OrgId, contact: Partial<Contact>): Promise<Contact> {
  const newContact: Contact = {
    id: `contact-${Date.now()}`,
    orgId,
    name: contact.name || '',
    email: contact.email || '',
    phone: contact.phone || '',
    company: contact.company || '',
    tags: contact.tags || [],
    status: contact.status || 'active',
    ownerUserId: 'current-user',
    notes: contact.notes || '',
    attachments: contact.attachments || [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  mockContacts.push(newContact);
  return Promise.resolve(newContact);
}

export async function mockUpdateContact(contactId: string, contact: Partial<Contact>): Promise<void> {
  const index = mockContacts.findIndex((c) => c.id === contactId);
  if (index !== -1) {
    mockContacts[index] = { ...mockContacts[index], ...contact, updatedAt: new Date() } as Contact;
  }
  return Promise.resolve();
}

export async function mockDeleteContact(contactId: string): Promise<void> {
  const index = mockContacts.findIndex((c) => c.id === contactId);
  if (index !== -1) {
    mockContacts.splice(index, 1);
  }
  return Promise.resolve();
}

// ============================================================================
// DEALS
// ============================================================================

export async function mockListDeals(orgId: OrgId): Promise<Deal[]> {
  const deals = mockDeals.filter((d) => d.orgId === orgId);
  return Promise.resolve(deals);
}

export async function mockGetDeal(dealId: string): Promise<Deal | null> {
  const deal = mockDeals.find((d) => d.id === dealId);
  return Promise.resolve(deal || null);
}

export async function mockCreateDeal(orgId: OrgId, deal: Partial<Deal>): Promise<Deal> {
  const newDeal: Deal = {
    id: `deal-${Date.now()}`,
    orgId,
    title: deal.title || '',
    contactId: deal.contactId || '',
    stage: deal.stage || 'Lead',
    status: deal.status || 'open',
    value: deal.value || 0,
    probability: deal.probability || 50,
    ownerUserId: 'current-user',
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  mockDeals.push(newDeal);
  return Promise.resolve(newDeal);
}

export async function mockUpdateDeal(dealId: string, deal: Partial<Deal>): Promise<void> {
  const index = mockDeals.findIndex((d) => d.id === dealId);
  if (index !== -1) {
    mockDeals[index] = { ...mockDeals[index], ...deal, updatedAt: new Date() } as Deal;
  }
  return Promise.resolve();
}

export async function mockDeleteDeal(dealId: string): Promise<void> {
  const index = mockDeals.findIndex((d) => d.id === dealId);
  if (index !== -1) {
    mockDeals.splice(index, 1);
  }
  return Promise.resolve();
}

// ============================================================================
// ATIVIDADES
// ============================================================================

export async function mockListActivities(orgId: OrgId): Promise<Activity[]> {
  const activities = mockActivities.filter((a) => a.orgId === orgId);
  return Promise.resolve(activities);
}

export async function mockCreateActivity(orgId: OrgId, activity: Partial<Activity>): Promise<Activity> {
  const newActivity: Activity = {
    id: `activity-${Date.now()}`,
    orgId,
    type: activity.type || 'task',
    dueDate: activity.dueDate || new Date(),
    status: activity.status || 'open',
    ownerUserId: 'current-user',
    relatedType: activity.relatedType || 'contact',
    relatedId: activity.relatedId || '',
    notes: activity.notes || '',
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  mockActivities.push(newActivity);
  return Promise.resolve(newActivity);
}

export async function mockUpdateActivity(activityId: string, activity: Partial<Activity>): Promise<void> {
  const index = mockActivities.findIndex((a) => a.id === activityId);
  if (index !== -1) {
    mockActivities[index] = { ...mockActivities[index], ...activity, updatedAt: new Date() } as Activity;
  }
  return Promise.resolve();
}

export async function mockDeleteActivity(activityId: string): Promise<void> {
  const index = mockActivities.findIndex((a) => a.id === activityId);
  if (index !== -1) {
    mockActivities.splice(index, 1);
  }
  return Promise.resolve();
}

// ============================================================================
// CONTRATOS
// ============================================================================

export async function mockListContracts(orgId: OrgId): Promise<Contract[]> {
  const contracts = mockContracts.filter((c) => c.orgId === orgId);
  return Promise.resolve(contracts);
}

export async function mockCreateContract(orgId: OrgId, contract: Partial<Contract>): Promise<Contract> {
  const newContract: Contract = {
    id: `contract-${Date.now()}`,
    orgId,
    contactId: contract.contactId || '',
    name: contract.name || '',
    mrr: contract.mrr || 0,
    startDate: contract.startDate || new Date(),
    renewalDate: contract.renewalDate || new Date(),
    status: contract.status || 'active',
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  mockContracts.push(newContract);
  return Promise.resolve(newContract);
}

export async function mockUpdateContract(contractId: string, contract: Partial<Contract>): Promise<void> {
  const index = mockContracts.findIndex((c) => c.id === contractId);
  if (index !== -1) {
    mockContracts[index] = { ...mockContracts[index], ...contract, updatedAt: new Date() } as Contract;
  }
  return Promise.resolve();
}

export async function mockDeleteContract(contractId: string): Promise<void> {
  const index = mockContracts.findIndex((c) => c.id === contractId);
  if (index !== -1) {
    mockContracts.splice(index, 1);
  }
  return Promise.resolve();
}

// ============================================================================
// FINANÇAS
// ============================================================================

export async function mockListFinanceTransactions(orgId: OrgId): Promise<FinanceTransaction[]> {
  const transactions = mockFinanceTransactions.filter((t) => t.orgId === orgId);
  return Promise.resolve(transactions);
}

export async function mockCreateFinanceTransaction(
  orgId: OrgId,
  transaction: Partial<FinanceTransaction>
): Promise<FinanceTransaction> {
  const newTransaction: FinanceTransaction = {
    id: `transaction-${Date.now()}`,
    orgId,
    type: transaction.type || 'income',
    value: transaction.value || 0,
    description: transaction.description || '',
    category: transaction.category || 'other',
    date: transaction.date || new Date(),
    isRecurring: transaction.isRecurring || false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  mockFinanceTransactions.push(newTransaction);
  return Promise.resolve(newTransaction);
}

export async function mockUpdateFinanceTransaction(
  transactionId: string,
  transaction: Partial<FinanceTransaction>
): Promise<void> {
  const index = mockFinanceTransactions.findIndex((t) => t.id === transactionId);
  if (index !== -1) {
    mockFinanceTransactions[index] = {
      ...mockFinanceTransactions[index],
      ...transaction,
      updatedAt: new Date(),
    } as FinanceTransaction;
  }
  return Promise.resolve();
}

export async function mockDeleteFinanceTransaction(transactionId: string): Promise<void> {
  const index = mockFinanceTransactions.findIndex((t) => t.id === transactionId);
  if (index !== -1) {
    mockFinanceTransactions.splice(index, 1);
  }
  return Promise.resolve();
}

// ============================================================================
// NPS CAMPAIGNS
// ============================================================================

export async function mockListNpsCampaigns(orgId: OrgId): Promise<NpsCampaign[]> {
  // Mock implementation - return empty array for now
  return Promise.resolve([]);
}

export async function mockCreateNpsCampaign(orgId: OrgId, campaign: Partial<NpsCampaign>): Promise<NpsCampaign> {
  const newCampaign: NpsCampaign = {
    id: `nps-${Date.now()}`,
    orgId,
    periodKey: campaign.periodKey || new Date().toISOString().slice(0, 7),
    status: campaign.status || 'active',
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  return Promise.resolve(newCampaign);
}

// ============================================================================
// REPORTS
// ============================================================================

export async function mockListReports(orgId: OrgId): Promise<any[]> {
  // Mock implementation - return empty array for now
  return Promise.resolve([]);
}

export async function mockGenerateReport(orgId: OrgId, report: any): Promise<void> {
  // Mock implementation - no-op
  return Promise.resolve();
}

// ============================================================================
// TEAM MANAGEMENT
// ============================================================================

export async function mockIsCallerAdmin(): Promise<boolean> {
  // Mock implementation - return true for testing
  return Promise.resolve(true);
}

export async function mockInviteTeamMember(orgId: OrgId, invitation: any): Promise<void> {
  // Mock implementation - no-op
  return Promise.resolve();
}

export async function mockListOrgMembers(orgId: OrgId): Promise<any[]> {
  // Mock implementation - return empty array for now
  return Promise.resolve([]);
}

export async function mockListTeamInvitations(orgId: OrgId): Promise<any[]> {
  // Mock implementation - return empty array for now
  return Promise.resolve([]);
}
