// src/components/ModulesButton.tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
  Grid2X2,
  ChevronDown,
  Stethoscope,
  ShieldCheck,
  UserSquare2,
  BarChart3,
  Check,
} from 'lucide-react';

type ModuleItem = {
  label: string;
  href: string;
  icon: React.ReactNode;
};

type ModulesButtonProps = {
  /** Solo cuando sea true (ADMIN) se permite cambiar de módulo */
  canSwitchModules?: boolean;
};

const MODULES: ModuleItem[] = [
  {
    label: 'Médico',
    href: '/medico',
    icon: <Stethoscope className="h-3.5 w-3.5" />,
  },
  {
    label: 'Administrador',
    href: '/admin',
    icon: <ShieldCheck className="h-3.5 w-3.5" />,
  },
  {
    label: 'Admisiones',
    href: '/admisiones',
    icon: <UserSquare2 className="h-3.5 w-3.5" />,
  },
  {
    label: 'Reportes',
    href: '/reportes',
    icon: <BarChart3 className="h-3.5 w-3.5" />,
  },
];

export default function ModulesButton({
  canSwitchModules = false,
}: ModulesButtonProps) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname() || '';
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Cerrar al hacer click fuera
  useEffect(() => {
    if (!open) return;

    function handleClickOutside(e: MouseEvent) {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const currentModule =
    MODULES.find((m) =>
      pathname === '/'
        ? false
        : pathname === m.href || pathname.startsWith(m.href + '/')
    ) ?? null;

  // 👇 Si no puede cambiar de módulo, solo mostramos el módulo actual
  const visibleModules: ModuleItem[] = canSwitchModules
    ? MODULES
    : currentModule
    ? [currentModule]
    : [];

  const handleNavigate = (href: string) => {
    setOpen(false);
    // Si ya estamos en ese módulo, no hace nada
    if (href !== pathname) {
      router.push(href);
    }
  };

  const buttonLabel = currentModule ? currentModule.label : 'Módulos';

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-medium text-slate-700 shadow-sm
                   hover:bg-slate-50 hover:border-slate-300 hover:text-slate-900
                   focus:outline-none focus:ring-2 focus:ring-blue-500/60 focus:ring-offset-1 focus:ring-offset-white"
      >
        <Grid2X2 className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">{buttonLabel}</span>
        <ChevronDown
          className={`h-3 w-3 text-slate-500 transition-transform ${
            open ? 'rotate-180' : ''
          }`}
        />
      </button>

      {open && visibleModules.length > 0 && (
        <div className="absolute right-0 w-48 py-1 mt-2 text-xs bg-white border rounded-lg shadow-lg border-slate-200 shadow-slate-200/70">
          {visibleModules.map((mod) => {
            const active =
              pathname === mod.href || pathname.startsWith(mod.href + '/');

            const baseClasses =
              'flex w-full items-center gap-2 px-3 py-1.5 text-left text-[11px]';
            const stateClasses = active
              ? 'bg-blue-50 text-blue-700'
              : 'text-slate-700 hover:bg-slate-50';

            return (
              <button
                key={mod.href}
                type="button"
                onClick={() =>
                  canSwitchModules ? handleNavigate(mod.href) : setOpen(false)
                }
                className={`${baseClasses} ${stateClasses}`}
              >
                <span className="flex items-center justify-center p-1 rounded-full bg-slate-100">
                  {mod.icon}
                </span>
                <span className="flex-1 truncate">{mod.label}</span>
                {active && <Check className="w-3 h-3 text-blue-600" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
