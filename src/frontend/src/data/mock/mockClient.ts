import {
  mockOrganizations,
  mockUsers,
  mockProjects,
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
  mockNpsCampaigns,
  mockNpsResponses,
} from './seed';
import type {
  Organization,
  User,
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
} from '../../types/model';

// In-memory storage
let organizations = [...mockOrganizations];
let users = [...mockUsers];
let projects = [...mockProjects];
let tasks = [...mockTasks];
let meetings = [...mockMeetings];
let deliverables = [...mockDeliverables];
let kpis = [...mockKpis];
let messages = [...mockMessages];
let documents = [...mockDocuments];
let contacts = [...mockContacts];
let deals = [...mockDeals];
let activities = [...mockActivities];
let contracts = [...mockContracts];
let financeTransactions = [...mockFinanceTransactions];
let npsCampaigns = [...mockNpsCampaigns];
let npsResponses = [...mockNpsResponses];

// Simulated user profile
let currentUserProfile: UserProfile | null = {
  firstName: 'Ana',
  lastName: 'Silva',
  email: 'ana.silva@empresa.com.br',
  currentOrgId: 'org-1',
  appRole: 'MEMBER',
};

// ============================================================================
// ORGANIZAÇÕES
// ============================================================================

export async function mockListOrgs(): Promise<Organization[]> {
  return organizations;
}

export async function mockGetOrg(orgId: string): Promise<Organization | null> {
  return organizations.find(o => o.id === orgId) || null;
}

export async function mockCreateOrg(name: string): Promise<Organization> {
  const newOrg: Organization = {
    id: `org-${Date.now()}`,
    name,
    owner: 'user-owner-1',
    createdAt: new Date(),
  };
  organizations.push(newOrg);
  return newOrg;
}

// ============================================================================
// PERFIL
// ============================================================================

export async function mockGetUserProfile(): Promise<UserProfile | null> {
  return currentUserProfile;
}

export async function mockSaveUserProfile(profile: UserProfile): Promise<void> {
  currentUserProfile = profile;
}

// ============================================================================
// PROJETOS
// ============================================================================

export async function mockListProjects(orgId: string): Promise<Project[]> {
  return projects.filter(p => p.orgId === orgId);
}

export async function mockGetProject(projectId: string): Promise<Project | null> {
  return projects.find(p => p.id === projectId) || null;
}

export async function mockCreateProject(orgId: string, project: Partial<Project>): Promise<Project> {
  const newProject: Project = {
    id: `project-${Date.now()}`,
    orgId,
    name: project.name || '',
    clientName: project.clientName || '',
    businessProfile: project.businessProfile || 'solo',
    journeyMonths: project.journeyMonths || 3,
    stage: project.stage || 'onboarding',
    startDate: project.startDate || new Date(),
    createdBy: 'user-owner-1',
    createdAt: new Date(),
  };
  projects.push(newProject);
  return newProject;
}

// ============================================================================
// TAREFAS
// ============================================================================

export async function mockListTasks(projectId: string): Promise<Task[]> {
  return tasks.filter(t => t.projectId === projectId);
}

export async function mockCreateTask(projectId: string, task: Partial<Task>): Promise<Task> {
  const project = projects.find(p => p.id === projectId);
  if (!project) throw new Error('Project not found');

  const newTask: Task = {
    id: `task-${Date.now()}`,
    orgId: project.orgId,
    projectId,
    title: task.title || '',
    description: task.description || '',
    status: task.status || 'todo',
    pillar: task.pillar || 'Estratégia',
    dueDate: task.dueDate,
    ownerUserId: task.ownerUserId,
    ownerRole: task.ownerRole,
    createdAt: new Date(),
  };
  tasks.push(newTask);
  return newTask;
}

export async function mockUpdateTask(taskId: string, updates: Partial<Task>): Promise<void> {
  const index = tasks.findIndex(t => t.id === taskId);
  if (index !== -1) {
    tasks[index] = { ...tasks[index], ...updates };
  }
}

export async function mockDeleteTask(taskId: string): Promise<void> {
  tasks = tasks.filter(t => t.id !== taskId);
}

export async function mockUpdateTaskStatus(taskId: string, status: Task['status']): Promise<void> {
  const task = tasks.find(t => t.id === taskId);
  if (task) {
    task.status = status;
  }
}

// ============================================================================
// REUNIÕES
// ============================================================================

export async function mockListMeetings(projectId: string): Promise<Meeting[]> {
  return meetings.filter(m => m.projectId === projectId);
}

export async function mockCreateMeeting(projectId: string, meeting: Partial<Meeting>): Promise<Meeting> {
  const project = projects.find(p => p.id === projectId);
  if (!project) throw new Error('Project not found');

  const newMeeting: Meeting = {
    id: `meeting-${Date.now()}`,
    orgId: project.orgId,
    projectId,
    title: meeting.title || '',
    datetime: meeting.datetime || new Date(),
    cadence: meeting.cadence || 'ad_hoc',
    notes: meeting.notes || '',
    createdAt: new Date(),
  };
  meetings.push(newMeeting);
  return newMeeting;
}

export async function mockUpdateMeeting(meetingId: string, updates: Partial<Meeting>): Promise<void> {
  const index = meetings.findIndex(m => m.id === meetingId);
  if (index !== -1) {
    meetings[index] = { ...meetings[index], ...updates };
  }
}

export async function mockDeleteMeeting(meetingId: string): Promise<void> {
  meetings = meetings.filter(m => m.id !== meetingId);
}

// ============================================================================
// ENTREGÁVEIS
// ============================================================================

export async function mockListDeliverables(projectId: string): Promise<Deliverable[]> {
  return deliverables.filter(d => d.projectId === projectId);
}

export async function mockUpdateDeliverable(deliverableId: string, updates: Partial<Deliverable>): Promise<void> {
  const index = deliverables.findIndex(d => d.id === deliverableId);
  if (index !== -1) {
    deliverables[index] = { ...deliverables[index], ...updates };
  }
}

export async function mockDeleteDeliverable(deliverableId: string): Promise<void> {
  deliverables = deliverables.filter(d => d.id !== deliverableId);
}

// ============================================================================
// KPIs
// ============================================================================

export async function mockListKpis(projectId: string): Promise<Kpi[]> {
  return kpis.filter(k => k.projectId === projectId);
}

// ============================================================================
// MENSAGENS (Support Messages - by orgId)
// ============================================================================

export async function mockListMessages(threadId: string): Promise<Message[]> {
  // In mock mode, threadId can be either projectId or orgId
  // Filter by both to maintain compatibility
  return messages.filter(m => m.projectId === threadId || m.orgId === threadId);
}

export async function mockSendMessage(threadId: string, text: string): Promise<Message> {
  // Try to find project first, otherwise use threadId as orgId
  const project = projects.find(p => p.id === threadId);
  const orgId = project?.orgId || threadId;

  const newMessage: Message = {
    id: `msg-${Date.now()}`,
    orgId,
    projectId: threadId,
    text,
    createdBy: 'user-owner-1',
    createdByRole: 'admin',
    createdAt: new Date(),
  };
  messages.push(newMessage);
  return newMessage;
}

// ============================================================================
// DOCUMENTOS
// ============================================================================

export async function mockListDocuments(orgIdOrProjectId: string): Promise<Document[]> {
  return documents.filter(d => d.orgId === orgIdOrProjectId || d.projectId === orgIdOrProjectId);
}

export async function mockCreateDocument(orgIdOrProjectId: string, document: Partial<Document>): Promise<Document> {
  const newDoc: Document = {
    id: `doc-${Date.now()}`,
    orgId: orgIdOrProjectId,
    projectId: orgIdOrProjectId,
    title: document.title || '',
    url: document.url || '#',
    category: document.category || 'other',
    createdBy: 'user-owner-1',
    createdAt: new Date(),
  };
  documents.push(newDoc);
  return newDoc;
}

export async function mockUploadDocument(orgId: string, document: any): Promise<void> {
  const newDoc: Document = {
    id: `doc-${Date.now()}`,
    orgId,
    projectId: orgId,
    title: document.name || 'Untitled',
    url: '#',
    category: document.category || 'other',
    createdBy: 'user-owner-1',
    createdAt: new Date(),
  };
  documents.push(newDoc);
}

export async function mockDeleteDocument(documentId: string): Promise<void> {
  documents = documents.filter(d => d.id !== documentId);
}

// ============================================================================
// CRM - CONTATOS
// ============================================================================

export async function mockListContacts(orgId: string): Promise<Contact[]> {
  return contacts.filter(c => c.orgId === orgId);
}

export async function mockCreateContact(orgId: string, contact: Partial<Contact>): Promise<Contact> {
  const newContact: Contact = {
    id: `contact-${Date.now()}`,
    orgId,
    name: contact.name || '',
    email: contact.email || '',
    phone: contact.phone || '',
    company: contact.company || '',
    tags: contact.tags || [],
    status: contact.status || 'ativo',
    ownerUserId: contact.ownerUserId || 'user-owner-1',
    notes: contact.notes || '',
    attachments: contact.attachments || [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  contacts.push(newContact);
  return newContact;
}

export async function mockUpdateContact(contactId: string, updates: Partial<Contact>): Promise<void> {
  const index = contacts.findIndex(c => c.id === contactId);
  if (index !== -1) {
    contacts[index] = { ...contacts[index], ...updates, updatedAt: new Date() };
  }
}

export async function mockDeleteContact(contactId: string): Promise<void> {
  contacts = contacts.filter(c => c.id !== contactId);
}

// ============================================================================
// CRM - DEALS
// ============================================================================

export async function mockListDeals(orgId: string): Promise<Deal[]> {
  return deals.filter(d => d.orgId === orgId);
}

export async function mockCreateDeal(orgId: string, deal: Partial<Deal>): Promise<Deal> {
  const newDeal: Deal = {
    id: `deal-${Date.now()}`,
    orgId,
    title: deal.title || '',
    contactId: deal.contactId || '',
    stage: deal.stage || 'Lead',
    status: deal.status || 'open',
    value: deal.value || 0,
    probability: deal.probability || 0,
    ownerUserId: deal.ownerUserId || 'user-owner-1',
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  deals.push(newDeal);
  return newDeal;
}

export async function mockUpdateDeal(dealId: string, updates: Partial<Deal>): Promise<void> {
  const index = deals.findIndex(d => d.id === dealId);
  if (index !== -1) {
    deals[index] = { ...deals[index], ...updates, updatedAt: new Date() };
  }
}

export async function mockDeleteDeal(dealId: string): Promise<void> {
  deals = deals.filter(d => d.id !== dealId);
}

// ============================================================================
// CRM - ATIVIDADES
// ============================================================================

export async function mockListActivities(orgId: string): Promise<Activity[]> {
  return activities.filter(a => a.orgId === orgId);
}

export async function mockCreateActivity(orgId: string, activity: Partial<Activity>): Promise<Activity> {
  const newActivity: Activity = {
    id: `activity-${Date.now()}`,
    orgId,
    type: activity.type || 'task',
    dueDate: activity.dueDate || new Date(),
    status: activity.status || 'open',
    ownerUserId: activity.ownerUserId || 'user-owner-1',
    relatedType: activity.relatedType || 'contact',
    relatedId: activity.relatedId || '',
    notes: activity.notes || '',
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  activities.push(newActivity);
  return newActivity;
}

export async function mockUpdateActivity(activityId: string, updates: Partial<Activity>): Promise<void> {
  const index = activities.findIndex(a => a.id === activityId);
  if (index !== -1) {
    activities[index] = { ...activities[index], ...updates, updatedAt: new Date() };
  }
}

export async function mockDeleteActivity(activityId: string): Promise<void> {
  activities = activities.filter(a => a.id !== activityId);
}

// ============================================================================
// CRM - CONTRATOS
// ============================================================================

export async function mockListContracts(orgId: string): Promise<Contract[]> {
  return contracts.filter(c => c.orgId === orgId);
}

export async function mockCreateContract(orgId: string, contract: Partial<Contract>): Promise<Contract> {
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
  contracts.push(newContract);
  return newContract;
}

export async function mockUpdateContract(contractId: string, updates: Partial<Contract>): Promise<void> {
  const index = contracts.findIndex(c => c.id === contractId);
  if (index !== -1) {
    contracts[index] = { ...contracts[index], ...updates, updatedAt: new Date() };
  }
}

export async function mockDeleteContract(contractId: string): Promise<void> {
  contracts = contracts.filter(c => c.id !== contractId);
}

export async function mockCancelContract(contractId: string, cancelReason: string): Promise<void> {
  const index = contracts.findIndex(c => c.id === contractId);
  if (index !== -1) {
    contracts[index] = {
      ...contracts[index],
      status: 'canceled',
      cancelDate: new Date(),
      cancelReason,
      updatedAt: new Date(),
    };
  }
}

// ============================================================================
// FINANCEIRO
// ============================================================================

export async function mockListFinanceTransactions(orgId: string): Promise<FinanceTransaction[]> {
  return financeTransactions.filter(t => t.orgId === orgId);
}

export async function mockCreateFinanceTransaction(orgId: string, transaction: Partial<FinanceTransaction>): Promise<FinanceTransaction> {
  const newTransaction: FinanceTransaction = {
    id: `transaction-${Date.now()}`,
    orgId,
    type: transaction.type || 'income',
    date: transaction.date || new Date(),
    value: transaction.value || 0,
    category: transaction.category || '',
    description: transaction.description || '',
    isRecurring: transaction.isRecurring || false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  financeTransactions.push(newTransaction);
  return newTransaction;
}

export async function mockUpdateFinanceTransaction(transactionId: string, updates: Partial<FinanceTransaction>): Promise<void> {
  const index = financeTransactions.findIndex(t => t.id === transactionId);
  if (index !== -1) {
    financeTransactions[index] = { ...financeTransactions[index], ...updates, updatedAt: new Date() };
  }
}

export async function mockDeleteFinanceTransaction(transactionId: string): Promise<void> {
  financeTransactions = financeTransactions.filter(t => t.id !== transactionId);
}

// ============================================================================
// NPS CAMPAIGNS
// ============================================================================

export async function mockListNpsCampaigns(orgId: string): Promise<NpsCampaign[]> {
  return npsCampaigns.filter(c => c.orgId === orgId);
}

export async function mockCreateNpsCampaign(orgId: string, campaign: Partial<NpsCampaign>): Promise<NpsCampaign> {
  const newCampaign: NpsCampaign = {
    id: `campaign-${Date.now()}`,
    orgId,
    periodKey: campaign.periodKey || '',
    status: campaign.status || 'active',
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  npsCampaigns.push(newCampaign);
  return newCampaign;
}

// ============================================================================
// NPS RESPONSES
// ============================================================================

export async function mockListNpsResponses(orgId: string, startDate: Date, endDate: Date): Promise<NpsResponse[]> {
  return npsResponses.filter(r => 
    r.orgId === orgId && 
    r.createdAt >= startDate && 
    r.createdAt <= endDate
  );
}

export async function mockCreateNpsResponse(orgId: string, response: Partial<NpsResponse>): Promise<NpsResponse> {
  const newResponse: NpsResponse = {
    id: `response-${Date.now()}`,
    orgId,
    campaignId: response.campaignId || '',
    contactId: response.contactId || '',
    score: response.score || 0,
    comment: response.comment || '',
    createdAt: new Date(),
  };
  npsResponses.push(newResponse);
  return newResponse;
}

// ============================================================================
// REPORTS
// ============================================================================

export async function mockListReports(orgId: string): Promise<any[]> {
  return [];
}

export async function mockGenerateReport(orgId: string, report: any): Promise<void> {
  // No-op in mock
}

// ============================================================================
// TEAM
// ============================================================================

export async function mockIsCallerAdmin(): Promise<boolean> {
  return true;
}

export async function mockInviteTeamMember(orgId: string, invitation: any): Promise<void> {
  // No-op in mock
}

export async function mockListOrgMembers(orgId: string): Promise<any[]> {
  return [];
}

export async function mockListTeamInvitations(orgId: string): Promise<any[]> {
  return [];
}
