/**
 * Episódios (clipes oficiais no YouTube) — mesma série que `movie-o-exorcista-1974` em movieCatalog.
 * IDs de vídeo referenciados em comunicação pública da produtora (ex.: Bromelia Filmes, 2021).
 */

export const GALINHA_PINTADINHA_SERIES_ID = 'movie-o-exorcista-1974';

function youtubeUrl(id) {
  return `https://www.youtube.com/watch?v=${id}`;
}

function thumbnailUrl(id, variant = 'maxresdefault.jpg') {
  return `https://i.ytimg.com/vi/${id}/${variant}`;
}

export const galinhaPintadinhaEpisodes = [
  {
    id: 'ep-galinha-01',
    series_id: GALINHA_PINTADINHA_SERIES_ID,
    title: 'Upa Cavalinho',
    season: 1,
    number: 1,
    description: 'Um dos clipes mais vistos do canal.',
    thumbnail_url: thumbnailUrl('Fn9adh4HWUU'),
    video_url: youtubeUrl('Fn9adh4HWUU'),
  },
  {
    id: 'ep-galinha-02',
    series_id: GALINHA_PINTADINHA_SERIES_ID,
    title: 'Dona Aranha',
    season: 1,
    number: 2,
    description: 'A aranha que sobe e desce pela parede.',
    thumbnail_url: thumbnailUrl('MuBgIfBR1kA'),
    video_url: youtubeUrl('MuBgIfBR1kA'),
  },
  {
    id: 'ep-galinha-03',
    series_id: GALINHA_PINTADINHA_SERIES_ID,
    title: 'Pintinho Amarelinho',
    season: 1,
    number: 3,
    description: 'Canção clássica com o pintinho amarelinho.',
    thumbnail_url: thumbnailUrl('59GM_xjPhco'),
    video_url: youtubeUrl('59GM_xjPhco'),
  },
  {
    id: 'ep-galinha-04',
    series_id: GALINHA_PINTADINHA_SERIES_ID,
    title: 'Sambalelê',
    season: 1,
    number: 4,
    description: 'Ritmo e festa com a turma.',
    thumbnail_url: thumbnailUrl('zKOubVELVNw'),
    video_url: youtubeUrl('zKOubVELVNw'),
  },
  {
    id: 'ep-galinha-05',
    series_id: GALINHA_PINTADINHA_SERIES_ID,
    title: 'Parabéns da Galinha Pintadinha',
    season: 1,
    number: 5,
    description: 'Música de aniversário.',
    thumbnail_url: thumbnailUrl('ei2-RjJDBHc'),
    video_url: youtubeUrl('ei2-RjJDBHc'),
  },
  {
    id: 'ep-galinha-06',
    series_id: GALINHA_PINTADINHA_SERIES_ID,
    title: 'A Baratinha',
    season: 1,
    number: 6,
    description: 'Cantiga tradicional com a turma.',
    thumbnail_url: thumbnailUrl('l7VsurR48Ew'),
    video_url: youtubeUrl('l7VsurR48Ew'),
  },
  {
    id: 'ep-galinha-07',
    series_id: GALINHA_PINTADINHA_SERIES_ID,
    title: 'Galinha Pintadinha 1 (DVD)',
    season: 1,
    number: 7,
    description: 'Compilação do primeiro DVD oficial.',
    thumbnail_url: thumbnailUrl('1i7p0vTGcBk', 'hqdefault.jpg'),
    video_url: youtubeUrl('1i7p0vTGcBk'),
  },
  {
    id: 'ep-galinha-08',
    series_id: GALINHA_PINTADINHA_SERIES_ID,
    title: 'Cão amigo',
    season: 1,
    number: 8,
    description: 'História do cão amigo.',
    thumbnail_url: thumbnailUrl('QpsXyVOjSGM'),
    video_url: youtubeUrl('QpsXyVOjSGM'),
  },
  {
    id: 'ep-galinha-09',
    series_id: GALINHA_PINTADINHA_SERIES_ID,
    title: 'Mariana',
    season: 1,
    number: 9,
    description: 'A contagem clássica da Mariana.',
    thumbnail_url: thumbnailUrl('orxxp-3gBiE'),
    video_url: youtubeUrl('orxxp-3gBiE'),
  },
  {
    id: 'ep-galinha-10',
    series_id: GALINHA_PINTADINHA_SERIES_ID,
    title: 'Meu Lanchinho',
    season: 1,
    number: 10,
    description: 'Hora do lanche com música.',
    thumbnail_url: thumbnailUrl('fnSBl46w82g'),
    video_url: youtubeUrl('fnSBl46w82g'),
  },
];
