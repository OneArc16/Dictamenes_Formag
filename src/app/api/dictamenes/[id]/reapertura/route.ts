import { NextResponse } from 'next/server';

import { originRouteError, parseDictamenId } from '@/features/formulario-origen/application/http';
import { reopenDocument } from '@/features/formulario-origen/application/reopening-service';
import { reaperturaDocumentoSchema } from '@/features/formulario-origen/domain/schemas';
import { requireAnyAbilityApi } from '@/lib/auth/api-guards';

export async function POST(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireAnyAbilityApi([
      'formulario_origen.reopen',
      'dictamen.reopen',
    ]);
    if (!auth.ok) return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });
    const { id } = await context.params;
    const input = reaperturaDocumentoSchema.parse(await req.json());
    const result = await reopenDocument(parseDictamenId(id), auth.auth, input);
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    return originRouteError(error, 'POST reapertura');
  }
}
