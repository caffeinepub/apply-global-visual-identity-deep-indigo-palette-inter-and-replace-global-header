import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export type OrgId = string;
export interface Contact {
    id: string;
    orgId: OrgId;
    name: string;
    createdBy: Principal;
    email: string;
    phone: string;
}
export interface NpsCampaign {
    id: string;
    status: string;
    orgId: OrgId;
    name: string;
    createdAt: bigint;
    createdBy: Principal;
}
export interface DocumentUploadInput {
    orgId: OrgId;
    file: ExternalBlob;
    name: string;
    category: DocumentCategory;
}
export interface Report {
    id: string;
    orgId: OrgId;
    period: string;
    generatedAt: bigint;
    generatedBy: Principal;
    reportType: string;
    format: string;
}
export interface Document {
    id: string;
    orgId: OrgId;
    file: ExternalBlob;
    name: string;
    category: DocumentCategory;
    uploadedAt: bigint;
    uploadedBy: Principal;
}
export interface TeamInvitation {
    id: string;
    status: string;
    orgId: OrgId;
    invitedAt: bigint;
    invitedBy: Principal;
    inviteeIdentifier: string;
}
export interface Activity {
    id: string;
    orgId: OrgId;
    relatedProject?: string;
    name: string;
    createdBy: Principal;
    completed: boolean;
    dueDate?: bigint;
}
export interface Deal {
    id: string;
    value: bigint;
    orgId: OrgId;
    name: string;
    createdBy: Principal;
    stage: DealStage;
}
export interface FinanceTransaction {
    id: string;
    orgId: OrgId;
    createdAt: bigint;
    createdBy: Principal;
    description: string;
    amount: bigint;
}
export interface Contract {
    id: string;
    endDate?: bigint;
    value: bigint;
    orgId: OrgId;
    name: string;
    createdBy: Principal;
    startDate: bigint;
}
export interface Project {
    id: string;
    orgId: OrgId;
    name: string;
    createdBy: Principal;
    description: string;
    phase: ProjectPhase;
}
export interface Organization {
    id: OrgId;
    name: string;
    createdAt: bigint;
    createdBy: Principal;
}
export interface UserProfile {
    email: string;
    currentOrgId?: OrgId;
    lastName: string;
    firstName: string;
}
export enum DealStage {
    prospecting = "prospecting",
    closedWon = "closedWon",
    negotiation = "negotiation",
    closedLost = "closedLost"
}
export enum DocumentCategory {
    projectDocs = "projectDocs",
    other = "other",
    marketing = "marketing",
    legal = "legal",
    presentations = "presentations",
    contracts = "contracts",
    reports = "reports",
    invoices = "invoices",
    proposals = "proposals",
    mediaAssets = "mediaAssets"
}
export enum ProjectPhase {
    completed = "completed",
    inProgress = "inProgress",
    planning = "planning"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addMemberToOrg(user: Principal, orgId: OrgId): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createActivity(activity: Activity): Promise<void>;
    createContact(contact: Contact): Promise<void>;
    createContract(contract: Contract): Promise<void>;
    createDeal(deal: Deal): Promise<void>;
    createFinanceTransaction(transaction: FinanceTransaction): Promise<void>;
    createNpsCampaign(campaign: NpsCampaign): Promise<void>;
    createOrganization(name: string, timestamp: bigint): Promise<OrgId>;
    createProject(project: Project): Promise<void>;
    generateReport(report: Report): Promise<void>;
    getActivity(id: string): Promise<Activity | null>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getContact(id: string): Promise<Contact | null>;
    getContract(id: string): Promise<Contract | null>;
    getDeal(id: string): Promise<Deal | null>;
    getDocument(id: string): Promise<Document | null>;
    getFinanceTransaction(id: string): Promise<FinanceTransaction | null>;
    getNpsCampaign(id: string): Promise<NpsCampaign | null>;
    getOrganization(orgId: OrgId): Promise<Organization | null>;
    getProject(id: string): Promise<Project | null>;
    getReport(id: string): Promise<Report | null>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    inviteTeamMember(invitation: TeamInvitation): Promise<void>;
    isCallerAdmin(): Promise<boolean>;
    listActivities(orgId: OrgId): Promise<Array<Activity>>;
    listContacts(orgId: OrgId): Promise<Array<Contact>>;
    listContracts(orgId: OrgId): Promise<Array<Contract>>;
    listDeals(orgId: OrgId): Promise<Array<Deal>>;
    listDocuments(orgId: OrgId): Promise<Array<Document>>;
    listFinanceTransactions(orgId: OrgId): Promise<Array<FinanceTransaction>>;
    listNpsCampaigns(orgId: OrgId): Promise<Array<NpsCampaign>>;
    listOrgMembers(orgId: OrgId): Promise<Array<Principal>>;
    listProjects(orgId: OrgId): Promise<Array<Project>>;
    listReports(orgId: OrgId): Promise<Array<Report>>;
    listTeamInvitations(orgId: OrgId): Promise<Array<TeamInvitation>>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    uploadDocument(input: DocumentUploadInput): Promise<void>;
}
