import { NextResponse } from 'next/server';

import { originRouteError, parseDictamenId } from '@/features/formulario-origen/application/http';
import { getReopeningOptions } from '@/features/formulario-origen/application/reopening-service';
import { requireAnyAbilityApi } from '@/lib/auth/api-guards';

export async function GET(_req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireAnyAbilityApi([
      'formulario_origen.reopen',
      'dictamen.reopen',
    ]);
    if (!auth.ok) return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });
    const { id } = await context.params;
    const options = await getReopeningOptions(parseDictamenId(id), auth.auth);
    return NextResponse.json({ ok: true, ...options });
  } catch (error) {
    return originRouteError(error, 'GET reapertura/opciones');
  }
}
