/**
 * Helpers para URLs Bunny.net no front (sem segredos — só deteção).
 * Guia: docs/bunny-net.md
 */

export function isLikelyBunnyUrl(url) {
  if (!url) return false;
  const u = url.toLowerCase();
  return (
    u.includes('mediadelivery.net') ||
    u.includes('b-cdn.net') ||
    u.includes('bunnycdn.com')
  );
}
