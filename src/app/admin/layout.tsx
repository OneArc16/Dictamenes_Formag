import { requireAdmin } from '@/lib/auth/guards';
import AdminShell from './ui/AdminShell';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await requireAdmin();

  return (
    <AdminShell
      empleado={{
        nombre: session.name,
        perfil: session.perfilNombre ?? session.role,
        role: session.role,
      }}
      permissions={session.permissions}
    >
      {children}
    </AdminShell>
  );
}
