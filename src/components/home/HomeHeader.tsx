'use client';

import { LogOut, ShieldCheck, User2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { useLogout } from '@/hooks/useLogout';

type HomeHeaderProps = {
  userName: string;
  profileName: string;
};

export default function HomeHeader({ userName, profileName }: HomeHeaderProps) {
  const logout = useLogout();

  return (
    <header className="border-b border-slate-200/80 bg-white/90 backdrop-blur">
      <div className="mx-auto flex min-h-16 max-w-7xl items-center justify-between gap-4 px-4 py-2 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-sky-100 bg-sky-50 text-sky-700 shadow-sm">
            <ShieldCheck className="h-5 w-5" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold tracking-tight text-slate-950">
              Dictamy
            </div>
            <div className="hidden text-xs text-slate-500 sm:block">
              Plataforma de dictámenes PCL
            </div>
          </div>
        </div>

        <div className="flex min-w-0 items-center gap-2">
          <div className="hidden min-w-0 items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 sm:flex">
            <User2 className="h-4 w-4 shrink-0 text-slate-500" aria-hidden="true" />
            <div className="min-w-0 leading-tight">
              <div className="max-w-44 truncate text-xs font-semibold text-slate-800">
                {userName}
              </div>
              <div className="max-w-44 truncate text-[11px] text-slate-500">
                {profileName}
              </div>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            className="h-11 rounded-2xl border-slate-200 bg-white px-3 text-slate-700 hover:bg-slate-50 hover:text-slate-950"
            onClick={logout}
          >
            <LogOut className="h-4 w-4" aria-hidden="true" />
            <span className="hidden sm:inline">Cerrar sesión</span>
            <span className="sr-only sm:hidden">Cerrar sesión</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
