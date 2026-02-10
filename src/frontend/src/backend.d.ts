import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export type OrgId = string;
export interface Contact {
    id: string;
    orgId: OrgId;
    name: string;
    createdBy: Principal;
    email: string;
    phone: string;
}
export interface Organization {
    id: OrgId;
    name: string;
    createdAt: bigint;
    createdBy: Principal;
}
export interface UserProfile {
    appRole: AppUserRole;
    email: string;
    currentOrgId?: OrgId;
    lastName: string;
    firstName: string;
}
export enum AppUserRole {
    FIRSTY_CONSULTANT = "FIRSTY_CONSULTANT",
    FIRSTY_ADMIN = "FIRSTY_ADMIN",
    OWNER_ADMIN = "OWNER_ADMIN",
    MEMBER = "MEMBER"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createContact(contact: Contact): Promise<void>;
    createOrganization(name: string, timestamp: bigint): Promise<OrgId>;
    deleteContact(id: string): Promise<void>;
    deleteOrganization(orgId: OrgId): Promise<void>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getContact(id: string): Promise<Contact | null>;
    getOrganization(orgId: OrgId): Promise<Organization | null>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    listContacts(orgId: OrgId): Promise<Array<Contact>>;
    listOrganizations(): Promise<Array<Organization>>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    updateContact(id: string, name: string, email: string, phone: string): Promise<void>;
    updateOrganization(orgId: OrgId, name: string): Promise<void>;
}
