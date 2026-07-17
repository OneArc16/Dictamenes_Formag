'use client';

import { FileText } from 'lucide-react';

type AppNavProps = {
  title?: string;
  showModulesButton?: boolean;
  canSwitchModules?: boolean;
};

export default function AppNav({
  title = 'Módulo',
  showModulesButton,
  canSwitchModules,
}: AppNavProps) {
  // Compatibilidad durante la migración: la navegación global ahora pertenece
  // al ModuleAppShell y estas opciones ya no alteran el encabezado contextual.
  void showModulesButton;
  void canSwitchModules;

  return (
    <header className="border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="flex min-h-14 items-center px-4 py-2">
        <div className="flex min-w-0 items-center gap-3">
          <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-700">
            <FileText className="h-4 w-4" aria-hidden="true" />
          </span>
          <div className="min-w-0 leading-tight">
            <span className="block truncate text-sm font-semibold text-slate-900">
              {title}
            </span>
            <span className="mt-0.5 block text-[11px] text-slate-500">
              Información del módulo
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
