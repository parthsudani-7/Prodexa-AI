import React, { useState, useEffect } from 'react';
import { RotateCcw, X, CheckCircle2 } from 'lucide-react';

interface ToastAction {
  id: string;
  message: string;
  onUndo: () => void;
}

export default function UniversalUndoToast() {
  const [toast, setToast] = useState<ToastAction | null>(null);

  useEffect(() => {
    const handleTriggerUndo = (e: Event) => {
      const customEvent = e as CustomEvent<{ message: string; onUndo: () => void }>;
      if (customEvent.detail) {
        setToast({
          id: `toast_${Date.now()}`,
          message: customEvent.detail.message,
          onUndo: customEvent.detail.onUndo
        });
      }
    };

    window.addEventListener('trigger_undo_toast', handleTriggerUndo);
    return () => window.removeEventListener('trigger_undo_toast', handleTriggerUndo);
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      setToast(null);
    }, 5000);
    return () => clearTimeout(timer);
  }, [toast]);

  if (!toast) return null;

  const handleUndo = () => {
    toast.onUndo();
    setToast(null);
  };

  return (
    <div className="fixed bottom-6 left-6 z-50 animate-fade-in font-sans">
      <div className="flex items-center gap-3 px-4 py-2.5 bg-surface border border-border rounded-xl shadow-modal text-xs text-text-primary">
        <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0" />
        <span className="font-medium text-text-primary">{toast.message}</span>
        <div className="flex items-center gap-2 ml-2 pl-3 border-l border-border">
          <button
            onClick={handleUndo}
            className="flex items-center gap-1 font-semibold text-brand hover:text-brand-hover transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Undo</span>
          </button>
          <button
            onClick={() => setToast(null)}
            className="text-text-muted hover:text-text-primary p-0.5"
            title="Dismiss"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
