import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { getFirestore } from 'firebase-admin/firestore';
import { getAdminApp } from './firebase-admin-app.mjs';
import {
  buildProtectedCoverUpdate,
  writeFirestoreCatalogBackup,
} from './lib/firestoreCoverProtection.mjs';
import { buildMockSeed } from '@/data/mockSeed';
import { mockTableKey } from '@/config/storageKeys';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const defaultBackupPath = path.resolve(__dirname, '../data/catalog-backup.json');
const inputPath = path.resolve(process.cwd(), process.argv[2] || defaultBackupPath);
const preserveExisting = true;
const overwriteOnlyIfEmpty = true;

function parseStoredJson(snapshot, key) {
  const raw = snapshot?.keys?.[key];
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function collectCategories(movies) {
  const categories = new Set();

  movies.forEach((movie) => {
    if (Array.isArray(movie.categories)) {
      movie.categories
        .map((item) => String(item || '').trim())
        .filter(Boolean)
        .forEach((item) => categories.add(item));
    }

    if (movie.category) {
      String(movie.category)
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean)
        .forEach((item) => categories.add(item));
    }
  });

  return Array.from(categories)
    .sort((a, b) => a.localeCompare(b, 'pt-BR'))
    .map((name) => ({
      id: name
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, ''),
      name,
    }));
}

async function main() {
  let movies = [];
  let episodes = [];
  let banners = [];

  try {
    const raw = await fs.readFile(inputPath, 'utf8');
    const snapshot = JSON.parse(raw);
    movies = parseStoredJson(snapshot, mockTableKey('Series'));
    episodes = parseStoredJson(snapshot, mockTableKey('Episode'));
    banners = parseStoredJson(snapshot, mockTableKey('FeaturedBanner'));
  } catch {
    /* fallback below */
  }

  if (movies.length === 0 && episodes.length === 0 && banners.length === 0) {
    const seed = buildMockSeed();
    movies = seed.Series || [];
    episodes = seed.Episode || [];
    banners = seed.FeaturedBanner || [];
  }

  const categories = collectCategories(movies);

  const app = getAdminApp();
  const db = getFirestore(app);
  const batch = db.batch();
  const backupFile = await writeFirestoreCatalogBackup(db, {
    reason: 'seed-firestore',
    preserveExisting,
    overwriteOnlyIfEmpty,
    inputPath,
  });
  const existingMoviesSnap = await db.collection('movies').get();
  const existingMoviesById = Object.fromEntries(
    existingMoviesSnap.docs.map((doc) => [doc.id, doc.data()])
  );

  movies.forEach((movie) => {
    const ref = db.collection('movies').doc(movie.id);
    const existing = existingMoviesById[movie.id] || {};
    const nextBannerUrl =
      preserveExisting && overwriteOnlyIfEmpty && String(existing.banner_url || '').trim()
        ? existing.banner_url
        : movie.banner_url || existing.banner_url || '';
    const coverUpdate = buildProtectedCoverUpdate(existing, {
      nextCoverUrl: movie.cover_url || '',
      nextImageSource: movie.cover_url ? 'restored_original' : (existing.imageSource || 'missing'),
      overwriteOnlyIfEmpty,
      allowOverwriteExisting: false,
    });
    const nextCoverUrl = coverUpdate.skip
      ? existing.cover_url || ''
      : (coverUpdate.payload.cover_url ?? existing.cover_url ?? '');
    const nextImageSource = coverUpdate.skip
      ? existing.imageSource || ''
      : (coverUpdate.payload.imageSource ?? existing.imageSource ?? '');

    batch.set(ref, {
      ...movie,
      cover_url: nextCoverUrl,
      banner_url: nextBannerUrl,
      imageSource: nextImageSource,
      previous_cover_url:
        coverUpdate.payload.previous_cover_url ??
        existing.previous_cover_url ??
        '',
      createdAt: movie.created_date || null,
      updatedAt: movie.updated_date || null,
    }, { merge: true });
  });

  episodes.forEach((episode) => {
    const ref = db.collection('episodes').doc(episode.id);
    batch.set(ref, {
      ...episode,
      createdAt: episode.created_date || null,
      updatedAt: episode.updated_date || null,
    }, { merge: true });
  });

  banners.forEach((banner) => {
    const ref = db.collection('banners').doc(banner.id);
    batch.set(ref, {
      ...banner,
      createdAt: banner.created_date || null,
      updatedAt: banner.updated_date || null,
    }, { merge: true });
  });

  categories.forEach((category) => {
    const ref = db.collection('categories').doc(category.id);
    batch.set(ref, {
      ...category,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }, { merge: true });
  });

  await batch.commit();

  console.log(`Seed concluído com sucesso.
Arquivo: ${inputPath}
Backup: ${backupFile}
movies: ${movies.length}
episodes: ${episodes.length}
banners: ${banners.length}
categories: ${categories.length}`);
}

await main();
