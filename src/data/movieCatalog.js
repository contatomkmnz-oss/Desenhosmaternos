/**
 * Catálogo central de filmes (e minissérie) — estilo Netflix: várias categorias por título.
 * Edite apenas aqui para alterar títulos, categorias e metadados.
 */
import { DEMO_VIDEO_MP4 } from '@/constants/demoVideo';
import { L } from '@/data/netflixRowOrder';
import { NETFLIX_CATALOG_EXTRAS } from '@/data/netflixCatalogExtras';

const POSTERS = [
  '/images/banners/poster-movie.svg',
  '/images/banners/hero-slide-1.svg',
  '/images/banners/hero-slide-2.svg',
];

function poster(i) {
  return POSTERS[i % POSTERS.length];
}

/**
 * @typedef {Object} CatalogEntry
 * @property {string} id
 * @property {string} title
 * @property {number} year
 * @property {string} description
 * @property {string[]} categories — rótulos exatos das fileiras (podem repetir entre títulos)
 * @property {'movie'|'series'} kind
 * @property {number} [total_views]
 * @property {string} [age_rating]
 * @property {string} [cover_url] — URL direta da capa (sobrepõe o poster rotativo)
 * @property {string} [banner_url] — URL direta do banner
 */

/** Lista completa — mesmos filmes podem aparecer em várias categorias. */
export const MOVIE_CATALOG = [
  {
    id: 'movie-a-voz-assassina-1989',
    kind: 'movie',
    title: 'Peppa Pig',
    year: 1989,
    description:
      'Uma porquinha vive aventuras do cotidiano com sua família, explorando o mundo de forma leve e divertida.',
    categories: [L.pequenos, L.familia, L.mais],
    total_views: 2100,
    age_rating: 'Livre',
    cover_url:
      'https://i.ibb.co/Kz6J4x2q/MV5-BMGMw-Mj-Vh-NDct-Mj-E5-My00-Yj-Vi-LWFk-MGIt-Yz-U3-N2-M3-OTdk-MDVi-Xk-Ey-Xk-Fqc-Gc-V1.jpg',
  },
  {
    id: 'movie-it-bem-vindos-a-derry-2025',
    kind: 'movie',
    title: 'Patrulha Canina',
    year: 2025,
    description:
      'Um garoto lidera uma equipe de filhotes que salvam a cidade em diversas missões.',
    categories: [L.mais, L.herois, L.animais],
    total_views: 9800,
    age_rating: 'Livre',
  },
  {
    id: 'movie-o-exorcista-1974',
    kind: 'movie',
    title: 'Galinha Pintadinha',
    year: 1974,
    description:
      'Série musical com personagens coloridos que ensinam através de canções infantis.',
    categories: [L.musicais, L.pequenos, L.mais],
    total_views: 15000,
    age_rating: 'Livre',
  },
  {
    id: 'movie-halloween-1978',
    kind: 'movie',
    title: 'Mundo Bita',
    year: 1978,
    description:
      'Um universo mágico onde músicas educativas ensinam valores, letras e números.',
    categories: [L.edu, L.musicais, L.fantasia],
    total_views: 14200,
    age_rating: 'Livre',
  },
  {
    id: 'movie-psicose-1960',
    kind: 'movie',
    title: 'Bluey',
    year: 1960,
    description:
      'Uma cachorrinha vive aventuras com sua família, estimulando imaginação e aprendizado emocional.',
    categories: [L.familia, L.mais, L.edu],
    total_views: 13800,
    age_rating: 'Livre',
  },
  {
    id: 'movie-o-iluminado-1980',
    kind: 'movie',
    title: 'Dora, a Aventureira',
    year: 1980,
    description:
      'Uma menina exploradora resolve desafios com a ajuda do público em suas jornadas.',
    categories: [L.animais, L.edu, L.pequenos],
    total_views: 13100,
    age_rating: 'Livre',
  },
  {
    id: 'movie-o-massacre-da-serra-eletrica-1974',
    kind: 'movie',
    title: 'Backyardigans',
    year: 1974,
    description:
      'Cinco amigos usam a imaginação para viver aventuras musicais no quintal.',
    categories: [L.musicais, L.engracados],
    total_views: 11200,
    age_rating: 'Livre',
  },
  {
    id: 'movie-sexta-feira-13-1980',
    kind: 'movie',
    title: 'Pocoyo',
    year: 1980,
    description:
      'Um menino curioso descobre o mundo ao lado de seus amigos em histórias educativas.',
    categories: [L.pequenos, L.edu],
    total_views: 12100,
    age_rating: 'Livre',
  },
  {
    id: 'movie-a-hora-do-pesadelo-1984',
    kind: 'movie',
    title: 'Masha e o Urso',
    year: 1984,
    description:
      'Uma menina travessa vive situações engraçadas com um urso paciente.',
    categories: [L.engracados, L.familia],
    total_views: 11900,
    age_rating: 'Livre',
  },
  {
    id: 'movie-chuck-brinquedo-assassino-1989',
    kind: 'movie',
    title: 'Baby Shark\'s Big Show!',
    year: 1989,
    description:
      'Um tubarãozinho vive aventuras divertidas com seus amigos no oceano.',
    categories: [L.musicais, L.pequenos, L.animais],
    total_views: 9800,
    age_rating: 'Livre',
  },
  {
    id: 'movie-panico-1996',
    kind: 'movie',
    title: 'Show da Luna!',
    year: 1996,
    description:
      'Uma menina curiosa investiga como o mundo funciona com perguntas e experiências.',
    categories: [L.edu, L.animais],
    total_views: 12500,
    age_rating: 'Livre',
  },
  {
    id: 'movie-hellraiser-2018',
    kind: 'movie',
    title: 'Daniel Tigre',
    year: 2018,
    description:
      'Um tigre aprende sobre sentimentos, convivência e amizade no dia a dia.',
    categories: [L.familia, L.edu],
    total_views: 6400,
    age_rating: 'Livre',
  },
  {
    id: 'movie-poltergeist-1982',
    kind: 'movie',
    title: 'Sid, o Cientista',
    year: 1982,
    description:
      'Um garoto curioso aprende ciência através de perguntas e descobertas.',
    categories: [L.edu],
    total_views: 10800,
    age_rating: 'Livre',
  },
  {
    id: 'movie-a-profecia-1977',
    kind: 'movie',
    title: 'Octonautas',
    year: 1977,
    description:
      'Uma equipe explora o fundo do mar ajudando animais e resolvendo problemas.',
    categories: [L.animais, L.herois],
    total_views: 9100,
    age_rating: 'Livre',
  },
  {
    id: 'movie-o-chamado-2003',
    kind: 'movie',
    title: 'Clifford, o Gigante Cão Vermelho',
    year: 2003,
    description:
      'Um cachorro gigante vive aventuras e aprende lições com sua dona.',
    categories: [L.animais, L.familia],
    total_views: 11700,
    age_rating: 'Livre',
  },
  {
    id: 'movie-a-casa-de-cera-2005',
    kind: 'movie',
    title: 'Barney e Seus Amigos',
    year: 2005,
    description:
      'Um dinossauro ensina valores como amizade, respeito e cooperação.',
    categories: [L.familia, L.pequenos],
    total_views: 8600,
    age_rating: 'Livre',
    cover_url:
      'https://i.ibb.co/1JZkyGrq/MV5-BMGMw-Mj-Vh-NDct-Mj-E5-My00-Yj-Vi-LWFk-MGIt-Yz-U3-N2-M3-OTdk-MDVi-Xk-Ey-Xk-Fqc-Gc-V1.jpg',
  },
  {
    id: 'movie-jogos-mortais-2004',
    kind: 'movie',
    title: 'Teletubbies',
    year: 2004,
    description:
      'Criaturas coloridas vivem situações simples focadas no aprendizado infantil.',
    categories: [L.pequenos],
    total_views: 12200,
    age_rating: 'Livre',
    cover_url:
      'https://i.ibb.co/3yFyN2JX/MV5-BZWM5-Zj-Nk-OWIt-Nm-U0-Zi00-Yzdi-LTg0-MTAt-Mzkx-MTZm-ZGI4-Nm-Q2-Xk-Ey-Xk-Fqc-Gc-V1-QL75-UX190-CR0-2-190.jpg',
  },
  {
    id: 'movie-atividade-paranormal-2007',
    kind: 'movie',
    title: 'Caillou',
    year: 2007,
    description:
      'Um menino pequeno aprende sobre o mundo em experiências do dia a dia.',
    categories: [L.familia],
    total_views: 12800,
    age_rating: 'Livre',
    cover_url: 'https://i.ibb.co/LDLQ5gQ9/images-31.jpg',
  },
  {
    id: 'movie-invocacao-do-mal-2013',
    kind: 'movie',
    title: 'Os Pequerruchos',
    year: 2013,
    description:
      'Bebês vivem aventuras imaginativas enquanto exploram o ambiente ao redor.',
    categories: [L.pequenos],
    total_views: 13500,
    age_rating: 'Livre',
    cover_url:
      'https://i.ibb.co/0yk2xBzF/MV5-BNWQy-Nm-Q4-ZGYt-ODU0-NS00-OTY5-LTk2-Nz-Et-Nj-Bi-Nm-Q3-OGI1-MDUy-Xk-Ey-Xk-Fqc-Gc-V1.jpg',
  },
  {
    id: 'movie-rec-2008',
    kind: 'movie',
    title: 'Bob Esponja',
    year: 2008,
    description:
      'Uma esponja vive aventuras engraçadas com seus amigos no fundo do mar.',
    categories: [L.engracados, L.mais],
    total_views: 10400,
    age_rating: 'Livre',
    cover_url: 'https://i.ibb.co/KjhHC9sq/images-32.jpg',
  },
  {
    id: 'movie-o-grito-2004',
    kind: 'movie',
    title: 'Mickey Mouse Clubhouse',
    year: 2004,
    description:
      'Mickey e seus amigos resolvem desafios com a participação das crianças.',
    categories: [L.mais, L.familia],
    total_views: 9900,
    age_rating: 'Livre',
    cover_url: 'https://i.ibb.co/G4NSLP0w/images-33.jpg',
  },
  {
    id: 'series-it-a-coisa-1990',
    kind: 'series',
    title: 'Minnie Toons',
    year: 1990,
    description:
      'Minnie e suas amigas vivem histórias leves sobre amizade e diversão.',
    categories: [L.familia, L.mais],
    total_views: 8900,
    age_rating: 'Livre',
    cover_url: 'https://i.ibb.co/1ffMfjFK/images-34.jpg',
  },
  {
    id: 'movie-a-bruxa-de-blair-1999',
    kind: 'movie',
    title: 'PJ Masks: Heróis de Pijama',
    year: 1999,
    description:
      'Crianças se transformam em heróis à noite para combater vilões.',
    categories: [L.herois],
    total_views: 10100,
    age_rating: 'Livre',
    cover_url: 'https://i.ibb.co/jvyCfrwt/images-35.jpg',
  },
  {
    id: 'movie-premonicao-1999',
    kind: 'movie',
    title: 'Blaze and the Monster Machines',
    year: 1999,
    description:
      'Um caminhão aventureiro ensina ciência e matemática em corridas.',
    categories: [L.corridas, L.edu],
    total_views: 9600,
    age_rating: 'Livre',
    cover_url: 'https://i.ibb.co/Jj5s2ggC/images-36.jpg',
  },
  {
    id: 'movie-exterminio-2003',
    kind: 'movie',
    title: 'Thomas e Seus Amigos',
    year: 2003,
    description:
      'Trens vivem histórias que ensinam trabalho em equipe e amizade.',
    categories: [L.corridas, L.familia],
    total_views: 11800,
    age_rating: 'Livre',
    cover_url: 'https://i.ibb.co/Kz2qcS5Y/Thomas-e-Seus-Amigos.webp',
  },
  {
    id: 'movie-a-entidade-2012',
    kind: 'movie',
    title: 'LazyTown',
    year: 2012,
    description:
      'Personagens incentivam hábitos saudáveis e atividades físicas.',
    categories: [L.edu, L.musicais],
    total_views: 7200,
    age_rating: 'Livre',
    cover_url: 'https://i.ibb.co/jZGTHVjb/images-37.jpg',
  },
  {
    id: 'movie-alien-1979',
    kind: 'movie',
    title: 'Ben 10',
    year: 1979,
    description:
      'Um garoto usa um dispositivo para se transformar em heróis alienígenas.',
    categories: [L.herois],
    total_views: 14000,
    age_rating: 'Livre',
    cover_url: 'https://i.ibb.co/GZK757F/images-38.jpg',
  },
  {
    id: 'movie-o-enigma-de-outro-mundo-1982',
    kind: 'movie',
    title: 'Alvin e os Esquilos',
    year: 1982,
    description:
      'Três esquilos vivem aventuras musicais cheias de confusão.',
    categories: [L.musicais, L.engracados],
    total_views: 10600,
    age_rating: 'Livre',
  },
  {
    id: 'movie-corra-2017',
    kind: 'movie',
    title: 'Scooby-Doo',
    year: 2017,
    description:
      'Um grupo de amigos resolve mistérios com humor e sustos leves.',
    categories: [L.engracados, L.animais],
    total_views: 12400,
    age_rating: 'Livre',
  },
  {
    id: 'movie-hereditario-2018',
    kind: 'movie',
    title: 'Tom e Jerry',
    year: 2018,
    description:
      'Um gato e um rato protagonizam perseguições engraçadas e caóticas.',
    categories: [L.engracados, L.mais],
    total_views: 11600,
    age_rating: 'Livre',
    cover_url: 'https://i.ibb.co/sdrcm0dT/Tom-Jerry.webp',
  },
  {
    id: 'movie-a-morte-do-demonio-1981',
    kind: 'movie',
    title: 'Peppa Pig',
    year: 1981,
    description:
      'Uma porquinha vive aventuras do cotidiano com sua família, explorando o mundo de forma leve e divertida.',
    categories: [L.pequenos, L.familia, L.mais],
    total_views: 9300,
    age_rating: 'Livre',
  },
  {
    id: 'movie-out-of-the-dark-2014',
    kind: 'movie',
    title: 'Patrulha Canina',
    year: 2014,
    description:
      'Um garoto lidera uma equipe de filhotes que salvam a cidade em diversas missões.',
    categories: [L.mais, L.herois],
    total_views: 3100,
    age_rating: 'Livre',
  },
  {
    id: 'movie-panico-na-floresta-2004',
    kind: 'movie',
    title: 'Galinha Pintadinha',
    year: 2004,
    description:
      'Série musical com personagens coloridos que ensinam através de canções infantis.',
    categories: [L.musicais, L.pequenos],
    total_views: 6700,
    age_rating: 'Livre',
  },
  {
    id: 'movie-todo-mundo-em-panico-2000',
    kind: 'movie',
    title: 'Mundo Bita',
    year: 2000,
    description:
      'Um universo mágico onde músicas educativas ensinam valores, letras e números.',
    categories: [L.edu, L.musicais, L.fantasia],
    total_views: 8800,
    age_rating: 'Livre',
  },
  ...NETFLIX_CATALOG_EXTRAS,
];

/**
 * Converte entradas do catálogo em linhas da entidade `Series` (API local).
 */
export function buildSeriesRowsFromMovieCatalog() {
  return MOVIE_CATALOG.map((entry, i) => {
    const base = {
      id: entry.id,
      title: entry.title,
      description: entry.description,
      year: entry.year,
      age_rating: entry.age_rating || '16',
      featured: true,
      published: true,
      total_views: entry.total_views ?? 5000,
      cover_url: entry.cover_url ?? poster(i),
      banner_url: entry.banner_url ?? poster(i + 1),
      banner_object_position: '50% center',
      highlighted_home_section: '',
      categories: [...entry.categories],
      category: entry.categories.join(', '),
    };

    if (entry.kind === 'movie') {
      return {
        ...base,
        content_type: 'movie',
        movie_url: DEMO_VIDEO_MP4,
      };
    }

    return {
      ...base,
      content_type: 'series',
    };
  });
}
