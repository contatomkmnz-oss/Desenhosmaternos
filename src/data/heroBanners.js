/**
 * ÚNICA fonte do hero (banner principal) na home.
 * Imagens em `public/images/banners/` — edita aqui os slides.
 */

export const heroBanners = [
  {
    id: 'hero-1',
    title: 'Destaque KIDSPlay',
    bannerImage: '/images/banners/hero-slide-1.svg',
    bannerObjectPosition: 'center center',
    description: 'Substitui por textos e imagens reais — ficheiros em public/images/banners/',
    year: '2026',
    rating: '16+',
    category: 'Terror',
    movieUrl: '/Player?seriesId=movie-o-exorcista-1974',
    detailUrl: '/SeriesDetail?id=movie-o-exorcista-1974',
  },
  {
    id: 'hero-2',
    title: 'Mais um destaque',
    bannerImage: '/images/banners/hero-slide-2.svg',
    bannerObjectPosition: 'center center',
    description: 'Lista vazia = sem hero; adiciona ou remove objetos neste array.',
    year: '2026',
    rating: '16+',
    category: 'Suspense',
    movieUrl: '/Player?seriesId=movie-halloween-1978',
    detailUrl: '/SeriesDetail?id=movie-halloween-1978',
  },
];

/**
 * Converte um item do config para o formato interno do componente Hero.
 */
export function normalizeHeroSlide(raw) {
  const banner_image = raw.bannerImage ?? raw.banner_image ?? '';
  const movieUrl = (raw.movieUrl ?? raw.movie_url ?? '').trim();
  const detailUrl = (raw.detailUrl ?? raw.detail_url ?? '').trim();
  const play = resolvePlayTarget(movieUrl);

  return {
    id: String(raw.id),
    title: raw.title ?? '',
    banner_image,
    banner_object_position: raw.bannerObjectPosition ?? raw.banner_object_position ?? 'center center',
    description: raw.description ?? '',
    year: raw.year ?? '',
    rating: raw.rating ?? '',
    category: raw.category ?? '',
    playExternal: play.external,
    playHref: play.href,
    detailHref: detailUrl || null,
  };
}

function resolvePlayTarget(movieUrl) {
  if (!movieUrl) {
    return { external: false, href: '/Home' };
  }
  if (/^https?:\/\//i.test(movieUrl)) {
    return { external: true, href: movieUrl };
  }
  return { external: false, href: movieUrl };
}
