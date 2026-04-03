import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { getFirestore } from 'firebase-admin/firestore';
import { getAdminApp } from './firebase-admin-app.mjs';
import { MOVIE_CATALOG } from '@/data/movieCatalog';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outputDir = path.resolve(__dirname, '../data/backups');
const originalById = Object.fromEntries(
  MOVIE_CATALOG.map((entry) => [entry.id, entry.cover_url || ''])
);

function normalizeUrl(value) {
  return String(value || '').trim();
}

function normalizeImageSource(source, coverUrl, isOriginalMatch) {
  const value = String(source || '').trim();
  if (value === 'imported_backup') return 'restored_original';
  if (value === 'auto_external') return 'external_auto';
  if (value) return value;
  if (!coverUrl) return 'missing';
  if (isOriginalMatch) return 'restored_original';
  return 'unknown';
}

function isCorruptedUrl(url) {
  const value = normalizeUrl(url);
  if (!value) return false;
  if (/^data:/i.test(value)) return true;
  if (/^\/images\/banners\//i.test(value)) return true;
  if (/^https?:\/\/(www\.)?ibb\.co\//i.test(value)) return true;
  return false;
}

function classifyRow(row) {
  const coverUrl = normalizeUrl(row.cover_url);
  const originalUrl = normalizeUrl(originalById[row.id]);
  const isOriginalMatch = Boolean(originalUrl) && coverUrl === originalUrl;
  const imageSource = normalizeImageSource(row.imageSource, coverUrl, isOriginalMatch);
  const corrupted = isCorruptedUrl(coverUrl);

  let status = 'preenchido_com_imagem_externa';
  let statusTecnico = 'external_not_confirmed';

  if (corrupted) {
    status = 'com_imagem_corrompida';
    statusTecnico = 'corrupted';
  } else if (!coverUrl) {
    status = 'sem_imagem';
    statusTecnico = 'missing';
  } else if (imageSource === 'manual_upload') {
    status = 'com_imagem_manual_upload';
    statusTecnico = 'manual_upload';
  } else if (isOriginalMatch) {
    status = 'restaurado_com_imagem_original';
    statusTecnico = row.coverRestoreStatus === 'restaurado_original'
      ? 'restored_original'
      : 'original_confirmado_ja_existente';
  }

  return {
    id: row.id,
    title: row.title || '',
    cover_url: coverUrl,
    imageSource,
    status,
    statusTecnico,
    originalCoverUrl: originalUrl,
  };
}

function buildMarkdown(report) {
  const lines = [
    '# Relatorio de capas',
    '',
    `Gerado em: ${report.generatedAt}`,
    '',
    '## Resumo',
    '',
    `- Total: ${report.all.length}`,
    `- Restaurado com imagem original: ${report.restoredOriginal.length}`,
    `- Original confirmado ja existente: ${report.originalConfirmedExisting.length}`,
    `- Com imagem externa: ${report.external.length}`,
    `- Sem imagem: ${report.missing.length}`,
    `- Com imagem manual/upload: ${report.manual.length}`,
    `- Com imagem corrompida: ${report.corrupted.length}`,
    '',
    '## Titulos faltantes',
    '',
    ...report.pendingManual.map((item) => `- ${item.title} [${item.status}]`),
  ];
  return lines.join('\n');
}

async function saveReportFiles(report) {
  await fs.mkdir(outputDir, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const jsonPath = path.join(outputDir, `cover-audit-report-${stamp}.json`);
  const missingPath = path.join(outputDir, `cover-audit-missing-${stamp}.json`);
  const mdPath = path.join(outputDir, `cover-audit-report-${stamp}.md`);

  await fs.writeFile(jsonPath, JSON.stringify(report, null, 2), 'utf8');
  await fs.writeFile(missingPath, JSON.stringify(report.pendingManual, null, 2), 'utf8');
  await fs.writeFile(mdPath, buildMarkdown(report), 'utf8');

  return { jsonPath, missingPath, mdPath };
}

async function main() {
  const db = getFirestore(getAdminApp());
  const snapshot = await db.collection('movies').get();
  const all = snapshot.docs
    .map((docSnap) => classifyRow({ id: docSnap.id, ...docSnap.data() }))
    .sort((a, b) => a.title.localeCompare(b.title, 'pt-BR'));

  const restoredOriginal = all.filter((item) => item.statusTecnico === 'restored_original');
  const originalConfirmedExisting = all.filter(
    (item) => item.statusTecnico === 'original_confirmado_ja_existente'
  );
  const external = all.filter((item) => item.status === 'preenchido_com_imagem_externa');
  const missing = all.filter((item) => item.status === 'sem_imagem');
  const manual = all.filter((item) => item.status === 'com_imagem_manual_upload');
  const corrupted = all.filter((item) => item.status === 'com_imagem_corrompida');
  const pendingManual = all.filter((item) =>
    ['preenchido_com_imagem_externa', 'sem_imagem', 'com_imagem_corrompida'].includes(item.status)
  );

  const report = {
    generatedAt: new Date().toISOString(),
    totals: {
      all: all.length,
      restoredOriginal: restoredOriginal.length,
      originalConfirmedExisting: originalConfirmedExisting.length,
      external: external.length,
      missing: missing.length,
      manual: manual.length,
      corrupted: corrupted.length,
      pendingManual: pendingManual.length,
    },
    all,
    pendingManual,
    restoredOriginal,
    originalConfirmedExisting,
    external,
    missing,
    manual,
    corrupted,
  };

  const paths = await saveReportFiles(report);
  console.log(JSON.stringify({ ...paths, totals: report.totals }, null, 2));
}

await main();
