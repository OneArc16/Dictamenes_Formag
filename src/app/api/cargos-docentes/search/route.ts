import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const q = new URL(req.url).searchParams.get('q')?.trim() ?? '';

  // ✅ No buscar si no hay mínimo 3 letras
  if (q.length < 3) {
    return Response.json({ ok: true, items: [] });
  }

  const items = await prisma.cargoDocente.findMany({
    where: {
      OR: [
        { nombre: { contains: q, mode: 'insensitive' } },
        { codigo: { contains: q, mode: 'insensitive' } },
      ],
    },
    take: 20,
    orderBy: { nombre: 'asc' },
    select: { id: true, codigo: true, nombre: true },
  });

  return Response.json({ ok: true, items });
}