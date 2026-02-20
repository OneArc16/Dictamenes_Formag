'use client';

import React from 'react';
import { Printer } from 'lucide-react';

type Props = {
  dictamenId: number;
  /** pásale true cuando el dictamen esté CERRADO */
  isCerrado: boolean;
  disabled?: boolean;
  className?: string;
};

export default function ImprimirDictamenButton({
  dictamenId,
  isCerrado,
  disabled = false,
  className = '',
}: Props) {
  // ✅ Solo mostrar si está CERRADO
  if (!isCerrado) return null;

  return (
    <button
      type="button"
      disabled={disabled}
      title="Imprimir"
      aria-label="Imprimir"
      onClick={() => {
        if (disabled) return;
        window.open(`/api/dictamenes/${dictamenId}/pdf-react`, '_blank', 'noopener,noreferrer');
      }}
      className={[
        'inline-flex items-center justify-center rounded-full',
        'border border-blue-200 bg-white',
        'h-8 w-8',
        'text-blue-700 hover:bg-blue-50 active:bg-blue-100',
        'transition',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        className,
      ].join(' ')}
    >
      <Printer className="w-4 h-4" aria-hidden="true" />
    </button>
  );
}