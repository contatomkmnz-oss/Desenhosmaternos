import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  serverTimestamp,
  setDoc,
  updateDoc,
  writeBatch,
} from 'firebase/firestore';
import { db, firestoreEnabled } from '@/lib/firestore';
import { resolveCatalogCoverUrl } from '@/lib/catalogArtwork';

const COLLECTIONS = {
  Series: 'movies',
  FeaturedBanner: 'banners',
  Episode: 'episodes',
  Category: 'categories',
};

function toIso(value) {
  if (!value) return undefined;
  if (typeof value === 'string') return value;
  if (value instanceof Date) return value.toISOString();
  if (typeof value?.toDate === 'function') return value.toDate().toISOString();
  return undefined;
}

function normalizeRow(id, data, collectionName) {
  const createdAt = toIso(data.createdAt) || data.created_date;
  const updatedAt = toIso(data.updatedAt) || data.updated_date;
  const isSeriesCollection = collectionName === COLLECTIONS.Series;
  const coverUrl = isSeriesCollection
    ? resolveCatalogCoverUrl(data.cover_url, data.title)
    : data.cover_url;
  const bannerUrl = isSeriesCollection
    ? data.banner_url || coverUrl
    : data.banner_url;

  return {
    ...data,
    id,
    cover_url: coverUrl,
    banner_url: bannerUrl,
    createdAt,
    updatedAt,
    created_date: createdAt,
    updated_date: updatedAt,
  };
}

function sanitizeData(data) {
  return Object.fromEntries(
    Object.entries(data || {}).filter(([, value]) => value !== undefined)
  );
}

function getFieldValue(row, field) {
  if (field === 'created_date') return row.createdAt || row.created_date;
  if (field === 'updated_date') return row.updatedAt || row.updated_date;
  return row[field];
}

function sortRows(rows, sortField) {
  if (!sortField) return [...rows];
  let field = sortField;
  let desc = false;
  if (field.startsWith('-')) {
    desc = true;
    field = field.slice(1);
  }

  return [...rows].sort((a, b) => {
    const va = getFieldValue(a, field);
    const vb = getFieldValue(b, field);
    if (va === vb) return 0;
    if (va == null) return 1;
    if (vb == null) return -1;
    const cmp = va < vb ? -1 : 1;
    return desc ? -cmp : cmp;
  });
}

function filterRows(rows, query) {
  if (!query || Object.keys(query).length === 0) return [...rows];
  return rows.filter((row) =>
    Object.entries(query).every(([key, value]) => {
      if (value === undefined) return true;
      const rowValue = row[key];
      return rowValue == value || String(rowValue) === String(value);
    })
  );
}

function limitRows(rows, limit) {
  if (typeof limit !== 'number' || limit <= 0) return rows;
  return rows.slice(0, limit);
}

async function loadCollection(collectionName) {
  if (!firestoreEnabled || !db) return [];
  const snapshot = await getDocs(collection(db, collectionName));
  return snapshot.docs.map((item) => normalizeRow(item.id, item.data(), collectionName));
}

async function syncCategoriesFromMovies() {
  if (!firestoreEnabled || !db) return;
  const movies = await loadCollection(COLLECTIONS.Series);
  const names = new Set();

  movies.forEach((movie) => {
    if (Array.isArray(movie.categories)) {
      movie.categories.forEach((category) => {
        const value = String(category || '').trim();
        if (value) names.add(value);
      });
    }
    if (movie.category) {
      String(movie.category)
        .split(',')
        .map((category) => category.trim())
        .filter(Boolean)
        .forEach((category) => names.add(category));
    }
  });

  const existing = await loadCollection(COLLECTIONS.Category);
  const batch = writeBatch(db);

  const existingById = Object.fromEntries(existing.map((category) => [category.id, category]));

  existing.forEach((category) => {
    if (!names.has(category.name)) {
      batch.delete(doc(db, COLLECTIONS.Category, category.id));
    }
  });

  Array.from(names)
    .sort((a, b) => a.localeCompare(b, 'pt-BR'))
    .forEach((name) => {
      const id = name
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      const existingCategory = existingById[id];

      batch.set(
        doc(db, COLLECTIONS.Category, id),
        {
          name,
          slug: id,
          updatedAt: serverTimestamp(),
          createdAt: existingCategory?.createdAt || serverTimestamp(),
        },
        { merge: true }
      );
    });

  await batch.commit();
}

function createEntity(entityName) {
  const collectionName = COLLECTIONS[entityName];

  async function readRows(query = {}, sortField, limit) {
    const rows = await loadCollection(collectionName);
    return limitRows(sortRows(filterRows(rows, query), sortField), limit);
  }

  return {
    list(sortField, limit) {
      return readRows({}, sortField, limit);
    },

    filter(query, sortField, limit) {
      return readRows(query, sortField, limit);
    },

    async create(data) {
      if (!firestoreEnabled || !db) {
        throw new Error('Firestore não está ativo.');
      }

      const ref = data?.id
        ? doc(db, collectionName, data.id)
        : doc(collection(db, collectionName));

      const payload = sanitizeData({
        ...data,
        id: ref.id,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      await setDoc(ref, payload, { merge: false });

      if (entityName === 'Series') {
        await syncCategoriesFromMovies();
      }

      return normalizeRow(ref.id, {
        ...payload,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }, collectionName);
    },

    async update(id, data) {
      if (!firestoreEnabled || !db) {
        throw new Error('Firestore não está ativo.');
      }

      const payload = sanitizeData({
        ...data,
        updatedAt: serverTimestamp(),
      });

      await updateDoc(doc(db, collectionName, id), payload);

      if (entityName === 'Series') {
        await syncCategoriesFromMovies();
      }

      return {
        id,
        ...data,
      };
    },

    async delete(id) {
      if (!firestoreEnabled || !db) {
        throw new Error('Firestore não está ativo.');
      }

      await deleteDoc(doc(db, collectionName, id));

      if (entityName === 'Series') {
        await syncCategoriesFromMovies();
      }
    },

    subscribe(queryOrCallback, sortField, limit, maybeCallback) {
      if (!firestoreEnabled || !db) {
        const callback =
          typeof queryOrCallback === 'function' ? queryOrCallback : maybeCallback;
        callback?.([]);
        return () => {};
      }

      const query =
        typeof queryOrCallback === 'function' ? {} : queryOrCallback || {};
      const callback =
        typeof queryOrCallback === 'function' ? queryOrCallback : maybeCallback;

      return onSnapshot(collection(db, collectionName), (snapshot) => {
        const rows = snapshot.docs.map((item) => normalizeRow(item.id, item.data(), collectionName));
        const finalRows = limitRows(sortRows(filterRows(rows, query), sortField), limit);
        callback?.(finalRows);
      });
    },
  };
}

export const firestoreEntities = {
  Series: createEntity('Series'),
  FeaturedBanner: createEntity('FeaturedBanner'),
  Episode: createEntity('Episode'),
  Category: createEntity('Category'),
};

export const firestoreClient = {
  entities: firestoreEntities,
  syncCategoriesFromMovies,
};
