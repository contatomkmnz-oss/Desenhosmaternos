import { useMemo } from 'react';
import { shuffleArray } from '@/lib/shuffle';

/**
 * Embaralha filmes; nova ordem quando o array de itens muda ou `locationKey` (ex.: nova visita à Home).
 * Passe `movies` memoizado no pai para evitar baralhar sem necessidade.
 */
export function useShuffledMovies(items, locationKey) {
  return useMemo(() => {
    if (!items?.length) return [];
    return shuffleArray(items);
  }, [items, locationKey]);
}
