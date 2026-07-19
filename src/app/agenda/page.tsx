import { redirect } from 'next/navigation';

import AgendaGenerationsList from '@/features/agenda/presentation/AgendaGenerationsList';
import { requireAgendaModule } from '@/lib/auth/guards';

export default async function AgendaPage() {
  const access = await requireAgendaModule();
  if (!access.canRead) redirect('/sin-acceso');
  return <AgendaGenerationsList canCreate={access.canCreate} />;
}
