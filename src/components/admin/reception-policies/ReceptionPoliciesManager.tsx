'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LoaderCircle, PowerOff } from 'lucide-react';
import toast from 'react-hot-toast';

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export type ReceptionPolicyRow = {
  id: number;
  sedeId: number;
  sedeNombre: string;
  version: number;
  cancelCutoffMinutes: number;
  rescheduleCutoffMinutes: number;
};
export type ReceptionPolicySite = { id: number; nombre: string };

type PolicyDraft = { cancelCutoffMinutes: string; rescheduleCutoffMinutes: string };

async function savePolicyVersion(sedeId: number, cancelCutoffMinutes: string, rescheduleCutoffMinutes: string) {
  const response = await fetch('/api/admin/reception-site-policies', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      sedeId,
      cancelCutoffMinutes: Number(cancelCutoffMinutes),
      rescheduleCutoffMinutes: Number(rescheduleCutoffMinutes),
    }),
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok || !body.ok) throw new Error(body.error ?? 'No fue posible guardar la política.');
}

export default function ReceptionPoliciesManager({ policies, sites }: { policies: ReceptionPolicyRow[]; sites: ReceptionPolicySite[] }) {
  const router = useRouter();
  const [siteId, setSiteId] = useState('');
  const [cancelCutoffMinutes, setCancelCutoffMinutes] = useState('0');
  const [rescheduleCutoffMinutes, setRescheduleCutoffMinutes] = useState('0');
  const [saving, setSaving] = useState(false);
  const [editingPolicyId, setEditingPolicyId] = useState<number | null>(null);
  const [draft, setDraft] = useState<PolicyDraft>({ cancelCutoffMinutes: '0', rescheduleCutoffMinutes: '0' });
  const [savingEdit, setSavingEdit] = useState(false);
  const [deactivatingId, setDeactivatingId] = useState<number | null>(null);
  const [pendingDeactivation, setPendingDeactivation] = useState<ReceptionPolicyRow | null>(null);

  const busy = saving || savingEdit || deactivatingId !== null;

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    try {
      await savePolicyVersion(Number(siteId), cancelCutoffMinutes, rescheduleCutoffMinutes);
      toast.success('Nueva versión de política activada.');
      setSiteId('');
      setCancelCutoffMinutes('0');
      setRescheduleCutoffMinutes('0');
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'No fue posible activar la política.');
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (policy: ReceptionPolicyRow) => {
    setEditingPolicyId(policy.id);
    setDraft({ cancelCutoffMinutes: String(policy.cancelCutoffMinutes), rescheduleCutoffMinutes: String(policy.rescheduleCutoffMinutes) });
  };

  const cancelEdit = () => setEditingPolicyId(null);

  const saveEdit = async (event: React.FormEvent, policy: ReceptionPolicyRow) => {
    event.preventDefault();
    setSavingEdit(true);
    try {
      await savePolicyVersion(policy.sedeId, draft.cancelCutoffMinutes, draft.rescheduleCutoffMinutes);
      toast.success(`Nueva versión de política guardada para ${policy.sedeNombre}.`);
      setEditingPolicyId(null);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'No fue posible guardar la política.');
    } finally {
      setSavingEdit(false);
    }
  };

  const deactivate = async (policy: ReceptionPolicyRow) => {
    setDeactivatingId(policy.id);
    try {
      const response = await fetch(`/api/admin/reception-site-policies/${policy.id}/deactivate`, { method: 'POST', credentials: 'include' });
      const body = await response.json().catch(() => ({}));
      if (!response.ok || !body.ok) throw new Error(body.error ?? 'No fue posible desactivar la política.');
      setPendingDeactivation(null);
      toast.success('Política desactivada.');
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'No fue posible desactivar la política.');
    } finally {
      setDeactivatingId(null);
    }
  };

  return (
    <div className="space-y-4">
      <form onSubmit={submit} className="grid gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-4 md:items-end">
        <label className="text-sm font-medium text-slate-700">
          Sede
          <select required value={siteId} onChange={(event) => setSiteId(event.target.value)} className="mt-1 h-11 w-full rounded-md border border-slate-300 bg-white px-3">
            <option value="">Selecciona una sede</option>
            {sites.map((site) => <option key={site.id} value={site.id}>{site.nombre}</option>)}
          </select>
        </label>
        <label className="text-sm font-medium text-slate-700">
          Corte de cancelación (min)
          <Input required min="0" max="43200" type="number" value={cancelCutoffMinutes} onChange={(event) => setCancelCutoffMinutes(event.target.value)} className="mt-1 h-11" />
        </label>
        <label className="text-sm font-medium text-slate-700">
          Corte de reprogramación (min)
          <Input required min="0" max="43200" type="number" value={rescheduleCutoffMinutes} onChange={(event) => setRescheduleCutoffMinutes(event.target.value)} className="mt-1 h-11" />
        </label>
        <Button className="h-11" disabled={busy}>{saving ? 'Activando…' : 'Activar nueva versión'}</Button>
      </form>

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs text-slate-600">
            <tr><th className="px-4 py-3">Sede</th><th className="px-4 py-3">Versión</th><th className="px-4 py-3">Cancelar</th><th className="px-4 py-3">Reprogramar</th><th className="px-4 py-3 text-right">Acciones</th></tr>
          </thead>
          <tbody>
            {policies.map((policy) => {
              const isEditing = editingPolicyId === policy.id;
              const formId = `policy-edit-${policy.id}`;
              return (
                <tr key={policy.id} className={isEditing ? 'border-t border-sky-200 bg-sky-50' : 'border-t border-slate-100'}>
                  <td className="px-4 py-3 font-medium text-slate-800">{policy.sedeNombre}</td>
                  <td className="px-4 py-3">v{policy.version}{isEditing ? <span className="ml-1 text-xs text-sky-700">→ v{policy.version + 1}</span> : null}</td>
                  <td className="px-4 py-3">
                    {isEditing ? (
                      <Input form={formId} required autoFocus min="0" max="43200" type="number" aria-label={`Corte de cancelación (min) de ${policy.sedeNombre}`} value={draft.cancelCutoffMinutes} onChange={(event) => setDraft((current) => ({ ...current, cancelCutoffMinutes: event.target.value }))} className="h-9 w-28 bg-white" />
                    ) : `${policy.cancelCutoffMinutes} min`}
                  </td>
                  <td className="px-4 py-3">
                    {isEditing ? (
                      <Input form={formId} required min="0" max="43200" type="number" aria-label={`Corte de reprogramación (min) de ${policy.sedeNombre}`} value={draft.rescheduleCutoffMinutes} onChange={(event) => setDraft((current) => ({ ...current, rescheduleCutoffMinutes: event.target.value }))} className="h-9 w-28 bg-white" />
                    ) : `${policy.rescheduleCutoffMinutes} min`}
                  </td>
                  <td className="px-4 py-3">
                    {isEditing ? (
                      <form id={formId} onSubmit={(event) => saveEdit(event, policy)} onKeyDown={(event) => { if (event.key === 'Escape') cancelEdit(); }} className="flex justify-end gap-2">
                        <Button type="submit" size="sm" disabled={savingEdit}>{savingEdit ? 'Guardando…' : 'Guardar'}</Button>
                        <Button type="button" size="sm" variant="outline" disabled={savingEdit} onClick={cancelEdit}>Cancelar</Button>
                      </form>
                    ) : (
                      <div className="flex justify-end gap-2">
                        <Button type="button" size="sm" variant="outline" disabled={busy || editingPolicyId !== null} onClick={() => startEdit(policy)}>Editar</Button>
                        <Button type="button" size="sm" variant="outline" className="border-rose-200 text-rose-700 hover:bg-rose-50 hover:text-rose-800" disabled={busy || editingPolicyId !== null} onClick={() => setPendingDeactivation(policy)}>Desactivar</Button>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <AlertDialog open={pendingDeactivation !== null} onOpenChange={(open) => { if (!open && deactivatingId === null) setPendingDeactivation(null); }}>
        <AlertDialogContent className="w-[calc(100%_-_2rem)] max-w-md gap-0 overflow-hidden rounded-2xl border-slate-200 bg-white p-0 shadow-[0_24px_80px_rgba(15,23,42,0.24)] motion-reduce:duration-0">
          <AlertDialogHeader className="flex-row items-center gap-3 space-y-0 border-b border-slate-100 px-5 py-4 text-left">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-100">
              <PowerOff className="h-5 w-5" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <AlertDialogTitle className="text-base font-semibold text-slate-950">¿Desactivar la política?</AlertDialogTitle>
              <AlertDialogDescription className="text-sm text-slate-600">
                No se podrán cancelar ni reprogramar citas de esta sede hasta activar otra versión.
              </AlertDialogDescription>
            </div>
          </AlertDialogHeader>

          {pendingDeactivation ? (
            <dl className="mx-5 my-4 grid grid-cols-2 gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm">
              <div className="col-span-2">
                <dt className="sr-only">Sede</dt>
                <dd className="font-semibold text-slate-900">{pendingDeactivation.sedeNombre} · v{pendingDeactivation.version}</dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500">Cancelar</dt>
                <dd className="text-slate-800">{pendingDeactivation.cancelCutoffMinutes} min</dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500">Reprogramar</dt>
                <dd className="text-slate-800">{pendingDeactivation.rescheduleCutoffMinutes} min</dd>
              </div>
            </dl>
          ) : null}

          <div className="flex flex-col-reverse gap-2 border-t border-slate-100 bg-slate-50/80 px-5 py-3 sm:flex-row sm:justify-end">
            <AlertDialogCancel
              type="button"
              disabled={deactivatingId !== null}
              className="mt-0 min-h-10 rounded-xl border-slate-300 bg-white px-5 text-slate-700 shadow-none hover:bg-slate-100 hover:text-slate-950 focus-visible:ring-2 focus-visible:ring-sky-500"
            >
              Volver
            </AlertDialogCancel>
            <Button
              type="button"
              className="min-h-10 rounded-xl bg-rose-700 px-5 text-white shadow-sm hover:bg-rose-800 focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:ring-offset-2"
              disabled={deactivatingId !== null}
              onClick={() => { if (pendingDeactivation) void deactivate(pendingDeactivation); }}
            >
              {deactivatingId !== null ? <LoaderCircle className="animate-spin motion-reduce:animate-none" aria-hidden="true" /> : <PowerOff aria-hidden="true" />}
              {deactivatingId !== null ? 'Desactivando…' : 'Desactivar'}
            </Button>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
