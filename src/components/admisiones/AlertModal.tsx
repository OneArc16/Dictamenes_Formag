'use client';
import ModalShell from '@/components/ui/ModalShell';

export default function AlertModal({ onClose }: { onClose: () => void }) {
  const titleId = 'alerta-eps-title';
  return (
    <ModalShell onClose={onClose} maxWidth="max-w-md" ariaLabelledBy={titleId}>
      <div className="px-6 pt-6 pb-4">
        <div className="flex items-start gap-3 mb-3">
          <span className="grid w-10 h-10 shrink-0 place-items-center rounded-xl bg-brand-100 text-brand-700 ring-1 ring-inset ring-brand-200">
            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor">
              <path d="M12 9v4m0 4h.01M12 2 2 22h20L12 2Z" strokeWidth="2" />
            </svg>
          </span>
          <div className="min-w-0">
            <h3 id={titleId} className="text-base font-semibold text-text">
              Este paciente no es de la Fiduprevisora
            </h3>
            <p className="mt-1 text-sm text-muted">
              Puedes continuar: se mostrará la información del paciente igualmente.
            </p>
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-4 mt-4 border-t border-subtle">
          <button onClick={onClose} className="px-4 py-2 text-sm border rounded-lg border-subtle bg-panel hover:bg-bg">
            Entendido
          </button>
        </div>
      </div>
    </ModalShell>
  );
}
