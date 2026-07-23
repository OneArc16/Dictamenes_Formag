import { NextResponse } from 'next/server';

import { originRouteError, parseDictamenId } from '@/features/formulario-origen/application/http';
import { requireAbilityApi } from '@/lib/auth/api-guards';
import { hasCaseScope } from '@/lib/auth/case-scope';
import { prisma } from '@/lib/prisma';

export async function GET(_req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireAbilityApi('formulario_origen.read');
    if (!auth.ok) return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });
    const { id } = await context.params;
    const origin = await prisma.formularioOrigen.findUnique({
      where: { dictamenId: parseDictamenId(id) },
      select: {
        dictamen: { select: { empleadoId: true } },
        versiones: {
          orderBy: { numeroVersion: 'desc' },
          select: {
            numeroVersion: true,
            createdAt: true,
            motivo: true,
            actor: { select: { primerNombre: true, primerApellido: true } },
          },
        },
      },
    });
    if (!origin) return NextResponse.json({ ok: false, error: 'Formulario no encontrado.' }, { status: 404 });
    if (!hasCaseScope(auth.auth, origin.dictamen.empleadoId)) {
      return NextResponse.json({ ok: false, error: 'No autorizado.' }, { status: 403 });
    }
    return NextResponse.json({
      ok: true,
      versions: origin.versiones.map((version) => ({
        numeroVersion: version.numeroVersion,
        createdAt: version.createdAt.toISOString(),
        motivo: version.motivo,
        actorNombre: version.actor
          ? `${version.actor.primerNombre} ${version.actor.primerApellido}`.trim()
          : null,
      })),
    });
  } catch (error) {
    return originRouteError(error, 'GET origen/versiones');
  }
}
