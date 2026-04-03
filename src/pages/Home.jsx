import React, { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { footer as footerContent } from '@/data/siteContent';
import { L, NETFLIX_HOME_ROW_ORDER } from '@/data/netflixRowOrder';
import { heroBanners, normalizeHeroSlide } from '@/data/heroBanners';
import { seriesToHeroSlide } from '@/lib/heroFromSeries';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import HeroBanner from '../components/home/HeroBanner';
import SeriesCarousel from '../components/home/SeriesCarousel';
import NetflixHomeRow from '../components/home/NetflixHomeRow';
import MovieAutoCarousel from '../components/home/MovieAutoCarousel';
import ContinueWatching from '../components/home/ContinueWatching';
import { CONTENT_TYPE_MOVIE } from '@/constants/contentType';
import { catalogItemMatchesCategoryLabel } from '@/lib/categoryFilter';
import { getItemsForNetflixRow } from '@/lib/netflixHomeRows';
import { useShuffledMovies } from '@/hooks/useShuffledMovies';
import { readActiveProfile } from '@/lib/activeProfile';
import { useLiveEntityList } from '@/hooks/useLiveEntityList';

export default function Home() {
  const location = useLocation();
  const queryClient = useQueryClient();
  const activeProfile = readActiveProfile();

  const { data: allSeries = [] } = useLiveEntityList({
    entity: base44.entities.Series,
    query: { published: true },
  });

  const { data: featuredBannerRows = [] } = useLiveEntityList({
    entity: base44.entities.FeaturedBanner,
    query: { active: true },
    sortField: 'order',
  });

  const { data: episodes = [] } = useLiveEntityList({
    entity: base44.entities.Episode,
    sortField: '-season',
    limit: 500,
  });

  const { data: myListItems = [] } = useQuery({
    queryKey: ['myList', activeProfile?.id],
    queryFn: () => activeProfile?.id ? base44.entities.MyList.filter({ profile_id: activeProfile.id }) : [],
    enabled: !!activeProfile?.id,
  });

  const { data: history = [] } = useQuery({
    queryKey: ['watchHistory', activeProfile?.id],
    queryFn: () => activeProfile?.id ? base44.entities.WatchHistory.filter({ profile_id: activeProfile.id }, '-updated_date', 20) : [],
    enabled: !!activeProfile?.id,
  });

  const addToListMut = useMutation({
    mutationFn: (seriesId) => base44.entities.MyList.create({ profile_id: activeProfile.id, series_id: seriesId }),
    onMutate: async (seriesId) => {
      await queryClient.cancelQueries({ queryKey: ['myList', activeProfile?.id] });
      const prev = queryClient.getQueryData(['myList', activeProfile?.id]);
      queryClient.setQueryData(['myList', activeProfile?.id], old => [
        ...(old || []),
        { id: `opt-${seriesId}`, profile_id: activeProfile.id, series_id: seriesId },
      ]);
      return { prev };
    },
    onError: (_e, _v, ctx) => queryClient.setQueryData(['myList', activeProfile?.id], ctx?.prev),
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['myList'] }),
  });

  const removeFromListMut = useMutation({
    mutationFn: async (seriesId) => {
      const item = myListItems.find(m => m.series_id === seriesId);
      if (item) await base44.entities.MyList.delete(item.id);
    },
    onMutate: async (seriesId) => {
      await queryClient.cancelQueries({ queryKey: ['myList', activeProfile?.id] });
      const prev = queryClient.getQueryData(['myList', activeProfile?.id]);
      queryClient.setQueryData(['myList', activeProfile?.id], old =>
        (old || []).filter(m => m.series_id !== seriesId)
      );
      return { prev };
    },
    onError: (_e, _v, ctx) => queryClient.setQueryData(['myList', activeProfile?.id], ctx?.prev),
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['myList'] }),
  });

  const myListIds = useMemo(() => myListItems.map(m => m.series_id), [myListItems]);

  const toggleList = (seriesId) => {
    if (!activeProfile?.id) return;
    if (myListIds.includes(seriesId)) {
      removeFromListMut.mutate(seriesId);
    } else {
      addToListMut.mutate(seriesId);
    }
  };

  const visibleSeries = activeProfile?.is_kid
    ? allSeries.filter(s => s.age_rating === 'Livre' || s.category?.toLowerCase().includes('infantil'))
    : allSeries;

  const heroSlides = useMemo(() => {
    const seriesById = Object.fromEntries(visibleSeries.map((s) => [s.id, s]));
    const fromAdmin = [...featuredBannerRows]
      .sort((a, b) => a.order - b.order)
      .map((b) => {
        const series = seriesById[b.series_id];
        if (!series) return null;
        return seriesToHeroSlide(series, b.id);
      })
      .filter(Boolean);
    if (fromAdmin.length > 0) return fromAdmin;
    return heroBanners.map(normalizeHeroSlide);
  }, [featuredBannerRows, visibleSeries, heroBanners]);

  const moviesSource = useMemo(
    () => visibleSeries.filter((s) => s.content_type === CONTENT_TYPE_MOVIE),
    [visibleSeries]
  );

  const moviesRow = useShuffledMovies(moviesSource, location.key);

  const netflixLabels = useMemo(
    () => new Set(NETFLIX_HOME_ROW_ORDER.map((r) => r.label)),
    []
  );

  /** Géneros só em séries (campo texto) que não entram nas fileiras Netflix fixas — ex.: Comédia */
  const extraSeriesGenreTokens = useMemo(() => {
    const set = new Set();
    visibleSeries.forEach((s) => {
      if (s.content_type === CONTENT_TYPE_MOVIE) return;
      if (!s.category) return;
      s.category.split(',').forEach((c) => {
        const t = c.trim();
        if (t && !netflixLabels.has(t)) set.add(t);
      });
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'pt-BR'));
  }, [visibleSeries, netflixLabels]);

  const maisAssistidosRow = useMemo(
    () => getItemsForNetflixRow(visibleSeries, L.mais),
    [visibleSeries]
  );
  const mostViewedIds = new Set(maisAssistidosRow.map((s) => s.id));

  return (
    <div className="min-h-screen bg-[#0F0F0F]">
      <HeroBanner slides={heroSlides} />

      <div className="-mt-4 md:-mt-20 relative z-10">
        {NETFLIX_HOME_ROW_ORDER.map(({ slug, label }, rowIndex) => (
          <NetflixHomeRow
            key={slug}
            slug={slug}
            label={label}
            rowIndex={rowIndex}
            visibleSeries={visibleSeries}
            myListIds={myListIds}
            onToggleList={toggleList}
            episodes={episodes}
            hideComingSoon
            hideComingSoonIds={mostViewedIds}
          />
        ))}

        <ContinueWatching history={history} episodes={episodes} allSeries={allSeries} profileName={activeProfile?.name} />

        {moviesRow.length > 0 && (
          <MovieAutoCarousel
            key={`filmes-${moviesRow.map((m) => m.id).sort().join(',')}`}
            title="Filmes"
            showHeader
            movies={moviesRow}
            myListIds={myListIds}
            onToggleList={toggleList}
            browseTo="/Browse?type=movie"
            episodes={episodes}
            hideComingSoonIds={mostViewedIds}
            direction={NETFLIX_HOME_ROW_ORDER.length % 2 === 0 ? 'left' : 'right'}
          />
        )}

        {extraSeriesGenreTokens.map((cat) => {
          const catSeries = visibleSeries.filter((s) => catalogItemMatchesCategoryLabel(s, cat));
          if (catSeries.length === 0) return null;
          return (
            <SeriesCarousel
              key={cat}
              title={cat}
              series={catSeries}
              myListIds={myListIds}
              onToggleList={toggleList}
              category={cat}
              episodes={episodes}
              hideComingSoonIds={mostViewedIds}
            />
          );
        })}

        {allSeries.length === 0 && (
          <div className="flex flex-col items-center justify-center py-32 px-4">
            <div className="text-6xl mb-6">🎬</div>
            <h2 className="text-2xl font-bold mb-2">Bem-vindo ao KIDSPlay!</h2>
            <p className="text-gray-400 text-center max-w-md">
              Nenhuma série disponível ainda. O administrador precisa adicionar conteúdo no painel admin.
            </p>
          </div>
        )}
      </div>

      <footer className="border-t border-white/5 mt-16 py-8 px-4 md:px-12 text-center text-xs text-gray-500">
        <p>
          &copy; {new Date().getFullYear()} {footerContent.copyright}
        </p>
      </footer>
    </div>
  );
}
