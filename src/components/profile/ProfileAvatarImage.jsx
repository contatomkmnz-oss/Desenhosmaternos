import React, { useState } from 'react';
import { PROFILE_AVATAR_FALLBACK, normalizeProfileAvatarUrl } from '@/data/profileAvatars';

/**
 * Avatar com object-cover, fallback se a URL falhar (sem quebrar layout).
 */
export default function ProfileAvatarImage({
  src,
  alt = '',
  className = '',
  loading = 'lazy',
  decoding = 'async',
}) {
  const [failed, setFailed] = useState(false);
  const normalizedSrc = normalizeProfileAvatarUrl(src);
  const effective = failed || !normalizedSrc ? PROFILE_AVATAR_FALLBACK : normalizedSrc;

  return (
    <img
      src={effective}
      alt={alt}
      loading={loading}
      decoding={decoding}
      className={className}
      onError={() => {
        if (!failed) setFailed(true);
      }}
    />
  );
}
