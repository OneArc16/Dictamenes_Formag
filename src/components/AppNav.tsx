// src/components/AppNav.tsx
'use client';

import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';
import ModulesButton from './ModulesButton';

type AppnavProps = {
  title?: string;
  /** Ocultar o mostrar el botón de módulos */
  showModulesButton?: boolean;
  /** Solo true para ADMIN: puede cambiar de módulo */
  canSwitchModules?: boolean;
};

export default function Appnav({
  title = 'Módulo',
  showModulesButton = true,
  canSwitchModules = false,
}: AppnavProps) {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch (err) {
      console.error('Error al cerrar sesión', err);
    } finally {
      router.replace('/login');
      router.refresh();
    }
  };

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="flex items-center justify-between max-w-6xl px-4 py-2 mx-auto">
        {/* Lado izquierdo: título */}
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center justify-center text-xs font-bold text-white bg-blue-600 rounded-full shadow-sm h-7 w-7">
            D
          </span>
          <div className="flex flex-col leading-tight">
            <span className="text-xs font-semibold text-slate-800">
              {title}
            </span>
            <span className="text-[10px] text-slate-400">
              Plataforma de dictámenes PCL
            </span>
          </div>
        </div>

        {/* Lado derecho: módulos + logout */}
        <div className="flex items-center gap-2">
          {showModulesButton && (
            <ModulesButton canSwitchModules={canSwitchModules} />
          )}

          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-[11px] font-medium text-slate-700 shadow-sm transition
                       hover:bg-slate-100 hover:text-slate-900 hover:border-slate-300
                       focus:outline-none focus:ring-2 focus:ring-blue-500/60 focus:ring-offset-1 focus:ring-offset-white"
            title="Cerrar sesión"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Cerrar sesión</span>
          </button>
        </div>
      </div>
    </header>
  );
}
