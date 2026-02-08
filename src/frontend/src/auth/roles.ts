/**
 * Definição de papéis (roles) da aplicação First-Y.
 * Estes papéis são usados tanto no modo MOCK quanto no modo BACKEND.
 */

export type AppRole = 
  | 'OWNER_ADMIN'      // Cliente/Dono da empresa - acesso ao Portal e CRM
  | 'MEMBER'           // Funcionário do cliente - acesso apenas ao CRM
  | 'FIRSTY_CONSULTANT' // Funcionário First-Y - acesso a tudo exceto cadastrar empresas/membros
  | 'FIRSTY_ADMIN';    // Admin First-Y - acesso total

export interface RoleInfo {
  role: AppRole;
  label: string;
  description: string;
  canAccessInternal: boolean;
  canAccessPortal: boolean;
  canManageOrganizations: boolean;
  canManageMembers: boolean;
}

export const ROLE_INFO: Record<AppRole, RoleInfo> = {
  OWNER_ADMIN: {
    role: 'OWNER_ADMIN',
    label: 'Administrador',
    description: 'Cliente/Dono da empresa - acesso ao Portal e CRM',
    canAccessInternal: true,
    canAccessPortal: true,
    canManageOrganizations: true,
    canManageMembers: true,
  },
  MEMBER: {
    role: 'MEMBER',
    label: 'Membro',
    description: 'Funcionário do cliente - acesso apenas ao CRM',
    canAccessInternal: true,
    canAccessPortal: false,
    canManageOrganizations: false,
    canManageMembers: false,
  },
  FIRSTY_CONSULTANT: {
    role: 'FIRSTY_CONSULTANT',
    label: 'Consultor First-Y',
    description: 'Funcionário First-Y - acesso a tudo exceto cadastrar empresas/membros',
    canAccessInternal: true,
    canAccessPortal: true,
    canManageOrganizations: false,
    canManageMembers: false,
  },
  FIRSTY_ADMIN: {
    role: 'FIRSTY_ADMIN',
    label: 'Admin First-Y',
    description: 'Admin First-Y - acesso total a todas funcionalidades',
    canAccessInternal: true,
    canAccessPortal: true,
    canManageOrganizations: true,
    canManageMembers: true,
  },
};

export function getRoleInfo(role: AppRole): RoleInfo {
  return ROLE_INFO[role];
}

export function canAccessInternal(role: AppRole): boolean {
  return ROLE_INFO[role]?.canAccessInternal ?? false;
}

export function canAccessPortal(role: AppRole): boolean {
  return ROLE_INFO[role]?.canAccessPortal ?? false;
}

export function canManageOrganizations(role: AppRole): boolean {
  return ROLE_INFO[role]?.canManageOrganizations ?? false;
}

export function canManageMembers(role: AppRole): boolean {
  return ROLE_INFO[role]?.canManageMembers ?? false;
}
