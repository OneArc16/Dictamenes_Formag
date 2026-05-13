import type { ToastType } from './types';

type ToastProps = {
  open: boolean;
  type: ToastType;
  message: string;
  onClose: () => void;
};

export function Toast({ open, type, message, onClose }: ToastProps) {
  if (!open) return null;

  const bgClass =
    type === 'success'
      ? 'bg-emerald-600'
      : type === 'error'
        ? 'bg-red-600'
        : 'bg-slate-800';

  return (
    <div className="fixed inset-x-0 top-4 z-[60] flex justify-center px-4">
      <div
        className={`flex items-center gap-3 rounded-xl ${bgClass} px-4 py-3 text-sm text-white shadow-2xl`}
      >
        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-white/10 text-xs font-bold">
          {type === 'success' ? '✓' : type === 'error' ? '!' : 'i'}
        </span>
        <span>{message}</span>
        <button
          type="button"
          onClick={onClose}
          className="ml-3 text-xs text-white/80 hover:text-white"
        >
          Cerrar
        </button>
      </div>
    </div>
  );
}
