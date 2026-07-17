import { requireRecomendacionesModule } from '@/lib/auth/guards';
import ModuleAppShell from '@/components/app-shell/ModuleAppShell';

export default async function RecomendacionesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = await requireRecomendacionesModule();

  return (
    <ModuleAppShell moduleKey="recomendaciones" user={user}>
      {children}
    </ModuleAppShell>
  );
}
