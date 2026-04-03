/**
 * Chaves centralizadas do armazenamento local (localStorage).
 * Usar sempre estes identificadores para evitar divergências entre módulos.
 */

/** Prefixo das tabelas mock (Series, Episode, …) */
export const LS_MOCK_PREFIX = 'kidsplay_mock_';

export const LS_SUBSCRIPTION_DEMO = 'kidsplay_demo_subscription';

/** IDs do seed removidos pelo admin (não reinserir nas migrações) */
export const LS_SERIES_SEED_TOMBSTONES = 'kidsplay_series_seed_tombstones';

/** Perfil ativo na UI (JSON) */
export const LS_ACTIVE_PROFILE = 'desenhos_active_profile';

/** Metadado: último autosave do catálogo (ISO string) */
export const LS_LAST_CATALOG_SAVE = 'kidsplay_last_catalog_save';

/** Flag de sessão: utilizador "autenticado" no modo demo */
export const LS_LOGGED_IN = 'kidsplay_logged_in';

/** Nomes das tabelas persistidas pelo mock (localMockClient) */
export const MOCK_TABLE_NAMES = [
  'Series',
  'Episode',
  'FeaturedBanner',
  'MyList',
  'WatchHistory',
  'Profile',
  'Avatar',
  'SearchTerm',
  'AccessCode',
  'ContentProposal',
  'User',
  'Subscription',
  'Notification',
];

export function mockTableKey(tableName) {
  return LS_MOCK_PREFIX + tableName;
}

/** Todas as chaves incluídas em backup/export/import e hidratação em disco (dev). */
export function getAllCatalogStorageKeys() {
  return [
    ...MOCK_TABLE_NAMES.map(mockTableKey),
    LS_SERIES_SEED_TOMBSTONES,
    LS_ACTIVE_PROFILE,
    LS_SUBSCRIPTION_DEMO,
  ];
}
