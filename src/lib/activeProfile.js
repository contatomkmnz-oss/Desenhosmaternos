import { LS_ACTIVE_PROFILE } from '@/config/storageKeys';

/**
 * Lê o perfil ativo do localStorage sem lançar se o JSON estiver corrompido.
 * Remove a chave inválida para o utilizador voltar a escolher perfil.
 */
export function readActiveProfile() {
  try {
    const raw = localStorage.getItem(LS_ACTIVE_PROFILE);
    if (!raw || raw === 'null') return null;
    const p = JSON.parse(raw);
    if (p && typeof p === 'object' && p.id) return p;
    localStorage.removeItem(LS_ACTIVE_PROFILE);
    return null;
  } catch {
    try {
      localStorage.removeItem(LS_ACTIVE_PROFILE);
    } catch {
      /* ignore */
    }
    return null;
  }
}
