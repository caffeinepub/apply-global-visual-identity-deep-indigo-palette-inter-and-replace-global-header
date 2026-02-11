import { BackendClient } from './api/backendClient';
import type { backendInterface, CustomFieldDefinition } from '../backend';
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
import type { PipelineStage, PipelineStageReorderUpdate } from '../types/pipelineStages';
import type { KanbanCard, CardInput } from '../types/kanbanCards';
import type { KanbanBoardWithDefinitions } from '../hooks/useKanbanBoard';
import type { 
  ReportHistoryItem, 
  ReportSchedule, 
  ReportScheduleInput, 
  GenerateReportInput 
} from '../types/reports';

/**
 * Cliente unificado que roteia chamadas para o backend.
 */

export interface KanbanBoard {
  id: string;
  name: string;
  orgId: string;
  createdBy: string;
  createdAt: Date;
}

export interface DataClient {
  // Organizações
  listOrgs: () => Promise<any[]>;
  getOrg: (orgId: string) => Promise<any | null>;
  createOrg: (name: string) => Promise<any>;
  selectOrg: (orgId: string) => Promise<void>;
  
  // Perfil
  getUserProfile: () => Promise<any | null>;
  saveUserProfile: (profile: any) => Promise<void>;
  
  // Projetos
  listProjects: (orgId: string) => Promise<Project[]>;
  getProject: (projectId: string) => Promise<Project | null>;
  createProject: (orgId: string, project: Partial<Project>) => Promise<Project>;
  
  // Tarefas
  listTasks: (projectId: string) => Promise<Task[]>;
  createTask: (projectId: string, task: Partial<Task>) => Promise<Task>;
  updateTask: (taskId: string, task: Partial<Task>) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
  updateTaskStatus: (taskId: string, status: string) => Promise<void>;
  
  // Reuniões
  listMeetings: (projectId: string) => Promise<Meeting[]>;
  createMeeting: (projectId: string, meeting: Partial<Meeting>) => Promise<Meeting>;
  updateMeeting: (meetingId: string, meeting: Partial<Meeting>) => Promise<void>;
  deleteMeeting: (meetingId: string) => Promise<void>;
  
  // Entregáveis
  listDeliverables: (projectId: string) => Promise<Deliverable[]>;
  updateDeliverable: (deliverableId: string, deliverable: Partial<Deliverable>) => Promise<void>;
  deleteDeliverable: (deliverableId: string) => Promise<void>;
  
  // KPIs
  listKpis: (projectId: string) => Promise<any[]>;
  
  // Mensagens
  listMessages: (orgId: string) => Promise<any[]>;
  sendMessage: (orgId: string, message: string) => Promise<void>;
  
  // Documentos
  listDocuments: (orgIdOrProjectId: string) => Promise<any[]>;
  createDocument: (orgIdOrProjectId: string, document: any) => Promise<any>;
  uploadDocument: (orgId: string, document: any) => Promise<void>;
  deleteDocument: (documentId: string) => Promise<void>;
  
  // CRM
  listContacts: (orgId: string) => Promise<Contact[]>;
  createContact: (orgId: string, contact: Partial<Contact>) => Promise<Contact>;
  updateContact: (contactId: string, contact: Partial<Contact>) => Promise<void>;
  deleteContact: (contactId: string) => Promise<void>;
  
  listDeals: (orgId: string) => Promise<Deal[]>;
  createDeal: (orgId: string, deal: Partial<Deal>) => Promise<Deal>;
  updateDeal: (dealId: string, deal: Partial<Deal>) => Promise<void>;
  deleteDeal: (dealId: string) => Promise<void>;
  
  listActivities: (orgId: string) => Promise<Activity[]>;
  createActivity: (orgId: string, activity: Partial<Activity>) => Promise<Activity>;
  updateActivity: (activityId: string, activity: Partial<Activity>) => Promise<void>;
  deleteActivity: (activityId: string) => Promise<void>;
  
  listContracts: (orgId: string) => Promise<Contract[]>;
  createContract: (orgId: string, contract: Partial<Contract>) => Promise<Contract>;
  updateContract: (contractId: string, contract: Partial<Contract>) => Promise<void>;
  deleteContract: (contractId: string) => Promise<void>;
  cancelContract: (contractId: string, cancelReason: string) => Promise<void>;
  
  // Financeiro
  listFinanceTransactions: (orgId: string) => Promise<FinanceTransaction[]>;
  createFinanceTransaction: (orgId: string, transaction: Partial<FinanceTransaction>) => Promise<FinanceTransaction>;
  updateFinanceTransaction: (transactionId: string, transaction: Partial<FinanceTransaction>) => Promise<void>;
  deleteFinanceTransaction: (transactionId: string) => Promise<void>;
  
  // NPS Campaigns & Responses
  listNpsCampaigns: (orgId: string) => Promise<NpsCampaign[]>;
  createNpsCampaign: (orgId: string, campaign: Partial<NpsCampaign>) => Promise<NpsCampaign>;
  listNpsResponses: (orgId: string, startDate: Date, endDate: Date) => Promise<NpsResponse[]>;
  createNpsResponse: (orgId: string, response: Partial<NpsResponse>) => Promise<NpsResponse>;
  
  // Reports (typed)
  listReportHistory: (orgId: string) => Promise<ReportHistoryItem[]>;
  generateReport: (input: GenerateReportInput) => Promise<void>;
  downloadReport: (reportId: string) => Promise<{ blob: Uint8Array; filename: string; mimeType: string }>;
  listReportSchedules: (orgId: string) => Promise<ReportSchedule[]>;
  createReportSchedule: (orgId: string, input: ReportScheduleInput) => Promise<string>;
  updateReportSchedule: (scheduleId: string, updates: Partial<ReportScheduleInput>) => Promise<void>;
  deleteReportSchedule: (scheduleId: string) => Promise<void>;
  
  // Team
  isCallerAdmin: () => Promise<boolean>;
  inviteTeamMember: (orgId: string, invitation: any) => Promise<void>;
  listOrgMembers: (orgId: string) => Promise<any[]>;
  listTeamInvitations: (orgId: string) => Promise<any[]>;
  
  // Kanban Boards
  listKanbanBoards: (orgId: string) => Promise<KanbanBoard[]>;
  createKanbanBoard: (orgId: string, name: string) => Promise<string>;
  renameKanbanBoard: (boardId: string, name: string) => Promise<void>;
  getKanbanBoard: (boardId: string) => Promise<KanbanBoardWithDefinitions>;
  addOrUpdateCustomFieldDefinition: (orgId: string, boardId: string, definition: CustomFieldDefinition) => Promise<void>;
  
  // Pipeline Stages (board-scoped)
  listPipelineStages: (orgId: string, boardId: string) => Promise<PipelineStage[]>;
  createPipelineStage: (orgId: string, boardId: string, name: string) => Promise<string>;
  renamePipelineStage: (columnId: string, boardId: string, newName: string) => Promise<void>;
  deletePipelineStage: (columnId: string, boardId: string) => Promise<void>;
  reorderPipelineStages: (orgId: string, boardId: string, updates: PipelineStageReorderUpdate[]) => Promise<void>;
  
  // Kanban Cards (board-scoped)
  listCardsByBoard: (orgId: string, boardId: string) => Promise<KanbanCard[]>;
  listCardsByColumn: (columnId: string, boardId: string) => Promise<KanbanCard[]>;
  getCard: (cardId: string) => Promise<KanbanCard>;
  createCard: (input: CardInput) => Promise<string>;
  updateCard: (cardId: string, input: CardInput) => Promise<void>;
  moveCard: (cardId: string, destinationColumnId: string) => Promise<void>;
  deleteCard: (cardId: string) => Promise<void>;
}

export function createBackendClient(actor: backendInterface): DataClient {
  return new BackendClient(actor);
}
