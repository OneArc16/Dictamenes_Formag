'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';

import { Checkbox } from '@/components/ui/checkbox';
import type { PermisoGroup } from '@/lib/admin/permisos';

function normalizeIds(ids: number[]) {
  return [...new Set(ids.filter((value) => Number.isFinite(value) && value > 0))].sort((a, b) => a - b);
}

function areSameIds(left: number[], right: number[]) {
  if (left.length !== right.length) return false;
  return left.every((value, index) => value === right[index]);
}

type Props = {
  perfilId: number;
  perfilNombre: string;
  groups: PermisoGroup[];
  initialPermissionIds: number[];
};

export default function PerfilPermisosForm({
  perfilId,
  perfilNombre,
  groups,
  initialPermissionIds,
}: Props) {
  const router = useRouter();

  const initialIds = useMemo(
    () => normalizeIds(initialPermissionIds),
    [initialPermissionIds],
  );
  const [selectedIds, setSelectedIds] = useState<number[]>(initialIds);

  useEffect(() => {
    setSelectedIds(initialIds);
  }, [initialIds]);

  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);
  const totalPermissions = useMemo(
    () => groups.reduce((acc, group) => acc + group.items.length, 0),
    [groups],
  );
  const dirty = useMemo(() => !areSameIds(selectedIds, initialIds), [selectedIds, initialIds]);

  const mutation = useMutation({
    mutationFn: async (permisoIds: number[]) => {
      const response = await fetch(`/api/admin/perfiles/${perfilId}/permisos`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ permisoIds }),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data?.ok) {
        throw new Error(data?.error ?? 'No se pudieron guardar los permisos');
      }

      return data;
    },
    onSuccess: () => {
      toast.success('Permisos actualizados correctamente');
      router.refresh();
    },
    onError: (error: unknown) => {
      toast.error(error instanceof Error ? error.message : 'No se pudieron guardar los permisos');
    },
  });

  function togglePermission(permisoId: number, checked: boolean) {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (checked) next.add(permisoId);
      else next.delete(permisoId);
      return normalizeIds([...next]);
    });
  }

  function setGroupSelection(permisoIds: number[], checked: boolean) {
    setSelectedIds((current) => {
      const next = new Set(current);
      for (const permisoId of permisoIds) {
        if (checked) next.add(permisoId);
        else next.delete(permisoId);
      }
      return normalizeIds([...next]);
    });
  }

  function setAllSelection(checked: boolean) {
    const next = checked ? groups.flatMap((group) => group.items.map((item) => item.id)) : [];
    setSelectedIds(normalizeIds(next));
  }

  return (
    <form
      className="space-y-4"
      onSubmit={(event) => {
        event.preventDefault();
        if (mutation.isPending || !dirty) return;
        mutation.mutate(selectedIds);
      }}
    >
      <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="text-sm font-semibold text-slate-900">Permisos del perfil {perfilNombre}</div>
            <p className="mt-1 text-[12px] text-slate-500">
              Selecciona exactamente las acciones y accesos que podra usar este perfil.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-[11px]">
            <span className="rounded-full bg-white px-3 py-1 font-semibold text-slate-700 shadow-sm ring-1 ring-slate-200">
              {selectedIds.length} de {totalPermissions} permisos seleccionados
            </span>
            <button
              type="button"
              onClick={() => setAllSelection(true)}
              className="rounded-full border border-slate-200 bg-white px-3 py-1.5 font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
            >
              Marcar todo
            </button>
            <button
              type="button"
              onClick={() => setAllSelection(false)}
              className="rounded-full border border-slate-200 bg-white px-3 py-1.5 font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
            >
              Limpiar
            </button>
          </div>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        {groups.map((group) => {
          const groupIds = group.items.map((item) => item.id);
          const selectedCount = groupIds.filter((permisoId) => selectedSet.has(permisoId)).length;

          return (
            <section
              key={group.key}
              className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
            >
              <div className="border-b border-slate-200 bg-slate-50/70 px-4 py-3">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <h2 className="text-sm font-semibold text-slate-900">{group.label}</h2>
                    <p className="mt-1 text-[11px] text-slate-500">{group.description}</p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 text-[11px]">
                    <span className="rounded-full bg-white px-2.5 py-1 font-semibold text-slate-600 ring-1 ring-slate-200">
                      {selectedCount}/{group.items.length}
                    </span>
                    <button
                      type="button"
                      onClick={() => setGroupSelection(groupIds, true)}
                      className="rounded-full border border-slate-200 bg-white px-3 py-1.5 font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
                    >
                      Marcar modulo
                    </button>
                    <button
                      type="button"
                      onClick={() => setGroupSelection(groupIds, false)}
                      className="rounded-full border border-slate-200 bg-white px-3 py-1.5 font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
                    >
                      Limpiar modulo
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-2 p-4">
                {group.items.map((permiso) => {
                  const checked = selectedSet.has(permiso.id);

                  return (
                    <label
                      key={permiso.id}
                      htmlFor={`permiso-${permiso.id}`}
                      className={[
                        'flex cursor-pointer items-start gap-3 rounded-xl border px-3 py-3 transition',
                        checked
                          ? 'border-blue-200 bg-blue-50/70'
                          : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50',
                      ].join(' ')}
                    >
                      <Checkbox
                        id={`permiso-${permiso.id}`}
                        checked={checked}
                        onCheckedChange={(next) => togglePermission(permiso.id, next === true)}
                        className="mt-0.5"
                      />

                      <div className="min-w-0 flex-1">
                        <div className="text-[12px] font-semibold text-slate-800">{permiso.nombre}</div>

                        {permiso.descripcion ? (
                          <p className="mt-2 text-[11px] leading-5 text-slate-500">{permiso.descripcion}</p>
                        ) : null}
                      </div>
                    </label>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>

      <div className="flex items-center justify-end gap-3">
        <span className="text-[11px] text-slate-500">
          {dirty ? 'Hay cambios pendientes por guardar.' : 'Sin cambios pendientes.'}
        </span>
        <button
          type="submit"
          disabled={mutation.isPending || !dirty}
          className="rounded-full bg-blue-600 px-4 py-2 text-[11px] font-semibold text-white shadow-sm hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {mutation.isPending ? 'Guardando...' : 'Guardar permisos'}
        </button>
      </div>
    </form>
  );
}



