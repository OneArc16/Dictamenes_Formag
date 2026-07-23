import { NextResponse } from 'next/server';

import { originRouteError, parseDictamenId } from '@/features/formulario-origen/application/http';
import { saveDescripcionOrigen } from '@/features/formulario-origen/application/origin-service';
import { descripcionOrigenSchema } from '@/features/formulario-origen/domain/schemas';
import { requireAbilityApi } from '@/lib/auth/api-guards';

export async function PATCH(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireAbilityApi('formulario_origen.edit');
    if (!auth.ok) return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });
    const { id } = await context.params;
    const input = descripcionOrigenSchema.parse(await req.json());
    const formulario = await saveDescripcionOrigen(parseDictamenId(id), auth.auth, input);
    return NextResponse.json({ ok: true, formulario });
  } catch (error) {
    return originRouteError(error, 'PATCH origen/descripcion');
  }
}
