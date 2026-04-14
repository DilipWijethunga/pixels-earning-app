import React, { useState, useCallback, useEffect } from 'react';
import { CheckCircle, XCircle, X } from 'lucide-react';

let toastCounter = 0;

// Singleton toast manager for external use
let _addToast = null;

export function showToast(message, type = 'success') {
  if (_addToast) _addToast(message, type);
}

export default function ToastContainer() {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'success') => {
    const id = ++toastCounter;
    setToasts((prev) => [...prev, { id, message, type, exiting: false }]);
    setTimeout(() => {
      setToasts((prev) => prev.map((t) => (t.id === id ? { ...t, exiting: true } : t)));
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 350);
    }, 3500);
  }, []);

  useEffect(() => {
    _addToast = addToast;
    return () => { _addToast = null; };
  }, [addToast]);

  const dismiss = (id) => {
    setToasts((prev) => prev.map((t) => (t.id === id ? { ...t, exiting: true } : t)));
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 350);
  };

  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl border shadow-xl backdrop-blur-sm max-w-xs ${
            toast.type === 'success'
              ? 'bg-slate-800/95 border-emerald-500/40 text-slate-200'
              : 'bg-slate-800/95 border-red-500/40 text-slate-200'
          } ${toast.exiting ? 'toast-exit' : 'toast-enter'}`}
        >
          {toast.type === 'success' ? (
            <CheckCircle size={16} className="text-emerald-400 flex-shrink-0" />
          ) : (
            <XCircle size={16} className="text-red-400 flex-shrink-0" />
          )}
          <span className="text-sm font-medium flex-1">{toast.message}</span>
          <button onClick={() => dismiss(toast.id)} className="text-slate-500 hover:text-slate-300 transition-colors">
            <X size={13} />
          </button>
        </div>
      ))}
    </div>
  );
}
