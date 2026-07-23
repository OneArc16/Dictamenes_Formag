import { NextResponse } from 'next/server';

import { getFormularioOrigen } from '@/features/formulario-origen/application/origin-service';
import { originRouteError, parseDictamenId } from '@/features/formulario-origen/application/http';
import { requireAbilityApi } from '@/lib/auth/api-guards';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(_req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireAbilityApi('formulario_origen.read');
    if (!auth.ok) {
      return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });
    }
    const { id } = await context.params;
    const formulario = await getFormularioOrigen(parseDictamenId(id), auth.auth);
    return NextResponse.json({ ok: true, formulario });
  } catch (error) {
    return originRouteError(error, 'GET /api/dictamenes/[id]/origen');
  }
}
