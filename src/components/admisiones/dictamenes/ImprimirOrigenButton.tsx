'use client';

import React from 'react';
import { Printer } from 'lucide-react';

import { Tooltip } from '@/components/ui/icon-tooltip';
import { useCan } from '@/hooks/useCan';

type Props = {
  dictamenId: number;
  canPrintOrigin: boolean;
  disabled?: boolean;
  className?: string;
};

export default function ImprimirOrigenButton({
  dictamenId,
  canPrintOrigin,
  disabled = false,
  className = '',
}: Props) {
  const { can: canReadOrigin } = useCan('formulario_origen.read');

  if (!canPrintOrigin || !canReadOrigin) return null;

  return (
    <Tooltip id={`dictamen-${dictamenId}-imprimir-origen-tooltip`} side="top" label="Imprimir Formulario de Origen">
      <button
        type="button"
        disabled={disabled}
        aria-label="Imprimir Formulario de Origen"
        onClick={() => {
          if (disabled) return;
          window.open(`/api/dictamenes/${dictamenId}/origen/pdf`, '_blank', 'noopener,noreferrer');
        }}
        className={[
          'inline-flex h-8 w-8 items-center justify-center rounded-full',
          'border border-emerald-200 bg-white',
          'text-emerald-700 hover:bg-emerald-50 active:bg-emerald-100',
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
