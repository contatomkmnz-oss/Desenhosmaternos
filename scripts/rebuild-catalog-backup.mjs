import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildMockSeed } from '@/data/mockSeed';
import {
  mockTableKey,
  LS_SERIES_SEED_TOMBSTONES,
  LS_ACTIVE_PROFILE,
  LS_SUBSCRIPTION_DEMO,
} from '@/config/storageKeys';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outputPath = path.resolve(__dirname, '../data/catalog-backup.json');

function buildSnapshotFromSeed() {
  const seed = buildMockSeed();
  const keys = {};

  Object.entries(seed).forEach(([tableName, rows]) => {
    keys[mockTableKey(tableName)] = JSON.stringify(rows);
  });

  keys[LS_SERIES_SEED_TOMBSTONES] = JSON.stringify([]);
  keys[LS_ACTIVE_PROFILE] = '';
  keys[LS_SUBSCRIPTION_DEMO] = '';

  return {
    schemaVersion: 2,
    savedAt: new Date().toISOString(),
    keys,
  };
}

const snapshot = buildSnapshotFromSeed();
await fs.writeFile(outputPath, JSON.stringify(snapshot), 'utf8');

console.log(`Backup do catálogo recriado em: ${outputPath}`);
