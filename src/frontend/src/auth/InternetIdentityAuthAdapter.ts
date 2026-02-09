import type { Identity } from '@dfinity/agent';
import type { AppRole } from './roles';
import type { UserProfile as FrontendUserProfile } from '../types/model';
import type { UserProfile as BackendUserProfile, AppUserRole } from '../backend';

/**
 * Map backend AppUserRole to frontend AppRole
 */
function mapBackendRoleToFrontend(backendRole: AppUserRole): AppRole {
  switch (backendRole) {
    case 'FIRSTY_ADMIN':
      return 'FIRSTY_ADMIN';
    case 'FIRSTY_CONSULTANT':
      return 'FIRSTY_CONSULTANT';
    case 'OWNER_ADMIN':
      return 'OWNER_ADMIN';
    case 'MEMBER':
      return 'MEMBER';
    default:
      return 'MEMBER'; // fallback
  }
}

export interface IIAuthUser {
  principal: string;
  name?: string;
  role: AppRole;
}

/**
 * Adapta a identidade do Internet Identity para o contexto de autenticação do app.
 * Em BACKEND mode, o papel vem do perfil do usuário retornado pelo backend.
 */
export function adaptIdentityToUser(
  identity: Identity,
  profile?: FrontendUserProfile | BackendUserProfile | null,
  authContext?: { role: string; orgRole?: string }
): IIAuthUser {
  const principal = identity.getPrincipal().toString();
  
  // Determinar o papel do usuário
  let role: AppRole = 'MEMBER'; // padrão
  
  // Prioridade 1: usar appRole do perfil do backend (BACKEND mode)
  if (profile?.appRole) {
    role = mapBackendRoleToFrontend(profile.appRole as AppUserRole);
  }
  // Prioridade 2: usar authContext se disponível (fallback)
  else if (authContext) {
    if (authContext.role === 'FIRSTY_ADMIN') {
      role = 'FIRSTY_ADMIN';
    } else if (authContext.role === 'FIRSTY_CONSULTANT') {
      role = 'FIRSTY_CONSULTANT';
    } else if (authContext.orgRole === 'OWNER_ADMIN') {
      role = 'OWNER_ADMIN';
    } else if (authContext.orgRole === 'MEMBER') {
      role = 'MEMBER';
    }
  }
  
  const name = profile 
    ? `${profile.firstName} ${profile.lastName}`.trim()
    : undefined;
  
  return {
    principal,
    name,
    role,
  };
}
