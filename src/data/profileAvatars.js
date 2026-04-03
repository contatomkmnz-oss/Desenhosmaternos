/**
 * Avatares da seleção de perfil (KIDSPlay).
 * Imagens: URLs diretas Imgur (mesmas que já funcionavam no projeto).
 * Nomes: rótulos de tema terror na UI.
 */

export const PROFILE_AVATAR_FALLBACK =
  'data:image/svg+xml,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256"><rect fill="#2a2a2a" width="256" height="256" rx="12"/><text x="128" y="140" text-anchor="middle" fill="#737373" font-family="system-ui,sans-serif" font-size="72">?</text></svg>'
  );

/** Lista oficial (6 itens) — imagens Imgur + nomes de terror */
export const profileAvatars = [
  { id: 'av-1', name: 'Palhaço', image_url: 'https://i.imgur.com/OITnNL8.png' },
  { id: 'av-2', name: 'Máscara', image_url: 'https://i.imgur.com/qK0hPxn.png' },
  { id: 'av-3', name: 'Fantasma', image_url: 'https://i.imgur.com/WXKGA98.png' },
  { id: 'av-4', name: 'Caveira', image_url: 'https://i.imgur.com/P8HfSbb.png' },
  { id: 'av-5', name: 'Lobo', image_url: 'https://i.imgur.com/jdzs6TE.png' },
  { id: 'av-6', name: 'Olhos', image_url: 'https://i.imgur.com/OzyK0oB.png' },
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
