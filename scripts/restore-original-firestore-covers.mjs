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

async function saveReport(report) {
  await fs.mkdir(backupDir, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filePath = path.join(backupDir, `cover-restore-report-${stamp}.json`);
  await fs.writeFile(filePath, JSON.stringify(report, null, 2), 'utf8');
  return filePath;
}

async function main() {
  const db = getFirestore(getAdminApp());
  const backupFile = await writeFirestoreCatalogBackup(db, {
    reason: 'restore-original-covers',
    overwriteOnlyIfEmpty: false,
    allowOverwriteExisting: true,
  });
  const snapshot = await db.collection('movies').get();
  const batch = db.batch();
  const restored = [];
  const notRecovered = [];

  snapshot.docs.forEach((docSnap) => {
    const data = docSnap.data();
    const originalCoverUrl = originalById[docSnap.id];
    const currentCoverUrl = data.cover_url || '';

    if (!originalCoverUrl) {
      if (currentCoverUrl) {
        notRecovered.push({
          id: docSnap.id,
          title: data.title || '',
          cover_url_atual: currentCoverUrl,
          cover_url_original_recuperado: '',
          status: 'original_nao_recuperado',
          recoverySource: '',
        });
      }
      return;
    }

    if (currentCoverUrl === originalCoverUrl) return;

    const coverUpdate = buildProtectedCoverUpdate(data, {
      nextCoverUrl: originalCoverUrl,
      nextImageSource: 'restored_original',
      overwriteOnlyIfEmpty: false,
      allowOverwriteExisting: true,
      extraFields: {
        imageRecoverySource: 'git_history',
        coverRestoreStatus: 'restaurado_original',
      },
    });

    if (coverUpdate.skip) {
      notRecovered.push({
        id: docSnap.id,
        title: data.title || '',
        cover_url_atual: currentCoverUrl,
        cover_url_original_recuperado: originalCoverUrl,
        status: 'original_preservado_sem_sobrescrita',
        recoverySource: coverUpdate.reason,
      });
      return;
    }

    batch.set(
      docSnap.ref,
      {
        ...coverUpdate.payload,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );

    restored.push({
      id: docSnap.id,
      title: data.title || '',
      cover_url_atual: currentCoverUrl,
      cover_url_original_recuperado: originalCoverUrl,
      status: 'restaurado',
      recoverySource: 'git_history',
    });
  });

  if (restored.length > 0) {
    await batch.commit();
  }

  const report = {
    generatedAt: new Date().toISOString(),
    backupFile,
    restored,
    notRecovered,
  };

  const reportPath = await saveReport(report);
  console.log(
    JSON.stringify(
      {
        reportPath,
        restored: restored.length,
        notRecovered: notRecovered.length,
      },
      null,
      2
    )
  );
}

await main();
