'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { LucideIcon } from 'lucide-react';
import {
  AppWindow,
  BarChart3,
  Stethoscope,
  Users2,
  ChevronDown,
} from 'lucide-react';

export type UserRole = 'ADMIN' | 'ADMISIONISTA' | 'MEDICO' | string | null;

export interface ModuleItem {
  id: string;
  label: string;
  href: string;
  description?: string;
  roles?: string[]; // roles que lo pueden ver
  icon?: LucideIcon;
  accentColorClass?: string; // color del icono
}

interface ModulesButtonProps {
  currentRole?: UserRole;
  modules?: ModuleItem[];
}

const DEFAULT_MODULES: ModuleItem[] = [
  {
    id: 'medico',
    label: 'Módulo médico',
    href: '/medico',
    description: 'Dictámenes PCL del médico.',
    roles: ['MEDICO', 'ADMIN'],
    icon: Stethoscope,
    accentColorClass: 'bg-blue-50 text-blue-600',
  },
  {
    id: 'admisiones',
    label: 'Admisiones',
    href: '/admisiones',
    description: 'Registro y gestión de docentes.',
    roles: ['ADMISIONISTA', 'ADMIN'],
    icon: Users2,
    accentColorClass: 'bg-emerald-50 text-emerald-600',
  },
  {
    id: 'reportes',
    label: 'Reportes',
    href: '/reportes',
    description: 'Indicadores y estadísticas.',
    roles: ['ADMIN'],
    icon: BarChart3,
    accentColorClass: 'bg-violet-50 text-violet-600',
  },
];

export function ModulesButton({
  currentRole = null,
  modules = DEFAULT_MODULES,
}: ModulesButtonProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const router = useRouter();

  // Siempre se llama el hook
  const visibleModules = useMemo(
    () =>
      modules.filter((m) =>
        m.roles && currentRole
          ? m.roles.includes(currentRole)
          : !m.roles || m.roles.length === 0
      ),
    [modules, currentRole]
  );

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

  // Si el rol no tiene módulos, no renderizamos nada
  if (!visibleModules.length) {
    return null;
  }

  const handleToggle = () => {
    setOpen((prev) => !prev);
  };

  const handleNavigate = (href: string) => {
    setOpen(false);
    router.push(href);
  };

  return (
    <div className="relative" ref={containerRef}>
      {/* Botón principal tipo launcher */}
      <button
        type="button"
        onClick={handleToggle}
        className="inline-flex items-center gap-1.5 rounded-full border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-50 hover:border-slate-400 transition-colors"
      >
        <AppWindow className="h-3.5 w-3.5 text-slate-500" />
        <span className="hidden sm:inline">Módulos</span>
        <ChevronDown
          className={`h-3 w-3 text-slate-500 transition-transform ${
            open ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 z-50 max-w-xs mt-2 bg-white border shadow-xl w-80 rounded-xl border-slate-200 shadow-slate-200/70">
          <div className="flex items-center justify-between px-3 py-2 border-b border-slate-100">
            <div>
              <p className="text-[11px] font-semibold text-slate-700">
                Selecciona un módulo
              </p>
              {currentRole && (
                <p className="text-[10px] text-slate-400">
                  Rol:{' '}
                  <span className="font-medium uppercase">
                    {String(currentRole)}
                  </span>
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-2 p-2">
            {visibleModules.map((m) => {
              const Icon = m.icon ?? AppWindow;
              const accent = m.accentColorClass ?? 'bg-slate-100 text-slate-700';

              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => handleNavigate(m.href)}
                  className="group w-full text-left rounded-lg border border-slate-100 bg-white px-3 py-2.5 hover:bg-slate-50 hover:border-slate-200 transition-colors flex items-center gap-3"
                >
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs ${accent} group-hover:scale-105 transition-transform`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[13px] font-medium text-slate-800">
                      {m.label}
                    </span>
                    {m.description && (
                      <span className="text-[11px] text-slate-500">
                        {m.description}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
