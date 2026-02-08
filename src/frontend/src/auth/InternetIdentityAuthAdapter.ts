import type { Identity } from '@dfinity/agent';
import type { AppRole } from './roles';

export interface IIAuthUser {
  principal: string;
  name?: string;
  role: AppRole;
}

/**
 * Adapta a identidade do Internet Identity para o contexto de autenticação do app.
 * Em produção, o papel seria obtido do backend via getAuthContext().
 */
export function adaptIdentityToUser(
  identity: Identity,
  profile?: { firstName: string; lastName: string } | null,
  authContext?: { role: string; orgRole?: string }
): IIAuthUser {
  const principal = identity.getPrincipal().toString();
  
  // Determinar o papel do usuário
  let role: AppRole = 'MEMBER'; // padrão
  
  if (authContext) {
    // Usar papel do backend se disponível
    if (authContext.role === 'FIRSTY_ADMIN') {
      role = 'FIRSTY_ADMIN';
    } else if (authContext.orgRole === 'OWNER_ADMIN') {
      role = 'OWNER_ADMIN';
    } else if (authContext.orgRole === 'MEMBER') {
      role = 'MEMBER';
    } else if (authContext.orgRole === 'FIRSTY_CONSULTANT') {
      role = 'FIRSTY_CONSULTANT';
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
