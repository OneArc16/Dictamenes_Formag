import { redirect } from 'next/navigation';

import AgendaGenerationDetail from '@/features/agenda/presentation/AgendaGenerationDetail';
import { requireAgendaModule } from '@/lib/auth/guards';

export default async function AgendaGenerationPage({ params }: { params: Promise<{ id: string }> }) {
  const access = await requireAgendaModule();
  if (!access.canRead) redirect('/sin-acceso');
  const id = Number((await params).id);
  if (!Number.isInteger(id) || id <= 0) redirect('/agenda');
  return <AgendaGenerationDetail id={id} canCancel={access.canCancelSlots} />;
}
