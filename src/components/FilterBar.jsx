import React from 'react';
import { Calendar, BarChart2, BookOpen } from 'lucide-react';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const currentYear = new Date().getFullYear();
const YEARS = [currentYear - 1, currentYear, currentYear + 1];

export default function FilterBar({ filter, onChange }) {
  const views = [
    { id: 'week', label: 'This Week', icon: Calendar },
    { id: 'month', label: 'Monthly', icon: BookOpen },
    { id: 'year', label: 'Yearly', icon: BarChart2 },
  ];

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* View toggle */}
      <div className="flex items-center bg-slate-800 border border-slate-700 rounded-xl p-1 gap-1">
        {views.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            id={`filter-${id}`}
            onClick={() => onChange({ ...filter, view: id })}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
              filter.view === id
                ? 'bg-violet-600 text-white shadow-lg shadow-violet-900/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700'
            }`}
          >
            <Icon size={13} />
            {label}
          </button>
        ))}
      </div>

      {/* Month selector */}
      {filter.view === 'month' && (
        <select
          id="filter-month-select"
          value={filter.month}
          onChange={(e) => onChange({ ...filter, month: parseInt(e.target.value) })}
          className="input-field !w-auto text-sm py-1.5"
        >
          {MONTHS.map((m, i) => (
            <option key={m} value={i + 1}>{m}</option>
          ))}
        </select>
      )}

      {/* Year selector — shown for month and year views */}
      {(filter.view === 'month' || filter.view === 'year') && (
        <select
          id="filter-year-select"
          value={filter.year}
          onChange={(e) => onChange({ ...filter, year: parseInt(e.target.value) })}
          className="input-field !w-auto text-sm py-1.5"
        >
          {YEARS.map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
      )}
    </div>
  );
}
