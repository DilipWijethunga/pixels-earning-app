import React from 'react';
import { TrendingUp, TrendingDown, Activity, DollarSign } from 'lucide-react';

function MetricCard({ label, value, subValue, icon: Icon, color, loading }) {
  if (loading) {
    return (
      <div className="card flex flex-col gap-3">
        <div className="skeleton h-4 w-24 rounded" />
        <div className="skeleton h-8 w-32 rounded" />
        <div className="skeleton h-3 w-20 rounded" />
      </div>
    );
  }

  return (
    <div className={`card flex flex-col gap-2 relative overflow-hidden group hover:border-slate-600 transition-all duration-300`}>
      <div className={`absolute top-0 right-0 w-24 h-24 rounded-full opacity-10 -translate-y-6 translate-x-6 ${color.bg}`} />
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-slate-400">{label}</span>
        <div className={`p-1.5 rounded-lg ${color.iconBg}`}>
          <Icon size={14} className={color.icon} />
        </div>
      </div>
      <div className={`text-2xl font-bold tracking-tight ${color.text}`}>{value}</div>
      {subValue && <div className="text-xs text-slate-500">{subValue}</div>}
    </div>
  );
}

export default function SummaryCards({ entries, pixelPrice, loading }) {
  const totalEarnings = entries.reduce((s, e) => s + (e.earnings || 0), 0);
  const totalExpenses = entries.reduce((s, e) => s + (e.expenses || 0), 0);
  const netPixel = totalEarnings - totalExpenses;
  const netUsd = pixelPrice ? netPixel * pixelPrice : null;

  const fmtPixel = (val) => {
    const num = parseFloat(val.toFixed(4));
    return num.toLocaleString('en-US', { maximumFractionDigits: 4 });
  };

  const fmtUsd = (val) =>
    val === null ? 'N/A' : `$${val.toFixed(2)}`;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <MetricCard
        label="Total Earnings"
        value={`${fmtPixel(totalEarnings)} PIXEL`}
        icon={TrendingUp}
        color={{
          bg: 'bg-emerald-500',
          iconBg: 'bg-emerald-500/20',
          icon: 'text-emerald-400',
          text: 'text-emerald-400',
        }}
        loading={loading}
      />
      <MetricCard
        label="Total Expenses"
        value={`${fmtPixel(totalExpenses)} PIXEL`}
        icon={TrendingDown}
        color={{
          bg: 'bg-red-500',
          iconBg: 'bg-red-500/20',
          icon: 'text-red-400',
          text: 'text-red-400',
        }}
        loading={loading}
      />
      <MetricCard
        label="Net $PIXEL"
        value={`${netPixel >= 0 ? '+' : ''}${fmtPixel(netPixel)} PIXEL`}
        icon={Activity}
        color={{
          bg: netPixel >= 0 ? 'bg-violet-500' : 'bg-orange-500',
          iconBg: netPixel >= 0 ? 'bg-violet-500/20' : 'bg-orange-500/20',
          icon: netPixel >= 0 ? 'text-violet-400' : 'text-orange-400',
          text: netPixel >= 0 ? 'text-violet-400' : 'text-orange-400',
        }}
        loading={loading}
      />
      <MetricCard
        label="Net USD"
        value={fmtUsd(netUsd)}
        subValue={pixelPrice ? `@ $${pixelPrice.toFixed(4)}/PIXEL` : 'Price loading...'}
        icon={DollarSign}
        color={{
          bg: 'bg-sky-500',
          iconBg: 'bg-sky-500/20',
          icon: 'text-sky-400',
          text: 'text-sky-300',
        }}
        loading={loading}
      />
    </div>
  );
}
