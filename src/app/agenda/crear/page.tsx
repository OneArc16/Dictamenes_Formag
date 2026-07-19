import AgendaCreationWizard from '@/features/agenda/presentation/AgendaCreationWizard';
import { requireAbility } from '@/lib/auth/guards';

export default async function CreateAgendaPage() {
  await requireAbility('agenda.create');
  return <AgendaCreationWizard />;
}
