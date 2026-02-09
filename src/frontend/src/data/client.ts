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
  NpsResponse,
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
  cancelContract: (contractId: string, cancelReason: string) => Promise<void>;
  
  // Financeiro
  listFinanceTransactions: typeof mockClient.mockListFinanceTransactions;
  createFinanceTransaction: (orgId: string, transaction: Partial<FinanceTransaction>) => Promise<FinanceTransaction>;
  updateFinanceTransaction: (transactionId: string, transaction: Partial<FinanceTransaction>) => Promise<void>;
  deleteFinanceTransaction: (transactionId: string) => Promise<void>;
  
  // NPS Campaigns & Responses
  listNpsCampaigns: (orgId: string) => Promise<NpsCampaign[]>;
  createNpsCampaign: (orgId: string, campaign: Partial<NpsCampaign>) => Promise<NpsCampaign>;
  listNpsResponses: (orgId: string, startDate: Date, endDate: Date) => Promise<NpsResponse[]>;
  createNpsResponse: (orgId: string, response: Partial<NpsResponse>) => Promise<NpsResponse>;
  
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
    cancelContract: mockClient.mockCancelContract,
    listFinanceTransactions: mockClient.mockListFinanceTransactions,
    createFinanceTransaction: mockClient.mockCreateFinanceTransaction,
    updateFinanceTransaction: mockClient.mockUpdateFinanceTransaction,
    deleteFinanceTransaction: mockClient.mockDeleteFinanceTransaction,
    listNpsCampaigns: mockClient.mockListNpsCampaigns,
    createNpsCampaign: mockClient.mockCreateNpsCampaign,
    listNpsResponses: mockClient.mockListNpsResponses,
    createNpsResponse: mockClient.mockCreateNpsResponse,
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
    listOrgs: backend.listOrgs.bind(backend),
    getOrg: backend.getOrg.bind(backend),
    createOrg: backend.createOrg.bind(backend),
    selectOrg: backend.selectOrg.bind(backend),
    getUserProfile: backend.getUserProfile.bind(backend),
    saveUserProfile: backend.saveUserProfile.bind(backend),
    listProjects: backend.listProjects.bind(backend),
    getProject: backend.getProject.bind(backend),
    createProject: backend.createProject.bind(backend),
    listTasks: backend.listTasks.bind(backend),
    createTask: backend.createTask.bind(backend),
    updateTask: backend.updateTask.bind(backend),
    deleteTask: backend.deleteTask.bind(backend),
    updateTaskStatus: backend.updateTaskStatus.bind(backend),
    listMeetings: backend.listMeetings.bind(backend),
    createMeeting: backend.createMeeting.bind(backend),
    updateMeeting: backend.updateMeeting.bind(backend),
    deleteMeeting: backend.deleteMeeting.bind(backend),
    listDeliverables: backend.listDeliverables.bind(backend),
    updateDeliverable: backend.updateDeliverable.bind(backend),
    deleteDeliverable: backend.deleteDeliverable.bind(backend),
    listKpis: backend.listKpis.bind(backend),
    listMessages: backend.listMessages.bind(backend),
    sendMessage: backend.sendMessage.bind(backend),
    listDocuments: backend.listDocuments.bind(backend),
    createDocument: backend.createDocument.bind(backend),
    uploadDocument: backend.uploadDocument.bind(backend),
    deleteDocument: backend.deleteDocument.bind(backend),
    listContacts: backend.listContacts.bind(backend),
    createContact: backend.createContact.bind(backend),
    updateContact: backend.updateContact.bind(backend),
    deleteContact: backend.deleteContact.bind(backend),
    listDeals: backend.listDeals.bind(backend),
    createDeal: backend.createDeal.bind(backend),
    updateDeal: backend.updateDeal.bind(backend),
    deleteDeal: backend.deleteDeal.bind(backend),
    listActivities: backend.listActivities.bind(backend),
    createActivity: backend.createActivity.bind(backend),
    updateActivity: backend.updateActivity.bind(backend),
    deleteActivity: backend.deleteActivity.bind(backend),
    listContracts: backend.listContracts.bind(backend),
    createContract: backend.createContract.bind(backend),
    updateContract: backend.updateContract.bind(backend),
    deleteContract: backend.deleteContract.bind(backend),
    cancelContract: backend.cancelContract.bind(backend),
    listFinanceTransactions: backend.listFinanceTransactions.bind(backend),
    createFinanceTransaction: backend.createFinanceTransaction.bind(backend),
    updateFinanceTransaction: backend.updateFinanceTransaction.bind(backend),
    deleteFinanceTransaction: backend.deleteFinanceTransaction.bind(backend),
    listNpsCampaigns: backend.listNpsCampaigns.bind(backend),
    createNpsCampaign: backend.createNpsCampaign.bind(backend),
    listNpsResponses: backend.listNpsResponses.bind(backend),
    createNpsResponse: backend.createNpsResponse.bind(backend),
    listReports: backend.listReports.bind(backend),
    generateReport: backend.generateReport.bind(backend),
    isCallerAdmin: backend.isCallerAdmin.bind(backend),
    inviteTeamMember: backend.inviteTeamMember.bind(backend),
    listOrgMembers: backend.listOrgMembers.bind(backend),
    listTeamInvitations: backend.listTeamInvitations.bind(backend),
  };
}
