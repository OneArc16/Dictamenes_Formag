import { NextResponse } from 'next/server';
import { z } from 'zod';

import { originRouteError, parseDictamenId } from '@/features/formulario-origen/application/http';
import {
  getReopeningOptions,
  reopenDocument,
} from '@/features/formulario-origen/application/reopening-service';
import { requireAbilityApi } from '@/lib/auth/api-guards';

const legacySchema = z.object({
  motivoReaperturaId: z.coerce.number().int().positive(),
});

export async function POST(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireAbilityApi('dictamen.reopen');
    if (!auth.ok) return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });
    const { id } = await context.params;
    const dictamenId = parseDictamenId(id);
    const input = legacySchema.parse(await req.json());
    const options = await getReopeningOptions(dictamenId, auth.auth);
    if (!options.targets.includes('PCL') || !options.versions.PCL) {
      return NextResponse.json(
        { ok: false, code: 'REOPEN_NOT_ELIGIBLE', error: 'El PCL no es elegible para reapertura.' },
        { status: 409 },
      );
    }
    const result = await reopenDocument(dictamenId, auth.auth, {
      objetivo: 'PCL',
      motivoId: input.motivoReaperturaId,
      expectedVersion: options.versions.PCL,
      observacion: null,
    });
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    return originRouteError(error, 'POST legacy reabrir PCL');
  }
}
