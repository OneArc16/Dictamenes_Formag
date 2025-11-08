'use client';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export default function AppNav({ name, role }: { name?: string; role?: string }) {
  const router = useRouter();

  async function logout() {
    const t = toast.loading('Cerrando sesión…');
    await fetch('/api/auth/logout', { method: 'POST' });
    toast.success('Sesión finalizada', { id: t });
    router.replace('/login');
  }

  return (
    <header className="sticky top-0 z-30 border-b border-subtle bg-panel/85 backdrop-blur">
      <div className="flex items-center justify-between max-w-6xl px-4 mx-auto h-14">
        <div className="flex items-center gap-3">
          <span className="inline-grid w-8 h-8 text-white shadow-sm place-items-center rounded-xl bg-gradient-to-tr from-brand-400 to-brand-600">
            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor">
              <path d="M12 3l9 6-9 6-9-6 9-6Z" strokeWidth="2" />
            </svg>
          </span>
          <div className="text-sm">
            <span className="font-medium">{name ?? 'Usuario'}</span>
            {role && (
              <span className="ml-2 rounded-full border border-subtle bg-bg px-2 py-0.5 text-xs capitalize text-muted">
                {role.toLowerCase()}
              </span>
            )}
          </div>
        </div>

        <button
          onClick={logout}
          className="rounded-lg border border-subtle bg-panel px-3 py-1.5 text-sm text-text hover:bg-bg"
        >
          Cerrar sesión
        </button>
      </div>
    </header>
  );
}
