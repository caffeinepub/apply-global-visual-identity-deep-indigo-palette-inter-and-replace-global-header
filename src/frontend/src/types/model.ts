import type { Principal } from '@dfinity/principal';

// ============================================================================
// TIPOS BASE
// ============================================================================

export type OrgId = string;
export type UserId = string;
export type ProjectId = string;
export type ContactId = string;
export type DealId = string;
export type ContractId = string;
export type ActivityId = string;
export type TaskId = string;
export type MeetingId = string;
export type DeliverableId = string;
export type KpiId = string;
export type MessageId = string;
export type DocumentId = string;

// ============================================================================
// ROLES E PERMISSÕES
// ============================================================================

export type AppRole = 
  | 'OWNER_ADMIN'
  | 'MEMBER'
  | 'FIRSTY_CONSULTANT'
  | 'FIRSTY_ADMIN';

export type ProjectRole = 'client' | 'member' | 'firsty' | 'admin';

// ============================================================================
// ORGANIZAÇÕES E USUÁRIOS
// ============================================================================

export interface Organization {
  id: OrgId;
  name: string;
  owner: string; // Principal ou UserId
  createdAt: Date;
}

export interface User {
  id: UserId;
  orgId: OrgId;
  role: AppRole;
  name: string;
  email: string;
  isActive: boolean;
  createdAt: Date;
}

export interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  currentOrgId?: OrgId;
  appRole: AppRole;
}

export interface OrgAccess {
  orgId: OrgId;
  userId: UserId;
  permission: 'read' | 'write';
  createdAt: Date;
}

// ============================================================================
// CRM
// ============================================================================

export interface Contact {
  id: ContactId;
  orgId: OrgId;
  name: string;
  email: string;
  phone: string;
  company: string;
  tags: string[];
  status: string;
  ownerUserId: UserId;
  notes: string;
  attachments: string[];
  createdAt: Date;
  updatedAt: Date;
}

export type DealStage = 'Lead' | 'Qualificação' | 'Proposta' | 'Negociação' | 'Fechado';
export type DealStatus = 'open' | 'won' | 'lost';

export interface Deal {
  id: DealId;
  orgId: OrgId;
  title: string;
  contactId: ContactId;
  stage: DealStage;
  status: DealStatus;
  value: number;
  probability: number;
  ownerUserId: UserId;
  lossReason?: string;
  createdAt: Date;
  closedAt?: Date;
  updatedAt: Date;
}

export type ActivityType = 'task' | 'meeting' | 'followup';
export type ActivityStatus = 'open' | 'done' | 'canceled';
export type RelatedType = 'contact' | 'deal' | 'contract' | 'project';

export interface Activity {
  id: ActivityId;
  orgId: OrgId;
  type: ActivityType;
  dueDate: Date;
  status: ActivityStatus;
  ownerUserId: UserId;
  relatedType: RelatedType;
  relatedId: string;
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}

export type ContractStatus = 'active' | 'paused' | 'canceled';

export interface Contract {
  id: ContractId;
  orgId: OrgId;
  contactId: ContactId;
  name: string;
  mrr: number;
  startDate: Date;
  renewalDate: Date;
  status: ContractStatus;
  cancelDate?: Date;
  cancelReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type TransactionType = 'income' | 'expense';

export interface FinanceTransaction {
  id: string;
  orgId: OrgId;
  type: TransactionType;
  date: Date;
  value: number;
  category: string;
  description: string;
  isRecurring: boolean;
  attachmentUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// CUSTOMER SUCCESS
// ============================================================================

export type CampaignStatus = 'active' | 'closed';

export interface NpsCampaign {
  id: string;
  orgId: OrgId;
  periodKey: string; // YYYY-MM
  status: CampaignStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface NpsResponse {
  id: string;
  orgId: OrgId;
  campaignId: string;
  contactId: ContactId;
  score: number; // 0-10
  comment: string;
  createdAt: Date;
}

export interface KpiSnapshot {
  id: string;
  orgId: OrgId;
  periodKey: string;
  dataMap: Record<string, any>;
  updatedAt: Date;
}

export type ExportType = 'sales' | 'finance' | 'cs' | 'project';
export type ExportFormat = 'csv' | 'xlsx' | 'pdf';

export interface Export {
  id: string;
  orgId: OrgId;
  type: ExportType;
  periodKey: string;
  format: ExportFormat;
  fileUrl: string;
  createdBy: UserId;
  createdAt: Date;
}

// ============================================================================
// PORTAL - PROJETOS
// ============================================================================

export type BusinessProfile = 'solo' | 'sme';
export type ProjectStage = 
  | 'onboarding'
  | 'execution_30'
  | 'execution_continuous'
  | 'followup'
  | 'closing';

export interface Project {
  id: ProjectId;
  orgId: OrgId;
  name: string;
  clientName: string;
  businessProfile: BusinessProfile;
  journeyMonths: number;
  stage: ProjectStage;
  startDate: Date;
  onboardingStartDate?: Date;
  executionStartDate?: Date;
  createdBy: UserId;
  createdAt: Date;
}

export interface ProjectMember {
  orgId: OrgId;
  projectId: ProjectId;
  userId: UserId;
  role: ProjectRole;
}

// ============================================================================
// PORTAL - ITENS DO PROJETO
// ============================================================================

export type TaskStatus = 'todo' | 'doing' | 'done';
export type Pillar = 
  | 'Estratégia'
  | 'Financeiro'
  | 'Pessoas'
  | 'Produto'
  | 'Tecnologia'
  | 'Experiência'
  | 'Operações';

export interface Task {
  id: TaskId;
  orgId: OrgId;
  projectId: ProjectId;
  title: string;
  description: string;
  status: TaskStatus;
  pillar: Pillar;
  dueDate?: Date;
  ownerUserId?: UserId;
  ownerRole?: ProjectRole;
  createdAt: Date;
}

export type MeetingCadence = 'semanal' | 'quinzenal' | 'ad_hoc';

export interface Meeting {
  id: MeetingId;
  orgId: OrgId;
  projectId: ProjectId;
  title: string;
  datetime: Date;
  cadence: MeetingCadence;
  notes: string;
  createdAt: Date;
}

export type DeliverableStatus = 'planejado' | 'em_andamento' | 'entregue';

export interface Deliverable {
  id: DeliverableId;
  orgId: OrgId;
  projectId: ProjectId;
  title: string;
  category: string;
  status: DeliverableStatus;
  dueDate?: Date;
  createdAt: Date;
}

export type Trend = 'up' | 'down' | 'flat';

export interface Kpi {
  id: KpiId;
  orgId: OrgId;
  projectId: ProjectId;
  name: string;
  value: string;
  trend: Trend;
  note: string;
  updatedAt: Date;
}

export interface Message {
  id: MessageId;
  orgId: OrgId;
  projectId: ProjectId;
  text: string;
  createdBy: UserId;
  createdByRole: ProjectRole;
  createdAt: Date;
}

export interface Document {
  id: DocumentId;
  orgId: OrgId;
  projectId: ProjectId;
  title: string;
  url: string;
  category: string;
  createdBy: UserId;
  createdAt: Date;
}

// ============================================================================
// PLAYBOOKS
// ============================================================================

export interface PlaybookTemplate {
  id: string;
  name: string;
  businessProfile: BusinessProfile;
  journeyMonths: number;
  stage: ProjectStage;
  isActive: boolean;
}

export type PlaybookItemType = 'task' | 'meeting' | 'deliverable' | 'kpi';

export interface PlaybookItemTemplate {
  id: string;
  templateId: string;
  itemType: PlaybookItemType;
  title: string;
  description: string;
  pillar?: Pillar;
  relativeDay: number;
  ownerRole: ProjectRole;
  required: boolean;
  orderIndex: number;
}
