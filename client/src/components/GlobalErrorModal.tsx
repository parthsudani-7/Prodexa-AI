import React, { useState, useEffect } from 'react';
import { AlertCircle, X, Check, ShieldAlert, RefreshCw } from 'lucide-react';

interface ErrorPayload {
  title?: string;
  message: string;
  code?: string;
  requestId?: string;
  details?: string;
}

export default function GlobalErrorModal() {
  const [error, setError] = useState<ErrorPayload | null>(null);

  useEffect(() => {
    // 1. Listen for custom dispatched app errors (from API, UI, or workflows)
    const handleCustomError = (e: Event) => {
      const customEvent = e as CustomEvent<ErrorPayload>;
      if (customEvent.detail) {
        setError({
          title: customEvent.detail.title || 'Action Notice',
          message: customEvent.detail.message || 'An unexpected operation issue occurred.',
          code: customEvent.detail.code,
          requestId: customEvent.detail.requestId || `req_${Date.now().toString(36)}`,
          details: customEvent.detail.details
        });
      }
    };

    // 2. Intercept uncaught browser runtime errors
    const handleWindowError = (event: ErrorEvent) => {
      // Suppress harmless extension / resize observer noise
      if (
        event.message?.includes('ResizeObserver') ||
        event.message?.includes('Script error') ||
        event.message?.includes('extension')
      ) {
        return;
      }
      
      setError({
        title: 'Application Runtime Notice',
        message: event.message || 'A script operation was interrupted. Your workspace data remains safely preserved.',
        code: 'RUNTIME_NOTICE',
        requestId: `err_${Date.now().toString(36)}`,
      });
    };

    // 3. Intercept unhandled promise rejections
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      let reasonText = 'A background network or async operation was interrupted.';
      if (typeof event.reason === 'string') {
        reasonText = event.reason;
      } else if (event.reason?.message) {
        reasonText = event.reason.message;
      }

      setError({
        title: 'Connection or Process Notice',
        message: reasonText,
        code: event.reason?.code || 'ASYNC_NOTICE',
        requestId: `req_${Date.now().toString(36)}`,
      });
    };

    window.addEventListener('show_global_error', handleCustomError);
    window.addEventListener('error', handleWindowError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('show_global_error', handleCustomError);
      window.removeEventListener('error', handleWindowError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  if (!error) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in font-sans">
      <div className="bg-surface border border-border rounded-xl w-full max-w-md p-6 shadow-modal space-y-4 relative">
        {/* Top Header */}
        <div className="flex items-start justify-between gap-3 border-b border-border pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-danger/15 border border-danger/30 flex items-center justify-center text-danger flex-shrink-0">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-text-primary tracking-tight">{error.title}</h3>
              {error.code && (
                <span className="text-[10px] font-mono text-text-muted">{error.code}</span>
              )}
            </div>
          </div>

          <button
            onClick={() => setError(null)}
            className="text-text-muted hover:text-text-primary p-1 rounded-md transition-colors"
            title="Dismiss notice"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Message Body */}
        <div className="space-y-2">
          <p className="text-xs text-text-secondary leading-relaxed bg-surface-elevated p-3.5 rounded-lg border border-border">
            {error.message}
          </p>

          {error.details && (
            <div className="text-[11px] font-mono text-text-muted bg-surface p-2.5 rounded border border-border overflow-x-auto max-h-24">
              {error.details}
            </div>
          )}

          {error.requestId && (
            <div className="flex items-center justify-between text-[10px] text-text-muted font-mono pt-1">
              <span>Trace Correlation ID:</span>
              <span className="text-text-primary">{error.requestId}</span>
            </div>
          )}
        </div>

        {/* Bottom Actions */}
        <div className="pt-2 flex justify-end gap-2">
          <button
            onClick={() => setError(null)}
            className="btn-primary px-4 py-1.5 text-xs shadow-subtle flex items-center gap-1.5"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Okay, Dismiss</span>
          </button>
        </div>
      </div>
    </div>
  );
}
