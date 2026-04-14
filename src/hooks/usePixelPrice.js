import { useState, useEffect } from 'react';

export function usePixelPrice() {
  const [price, setPrice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchPrice = async () => {
    try {
      const res = await fetch('/api/pixel-price');
      if (!res.ok) throw new Error('Failed to fetch price');
      const data = await res.json();
      setPrice(data.price);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Price fetch error:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrice();
    const interval = setInterval(fetchPrice, 30000);
    return () => clearInterval(interval);
  }, []);

  return { price, loading, lastUpdated };
}
