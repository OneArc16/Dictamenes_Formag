import { requireMedicoModule } from '@/lib/auth/guards';
import MedicoAccessProvider from '@/components/medico/MedicoAccessProvider';

export default async function MedicoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, readOnly } = await requireMedicoModule();

  // ✅ NO AppNav aquí (para no duplicar headers)
  return (
    <MedicoAccessProvider user={user} readOnly={readOnly}>
      {children}
    </MedicoAccessProvider>
  );
}
