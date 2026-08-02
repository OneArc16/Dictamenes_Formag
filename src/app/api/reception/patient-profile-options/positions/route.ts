import { prisma } from '@/lib/prisma';
import { receptionAuth, receptionError, receptionJson } from '@/lib/http/with-reception-api';

export async function GET(request: Request) {
  const auth = await receptionAuth(request);
  if (!auth.ok) return auth.response;

  try {
    const query = new URL(request.url).searchParams.get('q')?.trim() ?? '';
    if (query.length < 3) return receptionJson(request, []);

    const positions = await prisma.cargoDocente.findMany({
      where: {
        estado: true,
        OR: [
          { nombre: { contains: query, mode: 'insensitive' } },
          { codigo: { contains: query, mode: 'insensitive' } },
        ],
      },
      select: { id: true, codigo: true, nombre: true },
      orderBy: { nombre: 'asc' },
      take: 50,
    });

    return receptionJson(request, positions.map((item) => ({
      value: String(item.id),
      label: item.codigo ? `${item.nombre} (${item.codigo})` : item.nombre,
    })));
  } catch (error) {
    return receptionError(request, error);
  }
}
