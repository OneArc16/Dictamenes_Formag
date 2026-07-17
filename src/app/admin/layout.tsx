import { requireAdmin } from '@/lib/auth/guards';
import ModuleAppShell from '@/components/app-shell/ModuleAppShell';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await requireAdmin();

  return (
    <ModuleAppShell moduleKey="admin" user={session}>
      {children}
    </ModuleAppShell>
  );
}
