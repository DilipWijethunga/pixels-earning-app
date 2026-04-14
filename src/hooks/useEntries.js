import { useState, useEffect, useCallback } from 'react';

// Safely parse JSON from an error response — falls back to a plain message
// if the body is HTML (e.g. Vite proxy 500 when backend is unreachable).
async function safeParseError(res, fallback) {
  try {
    const data = await res.json();
    return data.message || fallback;
  } catch {
    return fallback;
  }
}

export function useEntries(filter) {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const buildQueryString = useCallback(() => {
    const params = new URLSearchParams();
    if (filter.view === 'week') {
      params.set('week', 'true');
    } else if (filter.view === 'month') {
      params.set('month', String(filter.month));
      params.set('year', String(filter.year));
    } else if (filter.view === 'year') {
      params.set('year', String(filter.year));
    }
    return params.toString();
  }, [filter]);

  const fetchEntries = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const qs = buildQueryString();
      const res = await fetch(`/api/entries?${qs}`);
      if (!res.ok) throw new Error('Failed to fetch entries');
      const data = await res.json();
      setEntries(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [buildQueryString]);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  const createEntry = async (payload) => {
    const res = await fetch('/api/entries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const message = await safeParseError(res, 'Failed to create entry');
      throw new Error(message);
    }
    const saved = await res.json();
    await fetchEntries();
    return saved;
  };

  const updateEntry = async (id, payload) => {
    const res = await fetch(`/api/entries/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const message = await safeParseError(res, 'Failed to update entry');
      throw new Error(message);
    }
    await fetchEntries();
  };

  const deleteEntry = async (id) => {
    const res = await fetch(`/api/entries/${id}`, { method: 'DELETE' });
    if (!res.ok) {
      const message = await safeParseError(res, 'Failed to delete entry');
      throw new Error(message);
    }
    await fetchEntries();
  };

  return { entries, loading, error, refetch: fetchEntries, createEntry, updateEntry, deleteEntry };
}
