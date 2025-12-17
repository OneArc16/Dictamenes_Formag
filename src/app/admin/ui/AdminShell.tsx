'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { AdminMode } from '@/lib/rbac';

type Props = {
  children: React.ReactNode;
  empleado: { nombre: string; perfil: string };
  mode: AdminMode;
};

function NavItem({ href, label }: { href: string; label: string }) {
  const pathname = usePathname() || '';
  const active = pathname === href;

  return (
    <Link
      href={href}
      className={[
        'block rounded-md px-3 py-2 text-[11px] font-medium transition',
        active
          ? 'bg-blue-50 text-blue-700'
          : 'text-slate-700 hover:bg-slate-50',
      ].join(' ')}
    >
      {label}
    </Link>
  );
}

export default function AdminShell({ children, empleado, mode }: Props) {
  const showAdminSection = mode === 'ADMIN';

  return (
    <div className="grid grid-cols-12 gap-4">
      <aside className="col-span-12 md:col-span-4 lg:col-span-3">
        <div className="p-3 bg-white border shadow-sm rounded-xl border-slate-200">
          <div className="p-3 mb-3 rounded-lg bg-slate-50">
            <div className="text-sm font-semibold text-slate-900">{empleado.nombre}</div>
            <div className="text-[11px] text-slate-500">{empleado.perfil}</div>
          </div>

          <div className="text-[11px] font-semibold text-slate-500">Operación</div>
          <div className="mt-2 space-y-1">
            <NavItem href="/admin" label="Dashboard" />
            <NavItem href="/admin/dictamenes" label="Dictámenes" />
            <NavItem href="/admin/pacientes" label="Pacientes" />
          </div>

          {showAdminSection && (
            <>
              <div className="mt-4 text-[11px] font-semibold text-slate-500">Administración</div>
              <div className="mt-2 space-y-1">
                <NavItem href="/admin/empleados" label="Empleados" />
                <NavItem href="/admin/perfiles" label="Perfiles" />
                <NavItem href="/admin/auditoria" label="Auditoría" />
              </div>
            </>
          )}
        </div>
      </aside>

      <main className="col-span-12 md:col-span-8 lg:col-span-9">
        <div className="p-4 bg-white border shadow-sm rounded-xl border-slate-200">
          {children}
        </div>
      </main>
    </div>
  );
}
