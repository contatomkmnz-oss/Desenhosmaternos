/**
 * Resolve como reproduzir uma URL de vídeo no player.
 * Bunny.net: ver docs/bunny-net.md
 *
 * @returns {{ type: 'bunny-player'|'bunny-stream'|'drive', url: string } | null}
 */
export function getVideoEmbedUrl(url) {
  if (!url) return null;

  let u = url;
  const iframeSrcMatch = u.match(/\ssrc=["']([^"']+)["']/i);
  if (iframeSrcMatch) u = iframeSrcMatch[1];

  let decoded;
  try {
    decoded = decodeURIComponent(u);
  } catch {
    decoded = u;
  }

  const lower = decoded.toLowerCase();

  // Bunny Stream — player embutido (iframe)
  if (
    lower.includes('mediadelivery.net') ||
    lower.includes('player.mediadelivery.net') ||
    lower.includes('iframe.mediadelivery.net')
  ) {
    return { type: 'bunny-player', url: decoded };
  }

  // Bunny CDN / Stream — MP4, WebM ou HLS (compatibilidade varia; ver docs)
  if (lower.includes('b-cdn.net') || lower.includes('bunnycdn.com')) {
    return { type: 'bunny-stream', url: decoded };
  }

  if (/\.(mp4|webm)(\?|$)/i.test(decoded)) {
    return { type: 'bunny-stream', url: decoded };
  }

  const match = decoded.match(/\/d\/([a-zA-Z0-9_-]+)/);
  if (match) {
    return { type: 'drive', url: `https://drive.google.com/file/d/${match[1]}/preview` };
  }

  if (decoded.includes('drive.google.com')) return { type: 'drive', url: decoded };

  return null;
}
