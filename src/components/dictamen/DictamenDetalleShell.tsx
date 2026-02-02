'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';

import AppNav from '@/components/AppNav';
import { DictamenFormLayout } from '@/components/dictamen/DictamenFormLayout';
import { ActualizarDocenteModal } from '@/components/docentes/ActualizarDocenteModal';

import DictamenLeftPanel from '@/components/dictamen/DictamenLeftPanel';
import DictamenCenterPanel from '@/components/dictamen/DictamenCenterPanel';
import DictamenRightPanel from '@/components/dictamen/DictamenRightPanel';

import { db } from '@/lib/dexieClient';

type DictamenEstado = 'PENDIENTE' | 'REABIERTO' | 'CERRADO';

type TipoEvento = 'ENFERMEDAD' | 'ACCIDENTE';
type OrigenEvento = 'LABORAL' | 'COMUN';

type DictamenDiagnosticoDTO = {
  cie10Codigo: string;
  tipo: 'CONFIRMADO_NUEVO' | 'IMPRESION_DIAGNOSTICA' | 'CONFIRMADO_REPETIDO';
  cie10Label?: string | null;
};

type DictamenDetalle = {
  id: number;
  numeroDictamen: string | null;
  fechaDictamen: string | null;
  procedimientoPcl: 'A' | 'B';
  estado: DictamenEstado;

  antecedentesClinicos: string | null;
  condicionSalud: string | null;
  descripcionHallazgos: string | null;

  // ✅ NUEVOS (Estructuración / Origen)
  fechaEstructuracionInvalidez?: string | null; // YYYY-MM-DD
  tipoEvento?: TipoEvento | null;
  origenEvento?: OrigenEvento | null;

  diagnosticos: DictamenDiagnosticoDTO[];
  docente: {
    id: number;
    documento: string;
    tipoDocumento: string;
    nombreCompleto: string;
    edad: number | null;
    sexo: string;
    secretaria: string | null;
    institucion: string | null;
  };
  medico: { id: number; nombreCompleto: string } | null;
};

type ApiResp =
  | { ok: true; dictamen: DictamenDetalle; readOnly?: boolean; serverVersion?: string }
  | { ok: false; error?: string };

async function fetchDictamen(
  id: number
): Promise<{ dictamen: DictamenDetalle; readOnly: boolean; serverVersion: string }> {
  const res = await fetch(`/api/dictamenes/${id}`, {
    method: 'GET',
    credentials: 'include',
    cache: 'no-store',
  });
  const data = (await res.json()) as ApiResp;

  if (!res.ok || !('ok' in data) || !data.ok) {
    throw new Error((data as any)?.error ?? 'Error cargando dictamen');
  }

  const serverVersion = String((data as any).serverVersion ?? '');

  return {
    dictamen: (data as any).dictamen,
    readOnly: Boolean((data as any).readOnly),
    serverVersion,
  };
}

async function patchDictamen(id: number, body: any) {
  const res = await fetch(`/api/dictamenes/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok || !data?.ok) throw new Error(data?.error ?? 'Error actualizando');
  return data;
}

type Props = {
  title: string;
  backHref: string;
  forceReadOnly?: boolean;
  allowEditDocente?: boolean;
};

export default function DictamenDetalleShell({
  title,
  backHref,
  forceReadOnly,
  allowEditDocente = true,
}: Props) {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const dictamenId = Number(id);

  const qc = useQueryClient();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['dictamen', dictamenId],
    queryFn: () => fetchDictamen(dictamenId),
    enabled: Number.isFinite(dictamenId) && dictamenId > 0,
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

  const dictamen = data?.dictamen ?? null;

  // ✅ IMPORTANTE: cerrado => solo lectura (aunque el rol sea MEDICO)
  const readOnly = useMemo(() => {
    if (forceReadOnly != null) return forceReadOnly;

    const apiReadOnly = data?.readOnly ?? false;
    const cerrado = dictamen?.estado === 'CERRADO';

    return apiReadOnly || cerrado;
  }, [forceReadOnly, data?.readOnly, dictamen?.estado]);

  const [procedimientoPcl, setProcedimientoPcl] = useState<'A' | 'B'>('A');
  const [fechaDictamen, setFechaDictamen] = useState<string>('');
  const [numeroDictamen, setNumeroDictamen] = useState<string>('');
  const [showEditDocente, setShowEditDocente] = useState(false);

  // ✅ para forzar remount del center panel cuando invalidamos drafts
  const [draftResetKey, setDraftResetKey] = useState(0);

  // ✅ invalidación Dexie por serverVersion
  useEffect(() => {
    if (!dictamen || !data?.serverVersion) return;

    let cancelled = false;

    (async () => {
      try {
        const serverVersion = String(data.serverVersion ?? '');
        if (!serverVersion) return;

        const meta = await db.dictamenMeta.get(dictamen.id);
        const localServerVersion = meta?.serverVersion ?? '';

        if (cancelled) return;

        if (localServerVersion !== serverVersion) {
          await db.dictamenDrafts.delete(dictamen.id).catch(() => {});
          await db.dictamenDiagnosticosDrafts.delete(dictamen.id).catch(() => {});

          await db.dictamenMeta.put({
            id: dictamen.id,
            serverVersion,
            updatedAt: Date.now(),
          });

          setDraftResetKey((k) => k + 1);
        } else if (!meta) {
          await db.dictamenMeta.put({
            id: dictamen.id,
            serverVersion,
            updatedAt: Date.now(),
          });
        }
      } catch (e) {
        console.error('Error comparando serverVersion / Dexie:', e);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [dictamen?.id, data?.serverVersion]);

  useEffect(() => {
    if (!dictamen) return;

    const proc = dictamen.procedimientoPcl ?? 'A';
    const rawFecha = dictamen.fechaDictamen;
    const uiFecha = rawFecha && rawFecha.length >= 10 ? rawFecha.substring(0, 10) : '';

    setProcedimientoPcl(proc);
    setFechaDictamen(uiFecha);
    setNumeroDictamen(dictamen.numeroDictamen ?? '');
  }, [dictamen?.id]);

  const updateMutation = useMutation({
    mutationFn: (body: any) => patchDictamen(dictamenId, body),
    onSuccess: (resp: any) => {
      const updatedNum = resp?.dictamen?.numeroDictamen;
      const updatedFecha = resp?.dictamen?.fechaDictamen;

      if (updatedNum != null) setNumeroDictamen(String(updatedNum));
      if (updatedFecha && typeof updatedFecha === 'string') setFechaDictamen(updatedFecha.slice(0, 10));

      qc.invalidateQueries({ queryKey: ['dictamen', dictamenId] });
    },
  });

  const handleChangeFecha = (newFecha: string) => {
    if (readOnly) return;
    setFechaDictamen(newFecha);
    if (!dictamenId || Number.isNaN(dictamenId)) return;
    updateMutation.mutate({ fechaDictamen: newFecha });
  };

  const handleChangeProcedimiento = (nuevoProc: 'A' | 'B') => {
    if (readOnly) return;
    setProcedimientoPcl(nuevoProc);
    updateMutation.mutate({ procedimientoPcl: nuevoProc });
  };

  const handleDocenteUpdated = async () => {
    await refetch();
  };

  if (!Number.isFinite(dictamenId) || dictamenId <= 0) {
    return (
      <div className="min-h-screen bg-slate-50">
        <AppNav title={title} canSwitchModules={true} />
        <main className="px-4 py-4 lg:px-8">
          <button type="button" onClick={() => router.push(backHref)} className="text-xs text-blue-600 hover:underline">
            ← Volver al listado
          </button>
          <div className="px-4 py-6 mt-4 text-sm text-red-600 bg-white border rounded-xl">ID de dictamen inválido.</div>
        </main>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <AppNav title={title} canSwitchModules={true} />
        <main className="px-4 py-4 lg:px-8">
          <button type="button" onClick={() => router.push(backHref)} className="text-xs text-blue-600 hover:underline">
            ← Volver al listado
          </button>
          <div className="px-4 py-6 mt-4 text-sm bg-white border rounded-xl text-slate-500">Cargando dictamen…</div>
        </main>
      </div>
    );
  }

  if (error || !dictamen) {
    return (
      <div className="min-h-screen bg-slate-50">
        <AppNav title={title} canSwitchModules={true} />
        <main className="px-4 py-4 lg:px-8">
          <button type="button" onClick={() => router.push(backHref)} className="text-xs text-blue-600 hover:underline">
            ← Volver al listado
          </button>
          <div className="px-4 py-6 mt-4 text-sm text-red-600 bg-white border rounded-xl">
            {(error as any)?.message ?? 'Dictamen no encontrado.'}
          </div>
        </main>
      </div>
    );
  }

  const canEditDocente = allowEditDocente && !readOnly;

  const readOnlyScope =
    readOnly
      ? [
          'opacity-70',
          '[&_input]:pointer-events-none [&_textarea]:pointer-events-none [&_select]:pointer-events-none',
          '[&_button]:pointer-events-none',
          '[&_button[data-ro-allow="1"]]:pointer-events-auto',
        ].join(' ')
      : '';

  return (
    <div className="min-h-screen bg-slate-50">
      <AppNav title={title} canSwitchModules={true} />

      {canEditDocente && showEditDocente && (
        <ActualizarDocenteModal
          open={showEditDocente}
          onClose={() => setShowEditDocente(false)}
          numeroDocumento={dictamen.docente.documento}
          onUpdate={handleDocenteUpdated}
        />
      )}

      <main className="px-4 py-4 lg:px-8">
        <button type="button" onClick={() => router.push(backHref)} className="text-xs text-blue-600 hover:underline">
          ← Volver al listado de dictámenes
        </button>

        {readOnly && (
          <div className="mt-4 rounded-xl border border-slate-200 bg-white px-4 py-2 text-[11px] text-slate-600">
            Estás en <b>modo solo lectura</b>. No puedes editar información clínica.
          </div>
        )}

        <div className="mt-4">
          <div className={readOnlyScope}>
            <DictamenFormLayout
              left={
                <DictamenLeftPanel
                  dictamenId={dictamen.id}
                  estado={dictamen.estado}
                  docente={dictamen.docente}
                  medico={dictamen.medico}
                  numeroDictamen={numeroDictamen}
                  fechaDictamen={fechaDictamen}
                  onChangeFecha={handleChangeFecha}
                  procedimientoPcl={procedimientoPcl}
                  onChangeProcedimiento={handleChangeProcedimiento}
                  onEditDocente={canEditDocente ? () => setShowEditDocente(true) : undefined}
                />
              }
              center={
                <DictamenCenterPanel
                  key={`center-${dictamen.id}-${data?.serverVersion ?? ''}-${draftResetKey}`}
                  readOnly={readOnly}
                  serverVersion={data?.serverVersion ?? ''}
                  dictamen={{
                    id: dictamen.id,
                    antecedentesClinicos: dictamen.antecedentesClinicos ?? '',
                    condicionSalud: dictamen.condicionSalud ?? '',
                    descripcionHallazgos: dictamen.descripcionHallazgos ?? '',
                    diagnosticos: dictamen.diagnosticos ?? [],

                    // ✅ NUEVOS (para tab sustentación)
                    fechaEstructuracionInvalidez: dictamen.fechaEstructuracionInvalidez ?? null,
                    tipoEvento: dictamen.tipoEvento ?? null,
                    origenEvento: dictamen.origenEvento ?? null,
                  }}
                  procedimientoPcl={procedimientoPcl}
                  fechaDictamen={fechaDictamen}
                />
              }
              right={
                <DictamenRightPanel
                  key={`right-${dictamen.id}-${procedimientoPcl}`}
                  dictamenId={dictamen.id}
                  procedimientoPcl={procedimientoPcl}
                />
              }
            />
          </div>
        </div>
      </main>
    </div>
  );
}
