import { renderToBuffer } from '@react-pdf/renderer';
import React from 'react';
import { NextResponse } from 'next/server';

import { originRouteError, parseDictamenId } from '@/features/formulario-origen/application/http';
import {
  FormularioOrigenPdf,
  type FormularioOrigenSnapshot,
} from '@/features/formulario-origen/presentation/FormularioOrigenPdf';
import { requireAbilityApi } from '@/lib/auth/api-guards';
import { hasCaseScope } from '@/lib/auth/case-scope';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

export async function GET(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireAbilityApi('formulario_origen.read');
    if (!auth.ok) return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });
    const { id } = await context.params;
    const dictamenId = parseDictamenId(id);
    const requestedVersion = Number(new URL(req.url).searchParams.get('version'));
    const origin = await prisma.formularioOrigen.findUnique({
      where: { dictamenId },
      select: {
        dictamen: { select: { empleadoId: true } },
        versiones: {
          where:
            Number.isInteger(requestedVersion) && requestedVersion > 0
              ? { numeroVersion: requestedVersion }
              : undefined,
          orderBy: { numeroVersion: 'desc' },
          take: 1,
          select: { numeroVersion: true, snapshot: true },
        },
      },
    });
    if (!origin) return NextResponse.json({ ok: false, error: 'Formulario no encontrado.' }, { status: 404 });
    if (!hasCaseScope(auth.auth, origin.dictamen.empleadoId)) {
      return NextResponse.json({ ok: false, error: 'No autorizado.' }, { status: 403 });
    }
    const version = origin.versiones[0];
    if (!version) {
      return NextResponse.json(
        { ok: false, error: 'El certificado solo está disponible para versiones finalizadas.' },
        { status: 409 },
      );
    }

    const document = React.createElement(FormularioOrigenPdf, {
      data: version.snapshot as FormularioOrigenSnapshot,
    });
    const buffer = await renderToBuffer(document as never);
    const body = buffer.buffer.slice(
      buffer.byteOffset,
      buffer.byteOffset + buffer.byteLength,
    ) as ArrayBuffer;

    return new Response(body, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="formulario-origen-${dictamenId}-v${version.numeroVersion}.pdf"`,
        'Cache-Control': 'private, no-store',
      },
    });
  } catch (error) {
    return originRouteError(error, 'GET origen/pdf');
  }
}
