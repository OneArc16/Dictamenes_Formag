'use client';

import React from 'react';

type Props = {
  dictamenId: number;
  procedimientoPcl: 'A' | 'B';
};

export default function TabDeficiencias({
  dictamenId,
  procedimientoPcl,
}: Props) {
  return (
    <div className="text-xs text-slate-500">
      Aquí irá el módulo de <strong>Deficiencias / PCL</strong> para el
      dictamen #{dictamenId} (procedimiento {procedimientoPcl}).
    </div>
  );
}