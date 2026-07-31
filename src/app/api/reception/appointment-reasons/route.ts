import { prisma } from '@/lib/prisma';
import { receptionAuth, receptionError, receptionJson } from '@/lib/http/with-reception-api';

export async function GET(request: Request) {
  const auth = await receptionAuth(request);
  if (!auth.ok) return auth.response;
  try {
    const type = new URL(request.url).searchParams.get('type');
    if (type !== 'CANCELACION' && type !== 'REPROGRAMACION') {
      return receptionJson(request, []);
    }
    const reasons = await prisma.motivoCambioCita.findMany({
      where: { tipo: type, estado: true },
      select: { codigo: true, nombre: true },
      orderBy: { nombre: 'asc' },
    });
    return receptionJson(request, reasons);
  } catch (error) { return receptionError(request, error); }
}
