import React, { useState, useEffect, useRef } from 'react';
import { X, Calculator, Layers, Coins, DollarSign, ChevronRight } from 'lucide-react';

const TOTAL_SUPPLY = 4_000_000;
const STACK_SIZE   = 185.25;

export default function PixelCalculator({ isOpen, onClose, pixelPrice }) {
  const [inputValue, setInputValue] = useState('');
  const [result, setResult]         = useState(null);
  const inputRef = useRef(null);

  // Reset & focus when opened
  useEffect(() => {
    if (isOpen) {
      setInputValue('');
      setResult(null);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  const handleCalculate = () => {
    const val = parseFloat(inputValue);
    if (!val || val <= 0) return;
    const totalPixels = (val / TOTAL_SUPPLY) * STACK_SIZE;
    const totalStacks = totalPixels / STACK_SIZE;
    const totalUsd    = pixelPrice ? totalPixels * pixelPrice : null;
    setResult({ val, totalPixels, totalStacks, totalUsd });
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop"
      style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="modal-content bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-sm">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-700">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-violet-500/20 rounded-lg">
              <Calculator size={13} className="text-violet-400" />
            </div>
            <span className="text-sm font-semibold text-slate-100">Pixel Calculator</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors"
          >
            <X size={14} />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-4 flex flex-col gap-4">

          {/* Formula hint */}
          <p className="text-xs text-slate-500 font-mono bg-slate-700/40 rounded-lg px-3 py-2">
            (value ÷ 4,000,000) × 185.25 = PIXEL
          </p>

          {/* Input + button */}
          <div className="flex gap-2">
            <input
              ref={inputRef}
              id="calc-input"
              type="number"
              min="0"
              step="any"
              placeholder="Enter value…"
              value={inputValue}
              onChange={(e) => { setInputValue(e.target.value); setResult(null); }}
              onKeyDown={(e) => { if (e.key === 'Enter') handleCalculate(); }}
              className="input-field flex-1 text-sm"
            />
            <button
              id="calc-btn"
              onClick={handleCalculate}
              disabled={!inputValue || parseFloat(inputValue) <= 0}
              className="btn-primary text-sm shrink-0 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronRight size={14} />
              Calc
            </button>
          </div>

          {/* Results */}
          {result && (
            <div className="flex flex-col gap-2 animate-fade-in">
              {/* Total PIXEL */}
              <div className="flex items-center justify-between bg-violet-500/10 border border-violet-500/20 rounded-xl px-4 py-3">
                <div className="flex items-center gap-2 text-violet-400">
                  <Coins size={13} />
                  <span className="text-xs font-semibold">Total PIXEL</span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-violet-300">
                    {result.totalPixels.toLocaleString('en-US', { maximumFractionDigits: 4 })}
                  </div>
                  <div className="text-[10px] text-slate-600 font-mono">
                    ({result.val.toLocaleString()} / 4M) × 185.25
                  </div>
                </div>
              </div>

              {/* Total Stacks */}
              <div className="flex items-center justify-between bg-sky-500/10 border border-sky-500/20 rounded-xl px-4 py-3">
                <div className="flex items-center gap-2 text-sky-400">
                  <Layers size={13} />
                  <span className="text-xs font-semibold">Total Stacks</span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-sky-300">
                    {result.totalStacks.toLocaleString('en-US', { maximumFractionDigits: 4 })}
                  </div>
                  <div className="text-[10px] text-slate-600 font-mono">
                    {result.totalPixels.toFixed(4)} ÷ 185.25
                  </div>
                </div>
              </div>

              {/* USD Value */}
              <div className="flex items-center justify-between bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-3">
                <div className="flex items-center gap-2 text-emerald-400">
                  <DollarSign size={13} />
                  <span className="text-xs font-semibold">USD Value</span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-emerald-300">
                    {result.totalUsd === null
                      ? 'N/A'
                      : `$${result.totalUsd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                  </div>
                  <div className="text-[10px] text-slate-600 font-mono">
                    {result.totalPixels.toFixed(4)} × {pixelPrice ? `$${pixelPrice.toFixed(4)}` : 'N/A'}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
