'use client';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

export default function ModalShell({
  onClose,
  children,
  maxWidth = 'max-w-xl',
  gradient = 'from-brand-400/40 via-brand-300/30 to-brand-600/40',
  ariaLabelledBy,
}: {
  onClose: () => void;
  children: React.ReactNode;
  maxWidth?: string;
  gradient?: string;
  ariaLabelledBy?: string;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  useEffect(() => {
    const onEsc = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onEsc);
    return () => window.removeEventListener('keydown', onEsc);
  }, [onClose]);

  if (!mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[1100] grid place-items-center bg-black/50 px-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={ariaLabelledBy}
    >
      <button className="absolute inset-0 -z-10" aria-label="Cerrar" onClick={onClose} />
      <div className={`w-full ${maxWidth} rounded-2xl p-[1px] bg-gradient-to-tr ${gradient} shadow-2xl`}>
        <div className="border rounded-2xl border-subtle bg-panel">{children}</div>
      </div>
    </div>,
    document.body
  );
}
