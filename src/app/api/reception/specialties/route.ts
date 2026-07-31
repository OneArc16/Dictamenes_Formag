import { availableSpecialties } from '@/features/reception/application/reception-service';
import { positiveQuery, receptionAuth, receptionError, receptionJson } from '@/lib/http/with-reception-api';

export async function GET(request: Request) {
  const auth = await receptionAuth(request); if (!auth.ok) return auth.response;
  try { const siteId = positiveQuery(new URL(request.url).searchParams.get('siteId'), 'Sede'); return receptionJson(request, await availableSpecialties(auth.auth, siteId)); } catch (error) { return receptionError(request, error); }
}
