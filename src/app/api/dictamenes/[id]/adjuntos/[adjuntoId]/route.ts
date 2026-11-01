import { NextResponse } from 'next/server';

import { requireAbilityApi } from '@/lib/auth/api-guards';
import { hasCaseScope } from '@/lib/auth/case-scope';
import { deleteAdjuntoFile, readAdjuntoFile } from '@/lib/dictamen/adjuntos-storage';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type RouteContext = { params: Promise<{ id: string; adjuntoId: string }> };

async function loadAdjunto(params: { id: string; adjuntoId: string }) {
  const dictamenId = Number(params.id);
  const adjuntoId = Number(params.adjuntoId);
  if (!Number.isInteger(dictamenId) || !Number.isInteger(adjuntoId)) return null;

  return prisma.dictamenAdjunto.findFirst({
    where: { id: adjuntoId, dictamenId },
    select: {
      id: true,
      nombre: true,
      mimeType: true,
      rutaArchivo: true,
      dictamen: { select: { empleadoId: true, estado: true } },
    },
  });
}

export async function GET(req: Request, context: RouteContext) {
  const guard = await requireAbilityApi('dictamen.adjunto.read');
  if (!guard.ok) return NextResponse.json({ ok: false, error: guard.error }, { status: guard.status });

  const adjunto = await loadAdjunto(await context.params);
  if (!adjunto) return NextResponse.json({ ok: false, error: 'Documento no encontrado.' }, { status: 404 });
  if (!hasCaseScope(guard.auth, adjunto.dictamen.empleadoId)) {
    return NextResponse.json({ ok: false, error: 'No tiene acceso a este dictamen.' }, { status: 403 });
  }

  let contenido: Buffer;
  try {
    contenido = await readAdjuntoFile(adjunto.rutaArchivo);
  } catch {
    return NextResponse.json({ ok: false, error: 'El archivo no está disponible en el servidor.' }, { status: 404 });
  }

  const download = new URL(req.url).searchParams.get('download') === '1';
  const disposition = download ? 'attachment' : 'inline';

  return new NextResponse(new Uint8Array(contenido), {
    headers: {
      'Content-Type': adjunto.mimeType,
      'Content-Disposition': `${disposition}; filename*=UTF-8''${encodeURIComponent(adjunto.nombre)}`,
      'X-Content-Type-Options': 'nosniff',
      'Cache-Control': 'private, no-store',
    },
  });
}

export async function DELETE(_req: Request, context: RouteContext) {
  const guard = await requireAbilityApi('dictamen.adjunto.manage');
  if (!guard.ok) return NextResponse.json({ ok: false, error: guard.error }, { status: guard.status });

  const adjunto = await loadAdjunto(await context.params);
  if (!adjunto) return NextResponse.json({ ok: false, error: 'Documento no encontrado.' }, { status: 404 });
  if (!hasCaseScope(guard.auth, adjunto.dictamen.empleadoId)) {
    return NextResponse.json({ ok: false, error: 'No tiene acceso a este dictamen.' }, { status: 403 });
  }
  if (!adjunto.dictamen.estado) {
    return NextResponse.json({ ok: false, error: 'El dictamen está cerrado.' }, { status: 409 });
  }

  await prisma.dictamenAdjunto.delete({ where: { id: adjunto.id } });
  await deleteAdjuntoFile(adjunto.rutaArchivo).catch((error) => {
    console.error('No se pudo borrar el archivo del adjunto', adjunto.id, error);
  });
  return NextResponse.json({ ok: true });
}
