/**
 * Dados iniciais do catálogo em modo local (primeira carga ou após limpar localStorage).
 * Filmes: catálogo central `movieCatalog.js` com `categories[]`.
 */
import { profileAvatarsSeed } from '@/data/profileAvatars';
import { barneyEpisodes } from '@/data/barneyEpisodes';
import { buildSeriesRowsFromMovieCatalog } from '@/data/movieCatalog';
import { DEMO_VIDEO_MP4 } from '@/constants/demoVideo';

export function buildMockSeed() {
  const now = new Date().toISOString();

  const catalogSeries = buildSeriesRowsFromMovieCatalog();

  const demoSeriesExtra = [
    {
      id: 'series-3',
      title: 'Comédias Animadas',
      description: 'Risadas garantidas.',
      category: 'Engraçados',
      year: 2012,
      age_rating: '10',
      featured: true,
      highlighted_home_section: 'mais_assistidos',
      total_views: 6500,
      published: true,
      cover_url: '',
      imageSource: 'missing',
      content_type: 'series',
    },
    {
      id: 'series-saga-1',
      title: 'Maratona: Mistérios da Mansão',
      description: 'Saga completa — todos os episódios em sequência para assistir de uma vez.',
      category: 'Fantasia',
      year: 2020,
      age_rating: '16',
      featured: true,
      highlighted_home_section: 'fantasia_e_magia',
      total_views: 4200,
      published: true,
      cover_url: '',
      imageSource: 'missing',
      content_type: 'series',
    },
  ];

  return {
    User: [
      {
        id: 'user-demo-1',
        email: 'demo@local.dev',
        role: 'user',
        activated: true,
        created_date: now,
      },
    ],
    Series: [...catalogSeries, ...demoSeriesExtra],
    Episode: [
      {
        id: 'ep-it-1990-1',
        series_id: 'series-it-a-coisa-1990',
        title: 'Parte 1',
        season: 1,
        number: 1,
        description: 'Derry e o palhaço.',
        video_url: DEMO_VIDEO_MP4,
        duration: 596,
        thumbnail_url: '',
      },
      {
        id: 'ep-it-1990-2',
        series_id: 'series-it-a-coisa-1990',
        title: 'Parte 2',
        season: 1,
        number: 2,
        video_url: DEMO_VIDEO_MP4,
        duration: 596,
      },
      {
        id: 'ep-saga-1',
        series_id: 'series-saga-1',
        title: 'Episódio 1 — O convite',
        season: 1,
        number: 1,
        description: 'Início da saga (demo).',
        video_url: DEMO_VIDEO_MP4,
        duration: 596,
        thumbnail_url: '',
      },
      {
        id: 'ep-saga-2',
        series_id: 'series-saga-1',
        title: 'Episódio 2 — Portas fechadas',
        season: 1,
        number: 2,
        video_url: DEMO_VIDEO_MP4,
        duration: 596,
      },
      ...barneyEpisodes,
    ],
    FeaturedBanner: [
      { id: 'fb-1', series_id: 'movie-o-exorcista-1974', order: 0, active: true },
      { id: 'fb-2', series_id: 'movie-halloween-1978', order: 1, active: true },
    ],
    Avatar: [...profileAvatarsSeed.map((a) => ({ ...a }))],
    AccessCode: [
      {
        id: 'code-demo-1',
        code: 'DESENHOS-DEMO01',
        active: true,
        used_by: null,
        used_date: null,
        created_date: now,
      },
    ],
    SearchTerm: [],
    Profile: [],
    MyList: [],
    WatchHistory: [],
    ContentProposal: [],
    Subscription: [],
    Notification: [],
  };
}
