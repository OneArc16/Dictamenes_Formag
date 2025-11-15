// src/components/Appnav.tsx
'use client';

import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useRouter } from 'next/navigation';

interface AppnavProps {
  title?: string;
}

export default function Appnav({ title }: AppnavProps) {
  const { user } = useCurrentUser();
  const router = useRouter();

  const displayName = user?.name || 'Usuario';

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    router.push('/login');
  };

  return (
    <header className="w-full border-b bg-slate-50">
      <div className="flex items-center justify-between max-w-6xl gap-3 px-4 py-3 mx-auto">
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

        <button
          onClick={handleLogout}
          className="text-xs px-3 py-1.5 rounded-md border bg-white hover:bg-slate-100"
        >
          Cerrar sesión
        </button>
      </div>
    </header>
  );
}
