import { redirect } from 'next/navigation';

import { listActiveModalities } from '@/features/agenda/infrastructure/modalities';
import AgendaHome from '@/features/agenda/presentation/AgendaHome';
import { requireAgendaModule } from '@/lib/auth/guards';

export default async function AgendaPage() {
  const access = await requireAgendaModule();
  if (!access.canRead) redirect('/sin-acceso');
  return (
    <AgendaHome
      canCreate={access.canCreate}
      canCancel={access.canCancelSlots}
      modalities={await listActiveModalities()}
    />
  );
}
