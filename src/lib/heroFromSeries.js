import { isMovie, getMovieStreamUrl } from '@/constants/contentType';
import { imageUrlWithCacheBust } from '@/lib/imageCacheBust';

/**
 * Converte um item do catálogo (Series) no formato do HeroBanner.
 * Usado quando o hero é preenchido pelo Admin "Banner Principal (Destaques)".
 */
export function seriesToHeroSlide(series, bannerRowId) {
  const playHref =
    isMovie(series) && getMovieStreamUrl(series)
      ? `/Player?seriesId=${series.id}`
      : `/SeriesDetail?id=${series.id}`;
  const rawBanner = series.banner_url || series.cover_url || '';
  return {
    id: String(bannerRowId ?? series.id),
    title: series.title ?? '',
    banner_image: imageUrlWithCacheBust(rawBanner, series),
    /** Para keys estáveis no Hero sem strings enormes (data URLs). */
    _image_version: series.updated_date || series.created_date || '',
    banner_object_position: series.banner_object_position || 'center center',
    description: series.description ?? '',
    year: series.year ?? '',
    rating: series.age_rating ?? '',
    category: series.category ?? '',
    playExternal: false,
    playHref,
    detailHref: `/SeriesDetail?id=${series.id}`,
  };
}
