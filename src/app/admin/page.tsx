import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

import { navigationIconMap } from '@/components/navigation/module-icons';
import { requireAdmin } from '@/lib/auth/guards';
import { getModuleByKey, getVisibleSecondaryNavigation } from '@/lib/module-navigation';

/** Qué se hace en cada submódulo de Administración. */
const DESCRIPTIONS: Record<string, string> = {
  employees: 'Crea y administra los empleados, su sede, su firma y su perfil.',
  profiles: 'Define los perfiles y los permisos de cada uno.',
  sites: 'Crea y administra las sedes de atención y su estado.',
  'reopen-reasons': 'Motivos para reabrir dictámenes y recomendaciones.',
  'pcl-notifiers': 'Empleados que notifican los dictámenes PCL en cada sede.',
  audit: 'Consulta y exporta el registro de acciones del sistema.',
  'reception-policies': 'Plazos para cancelar y reprogramar citas en cada sede.',
};

export default async function AdminHome() {
  const session = await requireAdmin('admin.dashboard.read');
  const admin = getModuleByKey('admin');
  const submodules = admin
    ? getVisibleSecondaryNavigation(admin, { permissions: session.permissions }).filter(
        (item) => item.key !== 'dashboard',
      )
    : [];

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-base font-semibold text-slate-900">Administración</h1>
        <p className="text-sm text-slate-600">Configuración, empleados, perfiles y auditoría del sistema.</p>
      </div>

      {submodules.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {submodules.map((item) => {
            const Icon = navigationIconMap[item.iconKey];
            return (
              <Link
                key={item.key}
                href={item.href}
                className="group flex min-h-40 flex-col rounded-2xl border border-slate-200/90 bg-white/95 p-5 shadow-[0_12px_32px_rgba(148,163,184,0.12)] transition duration-200 ease-out hover:-translate-y-0.5 hover:border-sky-200 hover:shadow-[0_16px_40px_rgba(14,165,233,0.14)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-200 motion-reduce:transform-none motion-reduce:transition-none"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-sky-100 bg-sky-50 text-sky-700 transition-colors duration-200 group-hover:bg-sky-100 motion-reduce:transition-none">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <h2 className="mt-4 text-base font-semibold tracking-tight text-slate-950">{item.label}</h2>
                <p className="mt-1 flex-1 text-sm leading-6 text-slate-600">{DESCRIPTIONS[item.key] ?? ''}</p>
                <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-sky-700">
                  Ingresar
                  <ArrowRight
                    className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5 motion-reduce:transform-none motion-reduce:transition-none"
                    aria-hidden="true"
                  />
                </span>
              </Link>
            );
          })}
        </div>
      ) : (
        <p className="rounded-2xl border border-amber-200 bg-white p-5 text-sm text-slate-600">
          Tu perfil no tiene submódulos de administración asignados.
        </p>
      )}
    </div>
  );
}
