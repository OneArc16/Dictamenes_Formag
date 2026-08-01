import { timingSafeEqual } from 'node:crypto';

import { NextResponse } from 'next/server';
import type { z } from 'zod';

import { ReceptionError } from '@/features/reception/application/errors';
import { requireAdmisionesApi } from '@/lib/auth/api-guards';

const CSRF_COOKIE = 'reception_csrf';
const UNSAFE_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

function requestCookie(request: Request, name: string) {
  return request.headers.get('cookie')?.split(';').map((part) => part.trim()).find((part) => part.startsWith(`${name}=`))?.slice(name.length + 1) ?? null;
}

function sameToken(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
}

function setCsrfCookie(request: Request, response: NextResponse) {
  const token = requestCookie(request, CSRF_COOKIE) ?? crypto.randomUUID();
  response.cookies.set(CSRF_COOKIE, token, { httpOnly: false, sameSite: 'strict', secure: process.env.NODE_ENV === 'production', path: '/' });
  return response;
}

function trustedOrigins(request: Request) {
  const url = new URL(request.url);
  const origins = new Set([url.origin]);
  const host = request.headers.get('x-forwarded-host') ?? request.headers.get('host');
  const protocol = request.headers.get('x-forwarded-proto') ?? url.protocol.replace(':', '');
  if (host && (protocol === 'http' || protocol === 'https')) origins.add(`${protocol}://${host}`);
  for (const origin of (process.env.RECEPTION_TRUSTED_ORIGINS ?? '').split(',').map((value) => value.trim()).filter(Boolean)) origins.add(origin);
  return origins;
}

/** Reject cross-origin state changes; a double-submit token is the fallback for clients without Origin/Fetch Metadata. */
export function assertReceptionRequestIntegrity(request: Request) {
  if (!UNSAFE_METHODS.has(request.method.toUpperCase())) return;
  const fetchSite = request.headers.get('sec-fetch-site')?.toLowerCase();
  const origin = request.headers.get('origin');
  if (fetchSite === 'cross-site' || fetchSite === 'none') {
    throw new ReceptionError('UNTRUSTED_ORIGIN', 'La solicitud no proviene de un origen confiable.', 403);
  }
  if (origin) {
    if (!trustedOrigins(request).has(origin) || (fetchSite && fetchSite !== 'same-origin' && fetchSite !== 'same-site')) {
      throw new ReceptionError('UNTRUSTED_ORIGIN', 'La solicitud no proviene de un origen confiable.', 403);
    }
    return;
  }
  if (fetchSite === 'same-origin') return;
  const csrfHeader = request.headers.get('x-csrf-token');
  const csrfCookie = requestCookie(request, CSRF_COOKIE);
  if (!csrfHeader || !csrfCookie || !sameToken(csrfHeader, csrfCookie)) {
    throw new ReceptionError('CSRF_TOKEN_REQUIRED', 'No fue posible validar la solicitud.', 403);
  }
}

export function receptionRequestId(request: Request) {
  return request.headers.get('x-request-id')?.slice(0, 100) || crypto.randomUUID();
}

export function receptionJson(request: Request, body: unknown, status = 200) {
  const id = receptionRequestId(request);
  return setCsrfCookie(request, NextResponse.json({ ok: true, data: body, requestId: id }, {
    status,
    headers: { 'Cache-Control': 'private, no-store', 'X-Request-Id': id },
  }));
}

export function receptionError(request: Request, error: unknown) {
  const id = receptionRequestId(request);
  if (error instanceof ReceptionError) {
    return setCsrfCookie(request, NextResponse.json({ ok: false, code: error.code, message: error.message, requestId: id }, { status: error.status, headers: { 'Cache-Control': 'private, no-store', 'X-Request-Id': id } }));
  }
  return setCsrfCookie(request, NextResponse.json({ ok: false, code: 'INTERNAL_ERROR', message: 'No fue posible completar la operación.', requestId: id }, { status: 500, headers: { 'Cache-Control': 'private, no-store', 'X-Request-Id': id } }));
}

export async function receptionAuth(request: Request, permission = 'reception.read') {
  try { assertReceptionRequestIntegrity(request); } catch (error) { return { ok: false as const, response: receptionError(request, error) }; }
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
