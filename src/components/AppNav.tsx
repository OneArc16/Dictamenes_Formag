'use client';

import { useRouter } from 'next/navigation';
import { ModulesButton } from '@/components/ModulesButton';
import { useCurrentUser } from '@/hooks/useCurrentUser';

interface AppnavProps {
  title?: string;
}

export default function Appnav({ title }: AppnavProps) {
  const router = useRouter();
  const { user } = useCurrentUser();

  const displayName = user?.name || 'Usuario';
  const role = (user?.role as any) ?? null;

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch (e) {
      // ignoramos errores de logout
    } finally {
      router.push('/login');
    }
  };

  return (
    <header className="w-full border-b bg-slate-50">
      <div className="flex items-center justify-between max-w-6xl gap-3 px-4 py-3 mx-auto">
        {/* Izquierda: avatar + nombre + título */}
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 text-sm font-semibold text-white bg-blue-600 rounded-full">
            {displayName.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="text-sm font-medium text-slate-800">
              {displayName}
            </div>
            {title && (
              <div className="text-xs text-slate-500">{title}</div>
            )}
          </div>
        </div>

        {/* Derecha: botón de módulos + cerrar sesión */}
        <div className="flex items-center gap-2">
          {/* Botón de módulos */}
          <ModulesButton currentRole={role} />

          {/* Botón cerrar sesión */}
          <button
            type="button"
            onClick={handleLogout}
            className="text-xs px-3 py-1.5 rounded-md border bg-white hover:bg-slate-100"
          >
            Cerrar sesión
          </button>
        </div>
      </div>
    </header>
  );
}
