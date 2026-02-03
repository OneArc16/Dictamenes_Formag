'use client';

import React, { useEffect, useMemo, useState, useCallback } from 'react';
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

  fechaEstructuracionInvalidez?: string | null;
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

  return {
    dictamen: (data as any).dictamen,
    readOnly: Boolean((data as any).readOnly),
    serverVersion: String((data as any).serverVersion ?? ''),
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

function isEditableTarget(t: EventTarget | null) {
  const el = t as HTMLElement | null;
  if (!el) return false;

  const tag = el.tagName?.toLowerCase?.() ?? '';
  if (tag === 'input' || tag === 'textarea' || tag === 'select') return true;

  // contenteditable (por si hay componentes rich)
  if ((el as any).isContentEditable) return true;

  // si el target está dentro de un input/textarea
  if (el.closest?.('input,textarea,select,[contenteditable="true"]')) return true;

  return false;
}

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

  // ✅ bloqueo inmediato (sin esperar GET)
  const [closedNow, setClosedNow] = useState(false);

  // ✅ remount duro al cerrar para matar focos / estados internos
  const [closeEpoch, setCloseEpoch] = useState(0);

  // ✅ para remount cuando invalidamos drafts
  const [draftResetKey, setDraftResetKey] = useState(0);

  // ✅ ReadOnly final (rol + cerrado server + cerrado instantáneo)
  const readOnly = useMemo(() => {
    if (forceReadOnly != null) return forceReadOnly;
    const apiReadOnly = data?.readOnly ?? false;
    const cerradoServer = dictamen?.estado === 'CERRADO';
    return apiReadOnly || cerradoServer || closedNow;
  }, [forceReadOnly, data?.readOnly, dictamen?.estado, closedNow]);

  // ✅ BLOQUEO EXTRA por captura (evita escribir incluso si algo queda enfocado)
  const blockTypingCapture = useCallback(
    (ev: any) => {
      if (!readOnly) return;

      // deja pasar clicks/teclas de navegación si NO es un campo editable
      if (!isEditableTarget(ev.target)) return;

      // Evita escritura, pegado, beforeinput, etc.
      ev.preventDefault?.();
      ev.stopPropagation?.();
    },
    [readOnly]
  );

  // ✅ Escucha cierre desde RightPanel
  useEffect(() => {
    function onClosed(ev: Event) {
      const e = ev as CustomEvent<{ dictamenId?: number; serverVersion?: string }>;
      if (e?.detail?.dictamenId !== dictamenId) return;

      // 1) bloquear YA
      setClosedNow(true);

      // 2) blur inmediato (mata teclado en textarea enfocado)
      try {
        const a = document.activeElement as any;
        a?.blur?.();
      } catch {}

      // 3) remount duro del layout para matar estados internos
      setCloseEpoch((x) => x + 1);
      setDraftResetKey((x) => x + 1);

      // 4) limpia drafts locales (para evitar que queden “inputs vivos” por Dexie)
      (async () => {
        await db.dictamenDrafts.delete(dictamenId).catch(() => {});
        await db.dictamenDiagnosticosDrafts.delete(dictamenId).catch(() => {});
        await db.dictamenMeta.put({
          id: dictamenId,
          serverVersion: String(e?.detail?.serverVersion ?? data?.serverVersion ?? ''),
          updatedAt: Date.now(),
        }).catch(() => {});
      })();

      // 5) cache optimista
      qc.setQueryData(['dictamen', dictamenId], (prev: any) => {
        if (!prev?.dictamen) return prev;
        return {
          ...prev,
          serverVersion: String(e?.detail?.serverVersion ?? prev.serverVersion ?? ''),
          dictamen: { ...prev.dictamen, estado: 'CERRADO' },
        };
      });

      // 6) traer verdad del servidor
      qc.invalidateQueries({ queryKey: ['dictamen', dictamenId] });
      qc.refetchQueries({ queryKey: ['dictamen', dictamenId] });
    }

    window.addEventListener('dictamen:closed', onClosed as any);
    return () => window.removeEventListener('dictamen:closed', onClosed as any);
  }, [dictamenId, qc, data?.serverVersion]);

  // ✅ invalidación Dexie por serverVersion (normal)
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

  const [procedimientoPcl, setProcedimientoPcl] = useState<'A' | 'B'>('A');
  const [fechaDictamen, setFechaDictamen] = useState<string>('');
  const [numeroDictamen, setNumeroDictamen] = useState<string>('');
  const [showEditDocente, setShowEditDocente] = useState(false);

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
          {/* ✅ Captura y bloquea escritura si readOnly (además de blur/remount) */}
          <div
            className={readOnlyScope}
            onBeforeInputCapture={blockTypingCapture as any}
            onPasteCapture={blockTypingCapture as any}
            onDropCapture={blockTypingCapture as any}
            onKeyDownCapture={(ev: any) => {
              if (!readOnly) return;
              if (!isEditableTarget(ev.target)) return;

              // deja Ctrl/Cmd + C (copiar) y navegación
              if ((ev.ctrlKey || ev.metaKey) && (ev.key === 'c' || ev.key === 'a' || ev.key === 'f')) return;
              if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Escape', 'Tab'].includes(ev.key)) return;

              // bloquea teclas que modifican
              if (ev.key === 'Backspace' || ev.key === 'Delete' || ev.key === 'Enter' || (ev.key?.length === 1 && !ev.ctrlKey && !ev.metaKey && !ev.altKey)) {
                ev.preventDefault();
                ev.stopPropagation();
              }
            }}
          >
            {/* ✅ Remount duro con closeEpoch */}
            <div key={`layout-${dictamen.id}-${closeEpoch}`}>
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
                    key={`center-${dictamen.id}-${data?.serverVersion ?? ''}-${draftResetKey}-${readOnly ? 'ro' : 'rw'}-${closeEpoch}`}
                    readOnly={readOnly}
                    serverVersion={data?.serverVersion ?? ''}
                    dictamen={{
                      id: dictamen.id,
                      antecedentesClinicos: dictamen.antecedentesClinicos ?? '',
                      condicionSalud: dictamen.condicionSalud ?? '',
                      descripcionHallazgos: dictamen.descripcionHallazgos ?? '',
                      diagnosticos: dictamen.diagnosticos ?? [],
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
                    key={`right-${dictamen.id}-${procedimientoPcl}-${closeEpoch}`}
                    dictamenId={dictamen.id}
                    procedimientoPcl={procedimientoPcl}
                  />
                }
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
