'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut, User2 } from 'lucide-react';

import { useAuthMe } from '@/hooks/useAuthMe';
import { getVisibleModules } from '@/lib/module-navigation';
import ModulesButton from './ModulesButton';

type AppNavProps = {
  title?: string;
  showModulesButton?: boolean;
  canSwitchModules?: boolean;
};

export default function AppNav({
  title = 'Modulo',
  showModulesButton = true,
  canSwitchModules,
}: AppNavProps) {
  const router = useRouter();
  const { data: user } = useAuthMe();

  const userName = user?.name ?? 'Usuario';
  const visibleModules = useMemo(
    () =>
      getVisibleModules({
        role: user?.role ?? null,
        permissions: user?.permissions ?? [],
      }),
    [user?.permissions, user?.role],
  );
  const effectiveCanSwitch = canSwitchModules ?? visibleModules.length > 1;

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
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white shadow-sm">
            D
          </span>
          <div className="flex flex-col leading-tight">
            <span className="text-xs font-semibold text-slate-800">{title}</span>
            <span className="text-[10px] text-slate-400">
              Plataforma de dictamenes PCL
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {showModulesButton ? (
            <ModulesButton canSwitchModules={effectiveCanSwitch} />
          ) : null}

          <div className="hidden items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-[11px] text-slate-700 shadow-sm sm:inline-flex">
            <User2 className="h-3.5 w-3.5 text-slate-500" />
            <span className="max-w-[170px] truncate">{userName}</span>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-[11px] font-medium text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-100 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/60 focus:ring-offset-1 focus:ring-offset-white"
            title="Cerrar sesion"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Cerrar sesion</span>
          </button>
        </div>
      </div>
    </header>
  );
}