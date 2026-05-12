import React, { useEffect } from 'react';
import { X, Plus, Pencil, Trash2, Coins, Layers, Tag as TagIcon, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import NoteTooltip from './NoteTooltip';

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
}

export default function DailyDetailsModal({ isOpen, dayData, onClose, onAddTransaction, onEditTransaction, onDeleteTransaction, pixelPrice }) {
  // Close on escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    if (isOpen) document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  if (!isOpen || !dayData) return null;

  const fmtPixel = (val) => parseFloat((val || 0).toFixed(4)).toLocaleString('en-US', { maximumFractionDigits: 4 });
  const net = dayData.earnings - dayData.expenses;
  const netUsd = pixelPrice ? net * pixelPrice : null;

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center p-4 modal-backdrop"
      style={{ backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="modal-content bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700 shrink-0">
          <div>
            <h2 className="text-lg font-semibold text-slate-100">{formatDate(dayData.date)}</h2>
            <p className="text-xs text-slate-400 mt-0.5">Daily Summary & Transactions</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors">
            <X size={16} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1 flex flex-col gap-6">
          {/* Top Totals */}
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
              <div className="flex items-center gap-1.5 text-emerald-400 mb-1">
                <ArrowUpRight size={14} />
                <span className="text-xs font-semibold uppercase tracking-wider">Earnings</span>
              </div>
              <div className="text-xl font-bold text-emerald-300">{fmtPixel(dayData.earnings)}</div>
            </div>
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
              <div className="flex items-center gap-1.5 text-red-400 mb-1">
                <ArrowDownRight size={14} />
                <span className="text-xs font-semibold uppercase tracking-wider">Expenses</span>
              </div>
              <div className="text-xl font-bold text-red-300">{fmtPixel(dayData.expenses)}</div>
            </div>
            <div className="p-4 bg-violet-500/10 border border-violet-500/20 rounded-xl">
              <div className="flex items-center gap-1.5 text-violet-400 mb-1">
                <Coins size={14} />
                <span className="text-xs font-semibold uppercase tracking-wider">Net (PIXEL)</span>
              </div>
              <div className={`text-xl font-bold ${net >= 0 ? 'text-violet-300' : 'text-orange-300'}`}>
                {net >= 0 ? '+' : ''}{fmtPixel(net)}
              </div>
              {netUsd !== null && (
                <div className={`text-xs mt-0.5 ${net >= 0 ? 'text-sky-400' : 'text-orange-400'}`}>
                  {net >= 0 ? '+' : ''}${netUsd.toFixed(2)}
                </div>
              )}
            </div>
          </div>

          {/* Transactions List */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Transactions</h3>
              <button 
                onClick={() => onAddTransaction(dayData.date)} 
                className="btn-primary py-1 px-2.5 text-xs bg-violet-600 hover:bg-violet-500 text-white border-none"
              >
                <Plus size={12} className="mr-1" /> Add Transaction
              </button>
            </div>
            
            <div className="border border-slate-700 rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-slate-800/80 border-b border-slate-700 text-left text-xs uppercase text-slate-400">
                  <tr>
                    <th className="px-4 py-2 font-semibold">Type</th>
                    <th className="px-4 py-2 font-semibold">Tag</th>
                    <th className="px-4 py-2 font-semibold text-right">Amount</th>
                    <th className="px-4 py-2 font-semibold text-center">Note</th>
                    <th className="px-4 py-2 font-semibold text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/50">
                  {dayData.transactions.map((t) => (
                    <tr key={t._id} className="hover:bg-slate-700/30 transition-colors">
                      <td className="px-4 py-3">
                        {t.type === 'earning' ? (
                          <span className="inline-flex items-center gap-1 text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded text-xs font-medium">
                            <ArrowUpRight size={12} /> Earning
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-red-400 bg-red-400/10 px-2 py-0.5 rounded text-xs font-medium">
                            <ArrowDownRight size={12} /> Expense
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5 text-slate-300">
                          <TagIcon size={12} className="text-slate-500" />
                          <span>{t.tag || '—'}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-slate-200">
                        {fmtPixel(t.amount)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {t.note ? (
                          <NoteTooltip note={t.note} />
                        ) : (
                          <span className="text-slate-600">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button onClick={() => onEditTransaction(t)} className="p-1 text-slate-400 hover:text-violet-400 hover:bg-slate-700 rounded transition-colors" title="Edit">
                            <Pencil size={13} />
                          </button>
                          <button onClick={() => {
                            if (window.confirm('Delete this transaction?')) {
                              onDeleteTransaction(t._id);
                            }
                          }} className="p-1 text-slate-400 hover:text-red-400 hover:bg-slate-700 rounded transition-colors" title="Delete">
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {dayData.transactions.length === 0 && (
                    <tr>
                      <td colSpan="5" className="px-4 py-6 text-center text-slate-500 text-sm">
                        No transactions found for this day.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
