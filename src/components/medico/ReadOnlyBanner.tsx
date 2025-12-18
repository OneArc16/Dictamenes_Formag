'use client';

import { useMedicoAccess } from '@/components/medico/MedicoAccessProvider';

export default function ReadOnlyBanner() {
  const { readOnly } = useMedicoAccess();
  if (!readOnly) return null;

  return (
    <div className="mb-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-[11px] text-amber-800">
      Estás en <span className="font-semibold">modo solo lectura</span> (Administrador). No puedes editar HC.
    </div>
  );
}
