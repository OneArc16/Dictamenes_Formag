import { requireAdmin } from '@/lib/auth/guards';
import { hasAbility } from '@/lib/auth/ability-utils';

const dashboardChecks = [
  { label: 'Gestionar empleados', ability: 'admin.empleados.manage' },
  { label: 'Gestionar perfiles', ability: 'admin.perfiles.manage' },
  { label: 'Gestionar motivos de reapertura', ability: 'admin.motivos_reapertura.manage' },
  { label: 'Ver auditoria', ability: 'admin.auditoria.read' },
  { label: 'Exportar auditoria', ability: 'admin.auditoria.export' },
  { label: 'Reabrir dictamenes', ability: 'dictamen.reopen' },
  { label: 'Reabrir recomendaciones', ability: 'recomendacion.reopen' },
] as const;

export default async function AdminHome() {
  const session = await requireAdmin('admin.dashboard.read');

  return (
    <div className="space-y-3">
      <h1 className="text-base font-semibold text-slate-900">Dashboard Administrador</h1>

      <div className="rounded-lg border border-slate-200 bg-white p-3">
        <div className="text-[11px] font-medium text-slate-700">Permisos rapidos del perfil actual</div>
        <ul className="mt-2 space-y-1 text-[11px] text-slate-600">
          {dashboardChecks.map((item) => (
            <li key={item.ability}>
              {item.label}: {hasAbility(session, item.ability) ? '✅' : '❌'}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
