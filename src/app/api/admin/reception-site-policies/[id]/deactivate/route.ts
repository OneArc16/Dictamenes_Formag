import { NextResponse } from 'next/server';

import { auditReception } from '@/features/reception/application/reception-audit';
import { requireAdminApi } from '@/lib/auth/api-guards';
import { prisma } from '@/lib/prisma';

export function parseReceptionPolicyId(id: string) {
  if (!/^[1-9]\d*$/.test(id)) return null;
  const policyId = Number(id);
  return Number.isSafeInteger(policyId) && policyId <= 2_147_483_647 ? policyId : null;
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdminApi('admin.reception.policy.manage');
  if (!auth.ok) return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });

  const { id } = await params;
  const policyId = parseReceptionPolicyId(id);
  if (policyId === null) {
    return NextResponse.json({ ok: false, error: 'La política no es válida.' }, { status: 422 });
  }

  const policy = await prisma.receptionSitePolicy.findFirst({
    where: { id: policyId, active: true },
    select: { id: true, sedeId: true, version: true },
  });
  if (!policy) return NextResponse.json({ ok: false, error: 'La política activa no existe.' }, { status: 404 });

  const deactivated = await prisma.receptionSitePolicy.updateMany({
    where: { id: policy.id, active: true },
    data: { active: false },
  });
  if (deactivated.count !== 1) {
    return NextResponse.json({ ok: false, error: 'La política cambió. Actualiza la página e inténtalo nuevamente.' }, { status: 409 });
  }

  await auditReception({
    requestId: request.headers.get('x-request-id') ?? crypto.randomUUID(),
    actorEmpleadoId: auth.auth.empleadoId,
    action: 'SITE_POLICY_DEACTIVATED',
    result: 'SUCCESS',
    resourceType: 'ReceptionSitePolicy',
    resourceId: policy.id,
    sedeId: policy.sedeId,
    httpStatus: 200,
    metadata: { version: policy.version },
  });

  return NextResponse.json({ ok: true, data: { id: policy.id } });
}
