'use client';

import Link from 'next/link';
import { useMemo, useState, type ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
  ClipboardList,
  ClipboardPlus,
  IdCard,
  LogOut,
  Menu,
  RotateCcw,
  ShieldCheck,
  Stethoscope,
  User2,
  UserRoundCog,
  UserSquare2,
  X,
} from 'lucide-react';

import { useAuthMe } from '@/hooks/useAuthMe';
import { hasAbility, type AbilityCode } from '@/lib/auth/ability-utils';
import { getRoleLabel, getVisibleModules, type AppRole, type ModuleKey } from '@/lib/module-navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

type Props = {
  children: ReactNode;
  empleado: { nombre: string; perfil: string; role: AppRole };
  permissions: string[];
};

type SidebarItem = {
  href: string;
  label: string;
  icon: React.ElementType;
  description?: string;
  requiredAbility?: AbilityCode;
};

const moduleIconMap: Record<ModuleKey, typeof ShieldCheck> = {
  admin: ShieldCheck,
  medico: Stethoscope,
  admisiones: UserSquare2,
  recomendaciones: ClipboardPlus,
};

const administrationItems: SidebarItem[] = [
  { href: '/admin/empleados', label: 'Empleados', icon: IdCard, requiredAbility: 'admin.empleados.read' },
  { href: '/admin/perfiles', label: 'Perfiles', icon: UserRoundCog, requiredAbility: 'admin.perfiles.read' },
  {
    href: '/admin/motivos-reapertura',
    label: 'Motivos de reapertura',
    icon: RotateCcw,
    requiredAbility: 'admin.motivos_reapertura.read',
  },
  { href: '/admin/auditoria', label: 'Auditoria', icon: ClipboardList, requiredAbility: 'admin.auditoria.read' },
];

function SidebarLink({
  href,
  label,
  icon: Icon,
  description,
  onNavigate,
}: SidebarItem & { onNavigate?: () => void }) {
  const pathname = usePathname() || '';
  const active = pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Link
      href={href}
      onClick={onNavigate}
      className={cn(
        'group flex items-start gap-2.5 rounded-2xl border px-2.5 py-2.5 transition',
        active
          ? 'border-slate-200 bg-white text-slate-950 shadow-sm shadow-slate-200/70'
          : 'border-transparent text-slate-600 hover:border-slate-200/80 hover:bg-white/80 hover:text-slate-900',
      )}
    >
      <span
        className={cn(
          'mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl transition',
          active
            ? 'bg-sky-50 text-sky-700'
            : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200/80 group-hover:text-slate-700',
        )}
      >
        <Icon className="h-4 w-4" />
      </span>

      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-medium">{label}</span>
      </span>
    </Link>
  );
}

function SidebarSection({
  title,
  items,
  onNavigate,
}: {
  title: string;
  items: SidebarItem[];
  onNavigate?: () => void;
}) {
  if (items.length === 0) return null;

  return (
    <div className="space-y-2">
      <div className="px-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-400">
        {title}
      </div>
      <nav className="space-y-1.5">
        {items.map((item) => (
          <SidebarLink key={item.href} {...item} onNavigate={onNavigate} />
        ))}
      </nav>
    </div>
  );
}

function AdminSidebarContent({
  empleado,
  permissions,
  onNavigate,
}: {
  empleado: Props['empleado'];
  permissions: string[];
  onNavigate?: () => void;
}) {
  const router = useRouter();
  const { data: user } = useAuthMe();
  const effectivePermissions = user?.permissions ?? permissions;
  const effectiveRole = user?.role ?? empleado.role;

  const visibleModules = useMemo(
    () =>
      getVisibleModules({
        role: effectiveRole,
        permissions: effectivePermissions,
      }),
    [effectivePermissions, effectiveRole],
  );

  const moduleItems: SidebarItem[] = visibleModules.map((moduleItem) => ({
    href: moduleItem.href,
    label: moduleItem.label,
    icon: moduleIconMap[moduleItem.key],
    description: moduleItem.description,
  }));

  const administrationSectionItems = useMemo(
    () => administrationItems.filter((item) => !item.requiredAbility || hasAbility(effectivePermissions, item.requiredAbility)),
    [effectivePermissions],
  );

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Error al cerrar sesion', error);
    } finally {
      router.replace('/login');
      router.refresh();
    }
  };

  return (
    <div className="flex h-full min-h-0 flex-col">
      <CardHeader className="space-y-3 border-b border-slate-200/80 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.12),_transparent_42%),linear-gradient(180deg,_rgba(255,255,255,0.98),_rgba(241,245,249,0.95))] px-4 pb-3 pt-4 text-slate-950">
        <div className="inline-flex h-9 w-9 items-center justify-center rounded-2xl border border-sky-100 bg-white shadow-sm shadow-sky-100/60">
          <ShieldCheck className="h-4 w-4 text-sky-700" />
        </div>
        <div className="space-y-1">
          <CardTitle className="text-base font-semibold tracking-tight text-slate-950">
            Dictamy
          </CardTitle>
        </div>
      </CardHeader>

      <CardContent className="flex min-h-0 flex-1 flex-col overflow-hidden px-3 pb-3 pt-3 text-slate-800">
        <div className="min-h-0 flex-1 space-y-3 overflow-y-auto pr-1">
          <div className="rounded-3xl border border-slate-200/80 bg-white/95 p-3 shadow-sm shadow-slate-200/60">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
                <User2 className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold text-slate-900">{empleado.nombre}</div>
                <div className="text-[11px] text-slate-500">{getRoleLabel(effectiveRole)}</div>
              </div>
            </div>
          </div>

          <SidebarSection title="Modulos" items={moduleItems} onNavigate={onNavigate} />
          <SidebarSection title="Administracion" items={administrationSectionItems} onNavigate={onNavigate} />
        </div>

        <div className="space-y-3 pt-3">
          <Separator className="bg-slate-200" />
          <Button
            type="button"
            variant="outline"
            className="h-10 w-full justify-center rounded-2xl border-slate-200 bg-white text-slate-700 shadow-sm hover:bg-slate-50 hover:text-slate-900"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4" />
            Cerrar sesion
          </Button>
        </div>
      </CardContent>
    </div>
  );
}

export default function AdminShell({ children, empleado, permissions }: Props) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(14,165,233,0.08),_transparent_22%),radial-gradient(circle_at_bottom_right,_rgba(59,130,246,0.08),_transparent_24%),linear-gradient(180deg,_#f8fafc_0%,_#eef4ff_100%)]">
      {mobileOpen ? (
        <div
          className="fixed inset-0 z-40 bg-slate-950/35 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      ) : null}

      <div className="flex min-h-screen gap-3 px-4 py-3 lg:gap-4 lg:py-4 lg:pl-3 lg:pr-4">
        <aside className="hidden w-[236px] shrink-0 lg:block xl:w-[244px]">
          <div className="sticky top-3">
            <Card className="h-[min(calc(100vh-1.5rem),840px)] min-h-0 overflow-hidden rounded-[26px] border-slate-200/90 bg-[linear-gradient(180deg,_rgba(248,250,252,0.98),_rgba(239,246,255,0.94))] shadow-[0_18px_45px_rgba(148,163,184,0.16)]">
              <AdminSidebarContent empleado={empleado} permissions={permissions} />
            </Card>
          </div>
        </aside>

        <aside
          className={cn(
            'fixed inset-y-0 left-0 z-50 w-[272px] max-w-[88vw] p-3 transition-transform duration-200 lg:hidden',
            mobileOpen ? 'translate-x-0' : '-translate-x-full',
          )}
        >
          <Card className="flex h-[calc(100vh-1.5rem)] flex-col overflow-hidden rounded-[26px] border-slate-200/90 bg-[linear-gradient(180deg,_rgba(248,250,252,0.99),_rgba(239,246,255,0.96))] shadow-2xl">
            <div className="flex items-center justify-end border-b border-slate-200 px-3 py-3">
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="rounded-xl text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                onClick={() => setMobileOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <AdminSidebarContent
              empleado={empleado}
              permissions={permissions}
              onNavigate={() => setMobileOpen(false)}
            />
          </Card>
        </aside>

        <main className="min-w-0 flex-1 space-y-3 pb-5">
          <div className="flex items-center justify-between rounded-2xl border border-slate-200/80 bg-white/85 px-4 py-3 shadow-sm backdrop-blur lg:hidden">
            <div className="space-y-0.5">
              <div className="text-sm font-semibold text-slate-950">Administrador</div>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="rounded-full border-slate-200"
              onClick={() => setMobileOpen(true)}
            >
              <Menu className="h-4 w-4" />
              Menu
            </Button>
          </div>

          <div className="space-y-4">{children}</div>
        </main>
      </div>
    </div>
  );
}
