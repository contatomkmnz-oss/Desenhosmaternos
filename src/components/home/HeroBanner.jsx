import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Play, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/** Troca automática de banner a cada 6s; ao mudar de slide manualmente, o cronómetro reinicia. */
const SLIDE_DURATION_MS = 6000;
const SWIPE_THRESHOLD_PX = 48;

/**
 * Hero da home — usa apenas `slides` normalizados (ver `heroBanners.js`).
 * Não lê catálogo, localStorage nem FeaturedBanner.
 */
export default function HeroBanner({ slides = [] }) {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);
  const [bannerFailed, setBannerFailed] = useState(false);
  const pointerStartX = useRef(null);

  const items = slides.filter(Boolean);
  const activeBannerSrc =
    items.length > 0 ? items[Math.min(current, items.length - 1)]?.banner_image : undefined;

  useEffect(() => {
    setCurrent(0);
  }, [items.length]);

  useEffect(() => {
    setBannerFailed(false);
  }, [current, activeBannerSrc]);

  useEffect(() => {
    if (items.length <= 1) return;
    const timer = setInterval(() => {
      setDirection(1);
      setCurrent((prev) => (prev + 1) % items.length);
    }, SLIDE_DURATION_MS);
    return () => clearInterval(timer);
  }, [items.length, current]);

  if (!items.length) return null;

  const slide = items[current];
  const bannerSrc = slide.banner_image;
  const slideVisualKey = `${slide.id}-${slide._image_version ?? ''}`;

  const goTo = (index) => {
    setDirection(index > current ? 1 : -1);
    setCurrent(index);
  };

  const goNext = () => {
    if (items.length <= 1) return;
    setDirection(1);
    setCurrent((prev) => (prev + 1) % items.length);
  };

  const goPrev = () => {
    if (items.length <= 1) return;
    setDirection(-1);
    setCurrent((prev) => (prev - 1 + items.length) % items.length);
  };

  const onPointerDown = (e) => {
    if (e.button !== undefined && e.button !== 0) return;
    pointerStartX.current = e.clientX;
  };

  const onPointerUp = (e) => {
    if (pointerStartX.current == null || items.length <= 1) return;
    const dx = e.clientX - pointerStartX.current;
    pointerStartX.current = null;
    if (Math.abs(dx) < SWIPE_THRESHOLD_PX) return;
    if (dx > 0) goPrev();
    else goNext();
  };

  const onPointerCancel = () => {
    pointerStartX.current = null;
  };

  const AssistirBtn = slide.playExternal ? (
    <a
      href={slide.playHref}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center justify-center gap-1.5 bg-white text-black px-3 py-2.5 md:px-6 md:py-3 rounded-md font-semibold text-sm md:text-base hover:bg-white/90 transition-all shadow-lg"
    >
      <Play className="w-4 h-4 md:w-5 md:h-5 fill-current" />
      Assistir
    </a>
  ) : (
    <Link
      to={slide.playHref}
      className="flex items-center justify-center gap-1.5 bg-white text-black px-3 py-2.5 md:px-6 md:py-3 rounded-md font-semibold text-sm md:text-base hover:bg-white/90 transition-all shadow-lg"
    >
      <Play className="w-4 h-4 md:w-5 md:h-5 fill-current" />
      Assistir
    </Link>
  );

  return (
    <div
      className="relative w-full h-[62svh] min-h-[420px] md:h-[95vh] overflow-hidden select-none"
      style={{ touchAction: 'manipulation' }}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onPointerLeave={onPointerCancel}
      onPointerCancel={onPointerCancel}
      role="region"
      aria-label="Destaques — arraste horizontalmente para mudar de banner"
    >
      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={slideVisualKey}
          custom={direction}
          variants={{
            enter: (d) => ({ x: d > 0 ? '8%' : '-8%', opacity: 0 }),
            center: { x: 0, opacity: 1 },
            exit: (d) => ({ x: d > 0 ? '-8%' : '8%', opacity: 0 }),
          }}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.6, ease: 'easeInOut' }}
          className="absolute inset-0 pointer-events-none"
        >
          {bannerSrc && !bannerFailed ? (
            <img
              key={slideVisualKey}
              src={bannerSrc}
              alt={slide.title}
              loading="eager"
              decoding="async"
              onError={() => setBannerFailed(true)}
              className="absolute inset-0 z-0 w-full h-full object-cover"
              style={{
                imageRendering: 'auto',
                objectPosition: slide.banner_object_position || 'center center',
              }}
            />
          ) : (
            <div className="absolute inset-0 z-0 bg-gradient-to-br from-[#1a0000] via-[#0F0F0F] to-[#1a1a00]" />
          )}
          <div className="absolute inset-0 z-[1] bg-gradient-to-t from-[#0F0F0F] via-[#0F0F0F]/40 to-transparent pointer-events-none" />
          <div className="absolute inset-0 z-[1] bg-gradient-to-r from-[#0F0F0F]/80 via-transparent to-transparent pointer-events-none" />
        </motion.div>
      </AnimatePresence>

      <div className="absolute bottom-0 left-0 right-0 z-20 pb-20 md:pb-24 px-4 md:px-12 pointer-events-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={slideVisualKey + '-content'}
            initial={{ y: 16, opacity: 1 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -8, opacity: 1 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="max-w-full pr-4 sm:pr-12 md:max-w-2xl text-white opacity-100"
            style={{ opacity: 1 }}
          >
            <h1 className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-black leading-[1.05] mb-3 md:mb-4 drop-shadow-2xl text-white">
              {slide.title}
            </h1>
            {slide.description && (
              <p
                className="text-gray-100 mb-4 leading-snug line-clamp-3 text-sm sm:text-base md:line-clamp-3 md:text-lg md:max-w-xl md:mb-6 md:leading-relaxed drop-shadow-md"
              >
                {slide.description}
              </p>
            )}
            <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-2.5 sm:gap-3">
              {AssistirBtn}
              {slide.detailHref && (
                <Link
                  to={slide.detailHref}
                  className="flex items-center justify-center gap-1.5 bg-white/20 backdrop-blur-sm text-white px-3 py-2.5 md:px-6 md:py-3 rounded-md font-semibold text-sm md:text-base hover:bg-white/30 transition-all whitespace-nowrap"
                >
                  <Info className="w-3 h-3 md:w-5 md:h-5" />
                  Mais Informações
                </Link>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2 mt-4 text-xs sm:text-sm text-gray-300">
              {slide.year !== '' && slide.year != null && <span>{slide.year}</span>}
              {slide.rating && (
                <span className="border border-gray-500 px-2 py-0.5 rounded text-gray-300">{slide.rating}</span>
              )}
              {slide.category && <span>{slide.category}</span>}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {items.length > 1 && (
        <div className="hidden md:flex absolute bottom-6 left-1/2 -translate-x-1/2 items-center gap-2 z-10">
          {items.map((item, i) => (
            <button
              key={item.id}
              type="button"
              onClick={() => goTo(i)}
              className="relative h-1 rounded-full overflow-hidden transition-all"
              style={{ width: i === current ? 32 : 8, background: 'rgba(255,255,255,0.3)' }}
            >
              {i === current && (
                <motion.div
                  key={current}
                  className="absolute inset-0 bg-white rounded-full"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: SLIDE_DURATION_MS / 1000, ease: 'linear' }}
                  style={{ transformOrigin: 'left' }}
                />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
