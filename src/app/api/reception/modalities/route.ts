import { prisma } from '@/lib/prisma';
import { receptionAuth, receptionError, receptionJson } from '@/lib/http/with-reception-api';

export async function GET(request: Request) {
  const auth = await receptionAuth(request); if (!auth.ok) return auth.response;
  try { return receptionJson(request, await prisma.modalidadCita.findMany({ where: { estado: true }, select: { id: true, codigo: true, nombre: true }, orderBy: { nombre: 'asc' } })); } catch (error) { return receptionError(request, error); }
}
