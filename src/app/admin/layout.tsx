import { cookies } from 'next/headers';
import { requireAdmin } from '@/lib/auth/guards';
import { ADMIN_MODE_COOKIE, type AdminMode } from '@/lib/rbac';
import AdminShell from './ui/AdminShell';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await requireAdmin();

  const cookieStore = await cookies();
  const raw = cookieStore.get(ADMIN_MODE_COOKIE)?.value as AdminMode | undefined;
  const mode: AdminMode =
    raw && ['ADMIN', 'MEDICO_VIEW', 'ADMISION'].includes(raw) ? raw : 'ADMIN';

  return (
    <AdminShell
      empleado={{ nombre: session.name, perfil: session.role }}
      mode={mode}
    >
      {children}
    </AdminShell>
  );
}
