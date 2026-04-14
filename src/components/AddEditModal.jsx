import React, { useState, useEffect, useRef } from 'react';
import { X, Trash2, Save, Plus, AlertTriangle } from 'lucide-react';

function localDateString(date) {
  const d = date ? new Date(date) : new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

const defaultForm = () => ({
  date: localDateString(new Date()),
  earnings: '',
  earningsNote: '',
  expenses: '',
  expensesNote: '',
  note: '',
});

export default function AddEditModal({ isOpen, entry, onClose, onSave, onDelete }) {
  const [form, setForm] = useState(defaultForm());
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const firstInputRef = useRef(null);

  const isEdit = Boolean(entry);

  useEffect(() => {
    if (isOpen) {
      if (entry) {
        setForm({
          date: localDateString(entry.date),
          earnings: entry.earnings !== 0 ? String(entry.earnings) : '',
          earningsNote: entry.earningsNote || '',
          expenses: entry.expenses !== 0 ? String(entry.expenses) : '',
          expensesNote: entry.expensesNote || '',
          note: entry.note || '',
        });
      } else {
        setForm(defaultForm());
      }
      setConfirmDelete(false);
      // Focus first field after open
      setTimeout(() => firstInputRef.current?.focus(), 50);
    }
  }, [isOpen, entry]);

  // Close on escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    if (isOpen) document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        date: new Date(form.date).toISOString(),
        earnings: parseFloat(form.earnings) || 0,
        earningsNote: form.earningsNote.trim(),
        expenses: parseFloat(form.expenses) || 0,
        expensesNote: form.expensesNote.trim(),
        note: form.note.trim(),
      };
      await onSave(payload);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    setDeleting(true);
    try {
      await onDelete(entry._id);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setDeleting(false);
      setConfirmDelete(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop"
      style={{ backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="modal-content bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-violet-500/20 rounded-lg">
              {isEdit ? <Save size={15} className="text-violet-400" /> : <Plus size={15} className="text-violet-400" />}
            </div>
            <h2 className="text-base font-semibold text-slate-100">
              {isEdit ? 'Edit Entry' : 'Add Entry'}
            </h2>
          </div>
          <button
            id="modal-close-btn"
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-5 flex flex-col gap-4">
          {/* Date */}
          <div>
            <label className="label">Date</label>
            <input
              ref={firstInputRef}
              id="entry-date"
              type="date"
              value={form.date}
              onChange={(e) => handleChange('date', e.target.value)}
              className="input-field"
              required
            />
          </div>

          {/* Earnings + Expenses side by side */}
          <div className="grid grid-cols-2 gap-4">
            {/* Earnings — left */}
            <div className="flex flex-col gap-3 p-4 bg-slate-700/30 rounded-xl border border-emerald-500/20">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-emerald-400" />
                <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Earnings</span>
              </div>
              <div>
                <label className="label">Amount ($PIXEL)</label>
                <input
                  id="entry-earnings"
                  type="number"
                  min="0"
                  step="any"
                  placeholder="0"
                  value={form.earnings}
                  onChange={(e) => handleChange('earnings', e.target.value)}
                  className="input-field"
                />
              </div>
              <div className="flex-1 flex flex-col">
                <label className="label">Note (optional)</label>
                <textarea
                  id="entry-earnings-note"
                  rows={3}
                  placeholder="e.g. Ronin quest rewards"
                  value={form.earningsNote}
                  onChange={(e) => handleChange('earningsNote', e.target.value)}
                  className="input-field resize-none flex-1"
                />
              </div>
            </div>

            {/* Expenses — right */}
            <div className="flex flex-col gap-3 p-4 bg-slate-700/30 rounded-xl border border-red-500/20">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-red-400" />
                <span className="text-xs font-semibold text-red-400 uppercase tracking-wider">Expenses</span>
              </div>
              <div>
                <label className="label">Amount ($PIXEL)</label>
                <input
                  id="entry-expenses"
                  type="number"
                  min="0"
                  step="any"
                  placeholder="0"
                  value={form.expenses}
                  onChange={(e) => handleChange('expenses', e.target.value)}
                  className="input-field"
                />
              </div>
              <div className="flex-1 flex flex-col">
                <label className="label">Note (optional)</label>
                <textarea
                  id="entry-expenses-note"
                  rows={3}
                  placeholder="e.g. Land rental fee"
                  value={form.expensesNote}
                  onChange={(e) => handleChange('expensesNote', e.target.value)}
                  className="input-field resize-none flex-1"
                />
              </div>
            </div>
          </div>

          {/* General note — full width */}
          <div>
            <label className="label flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400 inline-block" />
              Entry Note
              <span className="text-slate-600 font-normal normal-case tracking-normal">(optional)</span>
            </label>
            <textarea
              id="entry-note"
              rows={2}
              placeholder="Any general note for this entry…"
              value={form.note}
              onChange={(e) => handleChange('note', e.target.value)}
              className="input-field resize-none"
            />
          </div>

          {/* Footer buttons */}
          <div className="flex items-center gap-3 pt-1">
            {isEdit && (
              <button
                type="button"
                id="delete-entry-btn"
                onClick={handleDelete}
                disabled={deleting}
                className={`btn-danger flex items-center gap-1.5 ${confirmDelete ? 'bg-red-600/40 text-red-300' : ''}`}
              >
                {confirmDelete ? (
                  <>
                    <AlertTriangle size={13} />
                    {deleting ? 'Deleting...' : 'Confirm Delete'}
                  </>
                ) : (
                  <>
                    <Trash2 size={13} />
                    Delete
                  </>
                )}
              </button>
            )}
            <div className="flex-1" />
            <button
              type="button"
              id="modal-cancel-btn"
              onClick={onClose}
              className="btn-secondary text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              id="modal-submit-btn"
              disabled={saving}
              className="btn-primary text-sm"
            >
              {saving ? 'Saving...' : isEdit ? 'Update Entry' : 'Save Entry'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
