import { requireMedicoModule } from '@/lib/auth/guards';
import ModuleAppShell from '@/components/app-shell/ModuleAppShell';
import MedicoAccessProvider from '@/components/medico/MedicoAccessProvider';

export default async function MedicoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, readOnly } = await requireMedicoModule();

  return (
    <MedicoAccessProvider user={user} readOnly={readOnly}>
      <ModuleAppShell moduleKey="medicina-laboral" user={user}>
        {children}
      </ModuleAppShell>
    </MedicoAccessProvider>
  );
}
