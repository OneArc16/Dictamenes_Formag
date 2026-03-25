'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { AdminMode } from '@/lib/rbac';
import {
  ClipboardList,
  FileText,
  IdCard,
  LayoutDashboard,
  RotateCcw,
  UserRoundCog,
  Users,
} from 'lucide-react';

type Props = {
  children: React.ReactNode;
  empleado: { nombre: string; perfil: string };
  mode: AdminMode;
};

function NavItem({
  href,
  label,
  icon: Icon,
}: {
  href: string;
  label: string;
  icon: React.ElementType;
}) {
  const pathname = usePathname() || '';
  const active = pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Link
      href={href}
      className={[
        'flex items-center gap-2 rounded-md px-3 py-2 text-[11px] font-medium transition',
        active ? 'bg-blue-50 text-blue-700' : 'text-slate-700 hover:bg-slate-50',
      ].join(' ')}
    >
      <Icon
        className={[
          'h-4 w-4',
          active ? 'text-blue-700' : 'text-slate-500',
        ].join(' ')}
      />
      <span>{label}</span>
    </Link>
  );
}

export default function AdminShell({ children, empleado, mode }: Props) {
  const showAdminSection = mode === 'ADMIN';

  return (
    <div className="grid grid-cols-12 gap-4">
      <aside className="col-span-12 md:col-span-4 lg:col-span-3">
        <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
          <div className="mb-3 rounded-lg bg-slate-50 p-3">
            <div className="text-sm font-semibold text-slate-900">{empleado.nombre}</div>
            <div className="text-[11px] text-slate-500">{empleado.perfil}</div>
          </div>

          <div className="text-[11px] font-semibold text-slate-500">Operación</div>
          <div className="mt-2 space-y-1">
            <NavItem href="/admin" label="Dashboard" icon={LayoutDashboard} />
            <NavItem href="/admin/dictamenes" label="Dictámenes" icon={FileText} />
            <NavItem href="/admin/pacientes" label="Pacientes" icon={Users} />
          </div>

          {showAdminSection ? (
            <>
              <div className="mt-4 text-[11px] font-semibold text-slate-500">Administración</div>
              <div className="mt-2 space-y-1">
                <NavItem href="/admin/empleados" label="Empleados" icon={IdCard} />
                <NavItem href="/admin/perfiles" label="Perfiles" icon={UserRoundCog} />
                <NavItem href="/admin/motivos-reapertura" label="Motivos reapertura" icon={RotateCcw} />
                <NavItem href="/admin/auditoria" label="Auditoría" icon={ClipboardList} />
              </div>
            </>
          ) : null}
        </div>
      </aside>

      <main className="col-span-12 md:col-span-8 lg:col-span-9">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">{children}</div>
      </main>
    </div>
  );
}
