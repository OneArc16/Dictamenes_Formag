import { NextResponse } from 'next/server';

import { requireAbilityApi } from '@/lib/auth/api-guards';
import { hasCaseScope } from '@/lib/auth/case-scope';
import {
  ADJUNTOS_MAX_POR_DICTAMEN,
  matchesAdjuntoSignature,
  sanitizeAdjuntoName,
  validateAdjunto,
} from '@/lib/dictamen/adjuntos';
import { deleteAdjuntoFile, saveAdjuntoFile } from '@/lib/dictamen/adjuntos-storage';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type RouteContext = { params: Promise<{ id: string }> };

async function loadDictamen(idParam: string) {
  const id = Number(idParam);
  if (!Number.isInteger(id) || id <= 0) return null;
  return prisma.dictamen.findUnique({
    where: { id },
    select: { id: true, empleadoId: true, estado: true },
  });
}

export async function GET(_req: Request, context: RouteContext) {
  const guard = await requireAbilityApi('dictamen.adjunto.read');
  if (!guard.ok) return NextResponse.json({ ok: false, error: guard.error }, { status: guard.status });

  const dictamen = await loadDictamen((await context.params).id);
  if (!dictamen) return NextResponse.json({ ok: false, error: 'Dictamen no encontrado.' }, { status: 404 });
  if (!hasCaseScope(guard.auth, dictamen.empleadoId)) {
    return NextResponse.json({ ok: false, error: 'No tiene acceso a este dictamen.' }, { status: 403 });
  }

  const adjuntos = await prisma.dictamenAdjunto.findMany({
    where: { dictamenId: dictamen.id },
    orderBy: { createdAt: 'desc' },
    select: { id: true, nombre: true, mimeType: true, tamano: true, createdAt: true, createdBy: true },
  });

  return NextResponse.json({ ok: true, adjuntos });
}

export async function POST(req: Request, context: RouteContext) {
  try {
    const guard = await requireAbilityApi('dictamen.adjunto.manage');
    if (!guard.ok) return NextResponse.json({ ok: false, error: guard.error }, { status: guard.status });

    const dictamen = await loadDictamen((await context.params).id);
    if (!dictamen) return NextResponse.json({ ok: false, error: 'Dictamen no encontrado.' }, { status: 404 });
    if (!hasCaseScope(guard.auth, dictamen.empleadoId)) {
      return NextResponse.json({ ok: false, error: 'No tiene acceso a este dictamen.' }, { status: 403 });
    }
    if (!dictamen.estado) {
      return NextResponse.json({ ok: false, error: 'El dictamen está cerrado.' }, { status: 409 });
    }

    const form = await req.formData().catch(() => null);
    const file = form?.get('archivo');
    if (!(file instanceof File)) {
      return NextResponse.json({ ok: false, error: 'Selecciona un archivo.' }, { status: 400 });
    }

    const validation = validateAdjunto(file);
    if (!validation.ok) {
      return NextResponse.json({ ok: false, error: validation.error }, { status: 400 });
    }

    const bytes = new Uint8Array(await file.arrayBuffer());
    if (!matchesAdjuntoSignature(bytes, file.type)) {
      return NextResponse.json(
        { ok: false, error: 'El contenido del archivo no corresponde a su tipo.' },
        { status: 400 },
      );
    }

    const total = await prisma.dictamenAdjunto.count({ where: { dictamenId: dictamen.id } });
    if (total >= ADJUNTOS_MAX_POR_DICTAMEN) {
      return NextResponse.json(
        { ok: false, error: `Máximo ${ADJUNTOS_MAX_POR_DICTAMEN} documentos por dictamen.` },
        { status: 400 },
      );
    }

    const rutaArchivo = await saveAdjuntoFile(dictamen.id, file.type, bytes);
    let created: { id: number };
    try {
      created = await prisma.dictamenAdjunto.create({
        data: {
          dictamenId: dictamen.id,
          nombre: sanitizeAdjuntoName(file.name),
          mimeType: file.type,
          tamano: file.size,
          rutaArchivo,
          createdBy: String(guard.payload.name ?? guard.payload.sub ?? '').trim() || null,
        },
        select: { id: true },
      });
    } catch (error) {
      await deleteAdjuntoFile(rutaArchivo).catch(() => undefined);
      throw error;
    }

    return NextResponse.json({ ok: true, id: created.id });
  } catch (error) {
    console.error('ERROR POST /api/dictamenes/[id]/adjuntos:', error);
    return NextResponse.json({ ok: false, error: 'No se pudo adjuntar el documento.' }, { status: 500 });
  }
}
