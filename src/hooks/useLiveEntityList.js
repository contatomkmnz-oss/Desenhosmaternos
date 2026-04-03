import { useEffect, useState } from 'react';

export function useLiveEntityList({
  entity,
  query,
  sortField,
  limit,
  enabled = true,
  initialData = [],
}) {
  const [data, setData] = useState(initialData);
  const [isLoading, setIsLoading] = useState(enabled);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!enabled || !entity) {
      setData(initialData);
      setIsLoading(false);
      return () => {};
    }

    let cancelled = false;
    let unsubscribe = () => {};

    const load = async () => {
      setIsLoading(true);
      try {
        const rows = query
          ? await entity.filter(query, sortField, limit)
          : await entity.list(sortField, limit);

        if (!cancelled) {
          setData(rows);
          setError(null);
          setIsLoading(false);
        }

        unsubscribe = query
          ? entity.subscribe(query, sortField, limit, (nextRows) => {
              if (!cancelled) setData(nextRows);
            })
          : entity.subscribe((nextRows) => {
              if (!cancelled) setData(nextRows);
            }, sortField, limit);
      } catch (err) {
        if (!cancelled) {
          setError(err);
          setIsLoading(false);
        }
      }
    };

    void load();

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, [enabled, entity, limit, sortField, JSON.stringify(query)]);

  return { data, isLoading, error };
}
