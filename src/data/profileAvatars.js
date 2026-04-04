/**
 * Avatares infantis da seleção de perfil (KIDSPlay).
 */

function buildProfileAvatarDataUrl({ emoji, bgFrom, bgTo, accent, label }) {
  return (
    'data:image/svg+xml,' +
    encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256">
        <defs>
          <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="${bgFrom}"/>
            <stop offset="100%" stop-color="${bgTo}"/>
          </linearGradient>
        </defs>
        <rect width="256" height="256" rx="40" fill="url(#bg)"/>
        <circle cx="210" cy="52" r="24" fill="${accent}" fill-opacity="0.9"/>
        <circle cx="48" cy="210" r="30" fill="#ffffff" fill-opacity="0.18"/>
        <text x="128" y="138" text-anchor="middle" font-size="92">${emoji}</text>
        <text x="128" y="210" text-anchor="middle" fill="#ffffff" fill-opacity="0.92" font-family="Segoe UI, Arial, sans-serif" font-size="20" font-weight="700">${label}</text>
      </svg>`
    )
  );
}

export const PROFILE_AVATAR_FALLBACK =
  buildProfileAvatarDataUrl({
    emoji: '⭐',
    bgFrom: '#ff8a65',
    bgTo: '#ffca28',
    accent: '#7e57c2',
    label: 'Kids',
  });

const legacyProfileAvatarUrls = new Set([
  'https://i.imgur.com/OITnNL8.png',
  'https://i.imgur.com/qK0hPxn.png',
  'https://i.imgur.com/WXKGA98.png',
  'https://i.imgur.com/P8HfSbb.png',
  'https://i.imgur.com/jdzs6TE.png',
  'https://i.imgur.com/OzyK0oB.png',
]);

/** Lista oficial (6 itens) — apenas avatares infantis */
export const profileAvatars = [
  {
    id: 'av-1',
    name: 'Leaozinho',
    image_url: buildProfileAvatarDataUrl({
      emoji: '🦁',
      bgFrom: '#ffb74d',
      bgTo: '#ff7043',
      accent: '#ffee58',
      label: 'Leaozinho',
    }),
  },
  {
    id: 'av-2',
    name: 'Coelhinho',
    image_url: buildProfileAvatarDataUrl({
      emoji: '🐰',
      bgFrom: '#f48fb1',
      bgTo: '#ce93d8',
      accent: '#80deea',
      label: 'Coelhinho',
    }),
  },
  {
    id: 'av-3',
    name: 'Panda',
    image_url: buildProfileAvatarDataUrl({
      emoji: '🐼',
      bgFrom: '#90caf9',
      bgTo: '#5c6bc0',
      accent: '#fff176',
      label: 'Panda',
    }),
  },
  {
    id: 'av-4',
    name: 'Unicornio',
    image_url: buildProfileAvatarDataUrl({
      emoji: '🦄',
      bgFrom: '#b39ddb',
      bgTo: '#7e57c2',
      accent: '#ffd54f',
      label: 'Unicornio',
    }),
  },
  {
    id: 'av-5',
    name: 'Dinossauro',
    image_url: buildProfileAvatarDataUrl({
      emoji: '🦖',
      bgFrom: '#81c784',
      bgTo: '#26a69a',
      accent: '#fff59d',
      label: 'Dinossauro',
    }),
  },
  {
    id: 'av-6',
    name: 'Estrelinha',
    image_url: buildProfileAvatarDataUrl({
      emoji: '🌟',
      bgFrom: '#4dd0e1',
      bgTo: '#29b6f6',
      accent: '#ffca28',
      label: 'Estrelinha',
    }),
  },
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
