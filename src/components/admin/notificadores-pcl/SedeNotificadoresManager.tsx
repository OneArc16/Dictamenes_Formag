'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';

import { Button } from '@/components/ui/button';

export type NotificadorEmpleadoOption = {
  id: number;
  nombreCompleto: string;
  documento: string | null;
  sedeId: number | null;
  sedeNombre: string | null;
  tieneFirma: boolean;
};

export type SedeNotificadorRow = {
  id: number;
  nombre: string;
  ubicacion: string | null;
  current: {
    empleadoId: number;
    nombreCompleto: string;
    vigenteDesde: string | null;
    vigenteHasta: string | null;
    tieneFirma: boolean;
  } | null;
};

type RowState = {
  empleadoId: string;
  vigenteDesde: string;
  vigenteHasta: string;
};

type Props = {
  sedes: SedeNotificadorRow[];
  empleados: NotificadorEmpleadoOption[];
};

function buildInitialState(sedes: SedeNotificadorRow[]) {
  return Object.fromEntries(
    sedes.map((sede) => [
      sede.id,
      {
        empleadoId: sede.current?.empleadoId ? String(sede.current.empleadoId) : '',
        vigenteDesde: sede.current?.vigenteDesde ?? '',
        vigenteHasta: sede.current?.vigenteHasta ?? '',
      },
    ]),
  ) as Record<number, RowState>;
}

export default function SedeNotificadoresManager({ sedes, empleados }: Props) {
  const router = useRouter();
  const [values, setValues] = useState<Record<number, RowState>>(() => buildInitialState(sedes));

  const empleadosById = useMemo(
    () => new Map(empleados.map((empleado) => [empleado.id, empleado])),
    [empleados],
  );

  const mutation = useMutation({
    mutationFn: async (payload: {
      sedeId: number;
      empleadoId: number | null;
      vigenteDesde: string | null;
      vigenteHasta: string | null;
    }) => {
      const response = await fetch('/api/admin/notificadores-pcl', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data?.ok) {
        throw new Error(data?.error ?? 'No se pudo guardar el notificador.');
      }

      return data as { message?: string };
    },
    onSuccess: (data) => {
      toast.success(data.message ?? 'Notificador actualizado.');
      router.refresh();
    },
    onError: (error: unknown) => {
      toast.error(error instanceof Error ? error.message : 'No se pudo guardar el notificador.');
    },
  });

  const updateValue = (sedeId: number, patch: Partial<RowState>) => {
    setValues((current) => ({
      ...current,
      [sedeId]: {
        ...(current[sedeId] ?? { empleadoId: '', vigenteDesde: '', vigenteHasta: '' }),
        ...patch,
      },
    }));
  };

  const saveRow = (sedeId: number) => {
    if (mutation.isPending) return;

    const row = values[sedeId] ?? { empleadoId: '', vigenteDesde: '', vigenteHasta: '' };
    const empleadoId = row.empleadoId ? Number(row.empleadoId) : null;

    if (row.vigenteDesde && row.vigenteHasta && row.vigenteHasta < row.vigenteDesde) {
      toast.error('La fecha final no puede ser anterior a la fecha inicial.');
      return;
    }

    mutation.mutate({
      sedeId,
      empleadoId,
      vigenteDesde: row.vigenteDesde || null,
      vigenteHasta: row.vigenteHasta || null,
    });
  };

  if (sedes.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white px-4 py-8 text-center text-[12px] text-slate-500 shadow-sm">
        No hay sedes registradas para asignar notificadores.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-[980px] w-full text-left text-[11px]">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="px-3 py-2">Sede</th>
              <th className="px-3 py-2">Notificador actual</th>
              <th className="px-3 py-2">Asignar notificador</th>
              <th className="px-3 py-2">Vigencia</th>
              <th className="px-3 py-2 text-right">Acciones</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {sedes.map((sede) => {
              const row = values[sede.id] ?? { empleadoId: '', vigenteDesde: '', vigenteHasta: '' };
              const selectedEmpleado = row.empleadoId ? empleadosById.get(Number(row.empleadoId)) : null;
              const empleadosDisponibles = empleados.filter((empleado) => empleado.sedeId === sede.id);
              const opcionesEmpleado =
                selectedEmpleado && !empleadosDisponibles.some((empleado) => empleado.id === selectedEmpleado.id)
                  ? [selectedEmpleado, ...empleadosDisponibles]
                  : empleadosDisponibles;

              return (
                <tr key={sede.id} className="align-top text-slate-700">
                  <td className="px-3 py-3">
                    <div className="font-semibold text-slate-900">{sede.nombre}</div>
                    <div className="mt-1 text-[10px] text-slate-500">
                      {sede.ubicacion ?? 'Sin ubicacion registrada'}
                    </div>
                  </td>

                  <td className="px-3 py-3">
                    {sede.current ? (
                      <div className="space-y-1">
                        <div className="font-medium text-slate-900">{sede.current.nombreCompleto}</div>
                        <div className="text-[10px] text-slate-500">
                          {sede.current.vigenteDesde || sede.current.vigenteHasta
                            ? `Vigencia: ${sede.current.vigenteDesde ?? 'sin inicio'} - ${sede.current.vigenteHasta ?? 'sin fin'}`
                            : 'Sin vigencia limitada'}
                        </div>
                        <span
                          className={[
                            'inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold',
                            sede.current.tieneFirma
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-rose-50 text-rose-700',
                          ].join(' ')}
                        >
                          {sede.current.tieneFirma ? 'Firma registrada' : 'Sin firma registrada'}
                        </span>
                      </div>
                    ) : (
                      <span className="inline-flex rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
                        Sin notificador
                      </span>
                    )}
                  </td>

                  <td className="px-3 py-3">
                    <select
                      value={row.empleadoId}
                      onChange={(event) => updateValue(sede.id, { empleadoId: event.target.value })}
                      className="h-9 w-full min-w-[240px] rounded-lg border border-slate-200 bg-white px-3 text-[11px] text-slate-700 shadow-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                    >
                      <option value="">Sin notificador asignado</option>
                      {opcionesEmpleado.map((empleado) => (
                        <option key={empleado.id} value={empleado.id}>
                          {empleado.nombreCompleto}
                          {empleado.documento ? ` - ${empleado.documento}` : ''}
                          {empleado.tieneFirma ? '' : ' - sin firma'}
                        </option>
                      ))}
                    </select>

                    {selectedEmpleado ? (
                      <div className="mt-1 space-y-1 text-[10px]">
                        {selectedEmpleado.sedeNombre ? (
                          <div className="text-slate-500">Sede laboral: {selectedEmpleado.sedeNombre}</div>
                        ) : null}
                        <div className={selectedEmpleado.tieneFirma ? 'text-emerald-700' : 'text-rose-700'}>
                          {selectedEmpleado.tieneFirma ? 'Firma registrada' : 'Sin firma registrada'}
                        </div>
                      </div>
                    ) : null}
                  </td>

                  <td className="px-3 py-3">
                    <div className="grid min-w-[230px] grid-cols-2 gap-2">
                      <input
                        type="date"
                        value={row.vigenteDesde}
                        onChange={(event) => updateValue(sede.id, { vigenteDesde: event.target.value })}
                        className="h-9 rounded-lg border border-slate-200 px-2 text-[11px] text-slate-700 shadow-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                      />
                      <input
                        type="date"
                        value={row.vigenteHasta}
                        onChange={(event) => updateValue(sede.id, { vigenteHasta: event.target.value })}
                        className="h-9 rounded-lg border border-slate-200 px-2 text-[11px] text-slate-700 shadow-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                      />
                    </div>
                  </td>

                  <td className="px-3 py-3 text-right">
                    <Button
                      type="button"
                      size="sm"
                      disabled={mutation.isPending}
                      onClick={() => saveRow(sede.id)}
                      className="rounded-full bg-blue-600 text-white hover:bg-blue-700 hover:text-white"
                    >
                      {mutation.isPending ? 'Guardando...' : 'Guardar'}
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
