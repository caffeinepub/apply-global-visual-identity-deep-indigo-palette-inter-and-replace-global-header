/**
 * Configuração do modo de dados da aplicação.
 * MOCK: usa dados locais em memória (padrão)
 * BACKEND: conecta ao canister Motoko no Internet Computer
 */

export type DataMode = 'MOCK' | 'BACKEND';

// Modo padrão é MOCK para desenvolvimento sem backend
const DEFAULT_MODE: DataMode = 'MOCK';

/**
 * Obtém o modo de dados atual da aplicação.
 * Pode ser configurado via variável de ambiente VITE_DATA_MODE.
 * 
 * @returns 'MOCK' ou 'BACKEND'
 */
export function getDataMode(): DataMode {
  const envMode = import.meta.env.VITE_DATA_MODE?.toUpperCase();
  
  if (envMode === 'BACKEND') {
    return 'BACKEND';
  }
  
  return DEFAULT_MODE;
}

/**
 * Verifica se o app está em modo MOCK.
 */
export function isMockMode(): boolean {
  return getDataMode() === 'MOCK';
}

/**
 * Verifica se o app está em modo BACKEND.
 */
export function isBackendMode(): boolean {
  return getDataMode() === 'BACKEND';
}
