const DEFAULT_SEED_POSTERS = new Set([
  '/images/banners/poster-movie.svg',
  '/images/banners/poster-comedy.svg',
  '/images/banners/hero-slide-1.svg',
  '/images/banners/hero-slide-2.svg',
]);

function hashString(value) {
  return Array.from(String(value || '')).reduce(
    (acc, char) => ((acc << 5) - acc + char.charCodeAt(0)) | 0,
    0
  );
}

function paletteFromTitle(title) {
  const palettes = [
    ['#0F172A', '#1D4ED8', '#38BDF8'],
    ['#3F0D12', '#A71D31', '#F97316'],
    ['#14532D', '#16A34A', '#84CC16'],
    ['#312E81', '#7C3AED', '#F472B6'],
    ['#3B0764', '#9333EA', '#F59E0B'],
    ['#111827', '#DC2626', '#FACC15'],
  ];
  return palettes[Math.abs(hashString(title)) % palettes.length];
}

function escapeXml(value) {
  return String(value || '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}

function titleToLines(title) {
  const words = String(title || 'KIDSPlay')
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (words.length <= 2) return [words.join(' ')];

  const midpoint = Math.ceil(words.length / 2);
  return [words.slice(0, midpoint).join(' '), words.slice(midpoint).join(' ')];
}

export function buildCatalogPosterDataUrl(title) {
  const [bgStart, bgMid, accent] = paletteFromTitle(title);
  const lines = titleToLines(title).slice(0, 2);
  const fontSize = lines.some((line) => line.length > 16) ? 24 : 28;
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 600" role="img" aria-label="${escapeXml(title)}">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="${bgStart}" />
          <stop offset="55%" stop-color="${bgMid}" />
          <stop offset="100%" stop-color="#09090B" />
        </linearGradient>
        <linearGradient id="glow" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="${accent}" stop-opacity="0.95" />
          <stop offset="100%" stop-color="${accent}" stop-opacity="0" />
        </linearGradient>
      </defs>
      <rect width="400" height="600" rx="28" fill="url(#bg)" />
      <circle cx="320" cy="120" r="140" fill="url(#glow)" />
      <circle cx="90" cy="500" r="120" fill="${accent}" opacity="0.14" />
      <rect x="28" y="28" width="344" height="544" rx="22" fill="none" stroke="rgba(255,255,255,0.10)" />
      <text x="200" y="96" fill="rgba(255,255,255,0.78)" font-family="Segoe UI, system-ui, sans-serif" font-size="18" font-weight="700" text-anchor="middle" letter-spacing="3">KIDSPLAY</text>
      <g transform="translate(200 300)" fill="#FFFFFF" font-family="Segoe UI, system-ui, sans-serif" font-size="${fontSize}" font-weight="800" text-anchor="middle">
        ${lines
          .map(
            (line, index) =>
              `<text y="${index === 0 ? 0 : 42}">${escapeXml(line)}</text>`
          )
          .join('')}
      </g>
      <text x="200" y="542" fill="rgba(255,255,255,0.72)" font-family="Segoe UI, system-ui, sans-serif" font-size="16" font-weight="600" text-anchor="middle">Catalogo infantil</text>
    </svg>
  `.trim();

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

export function isLikelyBrokenCatalogCoverUrl(url) {
  if (!url) return true;
  if (DEFAULT_SEED_POSTERS.has(url)) return true;
  if (/^https?:\/\/(www\.)?ibb\.co\//i.test(url)) return true;
  if (/^https?:\/\/i\.ibb\.co\/[^/]+\/(?:image|images-\d+)\.(?:jpe?g|png|webp)$/i.test(url)) {
    return true;
  }
  return false;
}

export function resolveCatalogCoverUrl(url, title) {
  if (isLikelyBrokenCatalogCoverUrl(url)) {
    return buildCatalogPosterDataUrl(title);
  }
  return url;
}
