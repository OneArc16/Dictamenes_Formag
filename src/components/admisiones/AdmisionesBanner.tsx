'use client';

import { useAdmisionesAccess } from '@/components/admisiones/AdmisionesAccessProvider';

export default function AdmisionesBanner() {
  const { user, canReabrirDictamen } = useAdmisionesAccess();

  return (
    <div className="mb-3 rounded-xl border border-slate-200 bg-white px-3 py-2 text-[11px] text-slate-700">
      Sesión: <span className="font-semibold">{user.role}</span>
      {' · '}
      Reabrir dictamen:{' '}
      <span className={canReabrirDictamen ? 'font-semibold text-emerald-700' : 'text-rose-700'}>
        {canReabrirDictamen ? 'Habilitado' : 'No'}
      </span>
    </div>
  );
}
