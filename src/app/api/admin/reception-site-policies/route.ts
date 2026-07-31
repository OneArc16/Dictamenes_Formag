import { z } from 'zod';
import { NextResponse } from 'next/server';

import { auditReception } from '@/features/reception/application/reception-audit';
import { requireAdminApi } from '@/lib/auth/api-guards';
import { prisma } from '@/lib/prisma';

const policySchema = z.object({
  sedeId: z.number().int().positive(),
  cancelCutoffMinutes: z.number().int().min(0).max(43_200),
  rescheduleCutoffMinutes: z.number().int().min(0).max(43_200),
}).strict();

export async function GET() {
  const auth = await requireAdminApi('admin.reception.policy.manage');
  if (!auth.ok) return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });
  const rows = await prisma.receptionSitePolicy.findMany({ where: { active: true }, include: { sede: { select: { id: true, nombre: true } } }, orderBy: { sede: { nombre: 'asc' } } });
  return NextResponse.json({ ok: true, data: rows.map((row) => ({ id: row.id, sedeId: row.sedeId, sedeNombre: row.sede.nombre, version: row.version, cancelCutoffMinutes: row.cancelCutoffMinutes, rescheduleCutoffMinutes: row.rescheduleCutoffMinutes })) });
}

export async function POST(request: Request) {
  const auth = await requireAdminApi('admin.reception.policy.manage');
  if (!auth.ok) return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });
  const parsed = policySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ ok: false, error: 'La política no es válida.' }, { status: 422 });
  const site = await prisma.sede.findFirst({ where: { id: parsed.data.sedeId, estado: 1 }, select: { id: true } });
  if (!site) return NextResponse.json({ ok: false, error: 'La sede no está activa.' }, { status: 404 });
  const created = await prisma.$transaction(async (tx) => {
    const current = await tx.receptionSitePolicy.findFirst({ where: { sedeId: site.id, active: true }, orderBy: { version: 'desc' } });
    if (current) await tx.receptionSitePolicy.update({ where: { id: current.id }, data: { active: false } });
    return tx.receptionSitePolicy.create({ data: { sedeId: site.id, version: (current?.version ?? 0) + 1, active: true, cancelCutoffMinutes: parsed.data.cancelCutoffMinutes, rescheduleCutoffMinutes: parsed.data.rescheduleCutoffMinutes } });
  });
  await auditReception({ requestId: request.headers.get('x-request-id') ?? crypto.randomUUID(), actorEmpleadoId: auth.auth.empleadoId, action: 'SITE_POLICY_ACTIVATED', result: 'SUCCESS', resourceType: 'ReceptionSitePolicy', resourceId: created.id, sedeId: created.sedeId, httpStatus: 201, metadata: { version: created.version } });
  return NextResponse.json({ ok: true, data: created }, { status: 201 });
}
