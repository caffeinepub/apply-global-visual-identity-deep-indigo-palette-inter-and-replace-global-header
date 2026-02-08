import { isMockMode } from '../config/dataMode';
import * as mockClient from './mock/mockClient';
import { BackendClient } from './api/backendClient';
import type { backendInterface } from '../backend';
import type {
  Contact,
  Deal,
  Activity,
  Contract,
  FinanceTransaction,
  Project,
  NpsCampaign,
  Task,
  Meeting,
  Deliverable,
} from '../types/model';

/**
 * Cliente unificado que roteia chamadas para MOCK ou BACKEND
 * dependendo do modo configurado.
 */

export interface DataClient {
  // Organizações
  listOrgs: typeof mockClient.mockListOrgs;
  getOrg: typeof mockClient.mockGetOrg;
  createOrg: typeof mockClient.mockCreateOrg;
  selectOrg: (orgId: string) => Promise<void>;
  
  // Perfil
  getUserProfile: typeof mockClient.mockGetUserProfile;
  saveUserProfile: typeof mockClient.mockSaveUserProfile;
  
  // Projetos
  listProjects: typeof mockClient.mockListProjects;
  getProject: typeof mockClient.mockGetProject;
  createProject: (orgId: string, project: Partial<Project>) => Promise<Project>;
  
  // Tarefas
  listTasks: typeof mockClient.mockListTasks;
  createTask: typeof mockClient.mockCreateTask;
  updateTask: (taskId: string, task: Partial<Task>) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
  updateTaskStatus: typeof mockClient.mockUpdateTaskStatus;
  
  // Reuniões
  listMeetings: typeof mockClient.mockListMeetings;
  createMeeting: typeof mockClient.mockCreateMeeting;
  updateMeeting: (meetingId: string, meeting: Partial<Meeting>) => Promise<void>;
  deleteMeeting: (meetingId: string) => Promise<void>;
  
  // Entregáveis
  listDeliverables: typeof mockClient.mockListDeliverables;
  updateDeliverable: (deliverableId: string, deliverable: Partial<Deliverable>) => Promise<void>;
  deleteDeliverable: (deliverableId: string) => Promise<void>;
  
  // KPIs
  listKpis: typeof mockClient.mockListKpis;
  
  // Mensagens
  listMessages: typeof mockClient.mockListMessages;
  sendMessage: typeof mockClient.mockSendMessage;
  
  // Documentos
  listDocuments: (orgIdOrProjectId: string) => Promise<any[]>;
  createDocument: (orgIdOrProjectId: string, document: any) => Promise<any>;
  uploadDocument: (orgId: string, document: any) => Promise<void>;
  deleteDocument: (documentId: string) => Promise<void>;
  
  // CRM
  listContacts: typeof mockClient.mockListContacts;
  createContact: (orgId: string, contact: Partial<Contact>) => Promise<Contact>;
  updateContact: (contactId: string, contact: Partial<Contact>) => Promise<void>;
  deleteContact: (contactId: string) => Promise<void>;
  
  listDeals: typeof mockClient.mockListDeals;
  createDeal: (orgId: string, deal: Partial<Deal>) => Promise<Deal>;
  updateDeal: (dealId: string, deal: Partial<Deal>) => Promise<void>;
  deleteDeal: (dealId: string) => Promise<void>;
  
  listActivities: typeof mockClient.mockListActivities;
  createActivity: (orgId: string, activity: Partial<Activity>) => Promise<Activity>;
  updateActivity: (activityId: string, activity: Partial<Activity>) => Promise<void>;
  deleteActivity: (activityId: string) => Promise<void>;
  
  listContracts: typeof mockClient.mockListContracts;
  createContract: (orgId: string, contract: Partial<Contract>) => Promise<Contract>;
  updateContract: (contractId: string, contract: Partial<Contract>) => Promise<void>;
  deleteContract: (contractId: string) => Promise<void>;
  
  // Financeiro
  listFinanceTransactions: typeof mockClient.mockListFinanceTransactions;
  createFinanceTransaction: (orgId: string, transaction: Partial<FinanceTransaction>) => Promise<FinanceTransaction>;
  updateFinanceTransaction: (transactionId: string, transaction: Partial<FinanceTransaction>) => Promise<void>;
  deleteFinanceTransaction: (transactionId: string) => Promise<void>;
  
  // NPS Campaigns
  listNpsCampaigns: (orgId: string) => Promise<NpsCampaign[]>;
  createNpsCampaign: (orgId: string, campaign: Partial<NpsCampaign>) => Promise<NpsCampaign>;
  
  // Reports
  listReports: (orgId: string) => Promise<any[]>;
  generateReport: (orgId: string, report: any) => Promise<void>;
  
  // Team
  isCallerAdmin: () => Promise<boolean>;
  inviteTeamMember: (orgId: string, invitation: any) => Promise<void>;
  listOrgMembers: (orgId: string) => Promise<any[]>;
  listTeamInvitations: (orgId: string) => Promise<any[]>;
}

export function createMockClient(): DataClient {
  return {
    listOrgs: mockClient.mockListOrgs,
    getOrg: mockClient.mockGetOrg,
    createOrg: mockClient.mockCreateOrg,
    selectOrg: async () => { /* No-op in mock mode */ },
    getUserProfile: mockClient.mockGetUserProfile,
    saveUserProfile: mockClient.mockSaveUserProfile,
    listProjects: mockClient.mockListProjects,
    getProject: mockClient.mockGetProject,
    createProject: mockClient.mockCreateProject,
    listTasks: mockClient.mockListTasks,
    createTask: mockClient.mockCreateTask,
    updateTask: mockClient.mockUpdateTask,
    deleteTask: mockClient.mockDeleteTask,
    updateTaskStatus: mockClient.mockUpdateTaskStatus,
    listMeetings: mockClient.mockListMeetings,
    createMeeting: mockClient.mockCreateMeeting,
    updateMeeting: mockClient.mockUpdateMeeting,
    deleteMeeting: mockClient.mockDeleteMeeting,
    listDeliverables: mockClient.mockListDeliverables,
    updateDeliverable: mockClient.mockUpdateDeliverable,
    deleteDeliverable: mockClient.mockDeleteDeliverable,
    listKpis: mockClient.mockListKpis,
    listMessages: mockClient.mockListMessages,
    sendMessage: mockClient.mockSendMessage,
    listDocuments: mockClient.mockListDocuments,
    createDocument: mockClient.mockCreateDocument,
    uploadDocument: mockClient.mockUploadDocument,
    deleteDocument: mockClient.mockDeleteDocument,
    listContacts: mockClient.mockListContacts,
    createContact: mockClient.mockCreateContact,
    updateContact: mockClient.mockUpdateContact,
    deleteContact: mockClient.mockDeleteContact,
    listDeals: mockClient.mockListDeals,
    createDeal: mockClient.mockCreateDeal,
    updateDeal: mockClient.mockUpdateDeal,
    deleteDeal: mockClient.mockDeleteDeal,
    listActivities: mockClient.mockListActivities,
    createActivity: mockClient.mockCreateActivity,
    updateActivity: mockClient.mockUpdateActivity,
    deleteActivity: mockClient.mockDeleteActivity,
    listContracts: mockClient.mockListContracts,
    createContract: mockClient.mockCreateContract,
    updateContract: mockClient.mockUpdateContract,
    deleteContract: mockClient.mockDeleteContract,
    listFinanceTransactions: mockClient.mockListFinanceTransactions,
    createFinanceTransaction: mockClient.mockCreateFinanceTransaction,
    updateFinanceTransaction: mockClient.mockUpdateFinanceTransaction,
    deleteFinanceTransaction: mockClient.mockDeleteFinanceTransaction,
    listNpsCampaigns: mockClient.mockListNpsCampaigns,
    createNpsCampaign: mockClient.mockCreateNpsCampaign,
    listReports: mockClient.mockListReports,
    generateReport: mockClient.mockGenerateReport,
    isCallerAdmin: mockClient.mockIsCallerAdmin,
    inviteTeamMember: mockClient.mockInviteTeamMember,
    listOrgMembers: mockClient.mockListOrgMembers,
    listTeamInvitations: mockClient.mockListTeamInvitations,
  };
}

export function createBackendClient(actor: backendInterface): DataClient {
  const backend = new BackendClient(actor);
  
  return {
    listOrgs: () => backend.listOrgs(),
    getOrg: (orgId) => backend.getOrg(orgId),
    createOrg: (name) => backend.createOrg(name),
    selectOrg: (orgId) => backend.selectOrg(orgId),
    getUserProfile: () => backend.getUserProfile(),
    saveUserProfile: (profile) => backend.saveUserProfile(profile),
    listProjects: (orgId) => backend.listProjects(orgId),
    getProject: (projectId) => backend.getProject(projectId),
    createProject: (orgId, project) => backend.createProject(orgId, project),
    listTasks: (projectId) => backend.listTasks(projectId),
    createTask: (projectId, task) => backend.createTask(projectId, task),
    updateTask: (taskId, task) => backend.updateTask(taskId, task),
    deleteTask: (taskId) => backend.deleteTask(taskId),
    updateTaskStatus: (taskId, status) => backend.updateTaskStatus(taskId, status),
    listMeetings: (projectId) => backend.listMeetings(projectId),
    createMeeting: (projectId, meeting) => backend.createMeeting(projectId, meeting),
    updateMeeting: (meetingId, meeting) => backend.updateMeeting(meetingId, meeting),
    deleteMeeting: (meetingId) => backend.deleteMeeting(meetingId),
    listDeliverables: (projectId) => backend.listDeliverables(projectId),
    updateDeliverable: (deliverableId, deliverable) => backend.updateDeliverable(deliverableId, deliverable),
    deleteDeliverable: (deliverableId) => backend.deleteDeliverable(deliverableId),
    listKpis: (projectId) => backend.listKpis(projectId),
    listMessages: (projectId) => backend.listMessages(projectId),
    sendMessage: (projectId, text) => backend.sendMessage(projectId, text),
    listDocuments: (orgId) => backend.listDocuments(orgId),
    createDocument: (projectId, document) => backend.createDocument(projectId, document),
    uploadDocument: (orgId, document) => backend.uploadDocument(orgId, document),
    deleteDocument: (documentId) => backend.deleteDocument(documentId),
    listContacts: (orgId) => backend.listContacts(orgId),
    createContact: (orgId, contact) => backend.createContact(orgId, contact),
    updateContact: (contactId, contact) => backend.updateContact(contactId, contact),
    deleteContact: (contactId) => backend.deleteContact(contactId),
    listDeals: (orgId) => backend.listDeals(orgId),
    createDeal: (orgId, deal) => backend.createDeal(orgId, deal),
    updateDeal: (dealId, deal) => backend.updateDeal(dealId, deal),
    deleteDeal: (dealId) => backend.deleteDeal(dealId),
    listActivities: (orgId) => backend.listActivities(orgId),
    createActivity: (orgId, activity) => backend.createActivity(orgId, activity),
    updateActivity: (activityId, activity) => backend.updateActivity(activityId, activity),
    deleteActivity: (activityId) => backend.deleteActivity(activityId),
    listContracts: (orgId) => backend.listContracts(orgId),
    createContract: (orgId, contract) => backend.createContract(orgId, contract),
    updateContract: (contractId, contract) => backend.updateContract(contractId, contract),
    deleteContract: (contractId) => backend.deleteContract(contractId),
    listFinanceTransactions: (orgId) => backend.listFinanceTransactions(orgId),
    createFinanceTransaction: (orgId, transaction) => backend.createFinanceTransaction(orgId, transaction),
    updateFinanceTransaction: (transactionId, transaction) => backend.updateFinanceTransaction(transactionId, transaction),
    deleteFinanceTransaction: (transactionId) => backend.deleteFinanceTransaction(transactionId),
    listNpsCampaigns: (orgId) => backend.listNpsCampaigns(orgId),
    createNpsCampaign: (orgId, campaign) => backend.createNpsCampaign(orgId, campaign),
    listReports: (orgId) => backend.listReports(orgId),
    generateReport: (orgId, report) => backend.generateReport(orgId, report),
    isCallerAdmin: () => backend.isCallerAdmin(),
    inviteTeamMember: (orgId, invitation) => backend.inviteTeamMember(orgId, invitation),
    listOrgMembers: (orgId) => backend.listOrgMembers(orgId),
    listTeamInvitations: (orgId) => backend.listTeamInvitations(orgId),
  };
}

export function getDataClient(actor?: backendInterface | null): DataClient {
  if (isMockMode()) {
    return createMockClient();
  }
  
  if (!actor) {
    throw new Error('Actor não disponível em modo BACKEND');
  }
  
  return createBackendClient(actor);
}
