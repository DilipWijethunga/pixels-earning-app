import React, { useState, useCallback } from 'react';
import { Plus, Coins, Calculator } from 'lucide-react';

import SummaryCards from './components/SummaryCards';
import FilterBar from './components/FilterBar';
import EntryTable from './components/EntryTable';
import AddEditModal from './components/AddEditModal';
import PriceBadge from './components/PriceBadge';
import PixelCalculator from './components/PixelCalculator';
import ToastContainer, { showToast } from './components/Toast';

import { useEntries } from './hooks/useEntries';
import { usePixelPrice } from './hooks/usePixelPrice';

const now = new Date();

function loadFilter() {
  try {
    const saved = localStorage.getItem('pixel-filter');
    if (saved) return JSON.parse(saved);
  } catch {}
  return {
    view: 'week',
    month: now.getMonth() + 1,
    year: now.getFullYear(),
  };
}

function saveFilter(f) {
  try {
    localStorage.setItem('pixel-filter', JSON.stringify(f));
  } catch {}
}

export default function App() {
  const [filter, setFilter] = useState(loadFilter);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [calcOpen, setCalcOpen] = useState(false);

  const handleFilterChange = useCallback((f) => {
    setFilter(f);
    saveFilter(f);
  }, []);

  const { entries, loading, createEntry, updateEntry, deleteEntry } = useEntries(filter);
  const { price: pixelPrice, loading: priceLoading } = usePixelPrice();

  const openAdd = () => {
    setSelectedEntry(null);
    setModalOpen(true);
  };

  const openEdit = (entry) => {
    setSelectedEntry(entry);
    setModalOpen(true);
  };

  const handleSave = async (payload) => {
    if (selectedEntry) {
      await updateEntry(selectedEntry._id, payload);
      showToast('Entry updated successfully!');
    } else {
      await createEntry(payload);
      showToast('Entry added successfully!');
    }
  };

  const handleDelete = async (id) => {
    await deleteEntry(id);
    showToast('Entry deleted.', 'error');
  };

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Navbar */}
      <header className="sticky top-0 z-30 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-violet-600/20 rounded-xl border border-violet-500/30">
              <Coins size={18} className="text-violet-400" />
            </div>
            <div>
              <h1 className="text-base font-bold text-slate-100 leading-none">Pixel Earnings</h1>
              <p className="text-xs text-slate-500 leading-none mt-0.5">Tracker</p>
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2">
            <PriceBadge price={pixelPrice} loading={priceLoading} />
            {/* Calculator icon-only button */}
            <button
              id="open-calc-btn"
              onClick={() => setCalcOpen(true)}
              className="p-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-violet-400 border border-slate-600 hover:border-violet-500/50 transition-all duration-200"
              title="Pixel Calculator"
            >
              <Calculator size={16} />
            </button>
            <button
              id="open-add-modal-btn"
              onClick={openAdd}
              className="btn-primary text-sm"
            >
              <Plus size={15} />
              <span className="hidden sm:inline">Add Entry</span>
              <span className="sm:hidden">Add</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex flex-col gap-6">
        {/* Filter bar */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-100">Dashboard</h2>
            <p className="text-sm text-slate-500 mt-0.5">Track your $PIXEL game earnings and expenses</p>
          </div>
          <FilterBar filter={filter} onChange={handleFilterChange} />
        </div>

        {/* Summary cards */}
        <SummaryCards entries={entries} pixelPrice={pixelPrice} loading={loading} />

        {/* Section header */}
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
            Entries
            {!loading && (
              <span className="ml-2 bg-slate-700 text-slate-400 text-xs font-normal px-2 py-0.5 rounded-full">
                {entries.length}
              </span>
            )}
          </h3>
          <p className="text-xs text-slate-600">Click a row to edit</p>
        </div>

        {/* Table */}
        <EntryTable
          entries={entries}
          loading={loading}
          pixelPrice={pixelPrice}
          onRowClick={openEdit}
          onDelete={handleDelete}
        />
      </main>

      {/* Modal */}
      <AddEditModal
        isOpen={modalOpen}
        entry={selectedEntry}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        onDelete={handleDelete}
      />

      {/* Calculator popup */}
      <PixelCalculator
        isOpen={calcOpen}
        onClose={() => setCalcOpen(false)}
        pixelPrice={pixelPrice}
      />

      {/* Toasts */}
      <ToastContainer />
    </div>
  );
}
