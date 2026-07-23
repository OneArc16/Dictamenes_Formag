import { NextResponse } from 'next/server';
import { z } from 'zod';

import { toErrorResponse } from './errors';

export function parseDictamenId(value: string) {
  const id = Number(value);
  if (!Number.isInteger(id) || id <= 0) {
    throw new z.ZodError([
      {
        code: 'custom',
        path: ['id'],
        message: 'ID de expediente inválido.',
      },
    ]);
  }
  return id;
}
export function originRouteError(error: unknown, route: string) {
  if (error instanceof z.ZodError) {
    return NextResponse.json(
      {
        ok: false,
        code: 'INVALID_INPUT',
        error: error.issues[0]?.message ?? 'Datos inválidos.',
        details: { issues: error.issues },
      },
      { status: 400 },
    );
  }

  const response = toErrorResponse(error);
  if (response.status === 500) {
    console.error(`ERROR ${route}:`, error);
  }
  return NextResponse.json(response.body, { status: response.status });
}
