import { useState, useCallback } from 'react';

// ── Generic async API hook ─────────────────────────────────────
export function useApi() {
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);

  const execute = useCallback(async (apiCall, onSuccess, onError) => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiCall();
      if (onSuccess) onSuccess(res.data?.data ?? res.data);
      return res.data?.data ?? res.data;
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Something went wrong';
      setError(msg);
      if (onError) onError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  const clearError = useCallback(() => setError(null), []);

  return { loading, error, execute, clearError };
}

// ── Pagination hook ────────────────────────────────────────────
export function usePagination(items = [], pageSize = 8) {
  const [page, setPage] = useState(1);

  const totalPages  = Math.max(1, Math.ceil(items.length / pageSize));
  const safePage    = Math.min(page, totalPages);
  const start       = (safePage - 1) * pageSize;
  const pageItems   = items.slice(start, start + pageSize);

  const goTo    = (p) => setPage(Math.max(1, Math.min(p, totalPages)));
  const next    = () => goTo(safePage + 1);
  const prev    = () => goTo(safePage - 1);
  const reset   = () => setPage(1);

  return { page: safePage, totalPages, pageItems, goTo, next, prev, reset };
}

// ── Search / Filter hook ───────────────────────────────────────
export function useSearch(items = [], fields = []) {
  const [query, setQuery] = useState('');

  const filtered = query.trim()
    ? items.filter(item =>
        fields.some(field => {
          const val = field.split('.').reduce((o, k) => o?.[k], item);
          return String(val ?? '').toLowerCase().includes(query.toLowerCase());
        })
      )
    : items;

  return { query, setQuery, filtered };
}
