import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { getFirestore } from 'firebase-admin/firestore';
import { getAdminApp } from './firebase-admin-app.mjs';
import {
  buildProtectedCoverUpdate,
  writeFirestoreCatalogBackup,
} from './lib/firestoreCoverProtection.mjs';
import { MOVIE_CATALOG } from '@/data/movieCatalog';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const backupDir = path.resolve(__dirname, '../data/backups');
const originalById = Object.fromEntries(
  MOVIE_CATALOG.map((entry) => [entry.id, entry.cover_url || ''])
);

function isAutoExternalUrl(url) {
  return /^https?:\/\/upload\.wikimedia\.org\//i.test(String(url || ''));
}

async function saveReport(report) {
  await fs.mkdir(backupDir, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filePath = path.join(backupDir, `cover-clear-report-${stamp}.json`);
  await fs.writeFile(filePath, JSON.stringify(report, null, 2), 'utf8');
  return filePath;
}

async function main() {
  const db = getFirestore(getAdminApp());
  const backupFile = await writeFirestoreCatalogBackup(db, {
    reason: 'clear-auto-external-covers',
    overwriteOnlyIfEmpty: false,
    allowOverwriteExisting: true,
  });
  const snapshot = await db.collection('movies').get();
  const batch = db.batch();
  const cleared = [];

  snapshot.docs.forEach((docSnap) => {
    const data = docSnap.data();
    const original = originalById[docSnap.id];
    const current = data.cover_url || '';

    if (original) return;
    if (!isAutoExternalUrl(current)) return;
    const coverUpdate = buildProtectedCoverUpdate(data, {
      nextCoverUrl: '',
      nextImageSource: 'external_auto',
      overwriteOnlyIfEmpty: false,
      allowOverwriteExisting: true,
      allowClear: true,
      extraFields: {
        coverRestoreStatus: 'original_not_recovered',
      },
    });
    if (coverUpdate.skip) return;

    batch.set(
      docSnap.ref,
      {
        ...coverUpdate.payload,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );

    cleared.push({
      id: docSnap.id,
      title: data.title || '',
      cover_url_atual: current,
      cover_url_original_recuperado: '',
      status: 'original_nao_recuperado',
      recoverySource: '',
    });
  });

  if (cleared.length > 0) {
    await batch.commit();
  }

  const reportPath = await saveReport({
    generatedAt: new Date().toISOString(),
    backupFile,
    cleared,
  });

  console.log(
    JSON.stringify(
      {
        reportPath,
        cleared: cleared.length,
      },
      null,
      2
    )
  );
}

await main();
