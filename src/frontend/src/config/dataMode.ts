/**
 * Configuração do modo de dados da aplicação.
 * BACKEND: conecta ao canister Motoko no Internet Computer (modo padrão)
 */

export type DataMode = 'BACKEND';

/**
 * Obtém o modo de dados atual da aplicação.
 * Sempre retorna 'BACKEND' - modo mock foi removido.
 * 
 * @returns 'BACKEND'
 */
export function getDataMode(): DataMode {
  return 'BACKEND';
}

/**
 * Verifica se o app está em modo MOCK.
 * Sempre retorna false - modo mock foi removido.
 */
export function isMockMode(): boolean {
  return false;
}

/**
 * Verifica se o app está em modo BACKEND.
 * Sempre retorna true - modo backend é o único disponível.
 */
export function isBackendMode(): boolean {
  return true;
}
