import type { backendInterface, AppUserRole as BackendAppUserRole, ColumnUpdate, CardInput as BackendCardInput, CustomField as BackendCustomField, FieldType as BackendFieldType, CustomFieldDefinition as BackendCustomFieldDefinition } from '../../backend';
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
import type { PipelineStage, PipelineStageReorderUpdate } from '../../types/pipelineStages';
import type { KanbanCard, CardInput, CardCustomField, CustomFieldValue } from '../../types/kanbanCards';
import { ExternalBlob } from '../../backend';
import { Principal } from '@icp-sdk/core/principal';
import type { DataClient, KanbanBoard } from '../client';
import type { KanbanBoardWithDefinitions } from '../../hooks/useKanbanBoard';

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

// Map backend FieldType to frontend CustomFieldValue
function mapBackendFieldTypeToFrontend(fieldType: BackendFieldType): CustomFieldValue {
  if ('text' in fieldType) {
    return { text: fieldType.text };
  } else if ('number' in fieldType) {
    return { number: fieldType.number };
  } else if ('date' in fieldType) {
    return { date: new Date(Number(fieldType.date)) };
  } else if ('singleSelect' in fieldType) {
    return { singleSelect: fieldType.singleSelect };
  } else if ('multiSelect' in fieldType) {
    return { multiSelect: fieldType.multiSelect };
  } else if ('tags' in fieldType) {
    return { tags: fieldType.tags };
  }
  return {};
}

// Map frontend CustomFieldValue to backend FieldType
function mapFrontendFieldTypeToBackend(value: CustomFieldValue): BackendFieldType {
  if (value.text !== undefined) {
    return { __kind__: 'text', text: value.text };
  } else if (value.number !== undefined) {
    return { __kind__: 'number', number: value.number };
  } else if (value.date !== undefined) {
    return { __kind__: 'date', date: BigInt(value.date.getTime()) };
  } else if (value.singleSelect !== undefined) {
    return { __kind__: 'singleSelect', singleSelect: value.singleSelect };
  } else if (value.multiSelect !== undefined) {
    return { __kind__: 'multiSelect', multiSelect: value.multiSelect };
  } else if (value.tags !== undefined) {
    return { __kind__: 'tags', tags: value.tags };
  }
  // Default to empty text
  return { __kind__: 'text', text: '' };
}

// Map backend CustomField to frontend CardCustomField
function mapBackendCustomFieldToFrontend(backendField: BackendCustomField, index: number): CardCustomField {
  const value = mapBackendFieldTypeToFrontend(backendField.value);
  
  // Determine field type from value
  let type: CardCustomField['type'] = 'text';
  let options: string[] | undefined;
  
  if (value.text !== undefined) {
    type = 'text';
  } else if (value.number !== undefined) {
    type = 'number';
  } else if (value.date !== undefined) {
    type = 'date';
  } else if (value.singleSelect !== undefined) {
    type = 'singleSelect';
    options = [value.singleSelect];
  } else if (value.multiSelect !== undefined) {
    type = 'multiSelect';
    options = value.multiSelect;
  } else if (value.tags !== undefined) {
    type = 'tags';
  }
  
  return {
    id: `field-${index}`,
    name: backendField.name,
    type,
    options,
    value,
  };
}

// Map frontend CardCustomField to backend CustomField
function mapFrontendCustomFieldToBackend(field: CardCustomField): BackendCustomField {
  return {
    name: field.name,
    value: mapFrontendFieldTypeToBackend(field.value),
  };
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
    return [];
  }

  async getProject(projectId: string): Promise<Project | null> {
    return null;
  }

  async createProject(orgId: string, project: Partial<Project>): Promise<Project> {
    throw new Error('Projects not implemented in backend yet');
  }

  // Tarefas
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

  // Reuniões
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

  // Entregáveis
  async listDeliverables(projectId: string): Promise<Deliverable[]> {
    return [];
  }

  async updateDeliverable(deliverableId: string, deliverable: Partial<Deliverable>): Promise<void> {
    throw new Error('Deliverables not implemented in backend yet');
  }

  async deleteDeliverable(deliverableId: string): Promise<void> {
    throw new Error('Deliverables not implemented in backend yet');
  }

  // KPIs
  async listKpis(projectId: string): Promise<any[]> {
    return [];
  }

  // Mensagens
  async listMessages(orgId: string) {
    return [];
  }

  async sendMessage(orgId: string, message: string) {
    throw new Error('Messages not implemented in backend yet');
  }

  // Documentos
  async listDocuments(orgId: string) {
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
    const profile = await this.actor.getCallerUserProfile();
    if (!profile) {
      throw new Error('User profile not found');
    }
    
    const contactId = `contact-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newContact = {
      id: contactId,
      name: contact.name || '',
      email: contact.email || '',
      phone: contact.phone || '',
      orgId,
      createdBy: Principal.fromText('aaaaa-aa'),
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

  // CRM - Contratos
  async listContracts(orgId: string): Promise<Contract[]> {
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
    return [];
  }

  async createNpsCampaign(orgId: string, campaign: Partial<NpsCampaign>): Promise<NpsCampaign> {
    throw new Error('NPS campaigns not implemented in backend yet');
  }

  async listNpsResponses(orgId: string, startDate: Date, endDate: Date): Promise<NpsResponse[]> {
    return [];
  }

  async createNpsResponse(orgId: string, response: Partial<NpsResponse>): Promise<NpsResponse> {
    throw new Error('NPS responses not implemented in backend yet');
  }

  // Reports
  async listReports(orgId: string): Promise<any[]> {
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
    return [];
  }

  async listTeamInvitations(orgId: string): Promise<any[]> {
    return [];
  }

  // Pipeline Stages (board-scoped)
  async listPipelineStages(orgId: string, boardId: string): Promise<PipelineStage[]> {
    const columns = await this.actor.getPipelineColumns(orgId, boardId);
    return columns.map((col) => ({
      id: col.id,
      name: col.name,
      position: Number(col.position),
      orgId: col.orgId,
      boardId: col.boardId,
      createdBy: col.createdBy.toString(),
      createdAt: new Date(Number(col.createdAt)),
    }));
  }

  async createPipelineStage(orgId: string, boardId: string, name: string): Promise<string> {
    const stages = await this.listPipelineStages(orgId, boardId);
    const position = stages.length;
    const timestamp = BigInt(Date.now());
    return await this.actor.createPipelineColumn(orgId, boardId, name, BigInt(position), timestamp);
  }

  async renamePipelineStage(stageId: string, boardId: string, newName: string): Promise<void> {
    await this.actor.updatePipelineColumn(stageId, boardId, newName);
  }

  async deletePipelineStage(stageId: string, boardId: string): Promise<void> {
    await this.actor.deletePipelineColumn(stageId, boardId);
  }

  async reorderPipelineStages(orgId: string, boardId: string, updates: PipelineStageReorderUpdate[]): Promise<void> {
    const backendUpdates: ColumnUpdate[] = updates.map((u) => ({
      id: u.id,
      name: u.name,
      boardId: u.boardId,
      newPosition: BigInt(u.newPosition),
    }));
    await this.actor.reorderPipelineColumns(orgId, boardId, backendUpdates);
  }

  // Kanban Boards
  async listKanbanBoards(orgId: string): Promise<KanbanBoard[]> {
    const boards = await this.actor.listKanbanBoards(orgId);
    return boards.map((board) => ({
      id: board.id,
      name: board.name,
      orgId: board.orgId,
      createdBy: board.createdBy.toString(),
      createdAt: new Date(Number(board.createdAt)),
    }));
  }

  async createKanbanBoard(orgId: string, name: string): Promise<string> {
    return await this.actor.createKanbanBoard(orgId, name);
  }

  async renameKanbanBoard(boardId: string, name: string): Promise<void> {
    await this.actor.updateKanbanBoard(boardId, name);
  }

  async getKanbanBoard(boardId: string): Promise<KanbanBoardWithDefinitions> {
    const board = await this.actor.getKanbanBoard(boardId);
    return {
      id: board.id,
      name: board.name,
      orgId: board.orgId,
      createdBy: board.createdBy.toString(),
      createdAt: new Date(Number(board.createdAt)),
      customFieldDefinitions: board.customFieldDefinitions,
    };
  }

  async addOrUpdateCustomFieldDefinition(orgId: string, boardId: string, definition: BackendCustomFieldDefinition): Promise<void> {
    await this.actor.addOrUpdateCustomFieldDefinition(orgId, boardId, definition);
  }

  // Kanban Cards (board-scoped)
  async listCardsByBoard(orgId: string, boardId: string): Promise<KanbanCard[]> {
    const cards = await this.actor.getCardsByBoard(orgId, boardId);
    return cards.map((card) => ({
      id: card.id,
      title: card.title,
      description: card.description,
      dueDate: card.dueDate ? new Date(Number(card.dueDate)) : undefined,
      columnId: card.columnId,
      orgId: card.orgId,
      boardId: card.boardId,
      createdBy: card.createdBy.toString(),
      createdAt: new Date(Number(card.createdAt)),
      updatedAt: new Date(Number(card.updatedAt)),
      customFields: card.customFields.map((f, i) => mapBackendCustomFieldToFrontend(f, i)),
    }));
  }

  async listCardsByColumn(columnId: string, boardId: string): Promise<KanbanCard[]> {
    const cards = await this.actor.getCardsByColumn(columnId, boardId);
    return cards.map((card) => ({
      id: card.id,
      title: card.title,
      description: card.description,
      dueDate: card.dueDate ? new Date(Number(card.dueDate)) : undefined,
      columnId: card.columnId,
      orgId: card.orgId,
      boardId: card.boardId,
      createdBy: card.createdBy.toString(),
      createdAt: new Date(Number(card.createdAt)),
      updatedAt: new Date(Number(card.updatedAt)),
      customFields: card.customFields.map((f, i) => mapBackendCustomFieldToFrontend(f, i)),
    }));
  }

  async getCard(cardId: string): Promise<KanbanCard> {
    const card = await this.actor.getCard(cardId);
    return {
      id: card.id,
      title: card.title,
      description: card.description,
      dueDate: card.dueDate ? new Date(Number(card.dueDate)) : undefined,
      columnId: card.columnId,
      orgId: card.orgId,
      boardId: card.boardId,
      createdBy: card.createdBy.toString(),
      createdAt: new Date(Number(card.createdAt)),
      updatedAt: new Date(Number(card.updatedAt)),
      customFields: card.customFields.map((f, i) => mapBackendCustomFieldToFrontend(f, i)),
    };
  }

  async createCard(input: CardInput): Promise<string> {
    const backendInput: BackendCardInput = {
      title: input.title,
      description: input.description,
      dueDate: input.dueDate ? BigInt(input.dueDate.getTime()) : undefined,
      columnId: input.columnId,
      orgId: input.orgId,
      boardId: input.boardId,
      customFields: input.customFields.map(mapFrontendCustomFieldToBackend),
    };
    return await this.actor.createCard(backendInput);
  }

  async updateCard(cardId: string, input: CardInput): Promise<void> {
    const backendInput: BackendCardInput = {
      title: input.title,
      description: input.description,
      dueDate: input.dueDate ? BigInt(input.dueDate.getTime()) : undefined,
      columnId: input.columnId,
      orgId: input.orgId,
      boardId: input.boardId,
      customFields: input.customFields.map(mapFrontendCustomFieldToBackend),
    };
    await this.actor.updateCard(cardId, backendInput);
  }

  async moveCard(cardId: string, destinationColumnId: string): Promise<void> {
    await this.actor.moveCard(cardId, destinationColumnId);
  }

  async deleteCard(cardId: string): Promise<void> {
    await this.actor.deleteCard(cardId);
  }
}
