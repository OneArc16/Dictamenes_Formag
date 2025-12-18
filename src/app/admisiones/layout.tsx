import { requireAdmisionesModule } from '@/lib/auth/guards';
import AdmisionesAccessProvider from '@/components/admisiones/AdmisionesAccessProvider';

export default async function AdmisionesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, canReabrirDictamen } = await requireAdmisionesModule();

  // ✅ NO AppNav aquí (si ya lo trae tu módulo)
  return (
    <AdmisionesAccessProvider user={user} canReabrirDictamen={canReabrirDictamen}>
      {children}
    </AdmisionesAccessProvider>
  );
}
