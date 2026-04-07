'use client';

import React from 'react';
import { Printer } from 'lucide-react';

import { useCan } from '@/hooks/useCan';

type Props = {
  dictamenId: number;
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
  const { can: canPrintDictamen } = useCan('dictamen.print');

  if (!isCerrado || !canPrintDictamen) return null;

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
        'disabled:cursor-not-allowed disabled:opacity-50',
        className,
      ].join(' ')}
    >
      <Printer className="h-4 w-4" aria-hidden="true" />
    </button>
  );
}
