'use client';

import Link from 'next/link';
import { useMemo, useState, type ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
  ClipboardPlus,
  LayoutDashboard,
  LogOut,
  Menu,
  ShieldCheck,
  Stethoscope,
  User2,
  UserSquare2,
  X,
} from 'lucide-react';

import { useAuthMe } from '@/hooks/useAuthMe';
import {
  getModuleByKey,
  getRoleLabel,
  getVisibleModules,
  type ModuleKey,
} from '@/lib/module-navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

type ModuleStat = {
  label: string;
  value: string;
};

type ModuleSidebarShellProps = {
  moduleKey: ModuleKey;
  title: string;
  description: string;
  stats?: ModuleStat[];
  compactHero?: boolean;
  actions?: ReactNode;
  children: ReactNode;
};

const moduleIconMap: Record<ModuleKey, typeof Stethoscope> = {
  admin: ShieldCheck,
  medico: Stethoscope,
  admisiones: UserSquare2,
  recomendaciones: ClipboardPlus,
};

function SidebarContent({
  moduleKey,
  onNavigate,
}: {
  moduleKey: ModuleKey;
  onNavigate?: () => void;
}) {
  const pathname = usePathname() || '';
  const { data: user } = useAuthMe();
  const router = useRouter();

  const currentModule = getModuleByKey(moduleKey);
  const visibleModules = useMemo(() => {
    const modules = getVisibleModules({
      role: user?.role ?? null,
      permissions: user?.permissions ?? [],
    });
    if (!currentModule) return modules;
    return modules.some((moduleItem) => moduleItem.key === currentModule.key)
      ? modules
      : [...modules, currentModule];
  }, [currentModule, user?.permissions, user?.role]);

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
    <div className="flex flex-col h-full">
      <CardHeader className="space-y-3 border-b border-slate-200/80 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.12),_transparent_42%),linear-gradient(180deg,_rgba(255,255,255,0.98),_rgba(241,245,249,0.95))] px-4 pb-3 pt-4 text-slate-950">
        <div className="inline-flex items-center justify-center bg-white border shadow-sm h-9 w-9 rounded-2xl border-sky-100 shadow-sky-100/60">
          <LayoutDashboard className="w-4 h-4 text-sky-700" />
        </div>
        <div className="space-y-1">
          <CardTitle className="text-base font-semibold tracking-tight text-slate-950">
            DICTAMY
          </CardTitle>
        </div>
      </CardHeader>

      <CardContent className="flex flex-col flex-1 gap-3 px-3 pt-3 pb-3 text-slate-800">
        <div className="p-3 border shadow-sm rounded-3xl border-slate-200/80 bg-white/95 shadow-slate-200/60">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center h-9 w-9 rounded-2xl bg-slate-100 text-slate-700">
              <User2 className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-sm font-semibold truncate text-slate-900">
                {user?.name ?? 'Usuario'}
              </div>
              <div className="text-[11px] text-slate-500">
                {getRoleLabel(user?.role)}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="px-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-400">
            Modulos
          </div>
          <nav className="space-y-1.5">
            {visibleModules.map((moduleItem) => {
              const active =
                pathname === moduleItem.href || pathname.startsWith(`${moduleItem.href}/`);
              const Icon = moduleIconMap[moduleItem.key];

              return (
                <Link
                  key={moduleItem.key}
                  href={moduleItem.href}
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
                    <Icon className="w-4 h-4" />
                  </span>
                  <span className="flex-1 min-w-0">
                    <span className="block text-sm font-medium truncate">
                      {moduleItem.label}
                    </span>

                  </span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="pt-1 mt-auto space-y-3">
          <Separator className="bg-slate-200" />
          <Button
            type="button"
            variant="outline"
            className="justify-center w-full h-10 bg-white shadow-sm rounded-2xl border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4" />
            Cerrar sesion
          </Button>
        </div>
      </CardContent>
    </div>
  );
}

export default function ModuleSidebarShell({
  moduleKey,
  title,
  description,
  stats = [],
  compactHero = false,
  actions,
  children,
}: ModuleSidebarShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const currentModule = getModuleByKey(moduleKey);
  const ModuleIcon = currentModule ? moduleIconMap[currentModule.key] : LayoutDashboard;

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
            <Card className="overflow-hidden rounded-[26px] border-slate-200/90 bg-[linear-gradient(180deg,_rgba(248,250,252,0.98),_rgba(239,246,255,0.94))] shadow-[0_18px_45px_rgba(148,163,184,0.16)]">
              <SidebarContent moduleKey={moduleKey} />
            </Card>
          </div>
        </aside>

        <aside
          className={cn(
            'fixed inset-y-0 left-0 z-50 w-[272px] max-w-[88vw] p-3 transition-transform duration-200 lg:hidden',
            mobileOpen ? 'translate-x-0' : '-translate-x-full',
          )}
        >
          <Card className="flex h-full flex-col overflow-hidden rounded-[26px] border-slate-200/90 bg-[linear-gradient(180deg,_rgba(248,250,252,0.99),_rgba(239,246,255,0.96))] shadow-2xl">
            <div className="flex items-center justify-end px-3 py-3 border-b border-slate-200">
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="rounded-xl text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                onClick={() => setMobileOpen(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            <SidebarContent
              moduleKey={moduleKey}
              onNavigate={() => setMobileOpen(false)}
            />
          </Card>
        </aside>

        <main className="flex-1 min-w-0 pb-5 space-y-3">
          <Card className="overflow-hidden border-slate-200/80 bg-white/90 shadow-[0_24px_60px_rgba(148,163,184,0.16)] backdrop-blur">
            <CardHeader
              className={cn(
                'border-b border-slate-100 bg-[radial-gradient(circle_at_top_right,_rgba(14,165,233,0.14),_transparent_28%),linear-gradient(180deg,_rgba(248,250,252,0.98),_rgba(255,255,255,0.96))] px-5',
                compactHero ? 'gap-3 py-3' : 'gap-4 py-4',
              )}
            >
              <div
                className={cn(
                  'flex flex-col lg:flex-row lg:items-start lg:justify-between',
                  compactHero ? 'gap-2' : 'gap-3',
                )}
              >
                <div className={cn(compactHero ? 'space-y-2' : 'space-y-3')}>
                  <div className="inline-flex items-center gap-2 rounded-full border border-sky-100 bg-sky-50 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-sky-700">
                    <ModuleIcon className="h-3.5 w-3.5" />
                    <span>{currentModule?.label ?? 'Modulo'}</span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="rounded-full border-slate-200 lg:hidden"
                    onClick={() => setMobileOpen(true)}
                  >
                    <Menu className="w-4 h-4" />
                    Menu
                  </Button>
                  {actions}
                </div>
              </div>
            </CardHeader>

            {stats.length > 0 ? (
              <CardContent className="grid gap-3 px-5 py-4 sm:grid-cols-2 xl:grid-cols-4">
                {stats.map((stat) => (
                  <div
                    key={stat.label}
                    className="px-4 py-3 border shadow-sm rounded-2xl border-slate-200 bg-slate-50/90"
                  >
                    <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                      {stat.label}
                    </div>
                    <div className="mt-1.5 text-2xl font-semibold leading-none text-slate-950">
                      {stat.value}
                    </div>
                  </div>
                ))}
              </CardContent>
            ) : null}
          </Card>

          <div className="space-y-4">{children}</div>
        </main>
      </div>
    </div>
  );
}