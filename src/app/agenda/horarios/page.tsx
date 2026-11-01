import { listActiveModalities } from '@/features/agenda/infrastructure/modalities';
import WorkSchedulesManager from '@/features/agenda/presentation/WorkSchedulesManager';
import { requireAbility } from '@/lib/auth/guards';

export default async function WorkSchedulesPage() {
  await requireAbility('agenda.schedule.manage');
  return <WorkSchedulesManager modalities={await listActiveModalities()} />;
}
