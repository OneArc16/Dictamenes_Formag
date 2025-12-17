import { cookies } from 'next/headers';
import { ADMIN_MODE_COOKIE, type AdminMode, can } from '@/lib/rbac';

export default async function AdminHome() {
  const cookieStore = await cookies();
  const mode = (cookieStore.get(ADMIN_MODE_COOKIE)?.value as AdminMode) ?? 'ADMIN';

  return (
    <div className="space-y-3">
      <h1 className="text-base font-semibold text-slate-900">Dashboard Administrador</h1>

      <div className="p-3 bg-white border rounded-lg border-slate-200">
        <div className="text-[11px] font-medium text-slate-700">Permisos rápidos en este modo</div>
        <ul className="mt-2 space-y-1 text-[11px] text-slate-600">
          <li>Ver HC: {can(mode, 'HC_VIEW') ? '✅' : '❌'}</li>
          <li>Editar HC: {can(mode, 'HC_EDIT') ? '✅' : '❌'}</li>
          <li>Acciones admisión: {can(mode, 'ADMISION_ACTIONS') ? '✅' : '❌'}</li>
          <li>Reabrir dictamen: {can(mode, 'DICTAMEN_REOPEN') ? '✅' : '❌'}</li>
        </ul>
      </div>
    </div>
  );
}
