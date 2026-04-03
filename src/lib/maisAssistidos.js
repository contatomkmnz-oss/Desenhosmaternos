/** Compara seção especial com tolerância a espaços / variações de tipo. */
export function normalizeHighlightSection(value) {
  if (value == null) return '';
  return String(value).trim();
}
