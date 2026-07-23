import { NextResponse } from 'next/server';

import { originRouteError, parseDictamenId } from '@/features/formulario-origen/application/http';
import { saveDiagnosticosOrigen } from '@/features/formulario-origen/application/origin-service';
import { diagnosticosOrigenSchema } from '@/features/formulario-origen/domain/schemas';
import { requireAbilityApi } from '@/lib/auth/api-guards';

export async function PUT(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireAbilityApi('formulario_origen.edit');
    if (!auth.ok) return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });
    const { id } = await context.params;
    const input = diagnosticosOrigenSchema.parse(await req.json());
    const formulario = await saveDiagnosticosOrigen(parseDictamenId(id), auth.auth, input);
    return NextResponse.json({ ok: true, formulario });
  } catch (error) {
    return originRouteError(error, 'PUT origen/diagnosticos');
  }
}
