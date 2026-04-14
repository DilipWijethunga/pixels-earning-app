import React, { useState } from 'react';
import { Pencil, AlertCircle, Inbox, Trash2 } from 'lucide-react';
import NoteTooltip from './NoteTooltip';

function SkeletonRow() {
  return (
    <tr>
      {[...Array(6)].map((_, i) => (
        <td key={i} className="px-4 py-3">
          <div className="skeleton h-4 rounded w-full" />
        </td>
      ))}
    </tr>
  );
}

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function EntryTable({ entries, loading, pixelPrice, onRowClick, onDelete }) {
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const fmtPixel = (val) =>
    parseFloat((val || 0).toFixed(4)).toLocaleString('en-US', { maximumFractionDigits: 4 });

  const fmtUsd = (pixelAmt) => {
    if (!pixelPrice) return '—';
    return `$${(pixelAmt * pixelPrice).toFixed(2)}`;
  };

  if (!loading && entries.length === 0) {
    return (
      <div className="card flex flex-col items-center justify-center py-20 gap-4">
        <div className="p-5 bg-slate-700/40 rounded-full">
          <Inbox size={40} className="text-slate-500" />
        </div>
        <div className="text-center">
          <p className="text-slate-300 font-medium text-lg">No entries yet</p>
          <p className="text-slate-500 text-sm mt-1">Add your first entry using the "+ Add Entry" button above.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card p-0 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-700 bg-slate-800/80 sticky top-0 z-10">
              <th className="text-left px-4 py-3.5 text-slate-400 font-semibold uppercase text-xs tracking-wider">Date</th>
              <th className="text-right px-4 py-3.5 text-slate-400 font-semibold uppercase text-xs tracking-wider">Earnings (PIXEL)</th>
              <th className="text-right px-4 py-3.5 text-slate-400 font-semibold uppercase text-xs tracking-wider">Expenses (PIXEL)</th>
              <th className="text-right px-4 py-3.5 text-slate-400 font-semibold uppercase text-xs tracking-wider">Net (PIXEL)</th>
              <th className="text-right px-4 py-3.5 text-slate-400 font-semibold uppercase text-xs tracking-wider">Net (USD)</th>
              <th className="text-center px-4 py-3.5 text-slate-400 font-semibold uppercase text-xs tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading
              ? [...Array(5)].map((_, i) => <SkeletonRow key={i} />)
              : entries.map((entry, idx) => {
                  const net = (entry.earnings || 0) - (entry.expenses || 0);
                  const netUsdAmt = pixelPrice ? net * pixelPrice : null;

                  return (
                    <tr
                      key={entry._id}
                      id={`entry-row-${entry._id}`}
                      onClick={() => { setConfirmDeleteId(null); onRowClick(entry); }}
                      className={`group cursor-pointer border-b border-slate-700/50 transition-colors duration-150 hover:bg-violet-500/10 ${
                        idx % 2 === 0 ? 'bg-slate-800/20' : 'bg-slate-800/40'
                      }`}
                    >
                      {/* Date */}
                      <td className="px-4 py-3.5 text-slate-300 font-medium whitespace-nowrap">
                        {formatDate(entry.date)}
                      </td>

                      {/* Earnings */}
                      <td className="px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <span className="text-emerald-400 font-medium">{fmtPixel(entry.earnings)}</span>
                          {entry.earningsNote && (
                            <NoteTooltip note={entry.earningsNote}>
                              <AlertCircle size={13} className="text-amber-400 cursor-help flex-shrink-0" />
                            </NoteTooltip>
                          )}
                        </div>
                      </td>

                      {/* Expenses */}
                      <td className="px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <span className="text-red-400 font-medium">{fmtPixel(entry.expenses)}</span>
                          {entry.expensesNote && (
                            <NoteTooltip note={entry.expensesNote}>
                              <AlertCircle size={13} className="text-amber-400 cursor-help flex-shrink-0" />
                            </NoteTooltip>
                          )}
                        </div>
                      </td>

                      {/* Net PIXEL */}
                      <td className={`px-4 py-3.5 text-right font-semibold ${net >= 0 ? 'text-violet-400' : 'text-orange-400'}`}>
                        {net >= 0 ? '+' : ''}{fmtPixel(net)}
                      </td>

                      {/* Net USD */}
                      <td className={`px-4 py-3.5 text-right font-medium ${netUsdAmt === null ? 'text-slate-500' : net >= 0 ? 'text-sky-400' : 'text-orange-400'}`}>
                        {netUsdAmt === null ? '—' : `${netUsdAmt >= 0 ? '+' : ''}$${netUsdAmt.toFixed(2)}`}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3.5 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* Edit */}
                          <button
                            id={`edit-btn-${entry._id}`}
                            onClick={(e) => { e.stopPropagation(); setConfirmDeleteId(null); onRowClick(entry); }}
                            className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg bg-violet-500/20 hover:bg-violet-500/40 text-violet-400 hover:text-violet-300 transition-all duration-200"
                            title="Edit entry"
                          >
                            <Pencil size={13} />
                          </button>

                          {/* Delete — two-click confirm */}
                          {confirmDeleteId === entry._id ? (
                            <button
                              id={`confirm-delete-btn-${entry._id}`}
                              onClick={(e) => { e.stopPropagation(); onDelete(entry._id); setConfirmDeleteId(null); }}
                              className="p-1.5 rounded-lg bg-red-500/30 hover:bg-red-500/50 text-red-300 text-xs font-medium px-2 flex items-center gap-1 transition-all duration-200"
                              title="Confirm delete"
                            >
                              Sure?
                            </button>
                          ) : (
                            <button
                              id={`delete-btn-${entry._id}`}
                              onClick={(e) => { e.stopPropagation(); setConfirmDeleteId(entry._id); }}
                              className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/40 text-red-400 hover:text-red-300 transition-all duration-200"
                              title="Delete entry"
                            >
                              <Trash2 size={13} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
