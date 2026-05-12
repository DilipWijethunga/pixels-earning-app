import { useState, useEffect, useCallback } from 'react';

export function useTags() {
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTags = useCallback(async () => {
    try {
      const res = await fetch('/api/tags');
      const data = await res.json();
      setTags(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTags();
  }, [fetchTags]);

  const addTag = async (type, name) => {
    const res = await fetch('/api/tags', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, name }),
    });
    if (!res.ok) throw new Error('Failed to add tag');
    await fetchTags();
  };

  const updateTag = async (id, name) => {
    const res = await fetch(`/api/tags/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    });
    if (!res.ok) throw new Error('Failed to update tag');
    await fetchTags();
  };

  const deleteTag = async (id) => {
    const res = await fetch(`/api/tags/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete tag');
    await fetchTags();
  };

  return { tags, loading, addTag, updateTag, deleteTag };
}
