/** Tipo de catálogo (mesma entidade `Series`, vídeos em `Episode` como nas séries) */
import { buildVideoSource } from '@/lib/videoSource';

export const CONTENT_TYPE_SERIES = 'series';
export const CONTENT_TYPE_MOVIE = 'movie';

export function isMovie(s) {
  return s?.content_type === 'movie';
}

/** Série de TV (padrão quando ausente — compatível com dados antigos) */
export function isSeriesContent(s) {
  return !s?.content_type || s.content_type === CONTENT_TYPE_SERIES;
}

/**
 * URL de streaming do filme (campo próprio `movie_url` na entidade Series).
 * Não confundir com `Episode.video_url` (séries / fluxo legado de “vídeos” no filme).
 */
export function getMovieStreamUrl(s) {
  if (!isMovie(s)) return '';
  return buildVideoSource(s)?.url || '';
}
