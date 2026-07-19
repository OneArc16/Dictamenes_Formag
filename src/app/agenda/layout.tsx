import ModuleAppShell from '@/components/app-shell/ModuleAppShell';
import { requireAgendaModule } from '@/lib/auth/guards';

export default async function AgendaLayout({ children }: { children: React.ReactNode }) {
  const { user } = await requireAgendaModule();
  return (
    <ModuleAppShell moduleKey="agenda" user={user}>
      {children}
    </ModuleAppShell>
  );
}
