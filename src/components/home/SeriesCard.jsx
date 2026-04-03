import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Play, Plus, Check, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { isMovie, getMovieStreamUrl } from '@/constants/contentType';
import { imageUrlWithCacheBust } from '@/lib/imageCacheBust';
import { buildVideoSource } from '@/lib/videoSource';

export default function SeriesCard({
  series,
  isInList,
  onToggleList,
  episodes = [],
  hideComingSoon = false,
  /** Dentro do carrossel CSS (marquee): sem Framer scale no wrapper — evita conflito com transform da faixa. */
  inMarquee = false,
}) {
  const [hovered, setHovered] = useState(false);
  const [coverFailed, setCoverFailed] = useState(false);
  const [canHover, setCanHover] = useState(false);

  useEffect(() => {
    setCoverFailed(false);
  }, [series.id, series.cover_url]);

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return undefined;
    }

    const media = window.matchMedia('(hover: hover) and (pointer: fine)');
    const sync = () => {
      setCanHover(media.matches);
      if (!media.matches) setHovered(false);
    };

    sync();
    media.addEventListener?.('change', sync);
    return () => media.removeEventListener?.('change', sync);
  }, []);

  const seriesEpisodes = episodes.filter(e => e.series_id === series.id);
  const hasNoEpisodes = seriesEpisodes.length === 0;
  const hasAtLeastOneLink = seriesEpisodes.some((e) => !!buildVideoSource(e)?.url);
  const movieStreamUrl = getMovieStreamUrl(series);
  const filmePronto = isMovie(series) && !!movieStreamUrl;
  const showComingSoon = !hideComingSoon && (
    isMovie(series)
      ? !filmePronto
      : (hasNoEpisodes || !hasAtLeastOneLink)
  );
  const playHref = filmePronto
    ? `/Player?seriesId=${series.id}`
    : `/SeriesDetail?id=${series.id}`;

  const shellClass =
    'relative shrink-0 w-[116px] sm:w-[140px] md:w-[200px] lg:w-[240px] group cursor-pointer';

  const Shell = inMarquee ? 'div' : motion.div;
  const shellProps = inMarquee
    ? {
        className: shellClass,
        onMouseEnter: () => canHover && setHovered(true),
        onMouseLeave: () => setHovered(false),
      }
    : {
        className: shellClass,
        onMouseEnter: () => canHover && setHovered(true),
        onMouseLeave: () => setHovered(false),
        whileHover: { scale: 1.05, zIndex: 10 },
        transition: { duration: 0.2 },
      };

  return (
    <Shell {...shellProps}>
      <Link to={`/SeriesDetail?id=${series.id}`}>
        <div className="aspect-[2/3] rounded-lg overflow-hidden bg-[#1A1A1A] shadow-lg relative">
          {series.cover_url && !coverFailed ? (
            <img
              key={`${series.id}-${series.updated_date || ''}`}
              src={imageUrlWithCacheBust(series.cover_url, series)}
              alt={series.title}
              loading={inMarquee ? 'eager' : 'lazy'}
              decoding="async"
              onError={() => setCoverFailed(true)}
              className={`w-full h-full object-cover transition-[transform,filter] duration-300 [transform:translateZ(0)] ${
                inMarquee ? 'group-hover:brightness-110' : 'group-hover:scale-110'
              }`}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#E50914]/30 to-[#1A1A1A] p-3">
              <span className="text-sm font-bold text-center text-white/80">{series.title}</span>
            </div>
          )}
          {showComingSoon && (
            <div className="absolute inset-0 bg-black/60 flex items-end justify-center pb-4">
              <div className="flex flex-col items-center gap-1 px-2 text-center">
                <Clock className="w-4 h-4 text-[#FFC107]" />
                <span className="text-[10px] md:text-xs font-bold text-[#FFC107] leading-tight">
                  {isMovie(series) ? 'FILME EM BREVE' : 'EPISÓDIOS EM BREVE'}
                </span>
              </div>
            </div>
          )}
        </div>
      </Link>

      {canHover && hovered && (() => {
        const hoverPanelBody = (
          <div className="bg-[#1A1A1A] rounded-b-lg p-3 shadow-2xl border-t border-[#E50914]/30">
            <p className="text-xs font-semibold text-white truncate mb-2">{series.title}</p>
            <div className="flex items-center gap-2">
              <Link
                to={playHref}
                className="w-7 h-7 rounded-full bg-white flex items-center justify-center hover:bg-gray-200 transition-colors"
              >
                <Play className="w-3.5 h-3.5 text-black fill-current ml-0.5" />
              </Link>
              {onToggleList && (
                <button
                  onClick={(e) => { e.preventDefault(); onToggleList(series.id); }}
                  className="w-7 h-7 rounded-full border border-gray-500 flex items-center justify-center hover:border-white transition-colors"
                >
                  {isInList ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                </button>
              )}
            </div>
            <div className="flex items-center gap-2 mt-2 text-[10px] text-gray-400">
              {series.year && <span>{series.year}</span>}
              {series.age_rating && (
                <span className="border border-gray-600 px-1 rounded">{series.age_rating}</span>
              )}
            </div>
          </div>
        );
        const wrapClass = 'absolute -bottom-2 left-0 right-0 px-2 pb-2';
        return inMarquee ? (
          <div className={wrapClass}>{hoverPanelBody}</div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className={wrapClass}
          >
            {hoverPanelBody}
          </motion.div>
        );
      })()}
    </Shell>
  );
}