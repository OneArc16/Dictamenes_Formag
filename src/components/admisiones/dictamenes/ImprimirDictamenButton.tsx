'use client';

import React from 'react';
import { Printer } from 'lucide-react';

import { Tooltip } from '@/components/ui/icon-tooltip';
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
    <Tooltip id={`dictamen-${dictamenId}-imprimir-tooltip`} side="top" label="Imprimir dictamen">
    <button
      type="button"
      disabled={disabled}
      aria-label="Imprimir dictamen"
      onClick={() => {
        if (disabled) return;
        window.open(`/api/dictamenes/${dictamenId}/pdf-react`, '_blank', 'noopener,noreferrer');
      }}
      className={[
        'inline-flex items-center justify-center rounded-full',
        'border border-violet-200 bg-white',
        'h-8 w-8',
        'text-violet-700 hover:bg-violet-50 active:bg-violet-100',
        'transition',
        'disabled:cursor-not-allowed disabled:opacity-50',
        className,
      ].join(' ')}
    >
      <Printer className="h-4 w-4" aria-hidden="true" />
    </button>
    </Tooltip>
  );
}
