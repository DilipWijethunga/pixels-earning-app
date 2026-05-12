import React, { useState, useCallback, useMemo } from 'react';
import { Plus, Coins, Calculator } from 'lucide-react';

import SummaryCards from './components/SummaryCards';
import FilterBar from './components/FilterBar';
import EntryTable from './components/EntryTable';
import AddEditModal from './components/AddEditModal';
import DailyDetailsModal from './components/DailyDetailsModal';
import PriceBadge from './components/PriceBadge';
import PixelCalculator from './components/PixelCalculator';
import ToastContainer, { showToast } from './components/Toast';

import { useEntries } from './hooks/useEntries';
import { usePixelPrice } from './hooks/usePixelPrice';
import { useTags } from './hooks/useTags';

const now = new Date();

function defaultFilter() {
  return {
    view: 'month',
    month: now.getMonth() + 1,
    year: now.getFullYear(),
  };
}

export default function App() {
  const [filter, setFilter] = useState(defaultFilter);
  const [selectedDayId, setSelectedDayId] = useState(null);
  
  const [addEditModalOpen, setAddEditModalOpen] = useState(false);
  const [transactionToEdit, setTransactionToEdit] = useState(null);
  const [initialDateForAdd, setInitialDateForAdd] = useState(null);
  const [calcOpen, setCalcOpen] = useState(false);

  const handleFilterChange = useCallback((f) => {
    setFilter(f);
  }, []);

  const { entries, groupedEntries, loading, createEntry, updateEntry, deleteEntry } = useEntries(filter);
  const { price: pixelPrice, loading: priceLoading } = usePixelPrice();
  const { tags, addTag, deleteTag } = useTags();

  // Find the selected day's data so the modal stays up to date when entries refetch
  const selectedDayData = useMemo(() => {
    if (!selectedDayId) return null;
    return groupedEntries.find(g => g.id === selectedDayId) || null;
  }, [groupedEntries, selectedDayId]);

  const openDayDetails = (dayData) => {
    setSelectedDayId(dayData.id);
  };

  const openAdd = (dateStr) => {
    setTransactionToEdit(null);
    setInitialDateForAdd(typeof dateStr === 'string' ? dateStr : null);
    setAddEditModalOpen(true);
  };

  const openEdit = (transaction) => {
    setTransactionToEdit(transaction);
    setAddEditModalOpen(true);
  };

  const handleSaveTransaction = async (payload) => {
    if (transactionToEdit) {
      await updateEntry(transactionToEdit._id, payload);
      showToast('Transaction updated successfully!');
    } else {
      await createEntry(payload);
      showToast('Transaction added successfully!');
    }
  };

  const handleDeleteTransaction = async (id) => {
    await deleteEntry(id);
    showToast('Transaction deleted.', 'error');
  };

  return (
    <div className="min-h-screen bg-slate-900">
      <header className="sticky top-0 z-30 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-violet-600/20 rounded-xl border border-violet-500/30">
              <Coins size={18} className="text-violet-400" />
            </div>
            <div>
              <h1 className="text-base font-bold text-slate-100 leading-none">Pixel Earnings</h1>
              <p className="text-xs text-slate-500 leading-none mt-0.5">Tracker</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <PriceBadge price={pixelPrice} loading={priceLoading} />
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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex flex-col gap-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-100">Dashboard</h2>
            <p className="text-sm text-slate-500 mt-0.5">Track your $PIXEL game earnings and expenses</p>
          </div>
          <FilterBar filter={filter} onChange={handleFilterChange} />
        </div>

        <SummaryCards entries={entries} pixelPrice={pixelPrice} loading={loading} />

        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
            Daily Summaries
          </h3>
          <p className="text-xs text-slate-600">Click a row to view all transactions</p>
        </div>

        {/* Table renders the Grouped entries */}
        <EntryTable
          entries={groupedEntries}
          loading={loading}
          pixelPrice={pixelPrice}
          onRowClick={openDayDetails}
        />
      </main>

      <DailyDetailsModal
        isOpen={Boolean(selectedDayId)}
        dayData={selectedDayData}
        onClose={() => setSelectedDayId(null)}
        onAddTransaction={openAdd}
        onEditTransaction={openEdit}
        onDeleteTransaction={handleDeleteTransaction}
        pixelPrice={pixelPrice}
      />

      <AddEditModal
        isOpen={addEditModalOpen}
        entry={transactionToEdit}
        initialDate={initialDateForAdd}
        onClose={() => setAddEditModalOpen(false)}
        onSave={handleSaveTransaction}
        tags={tags}
        addTag={addTag}
        deleteTag={deleteTag}
      />

      <PixelCalculator
        isOpen={calcOpen}
        onClose={() => setCalcOpen(false)}
        pixelPrice={pixelPrice}
      />

      <ToastContainer />
    </div>
  );
}
