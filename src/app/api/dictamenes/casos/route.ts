import { NextResponse } from 'next/server';

import { requireAbilityApi } from '@/lib/auth/api-guards';
import { originRouteError } from '@/features/formulario-origen/application/http';
import { registrarCasoDictamen } from '@/features/formulario-origen/application/registrar-caso-dictamen';
import { registrarCasoDictamenSchema } from '@/features/formulario-origen/domain/schemas';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    const auth = await requireAbilityApi('dictamen.create');
    if (!auth.ok) {
      return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });
    }
    const input = registrarCasoDictamenSchema.parse(await req.json());
    const result = await registrarCasoDictamen(input, auth.auth);
    return NextResponse.json({ ok: true, ...result }, { status: result.replayed ? 200 : 201 });
  } catch (error) {
    return originRouteError(error, 'POST /api/dictamenes/casos');
  }
}
