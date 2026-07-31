import { NextResponse } from 'next/server';
import type { z } from 'zod';

import { ReceptionError } from '@/features/reception/application/errors';
import { requireAdmisionesApi } from '@/lib/auth/api-guards';

export function receptionRequestId(request: Request) {
  return request.headers.get('x-request-id')?.slice(0, 100) || crypto.randomUUID();
}

export function receptionJson(request: Request, body: unknown, status = 200) {
  const id = receptionRequestId(request);
  return NextResponse.json({ ok: true, data: body, requestId: id }, {
    status,
    headers: { 'Cache-Control': 'private, no-store', 'X-Request-Id': id },
  });
}

export function receptionError(request: Request, error: unknown) {
  const id = receptionRequestId(request);
  if (error instanceof ReceptionError) {
    return NextResponse.json({ ok: false, code: error.code, message: error.message, requestId: id }, { status: error.status, headers: { 'Cache-Control': 'private, no-store', 'X-Request-Id': id } });
  }
  return NextResponse.json({ ok: false, code: 'INTERNAL_ERROR', message: 'No fue posible completar la operación.', requestId: id }, { status: 500, headers: { 'Cache-Control': 'private, no-store', 'X-Request-Id': id } });
}

export async function receptionAuth(request: Request, permission = 'reception.read') {
  const auth = await requireAdmisionesApi(permission);
  if (auth.ok) return { ok: true as const, auth: auth.auth };
  return { ok: false as const, response: receptionError(request, new ReceptionError(auth.status === 401 ? 'UNAUTHENTICATED' : 'FORBIDDEN', auth.error, auth.status)) };
}

export async function receptionBody<T extends z.ZodType>(request: Request, schema: T): Promise<z.output<T>> {
  if (!request.headers.get('content-type')?.toLowerCase().includes('application/json')) {
    throw new ReceptionError('UNSUPPORTED_MEDIA_TYPE', 'El contenido debe ser JSON.', 415);
  }
  const length = Number(request.headers.get('content-length') ?? 0);
  if (length > 16_384) throw new ReceptionError('PAYLOAD_TOO_LARGE', 'La solicitud supera el límite permitido.', 413);
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) throw new ReceptionError('VALIDATION_ERROR', 'Revisa los datos ingresados.', 422);
  return parsed.data;
}

export function positiveQuery(value: string | null, label: string) {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1) throw new ReceptionError('VALIDATION_ERROR', `${label} no es válido.`, 422);
  return parsed;
}

export function idempotencyKey(request: Request) {
  const key = request.headers.get('idempotency-key')?.trim() ?? '';
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(key)) {
    throw new ReceptionError('IDEMPOTENCY_KEY_REQUIRED', 'La operación requiere una clave de idempotencia UUID válida.', 422);
  }
  return key;
}
