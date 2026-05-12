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
  const [entries, setEntries] = useState([]);         // Raw individual transactions
  const [groupedEntries, setGroupedEntries] = useState([]); // Grouped by day
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
      
      // Group by date (YYYY-MM-DD string)
      const grouped = {};
      data.forEach(entry => {
        const d = new Date(entry.date);
        const dateStr = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
        if (!grouped[dateStr]) {
          grouped[dateStr] = {
            id: dateStr, // Unique ID for the table row
            date: entry.date,
            earnings: 0,
            expenses: 0,
            transactions: []
          };
        }
        if (entry.type === 'earning') {
          grouped[dateStr].earnings += entry.amount;
        } else if (entry.type === 'expense') {
          grouped[dateStr].expenses += entry.amount;
        }
        grouped[dateStr].transactions.push(entry);
      });
      
      // Convert to array and sort by date descending
      const groupedArr = Object.values(grouped).sort((a, b) => new Date(b.date) - new Date(a.date));
      setGroupedEntries(groupedArr);

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

  return { entries, groupedEntries, loading, error, refetch: fetchEntries, createEntry, updateEntry, deleteEntry };
}
