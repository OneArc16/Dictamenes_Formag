import { NextResponse } from 'next/server';
import { z } from 'zod';

import { originRouteError, parseDictamenId } from '@/features/formulario-origen/application/http';
import {
  getReopeningOptions,
  reopenDocument,
} from '@/features/formulario-origen/application/reopening-service';
import { hasAnyAbility } from '@/lib/auth/ability-utils';
import { requireAbilityApi } from '@/lib/auth/api-guards';

export const runtime = 'nodejs';

const schema = z.object({
  motivoReaperturaId: z.coerce.number().int().positive(),
});

export async function POST(
  req: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const auth = await requireAbilityApi('dictamen.reopen');
    if (!auth.ok) {
      return NextResponse.json(
        { ok: false, error: auth.error },
        { status: auth.status },
      );
    }
    if (
      !hasAnyAbility(auth.auth, [
        'module.admin.access',
        'module.admisiones.access',
      ])
    ) {
      return NextResponse.json(
        { ok: false, error: 'No autorizado.' },
        { status: 403 },
      );
    }

    const { id } = await context.params;
    const dictamenId = parseDictamenId(id);
    const input = schema.parse(await req.json());
    const options = await getReopeningOptions(dictamenId, auth.auth);
    const expectedVersion = options.versions.PCL;
    if (!options.targets.includes('PCL') || !expectedVersion) {
      return NextResponse.json(
        {
          ok: false,
          code: 'REOPEN_NOT_ELIGIBLE',
          error: 'El Dictamen PCL no es elegible para reapertura.',
        },
        { status: 409 },
      );
    }

    const result = await reopenDocument(dictamenId, auth.auth, {
      objetivo: 'PCL',
      motivoId: input.motivoReaperturaId,
      observacion: null,
      expectedVersion,
    });

    return NextResponse.json({
      ok: true,
      dictamen: { id: dictamenId, estado: 'REABIERTO' as const },
      motivoReapertura: result.motivo,
      route: result.route,
    });
  } catch (error) {
    return originRouteError(
      error,
      'POST /api/admisiones/dictamenes/[id]/reabrir',
    );
  }
}
