import React, { useEffect, useMemo, useRef, useState } from 'react';
import Hls from 'hls.js';
import { AlertCircle, PlayCircle } from 'lucide-react';
import { buildVideoSource } from '@/lib/videoSource';

function PlayerFallback({ title, message }) {
  return (
    <div className="w-full h-full flex items-center justify-center bg-black text-center px-6">
      <div>
        <PlayCircle className="w-14 h-14 text-gray-600 mx-auto mb-4" />
        <p className="text-white font-medium mb-2">{title || 'Video indisponivel'}</p>
        <p className="text-sm text-gray-400">{message}</p>
      </div>
    </div>
  );
}

export default function SmartPlayer({
  source: sourceProp,
  url,
  title,
  poster,
  autoplay = false,
  onEnded,
  className = 'w-full h-full',
}) {
  const videoRef = useRef(null);
  const [playbackError, setPlaybackError] = useState('');
  const [mutedFallback, setMutedFallback] = useState(false);

  const source = useMemo(() => {
    if (sourceProp?.url) return sourceProp;
    return buildVideoSource(url);
  }, [sourceProp, url]);

  useEffect(() => {
    setPlaybackError('');
    setMutedFallback(false);
  }, [source?.url]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !source?.url || source.type !== 'hls') return undefined;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source.url;
      return undefined;
    }

    if (!Hls.isSupported()) {
      setPlaybackError('Este navegador nao suporta HLS para esta URL.');
      return undefined;
    }

    const hls = new Hls();
    hls.loadSource(source.url);
    hls.attachMedia(video);
    hls.on(Hls.Events.ERROR, (_event, data) => {
      if (data?.fatal) {
        setPlaybackError('Nao foi possivel reproduzir o stream HLS.');
      }
    });

    return () => {
      hls.destroy();
    };
  }, [source?.type, source?.url]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !source?.url) return undefined;
    if (source.type === 'embed' || source.type === 'play') return undefined;
    if (!autoplay) return undefined;

    let cancelled = false;

    const tryAutoplay = async () => {
      try {
        video.muted = false;
        await video.play();
      } catch {
        if (cancelled) return;
        try {
          setMutedFallback(true);
          video.muted = true;
          await video.play();
        } catch {
          if (!cancelled) {
            setPlaybackError('O navegador bloqueou a reprodução automática deste vídeo.');
          }
        }
      }
    };

    const timer = window.setTimeout(() => {
      void tryAutoplay();
    }, 80);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [autoplay, source?.type, source?.url]);

  if (!source?.url) {
    return (
      <PlayerFallback
        title={title}
        message="Nenhuma URL de video foi configurada para este conteudo."
      />
    );
  }

  if (playbackError) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-black text-center px-6">
        <div>
          <AlertCircle className="w-14 h-14 text-[#E50914] mx-auto mb-4" />
          <p className="text-white font-medium mb-2">{title || 'Erro de reproducao'}</p>
          <p className="text-sm text-gray-400">{playbackError}</p>
        </div>
      </div>
    );
  }

  if (
    source.type === 'embed' ||
    source.type === 'play' ||
    source.provider === 'youtube' ||
    source.provider === 'vimeo'
  ) {
    return (
      <iframe
        key={source.url}
        src={source.url}
        title={title || 'Video player'}
        className={className}
        frameBorder="0"
        scrolling="no"
        referrerPolicy="strict-origin-when-cross-origin"
        sandbox="allow-same-origin allow-scripts allow-popups allow-presentation allow-forms"
        allow="autoplay; encrypted-media; fullscreen; picture-in-picture; accelerometer; gyroscope"
        allowFullScreen
      />
    );
  }

  const directSourceType =
    source.type === 'hls'
      ? 'application/vnd.apple.mpegurl'
      : undefined;

  return (
    <div className="relative w-full h-full">
      <video
        key={source.url}
        ref={videoRef}
        className={className}
        controls
        autoPlay={autoplay}
        muted={mutedFallback}
        playsInline
        poster={poster || undefined}
        preload="auto"
        onEnded={onEnded}
        onError={() => setPlaybackError('Nao foi possivel carregar este video.')}
        {...{
          'x5-playsinline': 'true',
          'x5-video-player-type': 'h5',
          'x5-video-player-fullscreen': 'true',
        }}
      >
        {source.type !== 'hls' && <source src={source.url} type={directSourceType} />}
      </video>
      {mutedFallback && (
        <div className="absolute left-4 bottom-4 rounded-md bg-black/70 px-3 py-2 text-xs text-white">
          Reprodução automática iniciada sem som. Você pode ativar o áudio no player.
        </div>
      )}
    </div>
  );
}
