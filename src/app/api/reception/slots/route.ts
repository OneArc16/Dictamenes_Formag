import { availableSlots } from '@/features/reception/application/reception-service';
import { positiveQuery, receptionAuth, receptionError, receptionJson } from '@/lib/http/with-reception-api';

export async function GET(request: Request) {
  const auth = await receptionAuth(request); if (!auth.ok) return auth.response;
  try { const query = new URL(request.url).searchParams; const date = query.get('date') ?? ''; if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new Error('Fecha'); return receptionJson(request, await availableSlots(auth.auth, positiveQuery(query.get('siteId'), 'Sede'), positiveQuery(query.get('specialtyId'), 'Especialidad'), positiveQuery(query.get('doctorId'), 'Médico'), date)); } catch (error) { return receptionError(request, error); }
}
