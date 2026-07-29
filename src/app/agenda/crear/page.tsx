import { getAgendaCreationContext } from '@/features/agenda/application/agenda-creation-context';
import AgendaCreationForm from '@/features/agenda/presentation/creation/AgendaCreationForm';
import { requireAbility } from '@/lib/auth/guards';

export default async function CreateAgendaPage() {
  const auth = await requireAbility('agenda.create');
  const context = await getAgendaCreationContext(auth.empleadoId);
  return <AgendaCreationForm context={context} />;
}
