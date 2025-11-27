'use client';

import React from 'react';

type Props = {
  dictamenId: number;
  procedimientoPcl: 'A' | 'B';
};

export default function TabExamenFisico({
  dictamenId,
  procedimientoPcl,
}: Props) {
  return (
    <div className="text-xs text-slate-500">
      Aquí irá el formulario de <strong>Examen físico</strong> para el
      dictamen #{dictamenId} (procedimiento {procedimientoPcl}).
    </div>
  );
}
