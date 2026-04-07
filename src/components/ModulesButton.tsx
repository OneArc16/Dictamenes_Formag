'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
  Check,
  ChevronDown,
  ClipboardPlus,
  Grid2X2,
  ShieldCheck,
  Stethoscope,
  UserSquare2,
} from 'lucide-react';

import { useAuthMe } from '@/hooks/useAuthMe';
import {
  getCurrentModule,
  getVisibleModules,
  type ModuleKey,
} from '@/lib/module-navigation';

type ModulesButtonProps = {
  canSwitchModules?: boolean;
};

const moduleIconMap: Record<ModuleKey, typeof Stethoscope> = {
  admin: ShieldCheck,
  medico: Stethoscope,
  admisiones: UserSquare2,
  recomendaciones: ClipboardPlus,
};

export default function ModulesButton({
  canSwitchModules = false,
}: ModulesButtonProps) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname() || '';
  const containerRef = useRef<HTMLDivElement | null>(null);
  const { data: user } = useAuthMe();

  useEffect(() => {
    if (!open) return;

    function handleClickOutside(event: MouseEvent) {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const currentModule = getCurrentModule(pathname);
  const visibleModules = useMemo(() => {
    if (!canSwitchModules) {
      return currentModule ? [currentModule] : [];
    }

    const modules = getVisibleModules({
      role: user?.role ?? null,
      permissions: user?.permissions ?? [],
    });

    if (modules.length > 0) {
      return modules;
    }

    return currentModule ? [currentModule] : [];
  }, [canSwitchModules, currentModule, user?.permissions, user?.role]);

  const handleNavigate = (href: string) => {
    setOpen(false);
    if (href !== pathname) {
      router.push(href);
    }
  };

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-medium text-slate-700 shadow-sm hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/60 focus:ring-offset-1 focus:ring-offset-white"
      >
        <Grid2X2 className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">
          {currentModule?.label ?? 'Modulos'}
        </span>
        <ChevronDown
          className={`h-3 w-3 text-slate-500 transition-transform ${
            open ? 'rotate-180' : ''
          }`}
        />
      </button>

      {open && visibleModules.length > 0 ? (
        <div className="absolute right-0 mt-2 w-52 rounded-lg border border-slate-200 bg-white py-1 text-xs shadow-lg shadow-slate-200/70">
          {visibleModules.map((module) => {
            const active =
              pathname === module.href || pathname.startsWith(`${module.href}/`);
            const Icon = moduleIconMap[module.key];

            return (
              <button
                key={module.key}
                type="button"
                onClick={() =>
                  canSwitchModules ? handleNavigate(module.href) : setOpen(false)
                }
                className={`flex w-full items-center gap-2 px-3 py-1.5 text-left text-[11px] ${
                  active
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span className="flex items-center justify-center rounded-full bg-slate-100 p-1">
                  <Icon className="h-3.5 w-3.5" />
                </span>
                <span className="flex-1 truncate">{module.label}</span>
                {active ? <Check className="h-3 w-3 text-blue-600" /> : null}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}