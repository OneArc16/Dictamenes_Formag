import { NextResponse } from 'next/server';

import { originRouteError, parseDictamenId } from '@/features/formulario-origen/application/http';
import { finalizarFormularioOrigen } from '@/features/formulario-origen/application/origin-service';
import { finalizarOrigenSchema } from '@/features/formulario-origen/domain/schemas';
import { requireAbilityApi } from '@/lib/auth/api-guards';

export async function POST(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireAbilityApi('formulario_origen.finalize');
    if (!auth.ok) return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });
    const { id } = await context.params;
    const input = finalizarOrigenSchema.parse(await req.json());
    const formulario = await finalizarFormularioOrigen(
      parseDictamenId(id),
      auth.auth,
      input.expectedVersion,
    );
    return NextResponse.json({ ok: true, formulario });
  } catch (error) {
    return originRouteError(error, 'POST origen/finalizar');
  }
}
