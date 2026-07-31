import { availableDates } from '@/features/reception/application/reception-service';
import { positiveQuery, receptionAuth, receptionError, receptionJson } from '@/lib/http/with-reception-api';

export async function GET(request: Request) {
  const auth = await receptionAuth(request); if (!auth.ok) return auth.response;
  try { const query = new URL(request.url).searchParams; const from = query.get('from') ?? ''; const to = query.get('to') ?? ''; if (!/^\d{4}-\d{2}-\d{2}$/.test(from) || !/^\d{4}-\d{2}-\d{2}$/.test(to)) throw new Error('Fecha'); return receptionJson(request, await availableDates(auth.auth, positiveQuery(query.get('siteId'), 'Sede'), positiveQuery(query.get('specialtyId'), 'Especialidad'), new Date(`${from}T00:00:00.000Z`), new Date(`${to}T23:59:59.999Z`))); } catch (error) { return receptionError(request, error); }
}
