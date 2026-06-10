import { useState, useEffect, useCallback } from 'react';

// Event-bus approach: toast functions are callable anywhere without a hook
const listeners = new Set();
let uid = 0;

function emit(type, message, duration = 4000) {
  const id = ++uid;
  listeners.forEach(fn => fn({ id, type, message, duration }));
}

export const toast = {
  success: (msg, duration) => emit('success', msg, duration),
  error:   (msg, duration) => emit('error', msg, duration),
  info:    (msg, duration) => emit('info', msg, duration),
};

function ToastItem({ id, type, message, onRemove }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  const colorMap = {
    success: 'border-l-[#9FEF00] [&_span]:text-[#9FEF00]',
    error:   'border-l-red-500 [&_span]:text-red-400',
    info:    'border-l-blue-400 [&_span]:text-blue-400',
  };
  const iconMap = { success: 'check_circle', error: 'error', info: 'info' };

  return (
    <div
      role="alert"
      aria-live="assertive"
      className={`flex items-center gap-3 bg-[#1C2536] border border-[#222f45] border-l-4 ${colorMap[type] || colorMap.info} rounded px-4 py-3 shadow-xl min-w-[260px] max-w-sm transition-all duration-300 ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
      }`}
    >
      <span className="material-symbols-outlined text-base flex-shrink-0" aria-hidden="true">
        {iconMap[type] || 'info'}
      </span>
      <span className="text-sm text-white font-assistant flex-1">{message}</span>
      <button
        onClick={() => onRemove(id)}
        aria-label="סגור הודעה"
        className="text-slate-500 hover:text-slate-200 transition-colors flex-shrink-0 ml-1"
      >
        <span className="material-symbols-outlined text-base" aria-hidden="true">close</span>
      </button>
    </div>
  );
}

export function Toaster() {
  const [toasts, setToasts] = useState([]);

  const remove = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  useEffect(() => {
    const handler = ({ id, type, message, duration }) => {
      setToasts(prev => [...prev, { id, type, message }]);
      setTimeout(() => remove(id), duration);
    };
    listeners.add(handler);
    return () => listeners.delete(handler);
  }, [remove]);

  if (toasts.length === 0) return null;

  return (
    <div
      className="fixed top-4 left-1/2 -translate-x-1/2 z-[9999] flex flex-col gap-2 items-center pointer-events-none"
      role="region"
      aria-label="הודעות מערכת"
    >
      {toasts.map(t => (
        <div key={t.id} className="pointer-events-auto">
          <ToastItem {...t} onRemove={remove} />
        </div>
      ))}
    </div>
  );
}
