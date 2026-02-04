'use client';

import React, { useMemo } from 'react';
import { useParams } from 'next/navigation';

export default function ImprimirDictamenPage() {
  const params = useParams<{ id: string }>();

  const dictamenId = useMemo(() => {
    const raw = params?.id;
    const n = Number(raw);
    return Number.isFinite(n) ? n : null;
  }, [params]);

  if (!dictamenId) {
    return (
      <div className="p-6">
        <div className="p-4 text-sm bg-white border rounded-xl text-slate-600">
          No se encontró el id del dictamen en la URL.
        </div>
      </div>
    );
  }

  const src = `/api/dictamenes/${dictamenId}/pdf`;

  return (
    <div className="h-[calc(100vh-0px)] w-full bg-slate-100">
      <iframe title="Dictamen PDF" src={src} className="w-full h-full" />
    </div>
  );
}
