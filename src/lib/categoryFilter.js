/**
 * Campo `category` (séries): lista separada por vírgulas.
 * Filmes: preferir `categories` (array) — estilo Netflix.
 */

export function seriesMatchesCategoryLabel(series, label) {
  if (!label?.trim() || !series?.category) return false;
  const q = label.trim().toLowerCase();
  const tokens = series.category
    .split(',')
    .map((c) => c.trim().toLowerCase())
    .filter(Boolean);
  return tokens.includes(q);
}

/**
 * Filmes: `categories[]`. Séries: `categories[]` opcional, senão `category` texto.
 */
export function catalogItemMatchesCategoryLabel(item, label) {
  if (!label?.trim() || !item) return false;
  const q = label.trim().toLowerCase();
  if (Array.isArray(item.categories) && item.categories.length > 0) {
    return item.categories.some((c) => c.trim().toLowerCase() === q);
  }
  if (item.category) {
    return seriesMatchesCategoryLabel(item, label);
  }
  return false;
}
