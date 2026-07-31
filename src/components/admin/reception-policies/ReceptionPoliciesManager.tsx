'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export type ReceptionPolicyRow = { id: number; sedeId: number; sedeNombre: string; version: number; cancelCutoffMinutes: number; rescheduleCutoffMinutes: number };
export type ReceptionPolicySite = { id: number; nombre: string };

export default function ReceptionPoliciesManager({ policies, sites }: { policies: ReceptionPolicyRow[]; sites: ReceptionPolicySite[] }) {
  const router = useRouter();
  const [siteId, setSiteId] = useState('');
  const [cancelCutoffMinutes, setCancelCutoffMinutes] = useState('0');
  const [rescheduleCutoffMinutes, setRescheduleCutoffMinutes] = useState('0');
  const [saving, setSaving] = useState(false);
  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    try {
      const response = await fetch('/api/admin/reception-site-policies', { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ sedeId: Number(siteId), cancelCutoffMinutes: Number(cancelCutoffMinutes), rescheduleCutoffMinutes: Number(rescheduleCutoffMinutes) }) });
      const body = await response.json().catch(() => ({}));
      if (!response.ok || !body.ok) throw new Error(body.error ?? 'No fue posible activar la política.');
      toast.success('Nueva versión de política activada.');
      setSiteId(''); setCancelCutoffMinutes('0'); setRescheduleCutoffMinutes('0'); router.refresh();
    } catch (error) { toast.error(error instanceof Error ? error.message : 'No fue posible activar la política.'); } finally { setSaving(false); }
  };
  return <div className="space-y-4"><form onSubmit={submit} className="grid gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-4 md:items-end"><label className="text-sm font-medium text-slate-700">Sede<select required value={siteId} onChange={(event) => setSiteId(event.target.value)} className="mt-1 h-11 w-full rounded-md border border-slate-300 bg-white px-3"><option value="">Selecciona una sede</option>{sites.map((site) => <option key={site.id} value={site.id}>{site.nombre}</option>)}</select></label><label className="text-sm font-medium text-slate-700">Corte de cancelación (min)<Input required min="0" max="43200" type="number" value={cancelCutoffMinutes} onChange={(event) => setCancelCutoffMinutes(event.target.value)} className="mt-1 h-11" /></label><label className="text-sm font-medium text-slate-700">Corte de reprogramación (min)<Input required min="0" max="43200" type="number" value={rescheduleCutoffMinutes} onChange={(event) => setRescheduleCutoffMinutes(event.target.value)} className="mt-1 h-11" /></label><Button className="h-11" disabled={saving}>{saving ? 'Activando…' : 'Activar nueva versión'}</Button></form><div className="overflow-x-auto rounded-xl border border-slate-200 bg-white"><table className="min-w-full text-left text-sm"><thead className="bg-slate-50 text-xs text-slate-600"><tr><th className="px-4 py-3">Sede</th><th className="px-4 py-3">Versión</th><th className="px-4 py-3">Cancelar</th><th className="px-4 py-3">Reprogramar</th></tr></thead><tbody>{policies.map((policy) => <tr key={policy.id} className="border-t border-slate-100"><td className="px-4 py-3 font-medium text-slate-800">{policy.sedeNombre}</td><td className="px-4 py-3">v{policy.version}</td><td className="px-4 py-3">{policy.cancelCutoffMinutes} min</td><td className="px-4 py-3">{policy.rescheduleCutoffMinutes} min</td></tr>)}</tbody></table></div></div>;
}
