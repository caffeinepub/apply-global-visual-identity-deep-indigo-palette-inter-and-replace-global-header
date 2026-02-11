import type { backendInterface, CustomFieldDefinition, CustomField as BackendCustomField, FieldType as BackendFieldType } from '../../backend';
import type { DataClient, KanbanBoard } from '../client';
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
} from '../../types/model';
import type { PipelineStage, PipelineStageReorderUpdate } from '../../types/pipelineStages';
import type { KanbanCard, CardInput, CardCustomField } from '../../types/kanbanCards';
import type { KanbanBoardWithDefinitions } from '../../hooks/useKanbanBoard';
import type { 
  ReportHistoryItem, 
  ReportSchedule, 
  ReportScheduleInput, 
  GenerateReportInput 
} from '../../types/reports';

// Helper to convert backend FieldType to frontend CardCustomField
function convertBackendFieldToFrontend(field: BackendCustomField): CardCustomField {
  const baseField: CardCustomField = {
    id: field.name, // Use name as id for now
    name: field.name,
    type: 'text',
    value: {},
  };

  if (field.value.__kind__ === 'text') {
    baseField.type = 'text';
    baseField.value = { text: field.value.text };
  } else if (field.value.__kind__ === 'number') {
    baseField.type = 'number';
    baseField.value = { number: field.value.number };
  } else if (field.value.__kind__ === 'date') {
    baseField.type = 'date';
    baseField.value = { date: new Date(Number(field.value.date) / 1_000_000) };
  } else if (field.value.__kind__ === 'singleSelect') {
    baseField.type = 'singleSelect';
    baseField.value = { singleSelect: field.value.singleSelect };
  } else if (field.value.__kind__ === 'multiSelect') {
    baseField.type = 'multiSelect';
    baseField.value = { multiSelect: field.value.multiSelect };
  } else if (field.value.__kind__ === 'tags') {
    baseField.type = 'tags';
    baseField.value = { tags: field.value.tags };
  }

  return baseField;
}

// Helper to convert frontend CardCustomField to backend CustomField
function convertFrontendFieldToBackend(field: CardCustomField): BackendCustomField {
  let fieldValue: BackendFieldType;

  if (field.type === 'text' && field.value.text !== undefined) {
    fieldValue = { __kind__: 'text', text: field.value.text };
  } else if (field.type === 'number' && field.value.number !== undefined) {
    fieldValue = { __kind__: 'number', number: field.value.number };
  } else if (field.type === 'date' && field.value.date !== undefined) {
    fieldValue = { __kind__: 'date', date: BigInt(field.value.date.getTime() * 1_000_000) };
  } else if (field.type === 'singleSelect' && field.value.singleSelect !== undefined) {
    fieldValue = { __kind__: 'singleSelect', singleSelect: field.value.singleSelect };
  } else if (field.type === 'multiSelect' && field.value.multiSelect !== undefined) {
    fieldValue = { __kind__: 'multiSelect', multiSelect: field.value.multiSelect };
  } else if (field.type === 'tags' && field.value.tags !== undefined) {
    fieldValue = { __kind__: 'tags', tags: field.value.tags };
  } else {
    // Default to empty text
    fieldValue = { __kind__: 'text', text: '' };
  }

  return {
    name: field.name,
    value: fieldValue,
  };
}

export class BackendClient implements DataClient {
  constructor(private actor: backendInterface) {}

  // Organizations
  async listOrgs() {
    const orgs = await this.actor.listOrganizations();
    return orgs.map((org) => ({
      id: org.id,
      name: org.name,
      createdBy: org.createdBy.toText(),
      createdAt: new Date(Number(org.createdAt) / 1_000_000),
    }));
  }

  async getOrg(orgId: string) {
    const org = await this.actor.getOrganization(orgId);
    if (!org) return null;
    return {
      id: org.id,
      name: org.name,
      createdBy: org.createdBy.toText(),
      createdAt: new Date(Number(org.createdAt) / 1_000_000),
    };
  }

  async createOrg(name: string) {
    const timestamp = BigInt(Date.now() * 1_000_000);
    const orgId = await this.actor.createOrganization(name, timestamp);
    return this.getOrg(orgId);
  }

  async selectOrg(orgId: string) {
    const profile = await this.actor.getCallerUserProfile();
    if (!profile) throw new Error('No user profile found');
    await this.actor.saveCallerUserProfile({
      ...profile,
      currentOrgId: orgId,
    });
  }

  // Profile
  async getUserProfile() {
    const profile = await this.actor.getCallerUserProfile();
    if (!profile) return null;
    return {
      firstName: profile.firstName,
      lastName: profile.lastName,
      email: profile.email,
      currentOrgId: profile.currentOrgId || null,
      appRole: profile.appRole,
    };
  }

  async saveUserProfile(profile: any) {
    await this.actor.saveCallerUserProfile({
      firstName: profile.firstName,
      lastName: profile.lastName,
      email: profile.email,
      currentOrgId: profile.currentOrgId || undefined,
      appRole: profile.appRole,
    });
  }

  // Contacts - stub implementation matching frontend Contact type
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
      status: 'active',
      ownerUserId: c.createdBy.toText(),
      notes: '',
      attachments: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    }));
  }

  async createContact(orgId: string, contact: Partial<Contact>): Promise<Contact> {
    const newContact: Contact = {
      id: `${orgId}-${Date.now()}`,
      orgId,
      name: contact.name || '',
      email: contact.email || '',
      phone: contact.phone || '',
      company: contact.company || '',
      tags: contact.tags || [],
      status: contact.status || 'active',
      ownerUserId: contact.ownerUserId || 'unknown',
      notes: contact.notes || '',
      attachments: contact.attachments || [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    await this.actor.createContact({
      id: newContact.id,
      name: newContact.name,
      email: newContact.email,
      phone: newContact.phone,
      createdBy: this.actor as any,
      orgId,
    });
    return newContact;
  }

  async updateContact(contactId: string, contact: Partial<Contact>): Promise<void> {
    await this.actor.updateContact(
      contactId,
      contact.name || '',
      contact.email || '',
      contact.phone || ''
    );
  }

  async deleteContact(contactId: string): Promise<void> {
    await this.actor.deleteContact(contactId);
  }

  // Kanban Boards
  async listKanbanBoards(orgId: string): Promise<KanbanBoard[]> {
    const boards = await this.actor.listKanbanBoards(orgId);
    return boards.map((b) => ({
      id: b.id,
      name: b.name,
      orgId: b.orgId,
      createdBy: b.createdBy.toText(),
      createdAt: new Date(Number(b.createdAt) / 1_000_000),
    }));
  }

  async createKanbanBoard(orgId: string, name: string): Promise<string> {
    return this.actor.createKanbanBoard(orgId, name);
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
      createdBy: board.createdBy.toText(),
      createdAt: new Date(Number(board.createdAt) / 1_000_000),
      customFieldDefinitions: board.customFieldDefinitions,
    };
  }

  async addOrUpdateCustomFieldDefinition(
    orgId: string,
    boardId: string,
    definition: CustomFieldDefinition
  ): Promise<void> {
    await this.actor.addOrUpdateCustomFieldDefinition(orgId, boardId, definition);
  }

  // Pipeline Stages
  async listPipelineStages(orgId: string, boardId: string): Promise<PipelineStage[]> {
    const columns = await this.actor.getPipelineColumns(orgId, boardId);
    return columns.map((col) => ({
      id: col.id,
      name: col.name,
      position: Number(col.position),
      orgId: col.orgId,
      boardId: col.boardId,
      createdBy: col.createdBy.toText(),
      createdAt: new Date(Number(col.createdAt) / 1_000_000),
    }));
  }

  async createPipelineStage(orgId: string, boardId: string, name: string): Promise<string> {
    const timestamp = BigInt(Date.now() * 1_000_000);
    const stages = await this.listPipelineStages(orgId, boardId);
    const position = stages.length;
    return this.actor.createPipelineColumn(orgId, boardId, name, BigInt(position), timestamp);
  }

  async renamePipelineStage(columnId: string, boardId: string, newName: string): Promise<void> {
    await this.actor.renamePipelineColumn(columnId, boardId, newName);
  }

  async deletePipelineStage(columnId: string, boardId: string): Promise<void> {
    await this.actor.deletePipelineColumn(columnId, boardId);
  }

  async reorderPipelineStages(
    orgId: string,
    boardId: string,
    updates: PipelineStageReorderUpdate[]
  ): Promise<void> {
    const backendUpdates = updates.map((u) => ({
      id: u.id,
      name: u.name,
      boardId: u.boardId,
      newPosition: BigInt(u.newPosition),
    }));
    await this.actor.reorderPipelineColumns(orgId, boardId, backendUpdates);
  }

  // Kanban Cards
  async listCardsByBoard(orgId: string, boardId: string): Promise<KanbanCard[]> {
    const cards = await this.actor.getCardsByBoard(orgId, boardId);
    return cards.map((card) => ({
      id: card.id,
      title: card.title,
      description: card.description,
      dueDate: card.dueDate ? new Date(Number(card.dueDate) / 1_000_000) : undefined,
      columnId: card.columnId,
      orgId: card.orgId,
      boardId: card.boardId,
      createdBy: card.createdBy.toText(),
      createdAt: new Date(Number(card.createdAt) / 1_000_000),
      updatedAt: new Date(Number(card.updatedAt) / 1_000_000),
      customFields: card.customFields.map(convertBackendFieldToFrontend),
    }));
  }

  async listCardsByColumn(columnId: string, boardId: string): Promise<KanbanCard[]> {
    const cards = await this.actor.getCardsByColumn(columnId, boardId);
    return cards.map((card) => ({
      id: card.id,
      title: card.title,
      description: card.description,
      dueDate: card.dueDate ? new Date(Number(card.dueDate) / 1_000_000) : undefined,
      columnId: card.columnId,
      orgId: card.orgId,
      boardId: card.boardId,
      createdBy: card.createdBy.toText(),
      createdAt: new Date(Number(card.createdAt) / 1_000_000),
      updatedAt: new Date(Number(card.updatedAt) / 1_000_000),
      customFields: card.customFields.map(convertBackendFieldToFrontend),
    }));
  }

  async getCard(cardId: string): Promise<KanbanCard> {
    const card = await this.actor.getCard(cardId);
    return {
      id: card.id,
      title: card.title,
      description: card.description,
      dueDate: card.dueDate ? new Date(Number(card.dueDate) / 1_000_000) : undefined,
      columnId: card.columnId,
      orgId: card.orgId,
      boardId: card.boardId,
      createdBy: card.createdBy.toText(),
      createdAt: new Date(Number(card.createdAt) / 1_000_000),
      updatedAt: new Date(Number(card.updatedAt) / 1_000_000),
      customFields: card.customFields.map(convertBackendFieldToFrontend),
    };
  }

  async createCard(input: CardInput): Promise<string> {
    const backendInput = {
      title: input.title,
      description: input.description,
      dueDate: input.dueDate ? BigInt(input.dueDate.getTime() * 1_000_000) : undefined,
      columnId: input.columnId,
      orgId: input.orgId,
      boardId: input.boardId,
      customFields: input.customFields.map(convertFrontendFieldToBackend),
    };
    return this.actor.createCard(backendInput);
  }

  async updateCard(cardId: string, input: CardInput): Promise<void> {
    const backendInput = {
      title: input.title,
      description: input.description,
      dueDate: input.dueDate ? BigInt(input.dueDate.getTime() * 1_000_000) : undefined,
      columnId: input.columnId,
      orgId: input.orgId,
      boardId: input.boardId,
      customFields: input.customFields.map(convertFrontendFieldToBackend),
    };
    await this.actor.updateCard(cardId, backendInput);
  }

  async moveCard(cardId: string, destinationColumnId: string): Promise<void> {
    await this.actor.moveCard(cardId, destinationColumnId);
  }

  async deleteCard(cardId: string): Promise<void> {
    await this.actor.deleteCard(cardId);
  }

  // Reports - Typed implementation
  async listReportHistory(orgId: string): Promise<ReportHistoryItem[]> {
    // Stub: Backend needs to implement report history storage
    console.warn('listReportHistory: Backend implementation pending');
    return [];
  }

  async generateReport(input: GenerateReportInput): Promise<void> {
    // Stub: Backend needs to implement report generation
    console.warn('generateReport: Backend implementation pending', input);
    throw new Error('Report generation not yet implemented in backend');
  }

  async downloadReport(reportId: string): Promise<{ blob: Uint8Array; filename: string; mimeType: string }> {
    // Stub: Backend needs to implement report file retrieval
    console.warn('downloadReport: Backend implementation pending', reportId);
    throw new Error('Report download not yet implemented in backend');
  }

  async listReportSchedules(orgId: string): Promise<ReportSchedule[]> {
    // Stub: Backend needs to implement schedule storage
    console.warn('listReportSchedules: Backend implementation pending');
    return [];
  }

  async createReportSchedule(orgId: string, input: ReportScheduleInput): Promise<string> {
    // Stub: Backend needs to implement schedule creation
    console.warn('createReportSchedule: Backend implementation pending', input);
    throw new Error('Schedule creation not yet implemented in backend');
  }

  async updateReportSchedule(scheduleId: string, updates: Partial<ReportScheduleInput>): Promise<void> {
    // Stub: Backend needs to implement schedule updates
    console.warn('updateReportSchedule: Backend implementation pending', scheduleId, updates);
    throw new Error('Schedule update not yet implemented in backend');
  }

  async deleteReportSchedule(scheduleId: string): Promise<void> {
    // Stub: Backend needs to implement schedule deletion
    console.warn('deleteReportSchedule: Backend implementation pending', scheduleId);
    throw new Error('Schedule deletion not yet implemented in backend');
  }

  // Stubs for other methods
  async listProjects(): Promise<Project[]> {
    return [];
  }
  async getProject(): Promise<Project | null> {
    return null;
  }
  async createProject(): Promise<Project> {
    throw new Error('Not implemented');
  }
  async listTasks(): Promise<Task[]> {
    return [];
  }
  async createTask(): Promise<Task> {
    throw new Error('Not implemented');
  }
  async updateTask(): Promise<void> {}
  async deleteTask(): Promise<void> {}
  async updateTaskStatus(): Promise<void> {}
  async listMeetings(): Promise<Meeting[]> {
    return [];
  }
  async createMeeting(): Promise<Meeting> {
    throw new Error('Not implemented');
  }
  async updateMeeting(): Promise<void> {}
  async deleteMeeting(): Promise<void> {}
  async listDeliverables(): Promise<Deliverable[]> {
    return [];
  }
  async updateDeliverable(): Promise<void> {}
  async deleteDeliverable(): Promise<void> {}
  async listKpis(): Promise<any[]> {
    return [];
  }
  async listMessages(): Promise<any[]> {
    return [];
  }
  async sendMessage(): Promise<void> {}
  async listDocuments(): Promise<any[]> {
    return [];
  }
  async createDocument(): Promise<any> {
    return {};
  }
  async uploadDocument(): Promise<void> {}
  async deleteDocument(): Promise<void> {}
  async listDeals(orgId: string): Promise<Deal[]> {
    const deals = await this.actor.getOrgDeals(orgId);
    return deals.map((d) => ({
      id: d.id,
      orgId: d.orgId,
      title: d.name,
      contactId: '',
      stage: 'Lead' as const,
      status: d.status === 'active' ? 'open' : d.status === 'won' ? 'won' : 'lost',
      value: Number(d.value),
      probability: 50,
      ownerUserId: d.createdBy.toText(),
      createdAt: new Date(Number(d.startDate) / 1_000_000),
      updatedAt: new Date(Number(d.startDate) / 1_000_000),
    }));
  }
  async createDeal(): Promise<Deal> {
    throw new Error('Not implemented');
  }
  async updateDeal(): Promise<void> {}
  async deleteDeal(): Promise<void> {}
  async listActivities(orgId: string): Promise<Activity[]> {
    const activities = await this.actor.getOrgActivities(orgId);
    return activities.map((a) => ({
      id: a.id,
      orgId: a.orgId,
      type: 'task' as const,
      dueDate: a.dueDate ? new Date(Number(a.dueDate) / 1_000_000) : new Date(),
      status: a.status === 'open' ? 'open' : 'done',
      ownerUserId: a.createdBy.toText(),
      relatedType: 'contact' as const,
      relatedId: a.relatedProject || '',
      notes: a.name,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));
  }
  async createActivity(): Promise<Activity> {
    throw new Error('Not implemented');
  }
  async updateActivity(): Promise<void> {}
  async deleteActivity(): Promise<void> {}
  async listContracts(orgId: string): Promise<Contract[]> {
    const contracts = await this.actor.getOrgContracts(orgId);
    return contracts.map((c) => ({
      id: c.id,
      orgId: c.orgId,
      contactId: '',
      name: c.name,
      mrr: Number(c.value),
      startDate: new Date(Number(c.startDate) / 1_000_000),
      renewalDate: c.endDate ? new Date(Number(c.endDate) / 1_000_000) : new Date(),
      status: c.isCancelled ? 'canceled' : 'active',
      cancelDate: c.isCancelled ? new Date() : undefined,
      cancelReason: c.cancellationReason || undefined,
      createdAt: new Date(Number(c.startDate) / 1_000_000),
      updatedAt: new Date(Number(c.startDate) / 1_000_000),
    }));
  }
  async createContract(): Promise<Contract> {
    throw new Error('Not implemented');
  }
  async updateContract(): Promise<void> {}
  async deleteContract(): Promise<void> {}
  async cancelContract(): Promise<void> {}
  async listFinanceTransactions(): Promise<FinanceTransaction[]> {
    return [];
  }
  async createFinanceTransaction(): Promise<FinanceTransaction> {
    throw new Error('Not implemented');
  }
  async updateFinanceTransaction(): Promise<void> {}
  async deleteFinanceTransaction(): Promise<void> {}
  async listNpsCampaigns(): Promise<NpsCampaign[]> {
    return [];
  }
  async createNpsCampaign(): Promise<NpsCampaign> {
    throw new Error('Not implemented');
  }
  async listNpsResponses(): Promise<NpsResponse[]> {
    return [];
  }
  async createNpsResponse(): Promise<NpsResponse> {
    throw new Error('Not implemented');
  }
  async isCallerAdmin(): Promise<boolean> {
    return this.actor.isCallerAdmin();
  }
  async inviteTeamMember(): Promise<void> {}
  async listOrgMembers(): Promise<any[]> {
    return [];
  }
  async listTeamInvitations(): Promise<any[]> {
    return [];
  }
}
