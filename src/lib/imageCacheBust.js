/**
 * Anexa um parâmetro de versão à URL para evitar cache HTTP do browser quando
 * a capa/banner é alterada no admin mas o caminho do ficheiro continua igual
 * (ex.: /images/banners/poster.svg). Data URLs e blob: não são alteradas.
 */
export function imageUrlWithCacheBust(url, entity) {
  if (!url || typeof url !== 'string') return url;
  if (url.startsWith('data:') || url.startsWith('blob:')) return url;
  const v = entity?.updated_date || entity?.created_date;
  if (!v) return url;
  // Não anexar query a URLs http(s) — quebra links assinados (S3, CloudFront, ImgBB direto, etc.).
  if (/^https?:\/\//i.test(url)) return url;
  const sep = url.includes('?') ? '&' : '?';
  return `${url}${sep}_imgv=${encodeURIComponent(v)}`;
}
