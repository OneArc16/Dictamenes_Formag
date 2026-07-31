import { requireAbility } from '@/lib/auth/guards';
import PatientReceptionPage from '@/features/reception/presentation/PatientReceptionPage';

export default async function ReceptionPatientsPage() {
  await requireAbility('reception.read');
  return <PatientReceptionPage />;
}
