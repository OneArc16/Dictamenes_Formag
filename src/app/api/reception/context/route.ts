import { receptionContext } from '@/features/reception/application/reception-service';
import { receptionAuth, receptionError, receptionJson } from '@/lib/http/with-reception-api';

export async function GET(request: Request) {
  const auth = await receptionAuth(request);
  if (!auth.ok) return auth.response;
  try { return receptionJson(request, await receptionContext(auth.auth)); } catch (error) { return receptionError(request, error); }
}
