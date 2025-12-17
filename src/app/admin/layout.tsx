import AppNav from '@/components/AppNav';
import { cookies } from 'next/headers';
import { requireAdmin } from '@/lib/auth/guards';
import { ADMIN_MODE_COOKIE, type AdminMode } from '@/lib/rbac';
import AdminShell from './ui/AdminShell';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await requireAdmin();

  // (opcional) mantenemos el modo por si después lo reactivas en otra parte
  const cookieStore = await cookies();
  const raw = cookieStore.get(ADMIN_MODE_COOKIE)?.value as AdminMode | undefined;
  const mode: AdminMode =
    raw && ['ADMIN', 'MEDICO_VIEW', 'ADMISION'].includes(raw) ? raw : 'ADMIN';

  return (
    <div className="min-h-screen bg-slate-50">
      <AppNav />

      <div className="px-4 py-4 mx-auto max-w-7xl">
        <AdminShell
          empleado={{ nombre: session.name, perfil: session.role }}
          mode={mode}
        >
          {children}
        </AdminShell>
      </div>
    </div>
  );
}
