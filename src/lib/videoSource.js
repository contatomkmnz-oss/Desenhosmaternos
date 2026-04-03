function extractIframeSrc(value) {
  const input = String(value || '').trim();
  if (!input) return '';
  const match = input.match(/\ssrc=["']([^"']+)["']/i);
  return match?.[1] || input;
}

function safeDecodeUrl(value) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function toUrl(value) {
  try {
    return new URL(value);
  } catch {
    return null;
  }
}

function withQueryParams(url, params) {
  const parsed = toUrl(url);
  if (!parsed) return url;

  Object.entries(params).forEach(([key, value]) => {
    parsed.searchParams.set(key, String(value));
  });

  return parsed.toString();
}

export function normalizeVideoUrl(value) {
  const extracted = extractIframeSrc(value);
  return safeDecodeUrl(extracted).trim();
}

export function isValidExternalVideoUrl(value) {
  const normalized = normalizeVideoUrl(value);
  const parsed = toUrl(normalized);
  return Boolean(parsed && /^https?:$/i.test(parsed.protocol));
}

export function detectVideoProvider(value) {
  const url = normalizeVideoUrl(value);
  if (!url) return '';

  const lower = url.toLowerCase();

  if (
    lower.includes('mediadelivery.net') ||
    lower.includes('b-cdn.net') ||
    lower.includes('bunnycdn.com')
  ) {
    return 'bunny';
  }
  if (lower.includes('youtube.com') || lower.includes('youtu.be')) {
    return 'youtube';
  }
  if (lower.includes('vimeo.com') || lower.includes('player.vimeo.com')) {
    return 'vimeo';
  }
  if (lower.includes('drive.google.com')) {
    return 'google-drive';
  }

  return 'generic';
}

export function detectVideoType(value) {
  const url = normalizeVideoUrl(value);
  if (!url) return '';

  const lower = url.toLowerCase();

  if (lower.includes('player.mediadelivery.net/play/')) {
    return 'play';
  }

  if (/\.m3u8(\?|#|$)/i.test(lower)) {
    return 'hls';
  }
  if (/\.(mp4|webm|ogg|mov|m4v)(\?|#|$)/i.test(lower)) {
    return 'file';
  }
  if (
    lower.includes('/embed/') ||
    lower.includes('player.') ||
    lower.includes('/preview') ||
    lower.includes('youtube.com/embed') ||
    lower.includes('player.vimeo.com/video/')
  ) {
    return 'embed';
  }
  if (lower.includes('mediadelivery.net')) {
    return 'embed';
  }
  if (lower.includes('drive.google.com')) {
    return 'embed';
  }

  return 'generic';
}

function normalizeDriveUrl(url) {
  const fileMatch = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
  if (fileMatch) {
      return withQueryParams(
        `https://drive.google.com/file/d/${fileMatch[1]}/preview`,
        { autoplay: 1 }
      );
  }
  const parsed = toUrl(url);
  const id = parsed?.searchParams.get('id');
  if (id) {
    return withQueryParams(
      `https://drive.google.com/file/d/${id}/preview`,
      { autoplay: 1 }
    );
  }
  return withQueryParams(url, { autoplay: 1 });
}

function normalizeYoutubeUrl(url) {
  const parsed = toUrl(url);
  if (!parsed) return url;

  if (parsed.hostname === 'youtu.be') {
    const id = parsed.pathname.replace(/^\/+/, '');
    if (id) {
      return withQueryParams(`https://www.youtube-nocookie.com/embed/${id}`, {
        autoplay: 1,
        playsinline: 1,
        rel: 0,
        modestbranding: 1,
        controls: 1,
        iv_load_policy: 3,
      });
    }
  }

  if (parsed.hostname.includes('youtube.com')) {
    const id =
      parsed.searchParams.get('v') ||
      parsed.pathname.match(/\/embed\/([^/?]+)/)?.[1];
    if (id) {
      return withQueryParams(`https://www.youtube-nocookie.com/embed/${id}`, {
        autoplay: 1,
        playsinline: 1,
        rel: 0,
        modestbranding: 1,
        controls: 1,
        iv_load_policy: 3,
      });
    }
  }

  return url;
}

function normalizeVimeoUrl(url) {
  const match = url.match(/vimeo\.com\/(?:video\/)?(\d+)/i);
  if (match) {
    return withQueryParams(`https://player.vimeo.com/video/${match[1]}`, {
      autoplay: 1,
      autopause: 0,
      title: 0,
      byline: 0,
      portrait: 0,
    });
  }
  return withQueryParams(url, {
    autoplay: 1,
    autopause: 0,
    title: 0,
    byline: 0,
    portrait: 0,
  });
}

function normalizeBunnyUrl(url, type) {
  if (type === 'play' || type === 'embed') {
    return withQueryParams(url, {
      autoplay: 'true',
    });
  }
  return url;
}

export function buildVideoSource(valueOrData) {
  const rawUrl =
    typeof valueOrData === 'string'
      ? valueOrData
      : valueOrData?.videoUrl ||
        valueOrData?.video_url ||
        valueOrData?.movie_url ||
        '';

  const url = normalizeVideoUrl(rawUrl);
  if (!url) return null;

  const provider =
    typeof valueOrData === 'string'
      ? detectVideoProvider(url)
      : valueOrData?.videoProvider ||
        valueOrData?.video_provider ||
        detectVideoProvider(url);

  const type =
    typeof valueOrData === 'string'
      ? detectVideoType(url)
      : valueOrData?.videoType ||
        valueOrData?.video_type ||
        detectVideoType(url);

  let normalizedUrl = url;
  if (provider === 'bunny') normalizedUrl = normalizeBunnyUrl(url, type);
  if (provider === 'google-drive') normalizedUrl = normalizeDriveUrl(url);
  if (provider === 'youtube') normalizedUrl = normalizeYoutubeUrl(url);
  if (provider === 'vimeo') normalizedUrl = normalizeVimeoUrl(url);

  return {
    url: normalizedUrl,
    provider,
    type,
    trailerUrl:
      typeof valueOrData === 'string'
        ? ''
        : valueOrData?.trailerUrl || valueOrData?.trailer_url || '',
  };
}

export function normalizeVideoFields(value, { legacyField = 'video_url' } = {}) {
  const source = buildVideoSource(value);
  const url = source?.url || '';
  const provider = source?.provider || '';
  const type = source?.type || '';
  const trailerUrl =
    typeof value === 'string' ? '' : (value?.trailerUrl || value?.trailer_url || '').trim();

  return {
    videoUrl: url,
    trailerUrl,
    videoProvider: provider,
    videoType: type,
    [legacyField]: url,
    video_url: legacyField === 'video_url' ? url : (typeof value === 'string' ? '' : value?.video_url || ''),
    movie_url: legacyField === 'movie_url' ? url : (typeof value === 'string' ? '' : value?.movie_url || ''),
  };
}

export function getVideoValidationMessage(value) {
  if (!value) return '';
  if (!isValidExternalVideoUrl(value)) {
    return 'Use uma URL externa valida com http ou https.';
  }
  return '';
}

export function getVideoSourceLabel(source) {
  if (!source?.url) return 'Nao detectado';
  const provider = source.provider || 'generic';
  const type = source.type || 'generic';
  return `${provider} / ${type}`;
}
