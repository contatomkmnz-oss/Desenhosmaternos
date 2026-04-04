/**
 * Ordem das fileiras na home (estilo Netflix). Slugs = parâmetro /Browse?section=
 * Rótulos devem coincidir com `categories[]` dos filmes (comparação case-insensitive).
 */

/** Rótulos oficiais das fileiras (use estes valores em `movieCatalog.js`). */
export const L = {
  mais: '🔥 Mais Assistidos',
  pequenos: '👶 Para os Pequenininhos (0–5 anos)',
  edu: '🧠 Educativos & Inteligentes',
  engracados: '😂 Engraçados & Caóticos',
  herois: '🦸 Heróis & Ação',
  fantasia: '🧙 Fantasia & Magia',
  familia: '👨‍👩‍👧 Família & Valores',
  animais: '🐾 Animais & Aventuras',
  musicais: '🎵 Musicais & Cantigas',
};

export const NETFLIX_HOME_ROW_ORDER = [
  { slug: 'mais_assistidos', label: L.mais },
  { slug: 'para_os_pequenininhos', label: L.pequenos },
  { slug: 'educativos_inteligentes', label: L.edu },
  { slug: 'engracados_e_caoticos', label: L.engracados },
  { slug: 'herois_e_acao', label: L.herois },
  { slug: 'fantasia_e_magia', label: L.fantasia },
  { slug: 'familia_e_valores', label: L.familia },
  { slug: 'animais_e_aventuras', label: L.animais },
  { slug: 'musicais_e_cantigas', label: L.musicais },
];

export const SLUG_TO_LABEL = Object.fromEntries(
  NETFLIX_HOME_ROW_ORDER.map(({ slug, label }) => [slug, label])
);

export const LABEL_TO_SLUG = Object.fromEntries(
  NETFLIX_HOME_ROW_ORDER.map(({ slug, label }) => [label, slug])
);
