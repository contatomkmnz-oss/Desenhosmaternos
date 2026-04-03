/**
 * Valida URLs de imagem que nem são diretas nem pertencem a hosts que sabemos converter.
 */
export function getIndirectImageHostMessage(url) {
  if (!url || typeof url !== 'string') return null;
  const u = url.trim();
  if (u.startsWith('data:') || u.startsWith('/') || u.startsWith('blob:')) return null;
  if (!/^https?:\/\//i.test(u)) return null;

  if (
    /^https?:\/\/(www\.)?ibb\.co\//i.test(u) ||
    /^https?:\/\/(www\.)?postimg\.cc\//i.test(u) ||
    /^https?:\/\/(www\.)?imgur\.com\//i.test(u)
  ) {
    return null;
  }

  if (/imgur\.com\/(gallery|a)\//i.test(u)) {
    return 'Use o link direto da imagem (i.imgur.com/….png), não a página da galeria Imgur.';
  }

  if (
    !/\.(png|jpe?g|webp|gif|svg)(\?.*)?$/i.test(u) &&
    !/^https?:\/\/i\.ibb\.co\//i.test(u) &&
    !/^https?:\/\/i\.postimg\.cc\//i.test(u)
  ) {
    return 'Use um link direto de imagem (.jpg/.png/.webp) ou um endereço suportado de página do ImgBB, Postimages ou Imgur.';
  }

  return null;
}
