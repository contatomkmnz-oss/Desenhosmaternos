/**
 * Avatares infantis da seleção de perfil (KIDSPlay).
 * Ficheiros em `public/images/avatars/` (servidos como `/images/avatars/...`).
 */

function publicAssetUrl(relativePath) {
  const base = import.meta.env.BASE_URL || '/';
  const normalized = String(relativePath || '').replace(/^\/+/, '');
  return `${base}${normalized}`.replace(/([^:]\/)\/+/g, '$1');
}

export const PROFILE_AVATAR_FALLBACK = publicAssetUrl('images/avatars/avatar-cocomelon-jj.png');

const legacyProfileAvatarUrls = new Set([
  'https://i.imgur.com/OITnNL8.png',
  'https://i.imgur.com/qK0hPxn.png',
  'https://i.imgur.com/WXKGA98.png',
  'https://i.imgur.com/P8HfSbb.png',
  'https://i.imgur.com/jdzs6TE.png',
  'https://i.imgur.com/OzyK0oB.png',
]);

/** Lista base (infantil) — mesma ordem que o seed do mock */
export const profileAvatars = [
  { id: 'av-1', name: 'CoComelon', image_url: publicAssetUrl('images/avatars/avatar-cocomelon-jj.png') },
  { id: 'av-2', name: 'Molang', image_url: publicAssetUrl('images/avatars/avatar-molang.png') },
  { id: 'av-3', name: 'Pinkfong', image_url: publicAssetUrl('images/avatars/avatar-pinkfong.png') },
  { id: 'av-4', name: 'Pororo', image_url: publicAssetUrl('images/avatars/avatar-pororo.png') },
  { id: 'av-5', name: 'CoComelon (pijama)', image_url: publicAssetUrl('images/avatars/avatar-cocomelon-jj-yellow.png') },
];

/** Seed do mock (mesma lista) */
export const profileAvatarsSeed = profileAvatars.map(({ id, name, image_url }) => ({
  id,
  name,
  image_url,
}));

/** Pré-carrega imagens para reduzir flicker ao abrir o seletor */
export function preloadProfileAvatars() {
  profileAvatars.forEach((a) => {
    const img = new Image();
    img.src = a.image_url;
  });
}

export function normalizeProfileAvatarUrl(url) {
  const value = String(url || '').trim();
  if (!value) return '';
  if (legacyProfileAvatarUrls.has(value)) {
    return profileAvatars[0]?.image_url || PROFILE_AVATAR_FALLBACK;
  }
  return value;
}

/** Junta avatares base com entradas do painel admin (evita duplicar o mesmo URL). */
export function mergeProfileAvatarChoices(adminRows) {
  const base = profileAvatars.map((a) => ({ id: a.id, name: a.name, image_url: a.image_url }));
  const seen = new Set(base.map((a) => a.image_url));
  const extras = [];
  for (const row of adminRows || []) {
    const url = String(row?.image_url || '').trim();
    if (!url || seen.has(url)) continue;
    seen.add(url);
    extras.push({
      id: row.id,
      name: String(row?.name || 'Avatar').trim() || 'Avatar',
      image_url: url,
    });
  }
  return [...base, ...extras];
}
