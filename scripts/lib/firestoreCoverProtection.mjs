import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const backupDir = path.resolve(__dirname, '../../data/backups');

function normalizeUrl(value) {
  return String(value || '').trim();
}

export function isManualUpload(row) {
  return normalizeUrl(row?.imageSource) === 'manual_upload';
}

export async function writeFirestoreCatalogBackup(db, metadata = {}) {
  const [moviesSnap, episodesSnap, bannersSnap, categoriesSnap] = await Promise.all([
    db.collection('movies').get(),
    db.collection('episodes').get(),
    db.collection('banners').get(),
    db.collection('categories').get(),
  ]);

  const snapshot = {
    savedAt: new Date().toISOString(),
    ...metadata,
    movies: moviesSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() })),
    episodes: episodesSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() })),
    banners: bannersSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() })),
    categories: categoriesSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() })),
  };

  await fs.mkdir(backupDir, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const safeReason = String(metadata.reason || 'batch')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
  const filePath = path.join(backupDir, `firestore-${safeReason || 'batch'}-${stamp}.json`);
  await fs.writeFile(filePath, JSON.stringify(snapshot, null, 2), 'utf8');
  return filePath;
}

export function buildProtectedCoverUpdate(existingRow, options = {}) {
  const existing = existingRow || {};
  const currentCoverUrl = normalizeUrl(existing.cover_url);
  const nextCoverUrl = normalizeUrl(options.nextCoverUrl);
  const currentImageSource = normalizeUrl(existing.imageSource);
  const nextImageSource = options.nextImageSource;
  const overwriteOnlyIfEmpty = options.overwriteOnlyIfEmpty !== false;
  const allowOverwriteExisting = options.allowOverwriteExisting === true;
  const allowClear = options.allowClear === true;

  if (currentImageSource === 'manual_upload') {
    return {
      skip: true,
      reason: 'manual_upload_preserved',
      payload: {},
    };
  }

  if (!allowOverwriteExisting && overwriteOnlyIfEmpty && currentCoverUrl) {
    return {
      skip: true,
      reason: 'existing_cover_preserved',
      payload: {},
    };
  }

  if (!allowClear && !nextCoverUrl) {
    return {
      skip: true,
      reason: 'empty_target_ignored',
      payload: {},
    };
  }

  const payload = {};
  const coverChanged = currentCoverUrl !== nextCoverUrl;

  if (coverChanged) {
    payload.previous_cover_url = currentCoverUrl || normalizeUrl(existing.previous_cover_url);
    payload.cover_url = nextCoverUrl;
  }

  if (nextImageSource !== undefined && nextImageSource !== existing.imageSource) {
    payload.imageSource = nextImageSource;
  }

  if (options.extraFields) {
    Object.assign(payload, options.extraFields);
  }

  if (Object.keys(payload).length === 0) {
    return {
      skip: true,
      reason: 'no_cover_change',
      payload: {},
    };
  }

  return {
    skip: false,
    reason: coverChanged ? 'cover_updated' : 'metadata_updated',
    payload,
  };
}
