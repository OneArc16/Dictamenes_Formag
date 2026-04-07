'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';

import AppNav from '@/components/AppNav';
import { DictamenFormLayout } from '@/components/dictamen/DictamenFormLayout';
import DictamenLeftPanel from '@/components/dictamen/DictamenLeftPanel';
import DictamenCenterPanel from '@/components/dictamen/DictamenCenterPanel';
import DictamenRightPanel from '@/components/dictamen/DictamenRightPanel';
import MedicoAccessProvider from '@/components/medico/MedicoAccessProvider';
import type { AuthUser } from '@/lib/auth/guards';
import type { DictamenDetalle } from '@/components/dictamen/types';
import { useCan } from '@/hooks/useCan';

function buildNumeroDictamen(id: number, fecha: string | null) {
  if (!fecha) return '';
  const [yyyy, mm, dd] = fecha.split('-');
  const datePart = `${dd}${mm}${yyyy}`;
  const consecutivo = String(id).padStart(9, '0');
  return `${datePart}${consecutivo}`;
}

const ADMISIONES_USER = {
  id: 0,
  role: 'ADMISIONISTA',
  name: 'ADMISIONES',
} as unknown as AuthUser;

export default function AdmisionesVerHistoriaClinicaPage() {
  const router = useRouter();
  const { can: canPrintDictamen } = useCan('dictamen.print');
  const { id } = useParams<{ id: string }>();
  const dictamenId = Number(id);

  const backTo = '/admisiones';

  const [dictamen, setDictamen] = useState<DictamenDetalle | null>(null);
  const [serverVersion, setServerVersion] = useState('');
  const [readOnly, setReadOnly] = useState(false);
  const [locked, setLocked] = useState(false);
  const [procedimientoPcl, setProcedimientoPcl] = useState<'A' | 'B'>('A');
  const [fechaDictamen, setFechaDictamen] = useState<string>('');
  const [numeroDictamen, setNumeroDictamen] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDictamen = useCallback(async (silent = false) => {
    try {
      if (!silent) setLoading(true);

      const res = await fetch(`/api/dictamenes/${dictamenId}`, {
        method: 'GET',
        credentials: 'include',
      });

      const data = await res.json();

      if (!res.ok || !data?.ok) {
        setError(data?.error ?? 'Error cargando informacion del dictamen');
        return;
      }

      const detail = data.dictamen as DictamenDetalle;
      setDictamen(detail);
      setServerVersion(String(data?.serverVersion ?? ''));

      const lockedNow = detail.estado === 'CERRADO' || Boolean(detail.locked);
      setLocked(lockedNow);
      setReadOnly(Boolean(data?.readOnly) || lockedNow);

      const proc = detail.procedimientoPcl ?? 'A';
      setProcedimientoPcl(proc);

      const rawFecha = detail.fechaDictamen;
      const uiFecha = rawFecha && rawFecha.length >= 10 ? rawFecha.substring(0, 10) : '';
      setFechaDictamen(uiFecha);

      const numero = detail.numeroDictamen ?? buildNumeroDictamen(detail.id, uiFecha || null);
      setNumeroDictamen(numero);

      setError(null);
    } catch (fetchError) {
      console.error('Error cargando dictamen:', fetchError);
      setError('Error cargando informacion del dictamen.');
    } finally {
      if (!silent) setLoading(false);
    }
  }, [dictamenId]);

  const markClosedLocally = useCallback((serverVersionValue?: string) => {
    setDictamen((prev) =>
      prev
        ? {
            ...prev,
            estado: 'CERRADO',
            locked: true,
          }
        : prev,
    );
    setLocked(true);
    setReadOnly(true);
    if (serverVersionValue) setServerVersion(serverVersionValue);
  }, []);

  useEffect(() => {
    if (!dictamenId || Number.isNaN(dictamenId)) {
      setError('ID de dictamen invalido.');
      setLoading(false);
      return;
    }
    void fetchDictamen(false);
  }, [dictamenId, fetchDictamen]);

  useEffect(() => {
    const handleClosedState = (event: Event) => {
      const customEvent = event as CustomEvent<{ dictamenId?: number; serverVersion?: string }>;
      if (customEvent.detail?.dictamenId !== dictamenId) return;

      markClosedLocally(
        customEvent.detail?.serverVersion ? String(customEvent.detail.serverVersion) : undefined,
      );

      void fetchDictamen(true);
    };

    window.addEventListener('dictamen:closed', handleClosedState as EventListener);
    window.addEventListener('dictamen:estado_updated', handleClosedState as EventListener);

    return () => {
      window.removeEventListener('dictamen:closed', handleClosedState as EventListener);
      window.removeEventListener('dictamen:estado_updated', handleClosedState as EventListener);
    };
  }, [dictamenId, fetchDictamen, markClosedLocally]);

  const handleChangeFecha = (newFecha: string) => {
    if (readOnly) return;
    setFechaDictamen(newFecha);
    if (!dictamenId || Number.isNaN(dictamenId)) return;
    setNumeroDictamen(buildNumeroDictamen(dictamenId, newFecha || null));
  };

  const handleChangeProcedimiento = (nuevoProc: 'A' | 'B') => {
    if (readOnly) return;
    setProcedimientoPcl(nuevoProc);
    if (!dictamenId || Number.isNaN(dictamenId)) return;
    setNumeroDictamen(buildNumeroDictamen(dictamenId, fechaDictamen || null));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <AppNav />
        <main className="px-4 py-4 lg:px-8">
          <button
            type="button"
            onClick={() => router.push(backTo)}
            className="text-xs text-blue-600 hover:underline"
          >
            ← Volver al listado
          </button>

          <div className="mt-4 rounded-xl border bg-white px-4 py-6 text-sm text-slate-500">
            Cargando dictamen…
          </div>
        </main>
      </div>
    );
  }

  if (error || !dictamen) {
    return (
      <div className="min-h-screen bg-slate-50">
        <AppNav />
        <main className="px-4 py-4 lg:px-8">
          <button
            type="button"
            onClick={() => router.push(backTo)}
            className="text-xs text-blue-600 hover:underline"
          >
            ← Volver al listado
          </button>

          <div className="mt-4 rounded-xl border bg-white px-4 py-6 text-sm text-red-600">
            {error ?? 'No se encontro el dictamen.'}
          </div>
        </main>
      </div>
    );
  }

  return (
    <MedicoAccessProvider user={ADMISIONES_USER} readOnly={true}>
      <div className="min-h-screen bg-slate-50">
        <AppNav />

        <main className="px-4 py-4 lg:px-8">
          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => router.push(backTo)}
              className="text-xs text-blue-600 hover:underline"
            >
              ← Volver al listado de dictamenes
            </button>

            {canPrintDictamen ? (
              <button
                type="button"
                onClick={() => {
                  window.open(`/api/dictamenes/${dictamen.id}/pdf-react`, '_blank', 'noopener,noreferrer');
                }}
                className="rounded-full border border-blue-200 bg-white px-3 py-1.5 text-[11px] font-semibold text-blue-700 shadow-sm hover:bg-blue-50"
              >
                Imprimir PDF
              </button>
            ) : null}
          </div>

          {readOnly && (
            <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2 text-xs text-amber-800">
              {locked
                ? 'Dictamen CERRADO. No se permite editar.'
                : 'Estas en modo solo lectura. No puedes editar.'}
            </div>
          )}

          <div className="mt-4">
            <DictamenFormLayout
              stickyTopClassName="top-20"
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
                />
              }
              center={
                <DictamenCenterPanel
                  dictamen={{
                    id: dictamen.id,
                    estado: dictamen.estado,
                    antecedentesClinicos: dictamen.antecedentesClinicos ?? '',
                    condicionSalud: dictamen.condicionSalud ?? '',
                    descripcionHallazgos: dictamen.descripcionHallazgos ?? '',
                    diagnosticos: dictamen.diagnosticos ?? [],
                    fechaEstructuracionInvalidez: dictamen.fechaEstructuracionInvalidez ?? null,
                    tipoEvento: dictamen.tipoEvento ?? null,
                    origenEvento: dictamen.origenEvento ?? null,
                    historial: dictamen.historial ?? [],
                  }}
                  procedimientoPcl={procedimientoPcl}
                  fechaDictamen={fechaDictamen}
                  serverVersion={serverVersion}
                  readOnly={true}
                />
              }
              right={
                <DictamenRightPanel
                  dictamenId={dictamen.id}
                  procedimientoPcl={procedimientoPcl}
                  readOnly={readOnly}
                  ultimaReapertura={dictamen.ultimaReapertura}
                />
              }
            />
          </div>
        </main>
      </div>
    </MedicoAccessProvider>
  );
}

