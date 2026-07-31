import ReceptionPoliciesManager from '@/components/admin/reception-policies/ReceptionPoliciesManager';
import { requireAdmin } from '@/lib/auth/guards';
import { prisma } from '@/lib/prisma';

export default async function ReceptionPoliciesPage() {
  await requireAdmin('admin.reception.policy.manage');
  const [policies, sites] = await Promise.all([
    prisma.receptionSitePolicy.findMany({ where: { active: true }, include: { sede: { select: { id: true, nombre: true } } }, orderBy: { sede: { nombre: 'asc' } } }),
    prisma.sede.findMany({ where: { estado: 1 }, select: { id: true, nombre: true }, orderBy: { nombre: 'asc' } }),
  ]);
  return <div className="space-y-4"><div><h1 className="text-xl font-semibold text-slate-950">Políticas de recepción</h1><p className="mt-1 text-sm text-slate-600">Define hasta cuándo se permiten cancelar o reprogramar citas por sede. Cada cambio crea una versión nueva.</p></div><ReceptionPoliciesManager policies={policies.map((item) => ({ id: item.id, sedeId: item.sedeId, sedeNombre: item.sede.nombre, version: item.version, cancelCutoffMinutes: item.cancelCutoffMinutes, rescheduleCutoffMinutes: item.rescheduleCutoffMinutes }))} sites={sites} /></div>;
}
