import { requireMedicoModule } from '@/lib/auth/guards';
import ModuleAppShell from '@/components/app-shell/ModuleAppShell';

export default async function AtencionesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = await requireMedicoModule();

  return (
    <ModuleAppShell moduleKey="medicina-laboral" user={user}>
      {children}
    </ModuleAppShell>
  );
}
