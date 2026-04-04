import React, { useEffect, useMemo, useRef, useState } from 'react';

/** Evita ícone de imagem partida quando a URL é inválida ou o browser bloqueia o carregamento. */
function AdminPosterThumb({ url, title }) {
  const [failed, setFailed] = useState(false);
  if (!url || failed) {
    return (
      <div className="w-full h-full flex items-center justify-center text-xs text-gray-500">{title?.[0] || '—'}</div>
    );
  }
  return (
    <img
      src={url}
      alt=""
      className="w-full h-full object-cover"
      onError={() => setFailed(true)}
    />
  );
}

/** Data URLs enormes não devem ir para o campo de texto — o valor pode truncar e corromper o link. */
function ManualImageUrlInput({ value, onChange }) {
  if (value?.startsWith('data:')) {
    return (
      <p className="text-xs text-emerald-400/90 rounded-md border border-emerald-500/25 bg-emerald-500/10 px-3 py-2 leading-snug">
        Imagem enviada (guardada neste navegador). Para usar um link https em vez do ficheiro, use «Remover imagem» e cole o URL abaixo.
      </p>
    );
  }
  return (
    <Input
      placeholder="https://…"
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      className="bg-[#141414] border border-white/10 font-mono text-xs h-9"
    />
  );
}
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Plus, Pencil, Trash2, ArrowLeft, EyeOff, Star, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import ImageUpload from '@/components/admin/ImageUpload';
import { CONTENT_TYPE_MOVIE, CONTENT_TYPE_SERIES } from '@/constants/contentType';
import { MOVIE_CATALOG } from '@/data/movieCatalog';
import { HOME_SECTION_SELECT_NONE } from '@/data/siteContent';
import { L, NETFLIX_HOME_ROW_ORDER } from '@/data/netflixRowOrder';
import { resolveHostedImageUrl } from '@/lib/resolveHostedImageUrl';
import { getIndirectImageHostMessage } from '@/lib/validateDirectImageUrl';
import {
  buildVideoSource,
  getVideoSourceLabel,
  getVideoValidationMessage,
  normalizeVideoFields,
} from '@/lib/videoSource';
import { toast } from 'sonner';
import { useLiveEntityList } from '@/hooks/useLiveEntityList';

const COVER_FILTERS = [
  { id: 'pending', label: 'Pendentes' },
  { id: 'high', label: 'Alta' },
  { id: 'medium', label: 'Média' },
  { id: 'low', label: 'Baixa' },
  { id: 'missing', label: 'Faltando' },
  { id: 'corrupted', label: 'Corrompida' },
  { id: 'duplicate', label: 'Duplicada' },
  { id: 'manual_upload', label: 'Manual' },
  { id: 'restored', label: 'Restaurada' },
  { id: 'all', label: 'Todos' },
];

const ADMIN_SERIES_QUEUE_STORAGE_KEY = 'adminSeries.coverQueue.currentId';

const HIGH_PRIORITY_IDS = new Set([
  'series-3',
  'series-saga-1',
  'XURSmlPEMqbnKY5reNKD',
  'movie-it-bem-vindos-a-derry-2025',
  'movie-out-of-the-dark-2014',
  'movie-o-exorcista-1974',
  'movie-halloween-1978',
  'movie-todo-mundo-em-panico-2000',
  'movie-a-morte-do-demonio-1981',
  'movie-psicose-1960',
  'movie-o-iluminado-1980',
  'movie-o-massacre-da-serra-eletrica-1974',
  'movie-sexta-feira-13-1980',
  'movie-a-hora-do-pesadelo-1984',
  'movie-chuck-brinquedo-assassino-1989',
  'movie-panico-1996',
  'movie-hellraiser-2018',
  'movie-poltergeist-1982',
  'movie-a-profecia-1977',
  'mock-netflix-fam-blues-clues-you',
  'mock-netflix-edu-storybots',
  'mock-netflix-edu-numberblocks',
  'mock-netflix-enf-looney-tunes',
  'movie-corra-2017',
  'mock-netflix-ani-lion-guard',
  'mock-netflix-mus-super-simple-songs',
  'mock-netflix-mus-pinkfong-baby-shark',
]);

const MEDIUM_PRIORITY_IDS = new Set([
  'mock-netflix-ani-101-dalmatas',
  'mock-netflix-fam-arthur',
  'mock-netflix-fam-babar',
  'mock-netflix-fam-clifford-novo',
  'movie-o-chamado-2003',
  'mock-netflix-mus-cocomelon-songs',
  'mock-netflix-ani-go-dog-go',
  'mock-netflix-fam-guess-how-much',
  'mock-netflix-fam-little-bear',
  'mock-netflix-ani-littlest-pet-shop',
  'mock-netflix-fam-ursinhos-carinhosos',
  'mock-netflix-edu-shaun-carneiro',
  'mock-netflix-ani-tots',
  'mock-netflix-mus-lottie-dottie-chicken',
  'mock-netflix-cor-cars-toons',
  'mock-netflix-cor-chuck-amigos',
  'mock-netflix-cor-hot-wheels-race-off',
  'mock-netflix-cor-monster-trucks-nick',
  'mock-netflix-cor-robocar-poli',
  'mock-netflix-cor-speed-racer',
  'mock-netflix-cor-team-hot-wheels',
  'mock-netflix-her-justice-league',
  'mock-netflix-her-batman-animated-series',
  'mock-netflix-her-spider-man-1994',
  'mock-netflix-her-hulk-smash',
  'mock-netflix-her-avengers-earths-mightiest',
  'mock-netflix-her-avengers-assemble',
  'mock-netflix-her-ultimate-spider-man',
  'mock-netflix-her-superman-animated-series',
  'mock-netflix-enf-tom-jerry-show',
  'mock-netflix-fan-my-little-pony-fim',
  'mock-netflix-fan-winx-club',
  'mock-netflix-fan-hilda',
  'mock-netflix-fan-principe-dragao',
  'mock-netflix-fan-trollhunters',
  'mock-netflix-fan-wizards-arcadia',
  'mock-netflix-fan-maya-e-os-tres',
  'mock-netflix-fan-kipo',
  'mock-netflix-her-wolverine-xmen',
  'mock-netflix-her-xmen-evolution',
  'mock-netflix-fan-ever-after-high',
  'mock-netflix-fan-she-ra',
]);

function normalizeUrl(value) {
  return String(value || '').trim();
}

function isCorruptedCoverUrl(url) {
  const value = normalizeUrl(url);
  if (!value) return false;
  // Upload manual em base64 (jpeg/png/webp/gif) é válido; só marcamos como corrompido SVG data-URL
  // e outros data: não-imagem (ex.: placeholders antigos em SVG).
  if (/^data:image\/(jpeg|jpg|pjpeg|png|webp|gif|avif);/i.test(value)) return false;
  if (/^data:/i.test(value)) return true;
  if (/^\/images\/banners\//i.test(value)) return true;
  if (/^https?:\/\/(www\.)?ibb\.co\//i.test(value)) return true;
  return false;
}

function getStatusPillClasses(statusKey) {
  switch (statusKey) {
    case 'missing':
      return 'bg-amber-500/15 text-amber-300 border-amber-500/20';
    case 'corrupted':
      return 'bg-red-500/15 text-red-300 border-red-500/20';
    case 'manual_upload':
      return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/20';
    case 'restored':
      return 'bg-sky-500/15 text-sky-300 border-sky-500/20';
    case 'external':
      return 'bg-violet-500/15 text-violet-300 border-violet-500/20';
    default:
      return 'bg-white/10 text-gray-300 border-white/10';
  }
}

function getPriorityBadgeClasses(priorityKey) {
  switch (priorityKey) {
    case 'high':
      return 'bg-[#E50914]/15 text-[#ff7a80] border-[#E50914]/20';
    case 'medium':
      return 'bg-yellow-500/15 text-yellow-300 border-yellow-500/20';
    case 'low':
      return 'bg-cyan-500/15 text-cyan-300 border-cyan-500/20';
    default:
      return 'bg-white/10 text-gray-300 border-white/10';
  }
}

function getPriorityMeta(item) {
  if (HIGH_PRIORITY_IDS.has(item.id)) {
    return { priorityKey: 'high', priorityLabel: 'Prioridade alta', priorityRank: 0 };
  }
  if (MEDIUM_PRIORITY_IDS.has(item.id)) {
    return { priorityKey: 'medium', priorityLabel: 'Prioridade média', priorityRank: 1 };
  }
  return { priorityKey: 'low', priorityLabel: 'Prioridade baixa', priorityRank: 2 };
}

function getSeriesCoverMeta(item, originalById, duplicateTitles) {
  const coverUrl = normalizeUrl(item.cover_url);
  const rawImageSource = normalizeUrl(item.imageSource);
  const originalCoverUrl = normalizeUrl(originalById[item.id]);
  const isOriginalMatch = Boolean(originalCoverUrl) && coverUrl === originalCoverUrl;
  const isDuplicate = duplicateTitles.has(item.title);
  const corrupted = isCorruptedCoverUrl(coverUrl);

  let statusKey = 'external';
  let statusLabel = 'Imagem externa';

  if (corrupted) {
    statusKey = 'corrupted';
    statusLabel = 'Corrompida';
  } else if (!coverUrl) {
    statusKey = 'missing';
    statusLabel = 'Sem imagem';
  } else if (rawImageSource === 'manual_upload') {
    statusKey = 'manual_upload';
    statusLabel = 'Manual/upload';
  } else if (isOriginalMatch || rawImageSource === 'restored_original' || rawImageSource === 'imported_backup') {
    statusKey = 'restored';
    statusLabel = 'Restaurada/original';
  } else if (rawImageSource === 'missing') {
    statusKey = 'missing';
    statusLabel = 'Sem imagem';
  } else if (rawImageSource === 'external_auto' || rawImageSource === 'auto_external') {
    statusKey = 'external';
    statusLabel = 'Externa';
  }

  return {
    statusKey,
    statusLabel,
    isDuplicate,
    isPending: statusKey === 'missing' || statusKey === 'corrupted' || statusKey === 'external',
    imageSource: rawImageSource || (statusKey === 'missing' ? 'missing' : '—'),
    coverUrl,
    ...getPriorityMeta(item),
  };
}

function getQueuePriority(item, meta) {
  const statusRank =
    meta.statusKey === 'corrupted'
      ? 0
      : meta.statusKey === 'missing'
        ? 1
        : meta.isDuplicate
          ? 2
          : meta.statusKey === 'external'
            ? 3
            : 4;
  return meta.priorityRank * 10 + statusRank;
}

export default function AdminSeries() {
  const queryClient = useQueryClient();
  const saveActionRef = useRef('close');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [listFilter, setListFilter] = useState('all'); // all | series | movie
  const [coverFilter, setCoverFilter] = useState('pending');
  const [searchTerm, setSearchTerm] = useState('');
  const [queueAdvanceRequest, setQueueAdvanceRequest] = useState(null);
  const [hasAutoOpenedQueue, setHasAutoOpenedQueue] = useState(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: '',
    year: '',
    cover_url: '',
    banner_url: '',
    videoUrl: '',
    trailerUrl: '',
    published: true,
    featured: false,
    age_rating: 'Livre',
    highlighted_home_section: null,
    content_type: CONTENT_TYPE_SERIES,
    categoriesText: '',
  });

  const { data: series = [], isLoading } = useLiveEntityList({
    entity: base44.entities.Series,
    sortField: '-created_date',
  });

  const originalById = useMemo(
    () => Object.fromEntries(MOVIE_CATALOG.map((entry) => [entry.id, entry.cover_url || ''])),
    []
  );

  const duplicateTitles = useMemo(() => {
    const counts = new Map();
    series.forEach((item) => {
      const title = String(item.title || '').trim();
      if (!title) return;
      counts.set(title, (counts.get(title) || 0) + 1);
    });
    return new Set([...counts.entries()].filter(([, count]) => count > 1).map(([title]) => title));
  }, [series]);

  const invalidateSeriesQueries = async () => {
    await queryClient.invalidateQueries({ queryKey: ['adminSeries'] });
    await queryClient.invalidateQueries({ queryKey: ['series'] });
    await queryClient.invalidateQueries({ queryKey: ['featuredBanner'] });
  };

  const handleMutationSuccess = async (savedId, operationLabel) => {
    await invalidateSeriesQueries();
    if (saveActionRef.current === 'next') {
      return;
    }
    toast.success(`${operationLabel} com sucesso.`);
    closeDialog();
  };

  const createMut = useMutation({
    mutationFn: (data) => base44.entities.Series.create(data),
    onSuccess: async (created) => {
      await handleMutationSuccess(created?.id, 'Título salvo');
    },
  });

  const updateMut = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Series.update(id, data),
    onSuccess: async (updated) => {
      await handleMutationSuccess(updated?.id, 'Alteração salva');
    },
  });

  const deleteMut = useMutation({
    mutationFn: (id) => base44.entities.Series.delete(id),
    onSuccess: () => invalidateSeriesQueries(),
  });

  const openCreate = (asMovie = false) => {
    setEditing(null);
    setForm({
      title: '',
      description: '',
      category: '',
      year: '',
      cover_url: '',
      banner_url: '',
      videoUrl: '',
      trailerUrl: '',
      published: true,
      featured: false,
      age_rating: 'Livre',
      highlighted_home_section: null,
      content_type: asMovie ? CONTENT_TYPE_MOVIE : CONTENT_TYPE_SERIES,
      categoriesText: '',
    });
    setDialogOpen(true);
  };

  const openEdit = (s) => {
    setEditing(s);
    setForm({
      title: s.title || '',
      description: s.description || '',
      category: s.category || '',
      year: s.year || '',
      cover_url: s.cover_url || '',
      banner_url: s.banner_url || '',
      videoUrl: s.videoUrl || s.movie_url || '',
      trailerUrl: s.trailerUrl || s.trailer_url || '',
      published: s.published !== false,
      featured: s.featured || false,
      age_rating: s.age_rating || 'Livre',
      highlighted_home_section: s.highlighted_home_section || null,
      content_type: s.content_type === CONTENT_TYPE_MOVIE ? CONTENT_TYPE_MOVIE : CONTENT_TYPE_SERIES,
      categoriesText:
        Array.isArray(s.categories) && s.categories.length > 0
          ? s.categories.join('\n')
          : '',
    });
    setDialogOpen(true);
  };

  const openQueueItem = (item) => {
    if (!item) return;
    setCoverFilter('pending');
    setSearchTerm('');
    openEdit(item);
  };

  const resumeQueue = () => {
    if (typeof window === 'undefined') return;
    if (queueList.length === 0) {
      toast.success('Nenhum pendente restante.');
      return;
    }
    const savedId = window.localStorage.getItem(ADMIN_SERIES_QUEUE_STORAGE_KEY);
    const target = queueList.find((item) => item.id === savedId) || queueList[0];
    if (target) {
      openQueueItem(target);
      toast.success('Fila retomada.');
    }
  };

  const restartQueue = () => {
    if (typeof window === 'undefined') return;
    if (queueList.length === 0) {
      toast.success('Nenhum pendente restante.');
      return;
    }
    if (!window.confirm('Recomeçar a fila do início? A posição salva atual será resetada.')) {
      return;
    }
    window.localStorage.removeItem(ADMIN_SERIES_QUEUE_STORAGE_KEY);
    openQueueItem(queueList[0]);
    toast.success('Fila reiniciada do início.');
  };

  const closeDialog = () => { setDialogOpen(false); setEditing(null); };

  const handleSubmit = async (saveAction = 'close') => {
    try {
      saveActionRef.current = saveAction;
      const coverTrim = (form.cover_url || '').trim();
      const bannerTrim = (form.banner_url || '').trim();
      const resolvedCover = await resolveHostedImageUrl(coverTrim);
      const resolvedBanner = await resolveHostedImageUrl(bannerTrim);

      const badCover = getIndirectImageHostMessage(resolvedCover);
      const badBanner = getIndirectImageHostMessage(resolvedBanner);
      if (badCover) {
        toast.error('Capa: link inválido para imagem', { description: badCover });
        return;
      }
      if (badBanner) {
        toast.error('Banner: link inválido para imagem', { description: badBanner });
        return;
      }

      if (resolvedCover && resolvedCover !== coverTrim) {
        toast.success('Link da capa convertido automaticamente.');
      }
      if (resolvedBanner && resolvedBanner !== bannerTrim) {
        toast.success('Link do banner convertido automaticamente.');
      }

      const movieVideoError =
        form.content_type === CONTENT_TYPE_MOVIE
          ? getVideoValidationMessage(form.videoUrl)
          : '';
      const trailerError = getVideoValidationMessage(form.trailerUrl);
      if (movieVideoError) {
        toast.error('URL do filme inválida', { description: movieVideoError });
        return;
      }
      if (trailerError) {
        toast.error('URL do trailer inválida', { description: trailerError });
        return;
      }

      const data = { ...form, year: form.year ? Number(form.year) : undefined };
      delete data.categoriesText;
      delete data.videoUrl;
      delete data.trailerUrl;
      if (form.content_type === CONTENT_TYPE_MOVIE) {
        const cats = (form.categoriesText || '')
          .split('\n')
          .map((t) => t.trim())
          .filter(Boolean);
        data.categories = cats;
        data.category = cats.join(', ');
        Object.assign(
          data,
          normalizeVideoFields(
            {
              videoUrl: form.videoUrl,
              trailerUrl: form.trailerUrl,
            },
            { legacyField: 'movie_url' }
          )
        );
      } else {
        delete data.categories;
        data.videoUrl = '';
        data.trailerUrl = '';
        data.videoProvider = '';
        data.videoType = '';
        data.movie_url = '';
      }
      data.cover_url = resolvedCover;
      data.banner_url = resolvedBanner;
      if (editing) {
        const coverChanged = resolvedCover !== (editing.cover_url || '');
        if (coverChanged) {
          data.previous_cover_url = editing.cover_url || '';
          data.imageSource = resolvedCover ? 'manual_upload' : 'missing';
        } else if (editing.imageSource) {
          data.imageSource = editing.imageSource;
        }
      } else {
        data.imageSource = resolvedCover ? 'manual_upload' : 'missing';
      }
      if (editing && saveAction === 'next') {
        const currentIndex = queueList.findIndex((item) => item.id === editing.id);
        setQueueAdvanceRequest({
          completedId: editing.id,
          targetId:
            currentIndex >= 0
              ? (queueList[currentIndex + 1]?.id || queueList[currentIndex - 1]?.id || null)
              : null,
        });
      } else {
        setQueueAdvanceRequest(null);
      }
      if (editing) {
        updateMut.mutate({ id: editing.id, data });
      } else {
        createMut.mutate(data);
      }
    } catch (e) {
      toast.error('Não foi possível tratar o link da imagem.', {
        description: String(e.message || e),
      });
    }
  };

  const filteredList = series.filter((s) => {
    if (listFilter === 'series') return s.content_type !== CONTENT_TYPE_MOVIE;
    if (listFilter === 'movie') return s.content_type === CONTENT_TYPE_MOVIE;
    return true;
  }).filter((s) => {
    const meta = getSeriesCoverMeta(s, originalById, duplicateTitles);
    if (coverFilter === 'all') return true;
    if (coverFilter === 'pending') return meta.isPending;
    if (coverFilter === 'high' || coverFilter === 'medium' || coverFilter === 'low') {
      return meta.isPending && meta.priorityKey === coverFilter;
    }
    if (coverFilter === 'duplicate') return meta.isDuplicate;
    if (coverFilter === 'restored') return meta.statusKey === 'restored';
    return meta.statusKey === coverFilter;
  }).filter((s) => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return true;

    const searchable = [
      s.title,
      s.id,
      s.category,
      Array.isArray(s.categories) ? s.categories.join(', ') : '',
      s.year,
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();

    return searchable.includes(query);
  });

  const queueList = useMemo(
    () =>
      [...series]
        .filter((item) => getSeriesCoverMeta(item, originalById, duplicateTitles).isPending)
        .sort((a, b) => {
          const metaA = getSeriesCoverMeta(a, originalById, duplicateTitles);
          const metaB = getSeriesCoverMeta(b, originalById, duplicateTitles);
          const priorityDiff = getQueuePriority(a, metaA) - getQueuePriority(b, metaB);
          if (priorityDiff !== 0) return priorityDiff;
          const titleDiff = String(a.title || '').localeCompare(String(b.title || ''), 'pt-BR');
          if (titleDiff !== 0) return titleDiff;
          return String(a.id || '').localeCompare(String(b.id || ''), 'pt-BR');
        }),
    [series, originalById, duplicateTitles]
  );

  const currentPendingIndex = editing
    ? queueList.findIndex((item) => item.id === editing.id)
    : -1;

  const currentEditingMeta = editing
    ? getSeriesCoverMeta(editing, originalById, duplicateTitles)
    : null;

  const summary = useMemo(() => {
    const counts = {
      pending: 0,
      high: 0,
      medium: 0,
      low: 0,
      missing: 0,
      corrupted: 0,
      duplicate: 0,
      manual_upload: 0,
      restored: 0,
    };
    series.forEach((item) => {
      const meta = getSeriesCoverMeta(item, originalById, duplicateTitles);
      if (meta.isPending) counts.pending += 1;
      if (meta.isPending && meta.priorityKey === 'high') counts.high += 1;
      if (meta.isPending && meta.priorityKey === 'medium') counts.medium += 1;
      if (meta.isPending && meta.priorityKey === 'low') counts.low += 1;
      if (meta.statusKey === 'missing') counts.missing += 1;
      if (meta.statusKey === 'corrupted') counts.corrupted += 1;
      if (meta.isDuplicate) counts.duplicate += 1;
      if (meta.statusKey === 'manual_upload') counts.manual_upload += 1;
      if (meta.statusKey === 'restored') counts.restored += 1;
    });
    return counts;
  }, [series, originalById, duplicateTitles]);

  const detectedMovieSource =
    form.content_type === CONTENT_TYPE_MOVIE ? buildVideoSource(form.videoUrl) : null;

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!editing?.id) return;
    window.localStorage.setItem(ADMIN_SERIES_QUEUE_STORAGE_KEY, editing.id);
  }, [editing]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (queueList.length === 0) {
      window.localStorage.removeItem(ADMIN_SERIES_QUEUE_STORAGE_KEY);
      return;
    }
    if (hasAutoOpenedQueue) return;

    const savedId = window.localStorage.getItem(ADMIN_SERIES_QUEUE_STORAGE_KEY);
    const target = queueList.find((item) => item.id === savedId) || queueList[0];
    if (target) {
      openQueueItem(target);
    }
    setHasAutoOpenedQueue(true);
  }, [queueList, hasAutoOpenedQueue]);

  useEffect(() => {
    if (!queueAdvanceRequest) return;

    const target =
      queueList.find((item) => item.id === queueAdvanceRequest.targetId) ||
      queueList.find((item) => item.id !== queueAdvanceRequest.completedId) ||
      null;

    if (target) {
      openQueueItem(target);
      toast.success('Alteração salva com sucesso. Próximo item carregado.');
    } else {
      closeDialog();
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(ADMIN_SERIES_QUEUE_STORAGE_KEY);
      }
      toast.success('Alteração salva com sucesso. Nenhum pendente restante.');
    }

    saveActionRef.current = 'close';
    setQueueAdvanceRequest(null);
  }, [queueAdvanceRequest, queueList]);

  return (
    <div className="min-h-screen bg-[#0F0F0F] pt-20 md:pt-24 px-4 md:px-12">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
          <div className="flex items-center gap-4 flex-1">
            <Link to="/Admin" className="text-gray-400 hover:text-white"><ArrowLeft className="w-5 h-5" /></Link>
            <h1 className="text-2xl font-bold">Séries e Filmes</h1>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => openCreate(false)} className="bg-[#E50914] hover:bg-[#FF3D3D]">
              <Plus className="w-4 h-4 mr-2" /> Nova série
            </Button>
            <Button onClick={() => openCreate(true)} variant="outline" className="border-[#E50914] text-[#E50914] hover:bg-[#E50914]/10">
              <Plus className="w-4 h-4 mr-2" /> Novo filme
            </Button>
          </div>
        </div>

        <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
          {[
            { id: 'all', label: 'Todos' },
            { id: 'series', label: 'Séries' },
            { id: 'movie', label: 'Filmes' },
          ].map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setListFilter(t.id)}
              className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                listFilter === t.id ? 'bg-white text-black' : 'bg-[#1A1A1A] text-gray-400 hover:text-white'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <Input
            placeholder="Pesquisar desenhos, filmes, categorias..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-[#1A1A1A] border-white/10 text-white placeholder:text-gray-500"
          />
        </div>

        <div className="mb-6 rounded-xl border border-white/10 bg-[#151515] p-4 space-y-4">
          {queueList.length > 0 ? (
            <div className="rounded-lg border border-[#E50914]/30 bg-[#E50914]/5 px-3 py-2 text-sm text-gray-200">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <span>
                  Modo fila ativo: {editing && currentPendingIndex >= 0 ? `${currentPendingIndex + 1} de ${queueList.length}` : `1 de ${queueList.length}`} pendentes.
                </span>
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="border-white/10 bg-black/20"
                    onClick={resumeQueue}
                  >
                    Retomar fila
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="border-white/10 bg-black/20"
                    onClick={restartQueue}
                  >
                    Recomeçar do início
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300">
              Nenhum pendente restante
            </div>
          )}
          <div className="flex flex-wrap items-center gap-2">
            {COVER_FILTERS.map((filter) => (
              <button
                key={filter.id}
                type="button"
                onClick={() => setCoverFilter(filter.id)}
                className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  coverFilter === filter.id
                    ? 'bg-[#E50914] text-white'
                    : 'bg-[#222] text-gray-400 hover:text-white'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
          <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-6 text-xs">
            <div className="rounded-lg bg-black/20 px-3 py-2 text-gray-300">Pendentes: <strong>{summary.pending}</strong></div>
            <div className="rounded-lg bg-black/20 px-3 py-2 text-gray-300">Alta: <strong>{summary.high}</strong></div>
            <div className="rounded-lg bg-black/20 px-3 py-2 text-gray-300">Média: <strong>{summary.medium}</strong></div>
            <div className="rounded-lg bg-black/20 px-3 py-2 text-gray-300">Baixa: <strong>{summary.low}</strong></div>
            <div className="rounded-lg bg-black/20 px-3 py-2 text-gray-300">Faltando: <strong>{summary.missing}</strong></div>
            <div className="rounded-lg bg-black/20 px-3 py-2 text-gray-300">Corrompida: <strong>{summary.corrupted}</strong></div>
            <div className="rounded-lg bg-black/20 px-3 py-2 text-gray-300">Duplicada: <strong>{summary.duplicate}</strong></div>
            <div className="rounded-lg bg-black/20 px-3 py-2 text-gray-300">Manual: <strong>{summary.manual_upload}</strong></div>
            <div className="rounded-lg bg-black/20 px-3 py-2 text-gray-300">Restaurada: <strong>{summary.restored}</strong></div>
          </div>
        </div>

        <div className="space-y-3">
          {filteredList.map(s => {
            const meta = getSeriesCoverMeta(s, originalById, duplicateTitles);
            return (
            <div key={s.id} className={`flex items-center gap-4 p-4 rounded-lg transition-colors ${editing?.id === s.id ? 'bg-[#222] ring-1 ring-[#E50914]/40' : 'bg-[#1A1A1A] hover:bg-[#222]'}`}>
              <div className="shrink-0 w-16 h-24 rounded overflow-hidden bg-[#2A2A2A]">
                <AdminPosterThumb url={s.cover_url} title={s.title} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-semibold truncate">{s.title}</h3>
                  <Badge className={`border ${getStatusPillClasses(meta.statusKey)}`}>
                    {meta.statusLabel}
                  </Badge>
                  <Badge className={`border ${getPriorityBadgeClasses(meta.priorityKey)}`}>
                    {meta.priorityLabel}
                  </Badge>
                  {meta.isDuplicate && (
                    <Badge className="border border-orange-500/20 bg-orange-500/15 text-orange-300">
                      Título duplicado
                    </Badge>
                  )}
                  <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${s.content_type === CONTENT_TYPE_MOVIE ? 'bg-[#E50914]/20 text-[#E50914]' : 'bg-white/10 text-gray-400'}`}>
                    {s.content_type === CONTENT_TYPE_MOVIE ? 'Filme' : 'Série'}
                  </span>
                  {s.featured && <Star className="w-4 h-4 text-[#FFC107] fill-current shrink-0" />}
                  {!s.published && <EyeOff className="w-4 h-4 text-gray-500 shrink-0" />}
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  {(Array.isArray(s.categories) ? s.categories.join(', ') : s.category) || '—'} • {s.year} • {s.age_rating}
                </p>
                <div className="mt-2 grid gap-1 text-[11px] text-gray-500">
                  <p><span className="text-gray-400">ID:</span> <code>{s.id}</code></p>
                  <p><span className="text-gray-400">imageSource:</span> <code>{meta.imageSource}</code></p>
                  <p className="truncate"><span className="text-gray-400">cover_url:</span> <code>{meta.coverUrl || '—'}</code></p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {s.content_type !== CONTENT_TYPE_MOVIE && (
                  <Link to={`/AdminEpisodes?seriesId=${s.id}`} className="text-xs text-[#E50914] hover:text-[#FF3D3D] px-3 py-1 border border-[#E50914] rounded">
                    Episódios
                  </Link>
                )}
                <button onClick={() => openEdit(s)} className="p-2 text-gray-400 hover:text-white"><Pencil className="w-4 h-4" /></button>
                <button onClick={() => { if (confirm('Excluir série?')) deleteMut.mutate(s.id); }} className="p-2 text-gray-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          )})}
          {filteredList.length === 0 && !isLoading && (
            <div className="text-center py-12 text-gray-500">
              <p>Nenhum título neste filtro.</p>
              <div className="flex gap-2 justify-center mt-4">
                <Button onClick={() => openCreate(false)} className="bg-[#E50914] hover:bg-[#FF3D3D]">Nova série</Button>
                <Button onClick={() => openCreate(true)} variant="outline" className="border-gray-600">Novo filme</Button>
              </div>
            </div>
          )}
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="bg-[#1A1A1A] border-white/10 text-white max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editing
                  ? form.content_type === CONTENT_TYPE_MOVIE
                    ? 'Editar filme'
                    : 'Editar série'
                  : form.content_type === CONTENT_TYPE_MOVIE
                    ? 'Novo filme'
                    : 'Nova série'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {editing && (
                <div className="rounded-lg border border-white/10 bg-black/20 p-3 space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge className={`border ${getStatusPillClasses(currentEditingMeta?.statusKey)}`}>
                        {currentEditingMeta?.statusLabel}
                      </Badge>
                      <Badge className={`border ${getPriorityBadgeClasses(currentEditingMeta?.priorityKey)}`}>
                        {currentEditingMeta?.priorityLabel}
                      </Badge>
                      {currentEditingMeta?.isDuplicate && (
                        <Badge className="border border-orange-500/20 bg-orange-500/15 text-orange-300">
                          Título duplicado
                        </Badge>
                      )}
                    </div>
                    {currentPendingIndex >= 0 && (
                      <p className="text-xs text-gray-400">
                        {currentPendingIndex + 1} de {queueList.length} pendentes
                      </p>
                    )}
                  </div>
                  <div className="grid gap-1 text-[11px] text-gray-400">
                    <p><span className="text-gray-500">ID:</span> <code>{editing.id}</code></p>
                    <p><span className="text-gray-500">imageSource:</span> <code>{currentEditingMeta?.imageSource || '—'}</code></p>
                    <p className="break-all"><span className="text-gray-500">cover_url atual:</span> <code>{currentEditingMeta?.coverUrl || '—'}</code></p>
                  </div>
                  {currentPendingIndex >= 0 && (
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        disabled={currentPendingIndex <= 0}
                        className="border-white/10"
                        onClick={() => openQueueItem(queueList[currentPendingIndex - 1])}
                      >
                        Anterior
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        disabled={currentPendingIndex < 0 || currentPendingIndex >= queueList.length - 1}
                        className="border-white/10"
                        onClick={() => openQueueItem(queueList[currentPendingIndex + 1])}
                      >
                        Próximo
                      </Button>
                    </div>
                  )}
                </div>
              )}
              <div>
                <p className="text-xs text-gray-400 mb-1">Tipo de catálogo</p>
                <Select
                  value={form.content_type}
                  onValueChange={(v) => setForm({ ...form, content_type: v })}
                >
                  <SelectTrigger className="bg-[#2A2A2A] border-none">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={CONTENT_TYPE_SERIES}>Série (episódios)</SelectItem>
                    <SelectItem value={CONTENT_TYPE_MOVIE}>Filme (URL própria)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {form.content_type === CONTENT_TYPE_MOVIE && (
                <div className="rounded-lg border border-[#E50914]/40 bg-[#E50914]/5 p-4 space-y-2">
                  <p className="text-xs font-semibold text-[#E50914] uppercase tracking-wide">URL do filme</p>
                  <p className="text-[11px] text-gray-400 leading-snug">
                    Cole a URL do vídeo do filme. Bunny.net é prioridade, mas também aceitamos HLS, MP4, Vimeo, YouTube e embeds compatíveis.
                  </p>
                  <Input
                    placeholder="https://…"
                    value={form.videoUrl}
                    onChange={(e) => setForm({ ...form, videoUrl: e.target.value })}
                    className="bg-[#141414] border border-white/10 font-mono text-sm"
                  />
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div className="rounded-md bg-black/20 px-3 py-2 text-gray-300">
                      <span className="text-gray-500">Provedor:</span>{' '}
                      <strong>{detectedMovieSource?.provider || 'não detectado'}</strong>
                    </div>
                    <div className="rounded-md bg-black/20 px-3 py-2 text-gray-300">
                      <span className="text-gray-500">Tipo:</span>{' '}
                      <strong>{detectedMovieSource?.type || 'não detectado'}</strong>
                    </div>
                  </div>
                  <Input
                    placeholder="Trailer (opcional)"
                    value={form.trailerUrl}
                    onChange={(e) => setForm({ ...form, trailerUrl: e.target.value })}
                    className="bg-[#141414] border border-white/10 font-mono text-sm"
                  />
                  <p className="text-[11px] text-gray-500">
                    Detectado: {getVideoSourceLabel(detectedMovieSource)}
                  </p>
                </div>
              )}
              <Input placeholder="Título" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="bg-[#2A2A2A] border-none" />
              <Textarea placeholder="Descrição" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="bg-[#2A2A2A] border-none h-24" />
              {form.content_type === CONTENT_TYPE_MOVIE ? (
                <div>
                  <p className="text-xs text-gray-400 mb-1">Categorias Netflix (uma por linha — mesmo filme em várias fileiras)</p>
                  <Textarea
                    placeholder={`${L.mais}\n${L.pequenos}\n${L.edu}`}
                    value={form.categoriesText}
                    onChange={(e) => setForm({ ...form, categoriesText: e.target.value })}
                    className="bg-[#2A2A2A] border-none min-h-[120px] font-mono text-sm"
                  />
                </div>
              ) : (
                <Input
                  placeholder="Categorias (ex: Terror, Comédia)"
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="bg-[#2A2A2A] border-none"
                />
              )}
              <div className="grid grid-cols-2 gap-3">
                <Input placeholder="Ano" type="number" value={form.year} onChange={e => setForm({ ...form, year: e.target.value })} className="bg-[#2A2A2A] border-none" />
                <Select value={form.age_rating} onValueChange={v => setForm({ ...form, age_rating: v })}>
                  <SelectTrigger className="bg-[#2A2A2A] border-none"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {['Livre', '10+', '12+', '14+', '16+', '18+'].map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">
                  {form.content_type === CONTENT_TYPE_MOVIE ? 'Capa do filme' : 'Capa da série'}
                </p>
                <ImageUpload value={form.cover_url} onChange={v => setForm({ ...form, cover_url: v })} placeholder="Clique para enviar a capa" />
                <p className="text-xs text-gray-500 mt-2 mb-1">
                  Pode colar link direto ou página do ImgBB/Imgur/Postimages. Ao guardar, tentamos converter automaticamente `ibb.co/...`, `imgur.com/...` e `postimg.cc/...`.
                </p>
                <ManualImageUrlInput
                  value={form.cover_url}
                  onChange={(v) => setForm({ ...form, cover_url: v })}
                />
                <p className="text-[11px] text-emerald-400/80 mt-2">
                  Preview acima. Ao salvar, a capa será gravada para todos os utilizadores.
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">
                  {form.content_type === CONTENT_TYPE_MOVIE ? 'Banner do filme' : 'Banner'}
                </p>
                <ImageUpload value={form.banner_url} onChange={v => setForm({ ...form, banner_url: v })} placeholder="Clique para enviar o banner" />
                <p className="text-xs text-gray-500 mt-2 mb-1">
                  Pode colar link direto ou página do host. O banner usa a mesma conversão automática da capa.
                </p>
                <ManualImageUrlInput
                  value={form.banner_url}
                  onChange={(v) => setForm({ ...form, banner_url: v })}
                />
              </div>
              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 text-sm"><Switch checked={form.published} onCheckedChange={v => setForm({ ...form, published: v })} /> Publicada</label>
                <label className="flex items-center gap-2 text-sm"><Switch checked={form.featured} onCheckedChange={v => setForm({ ...form, featured: v })} /> Destaque</label>
              </div>
              <Select
                value={form.highlighted_home_section ? form.highlighted_home_section : HOME_SECTION_SELECT_NONE}
                onValueChange={(v) =>
                  setForm({
                    ...form,
                    highlighted_home_section: v === HOME_SECTION_SELECT_NONE ? null : v,
                  })
                }
              >
                <SelectTrigger className="bg-[#2A2A2A] border-none">
                  <SelectValue placeholder="Nenhuma seção especial" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={HOME_SECTION_SELECT_NONE}>Nenhuma seção especial</SelectItem>
                  {NETFLIX_HOME_ROW_ORDER.map(({ slug, label }) => (
                    <SelectItem key={slug} value={slug}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="grid gap-2 sm:grid-cols-2">
                <Button
                  onClick={() => {
                    handleSubmit('close');
                  }}
                  className="w-full bg-[#E50914] hover:bg-[#FF3D3D]"
                >
                  {editing ? 'Salvar Alterações' : 'Criar'}
                </Button>
                {editing && currentPendingIndex >= 0 ? (
                  <Button
                    variant="outline"
                    className="w-full border-white/10"
                    onClick={() => {
                      handleSubmit('next');
                    }}
                  >
                    Salvar e Próximo
                  </Button>
                ) : null}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}