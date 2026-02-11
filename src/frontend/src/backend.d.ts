import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface UserProfile {
    appRole: AppUserRole;
    email: string;
    currentOrgId?: OrgId;
    lastName: string;
    firstName: string;
}
export interface PipelineColumn {
    id: string;
    orgId: OrgId;
    name: string;
    createdAt: bigint;
    createdBy: Principal;
    boardId: BoardId;
    position: bigint;
}
export type OrgId = string;
export interface ColumnUpdate {
    id: string;
    name: string;
    boardId: BoardId;
    newPosition: bigint;
}
export type CardId = string;
export interface Contact {
    id: string;
    orgId: OrgId;
    name: string;
    createdBy: Principal;
    email: string;
    phone: string;
}
export interface CardInput {
    title: string;
    orgId: OrgId;
    dueDate?: bigint;
    description: string;
    boardId: BoardId;
    customFields: Array<CustomField>;
    columnId: string;
}
export type BoardId = string;
export interface KanbanBoard {
    id: BoardId;
    customFieldDefinitions: Array<CustomFieldDefinition>;
    orgId: OrgId;
    name: string;
    createdAt: bigint;
    createdBy: Principal;
}
export interface Activity {
    id: string;
    status: ActivityStatus;
    orgId: OrgId;
    relatedProject?: string;
    name: string;
    createdBy: Principal;
    dueDate?: bigint;
}
export type FieldType = {
    __kind__: "singleSelect";
    singleSelect: string;
} | {
    __kind__: "date";
    date: bigint;
} | {
    __kind__: "tags";
    tags: Array<string>;
} | {
    __kind__: "text";
    text: string;
} | {
    __kind__: "multiSelect";
    multiSelect: Array<string>;
} | {
    __kind__: "number";
    number: number;
};
export interface Deal {
    id: string;
    status: DealStatus;
    value: bigint;
    orgId: OrgId;
    name: string;
    createdBy: Principal;
    startDate: bigint;
}
export interface CustomField {
    value: FieldType;
    name: string;
}
export interface Contract {
    id: string;
    isCancelled: boolean;
    endDate?: bigint;
    value: bigint;
    orgId: OrgId;
    cancellationReason: string;
    name: string;
    createdBy: Principal;
    startDate: bigint;
}
export interface CustomFieldDefinition {
    name: string;
    options: Array<string>;
    fieldType: FieldType;
}
export interface KanbanCard {
    id: CardId;
    title: string;
    orgId: OrgId;
    createdAt: bigint;
    createdBy: Principal;
    dueDate?: bigint;
    description: string;
    boardId: BoardId;
    customFields: Array<CustomField>;
    updatedAt: bigint;
    columnId: string;
}
export interface Organization {
    id: OrgId;
    name: string;
    createdAt: bigint;
    createdBy: Principal;
}
export enum ActivityStatus {
    open = "open",
    completed = "completed"
}
export enum AppUserRole {
    FIRSTY_CONSULTANT = "FIRSTY_CONSULTANT",
    FIRSTY_ADMIN = "FIRSTY_ADMIN",
    OWNER_ADMIN = "OWNER_ADMIN",
    MEMBER = "MEMBER"
}
export enum DealStatus {
    won = "won",
    active = "active",
    lost = "lost"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addOrUpdateCustomFieldDefinition(orgId: OrgId, boardId: BoardId, definition: CustomFieldDefinition): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createCard(input: CardInput): Promise<CardId>;
    createContact(contact: Contact): Promise<void>;
    createKanbanBoard(orgId: OrgId, name: string): Promise<BoardId>;
    createOrganization(name: string, timestamp: bigint): Promise<OrgId>;
    createPipelineColumn(orgId: OrgId, boardId: BoardId, name: string, position: bigint, timestamp: bigint): Promise<string>;
    deleteCard(cardId: CardId): Promise<void>;
    deleteContact(id: string): Promise<void>;
    deleteKanbanBoard(boardId: BoardId): Promise<void>;
    deleteOrganization(orgId: OrgId): Promise<void>;
    deletePipelineColumn(columnId: string, boardId: BoardId): Promise<void>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCard(cardId: CardId): Promise<KanbanCard>;
    getCardsByBoard(orgId: OrgId, boardId: BoardId): Promise<Array<KanbanCard>>;
    getCardsByColumn(columnId: string, boardId: BoardId): Promise<Array<KanbanCard>>;
    getContact(id: string): Promise<Contact | null>;
    getKanbanBoard(boardId: BoardId): Promise<KanbanBoard>;
    getOrgActivities(orgId: OrgId): Promise<Array<Activity>>;
    getOrgContracts(orgId: OrgId): Promise<Array<Contract>>;
    getOrgDeals(orgId: OrgId): Promise<Array<Deal>>;
    getOrganization(orgId: OrgId): Promise<Organization | null>;
    getPipelineColumn(columnId: string, boardId: BoardId): Promise<PipelineColumn | null>;
    getPipelineColumns(orgId: OrgId, boardId: BoardId): Promise<Array<PipelineColumn>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    listContacts(orgId: OrgId): Promise<Array<Contact>>;
    listKanbanBoards(orgId: OrgId): Promise<Array<KanbanBoard>>;
    listOrganizations(): Promise<Array<Organization>>;
    moveCard(cardId: CardId, destinationColumnId: string): Promise<void>;
    renamePipelineColumn(columnId: string, boardId: BoardId, newName: string): Promise<void>;
    reorderPipelineColumns(orgId: OrgId, boardId: BoardId, updates: Array<ColumnUpdate>): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    updateCard(cardId: CardId, input: CardInput): Promise<void>;
    updateContact(id: string, name: string, email: string, phone: string): Promise<void>;
    updateKanbanBoard(boardId: BoardId, name: string): Promise<void>;
    updateOrganization(orgId: OrgId, name: string): Promise<void>;
    updatePipelineColumn(columnId: string, boardId: BoardId, newName: string): Promise<void>;
}
