import { requireAdmisionesModule } from '@/lib/auth/guards';
import ModuleAppShell from '@/components/app-shell/ModuleAppShell';
import AdmisionesAccessProvider from '@/components/admisiones/AdmisionesAccessProvider';

export default async function AdmisionesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, canReabrirDictamen } = await requireAdmisionesModule();

  return (
    <AdmisionesAccessProvider user={user} canReabrirDictamen={canReabrirDictamen}>
      <ModuleAppShell moduleKey="admisiones" user={user}>
        {children}
      </ModuleAppShell>
    </AdmisionesAccessProvider>
  );
}
