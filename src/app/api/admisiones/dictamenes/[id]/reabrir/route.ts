import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmisionesApi } from '@/lib/auth/api-guards';

export async function POST(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmisionesApi();
  if (!auth.ok) {
    return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });
  }

  const { id } = await params;
  const dictamenId = Number(id);

  if (!Number.isFinite(dictamenId)) {
    return NextResponse.json({ ok: false, error: 'ID inválido' }, { status: 400 });
  }

  const d = await prisma.dictamen.findUnique({
    where: { id: dictamenId },
    select: { id: true, estado: true, reabierto: true },
  });

  if (!d) {
    return NextResponse.json({ ok: false, error: 'Dictamen no encontrado' }, { status: 404 });
  }

  // estado=true = pendiente/abierto. Si ya está abierto, no hay nada que reabrir.
  if (d.estado === true) {
    return NextResponse.json(
      { ok: false, error: 'El dictamen ya está abierto (pendiente).' },
      { status: 409 }
    );
  }

  await prisma.dictamen.update({
    where: { id: dictamenId },
    data: {
      estado: true,
      reabierto: true,
    },
  });

  return NextResponse.json({ ok: true });
}
