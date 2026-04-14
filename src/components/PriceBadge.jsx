import React from 'react';

export default function PriceBadge({ price, loading }) {
  if (loading) {
    return (
      <div className="flex items-center gap-2 bg-slate-800 border border-slate-700 rounded-full px-3 py-1.5">
        <div className="w-2 h-2 rounded-full bg-slate-600 animate-pulse" />
        <span className="text-xs text-slate-500">Loading price...</span>
      </div>
    );
  }

  if (!price) {
    return (
      <div className="flex items-center gap-2 bg-slate-800 border border-slate-700 rounded-full px-3 py-1.5">
        <div className="w-2 h-2 rounded-full bg-red-500" />
        <span className="text-xs text-slate-400">$PIXEL: unavailable</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 bg-slate-800 border border-slate-700 rounded-full px-3 py-1.5 group hover:border-emerald-500/50 transition-colors duration-300">
      <div className="relative">
        <div className="w-2 h-2 rounded-full bg-emerald-400" />
        <div className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-75" />
      </div>
      <span className="text-xs font-medium text-slate-300">
        $PIXEL:{' '}
        <span className="text-emerald-400 font-semibold">${price.toFixed(4)}</span>
      </span>
    </div>
  );
}
