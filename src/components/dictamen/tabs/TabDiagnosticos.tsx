'use client';

import React from 'react';

type Props = {
  dictamenId: number;
  procedimientoPcl: 'A' | 'B';
};

export default function TabDiagnosticos({
  dictamenId,
  procedimientoPcl,
}: Props) {
  return (
    <div className="text-xs text-slate-500">
      Aquí irá la sección de{' '}
      <strong>Diagnóstico y tratamiento</strong> para el dictamen #
      {dictamenId} (procedimiento {procedimientoPcl}).
    </div>
  );
}
