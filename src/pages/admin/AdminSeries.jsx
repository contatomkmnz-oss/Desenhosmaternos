import React, { useState } from 'react';

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
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import ImageUpload from '@/components/admin/ImageUpload';
import { CONTENT_TYPE_MOVIE, CONTENT_TYPE_SERIES } from '@/constants/contentType';
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

export default function AdminSeries() {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [listFilter, setListFilter] = useState('all'); // all | series | movie
  const [searchTerm, setSearchTerm] = useState('');
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

  const invalidateSeriesQueries = async () => {
    await queryClient.invalidateQueries({ queryKey: ['adminSeries'] });
    await queryClient.invalidateQueries({ queryKey: ['series'] });
    await queryClient.invalidateQueries({ queryKey: ['featuredBanner'] });
  };

  const createMut = useMutation({
    mutationFn: (data) => base44.entities.Series.create(data),
    onSuccess: async () => {
      await invalidateSeriesQueries();
      closeDialog();
    },
  });

  const updateMut = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Series.update(id, data),
    onSuccess: async () => {
      await invalidateSeriesQueries();
      closeDialog();
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

  const closeDialog = () => { setDialogOpen(false); setEditing(null); };

  const handleSubmit = async () => {
    try {
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
    const query = searchTerm.trim().toLowerCase();
    if (!query) return true;

    const searchable = [
      s.title,
      s.category,
      Array.isArray(s.categories) ? s.categories.join(', ') : '',
      s.year,
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();

    return searchable.includes(query);
  });

  const detectedMovieSource =
    form.content_type === CONTENT_TYPE_MOVIE ? buildVideoSource(form.videoUrl) : null;

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

        <div className="space-y-3">
          {filteredList.map(s => (
            <div key={s.id} className="flex items-center gap-4 p-4 bg-[#1A1A1A] rounded-lg hover:bg-[#222] transition-colors">
              <div className="shrink-0 w-16 h-24 rounded overflow-hidden bg-[#2A2A2A]">
                <AdminPosterThumb url={s.cover_url} title={s.title} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-semibold truncate">{s.title}</h3>
                  <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${s.content_type === CONTENT_TYPE_MOVIE ? 'bg-[#E50914]/20 text-[#E50914]' : 'bg-white/10 text-gray-400'}`}>
                    {s.content_type === CONTENT_TYPE_MOVIE ? 'Filme' : 'Série'}
                  </span>
                  {s.featured && <Star className="w-4 h-4 text-[#FFC107] fill-current shrink-0" />}
                  {!s.published && <EyeOff className="w-4 h-4 text-gray-500 shrink-0" />}
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  {(Array.isArray(s.categories) ? s.categories.join(', ') : s.category) || '—'} • {s.year} • {s.age_rating}
                </p>
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
          ))}
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
              <Button onClick={handleSubmit} className="w-full bg-[#E50914] hover:bg-[#FF3D3D]">
                {editing ? 'Salvar Alterações' : 'Criar'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}