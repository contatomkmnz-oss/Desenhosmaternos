import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { getFirestore } from 'firebase-admin/firestore';
import { getAdminApp } from './firebase-admin-app.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const backupDir = path.resolve(__dirname, '../data/backups');

async function main() {
  const db = getFirestore(getAdminApp());
  const [moviesSnap, episodesSnap, bannersSnap, categoriesSnap] = await Promise.all([
    db.collection('movies').get(),
    db.collection('episodes').get(),
    db.collection('banners').get(),
    db.collection('categories').get(),
  ]);

  const snapshot = {
    savedAt: new Date().toISOString(),
    movies: moviesSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() })),
    episodes: episodesSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() })),
    banners: bannersSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() })),
    categories: categoriesSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() })),
  };

  await fs.mkdir(backupDir, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filePath = path.join(backupDir, `firestore-catalog-backup-${stamp}.json`);
  await fs.writeFile(filePath, JSON.stringify(snapshot, null, 2), 'utf8');

  console.log(
    JSON.stringify(
      {
        filePath,
        movies: snapshot.movies.length,
        episodes: snapshot.episodes.length,
        banners: snapshot.banners.length,
        categories: snapshot.categories.length,
      },
      null,
      2
    )
  );
}

await main();
