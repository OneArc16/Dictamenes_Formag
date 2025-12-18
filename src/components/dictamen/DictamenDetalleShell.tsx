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

type DictamenEstado = 'PENDIENTE' | 'REABIERTO' | 'CERRADO';

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

type ApiResp = { ok: true; dictamen: DictamenDetalle; readOnly?: boolean } | { ok: false; error?: string };

function buildNumeroDictamen(id: number, fecha: string | null) {
  if (!fecha) return '';
  const [yyyy, mm, dd] = fecha.split('-');
  const datePart = `${dd}${mm}${yyyy}`;
  const consecutivo = String(id).padStart(9, '0');
  return `${datePart}${consecutivo}`;
}

async function fetchDictamen(id: number): Promise<{ dictamen: DictamenDetalle; readOnly: boolean }> {
  const res = await fetch(`/api/dictamenes/${id}`, { method: 'GET', credentials: 'include' });
  const data = (await res.json()) as ApiResp;

  if (!res.ok || !('ok' in data) || !data.ok) {
    throw new Error((data as any)?.error ?? 'Error cargando dictamen');
  }

  return { dictamen: (data as any).dictamen, readOnly: Boolean((data as any).readOnly) };
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
  /** título del AppNav */
  title: string;
  /** a dónde vuelve el botón */
  backHref: string;
  /** forzar solo lectura (para admisiones) */
  forceReadOnly?: boolean;
  /** permitir abrir modal de editar docente (solo médico normalmente) */
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
    staleTime: 10_000,
  });

  const dictamen = data?.dictamen ?? null;

  const readOnly = useMemo(() => {
    if (forceReadOnly != null) return forceReadOnly;
    return data?.readOnly ?? false;
  }, [forceReadOnly, data?.readOnly]);

  // Estado compartido (UI)
  const [procedimientoPcl, setProcedimientoPcl] = useState<'A' | 'B'>('A');
  const [fechaDictamen, setFechaDictamen] = useState<string>(''); // YYYY-MM-DD
  const [numeroDictamen, setNumeroDictamen] = useState<string>('');
  const [showEditDocente, setShowEditDocente] = useState(false);

  // Inicializar UI desde la data
  useEffect(() => {
    if (!dictamen) return;

    const proc = dictamen.procedimientoPcl ?? 'A';
    const rawFecha = dictamen.fechaDictamen;
    const uiFecha = rawFecha && rawFecha.length >= 10 ? rawFecha.substring(0, 10) : '';

    setProcedimientoPcl(proc);
    setFechaDictamen(uiFecha);

    const num = dictamen.numeroDictamen ?? buildNumeroDictamen(dictamen.id, uiFecha || null);
    setNumeroDictamen(num);
  }, [dictamen]);

  const updateMutation = useMutation({
    mutationFn: (body: any) => patchDictamen(dictamenId, body),
    onSuccess: (resp: any) => {
      const updatedNum = resp?.dictamen?.numeroDictamen;
      if (updatedNum) setNumeroDictamen(updatedNum);
      qc.invalidateQueries({ queryKey: ['dictamen', dictamenId] });
    },
  });

  const handleChangeFecha = (newFecha: string) => {
    setFechaDictamen(newFecha);
    if (!dictamenId || Number.isNaN(dictamenId)) return;

    // UI optimista
    setNumeroDictamen(buildNumeroDictamen(dictamenId, newFecha || null));

    // Persistir solo si se puede editar
    if (!readOnly) updateMutation.mutate({ fechaDictamen: newFecha });
  };

  const handleChangeProcedimiento = (nuevoProc: 'A' | 'B') => {
    setProcedimientoPcl(nuevoProc);

    if (!readOnly) updateMutation.mutate({ procedimientoPcl: nuevoProc });
  };

  const handleDocenteUpdated = async () => {
    await refetch(); // refresh
  };

  // Estados de carga / error
  if (!Number.isFinite(dictamenId) || dictamenId <= 0) {
    return (
      <div className="min-h-screen bg-slate-50">
        <AppNav title={title} canSwitchModules={true} />
        <main className="px-4 py-4 lg:px-8">
          <button type="button" onClick={() => router.push(backHref)} className="text-xs text-blue-600 hover:underline">
            ← Volver al listado
          </button>
          <div className="px-4 py-6 mt-4 text-sm text-red-600 bg-white border rounded-xl">
            ID de dictamen inválido.
          </div>
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
          <div className="px-4 py-6 mt-4 text-sm bg-white border rounded-xl text-slate-500">
            Cargando dictamen…
          </div>
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
        <button
          type="button"
          onClick={() => router.push(backHref)}
          className="text-xs text-blue-600 hover:underline"
        >
          ← Volver al listado de dictámenes
        </button>

        {readOnly && (
          <div className="mt-4 rounded-xl border border-slate-200 bg-white px-4 py-2 text-[11px] text-slate-600">
            Estás en <b>modo solo lectura</b>. No puedes editar información clínica.
          </div>
        )}

        <div className="mt-4">
          {/* ✅ Esto vuelve todo “gris” y sin edición */}
          <fieldset disabled={readOnly}>
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
                  dictamen={{
                    id: dictamen.id,
                    antecedentesClinicos: dictamen.antecedentesClinicos ?? '',
                    condicionSalud: dictamen.condicionSalud ?? '',
                    descripcionHallazgos: dictamen.descripcionHallazgos ?? '',
                    diagnosticos: dictamen.diagnosticos ?? [],
                  }}
                  procedimientoPcl={procedimientoPcl}
                  fechaDictamen={fechaDictamen}
                />
              }
              right={<DictamenRightPanel />}
            />
          </fieldset>
        </div>
      </main>
    </div>
  );
}
