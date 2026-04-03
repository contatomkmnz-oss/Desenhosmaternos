import { getFirestore } from 'firebase-admin/firestore';
import { getAdminApp } from './firebase-admin-app.mjs';
import {
  isManualUpload,
  writeFirestoreCatalogBackup,
} from './lib/firestoreCoverProtection.mjs';
import { MOVIE_CATALOG } from '@/data/movieCatalog';

const originalById = Object.fromEntries(
  MOVIE_CATALOG.map((entry) => [entry.id, entry.cover_url || ''])
);

async function main() {
  const db = getFirestore(getAdminApp());
  await writeFirestoreCatalogBackup(db, {
    reason: 'backfill-cover-origin-metadata',
    metadataOnly: true,
  });
  const snapshot = await db.collection('movies').get();
  const batch = db.batch();
  let updated = 0;

  snapshot.docs.forEach((docSnap) => {
    const data = docSnap.data();
    const original = originalById[docSnap.id];
    const current = data.cover_url || '';
    if (isManualUpload(data)) return;
    if (!original) return;
    if (current !== original) return;
    if (data.imageSource === 'restored_original' && data.imageRecoverySource === 'git_history') return;

    batch.set(
      docSnap.ref,
      {
        imageSource: 'restored_original',
        imageRecoverySource: 'git_history',
        coverRestoreStatus: 'original_confirmado',
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
    updated += 1;
  });

  if (updated > 0) {
    await batch.commit();
  }

  console.log(JSON.stringify({ updated }, null, 2));
}

await main();
