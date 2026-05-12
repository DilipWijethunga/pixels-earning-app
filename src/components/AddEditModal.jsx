import React, { useState, useEffect, useRef } from 'react';
import { X, Trash2, Save, Plus, AlertTriangle, Settings } from 'lucide-react';

function localDateString(date) {
  const d = date ? new Date(date) : new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

const defaultForm = (initialDate) => ({
  date: localDateString(initialDate || new Date()),
  type: 'earning',
  amount: '',
  tag: '',
  note: '',
});

export default function AddEditModal({ isOpen, entry, initialDate, onClose, onSave, tags, addTag, deleteTag }) {
  const [form, setForm] = useState(defaultForm(initialDate));
  const [saving, setSaving] = useState(false);
  
  const [newTagMode, setNewTagMode] = useState(false);
  const [newTagName, setNewTagName] = useState('');

  const firstInputRef = useRef(null);
  const isEdit = Boolean(entry);

  useEffect(() => {
    if (isOpen) {
      if (entry) {
        setForm({
          date: localDateString(entry.date),
          type: entry.type || 'earning',
          amount: entry.amount !== 0 ? String(entry.amount) : '',
          tag: entry.tag || '',
          note: entry.note || '',
        });
      } else {
        setForm(defaultForm(initialDate));
      }
      setNewTagMode(false);
      setNewTagName('');
      setTimeout(() => firstInputRef.current?.focus(), 50);
    }
  }, [isOpen, entry, initialDate]);

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    if (isOpen) document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddTag = async () => {
    if (!newTagName.trim()) return;
    try {
      await addTag(form.type, newTagName.trim());
      setForm(prev => ({ ...prev, tag: newTagName.trim() }));
      setNewTagMode(false);
      setNewTagName('');
    } catch (e) {
      alert("Failed to add tag. It might already exist.");
    }
  };

  const handleDeleteTag = async (tagId, e) => {
    e.preventDefault();
    e.stopPropagation();
    if (window.confirm("Delete this tag?")) {
      try {
        await deleteTag(tagId);
        setForm(prev => ({ ...prev, tag: '' }));
      } catch (err) {
        alert("Failed to delete tag");
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        date: new Date(form.date).toISOString(),
        type: form.type,
        amount: parseFloat(form.amount) || 0,
        tag: form.tag.trim(),
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

  if (!isOpen) return null;

  const relevantTags = tags.filter(t => t.type === form.type);

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 modal-backdrop"
      style={{ backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="modal-content bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-violet-500/20 rounded-lg">
              {isEdit ? <Save size={15} className="text-violet-400" /> : <Plus size={15} className="text-violet-400" />}
            </div>
            <h2 className="text-base font-semibold text-slate-100">
              {isEdit ? 'Edit Transaction' : 'Add Transaction'}
            </h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors">
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 flex flex-col gap-5">
          {/* Date & Type */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Date</label>
              <input
                ref={firstInputRef}
                type="date"
                value={form.date}
                onChange={(e) => handleChange('date', e.target.value)}
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="label">Type</label>
              <select
                value={form.type}
                onChange={(e) => {
                  handleChange('type', e.target.value);
                  handleChange('tag', ''); // Reset tag when type changes
                  setNewTagMode(false);
                }}
                className="input-field"
              >
                <option value="earning">Earning</option>
                <option value="expense">Expense</option>
              </select>
            </div>
          </div>

          {/* Amount & Tag */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Amount ($PIXEL)</label>
              <input
                type="number"
                min="0"
                step="any"
                placeholder="0"
                value={form.amount}
                onChange={(e) => handleChange('amount', e.target.value)}
                className="input-field"
                required
              />
            </div>
            <div className="flex flex-col">
              <label className="label flex justify-between items-center">
                <span>Tag</span>
                {!newTagMode && (
                  <button type="button" onClick={() => setNewTagMode(true)} className="text-[10px] text-violet-400 hover:text-violet-300">
                    + New
                  </button>
                )}
              </label>
              {newTagMode ? (
                <div className="flex gap-1 mt-1">
                  <input
                    type="text"
                    autoFocus
                    placeholder="New tag..."
                    value={newTagName}
                    onChange={(e) => setNewTagName(e.target.value)}
                    className="input-field py-1.5 text-xs flex-1"
                  />
                  <button type="button" onClick={handleAddTag} className="btn-primary px-2 py-1 bg-emerald-600 hover:bg-emerald-500 border-none text-white">
                    <Plus size={14} />
                  </button>
                  <button type="button" onClick={() => setNewTagMode(false)} className="btn-secondary px-2 py-1">
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <div className="relative mt-1">
                  <select
                    value={form.tag}
                    onChange={(e) => handleChange('tag', e.target.value)}
                    className="input-field py-2 pr-8"
                  >
                    <option value="">Select tag...</option>
                    {relevantTags.map(t => (
                      <option key={t._id} value={t.name}>{t.name}</option>
                    ))}
                  </select>
                  {/* Inline delete button if a valid tag is selected */}
                  {form.tag && relevantTags.find(t => t.name === form.tag) && (
                     <button 
                       type="button" 
                       onClick={(e) => handleDeleteTag(relevantTags.find(t => t.name === form.tag)._id, e)}
                       className="absolute right-6 top-1/2 -translate-y-1/2 p-1 text-slate-500 hover:text-red-400"
                       title="Delete Tag"
                     >
                       <Trash2 size={12} />
                     </button>
                  )}
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="label">Note (optional)</label>
            <textarea
              rows={2}
              placeholder="Any details..."
              value={form.note}
              onChange={(e) => handleChange('note', e.target.value)}
              className="input-field resize-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary text-sm">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary text-sm">
              {saving ? 'Saving...' : 'Save Transaction'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
