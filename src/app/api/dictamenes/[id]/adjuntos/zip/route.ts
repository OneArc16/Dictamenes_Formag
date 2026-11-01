import { NextResponse } from 'next/server';

import { requireAbilityApi } from '@/lib/auth/api-guards';
import { hasCaseScope } from '@/lib/auth/case-scope';
import { readAdjuntoFile } from '@/lib/dictamen/adjuntos-storage';
import { buildZip, uniqueZipNames } from '@/lib/dictamen/zip';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_req: Request, context: RouteContext) {
  const guard = await requireAbilityApi('dictamen.adjunto.read');
  if (!guard.ok) return NextResponse.json({ ok: false, error: guard.error }, { status: guard.status });

  const id = Number((await context.params).id);
  if (!Number.isInteger(id) || id <= 0) {
    return NextResponse.json({ ok: false, error: 'ID de dictamen inválido.' }, { status: 400 });
  }

  const dictamen = await prisma.dictamen.findUnique({
    where: { id },
    select: {
      id: true,
      empleadoId: true,
      adjuntos: {
        orderBy: { createdAt: 'asc' },
        select: { nombre: true, rutaArchivo: true },
      },
    },
  });
  if (!dictamen) return NextResponse.json({ ok: false, error: 'Dictamen no encontrado.' }, { status: 404 });
  if (!hasCaseScope(guard.auth, dictamen.empleadoId)) {
    return NextResponse.json({ ok: false, error: 'No tiene acceso a este dictamen.' }, { status: 403 });
  }
  if (dictamen.adjuntos.length === 0) {
    return NextResponse.json({ ok: false, error: 'El dictamen no tiene documentos adjuntos.' }, { status: 404 });
  }

  const names = uniqueZipNames(dictamen.adjuntos.map((adjunto) => adjunto.nombre));
  const entries = [];
  for (const [index, adjunto] of dictamen.adjuntos.entries()) {
    try {
      entries.push({ name: names[index], data: await readAdjuntoFile(adjunto.rutaArchivo) });
    } catch {
      return NextResponse.json(
        { ok: false, error: `El archivo "${adjunto.nombre}" no está disponible en el servidor.` },
        { status: 404 },
      );
    }
  }

  return new NextResponse(new Uint8Array(buildZip(entries)), {
    headers: {
      'Content-Type': 'application/zip',
      'Content-Disposition': `attachment; filename="adjuntos-dictamen-${dictamen.id}.zip"`,
      'X-Content-Type-Options': 'nosniff',
      'Cache-Control': 'private, no-store',
    },
  });
}
