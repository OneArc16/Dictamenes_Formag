'use client';

import React, { useEffect, useRef } from 'react';

type ConfirmModalProps = {
  open: boolean;
  title: string;

  /** Texto/JSX del cuerpo (va en el centro del modal) */
  description?: React.ReactNode;

  /** Opcional: contenido extra debajo del description */
  children?: React.ReactNode;

  confirmText?: string;
  cancelText?: string;

  loading?: boolean;
  danger?: boolean;

  onClose: () => void;
  onConfirm: () => void;
};

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ');
}

export default function ConfirmModal({
  open,
  title,
  description,
  children,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  loading = false,
  danger = false,
  onClose,
  onConfirm,
}: ConfirmModalProps) {
  const cancelRef = useRef<HTMLButtonElement | null>(null);

  // ESC para cerrar + bloquear scroll del body
  useEffect(() => {
    if (!open) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', onKeyDown);
    setTimeout(() => cancelRef.current?.focus(), 0);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70]">
      {/* overlay */}
      <button
        type="button"
        aria-label="Cerrar"
        onClick={onClose}
        className="absolute inset-0 bg-black/40"
      />

      {/* dialog */}
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div
          role="dialog"
          aria-modal="true"
          className="w-full max-w-md overflow-hidden bg-white border shadow-xl rounded-2xl border-slate-200"
        >
          {/* Header */}
          <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-slate-200 bg-slate-50">
            <div className="text-sm font-semibold text-slate-900">{title}</div>

            <button
              type="button"
              onClick={onClose}
              className="px-2 py-1 text-xs font-semibold bg-white border rounded-lg border-slate-200 text-slate-700 hover:bg-slate-50"
              aria-label="Cerrar modal"
            >
              ✕
            </button>
          </div>

          {/* Body (CENTRO) */}
          {(description || children) && (
            <div className="px-5 py-4">
              {description ? (
                <div className="text-sm leading-relaxed text-slate-700">{description}</div>
              ) : null}

              {children ? <div className="mt-3">{children}</div> : null}
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-end gap-2 px-5 py-4 bg-white border-t border-slate-200">
            <button
              ref={cancelRef}
              type="button"
              onClick={onClose}
              disabled={loading}
              className={cn(
                'rounded-lg border px-3 py-2 text-sm font-semibold',
                loading
                  ? 'cursor-not-allowed border-slate-200 bg-white text-slate-400'
                  : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
              )}
            >
              {cancelText}
            </button>

            <button
              type="button"
              onClick={onConfirm}
              disabled={loading}
              className={cn(
                'rounded-lg border px-3 py-2 text-sm font-semibold',
                loading
                  ? 'cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400'
                  : danger
                  ? 'border-red-300 bg-red-600 text-white hover:bg-red-700'
                  : 'border-blue-300 bg-blue-600 text-white hover:bg-blue-700'
              )}
            >
              {loading ? 'Procesando…' : confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
