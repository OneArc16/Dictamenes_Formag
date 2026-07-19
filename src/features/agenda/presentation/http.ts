import { NextResponse } from 'next/server';

import { AgendaApplicationError } from '@/features/agenda/application/agenda-service';

export function agendaErrorResponse(error: unknown, fallback: string) {
  if (error instanceof AgendaApplicationError) {
    return NextResponse.json({ ok: false, error: error.message }, { status: error.status });
  }
  console.error(fallback, error);
  return NextResponse.json({ ok: false, error: fallback }, { status: 500 });
}

export function auditActor(payload: { name?: string; sub?: string }) {
  return String(payload.name ?? payload.sub ?? 'usuario').trim().slice(0, 100) || 'usuario';
}
