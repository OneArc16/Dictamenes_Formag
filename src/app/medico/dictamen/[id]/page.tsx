'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useRouter, useParams, usePathname } from 'next/navigation';
import toast from 'react-hot-toast';

import AppNav from '@/components/AppNav';
import { DictamenFormLayout } from '@/components/dictamen/DictamenFormLayout';
import { ActualizarDocenteModal } from '@/components/docentes/ActualizarDocenteModal';
import DictamenLeftPanel from '@/components/dictamen/DictamenLeftPanel';
import DictamenCenterPanel from '@/components/dictamen/DictamenCenterPanel';
import DictamenRightPanel from '@/components/dictamen/DictamenRightPanel';
import type { DictamenDetalle } from '@/components/dictamen/types';

function buildNumeroDictamen(id: number, fecha: string | null) {
  if (!fecha) return '';

  const [yyyy, mm, dd] = fecha.split('-');
  const datePart = `${dd}${mm}${yyyy}`;
  const consecutivo = String(id).padStart(9, '0');

  return `${datePart}${consecutivo}`;
}

export default function DictamenDetallePage() {
  const router = useRouter();
  const pathname = usePathname();
  const { id } = useParams<{ id: string }>();
  const dictamenId = Number(id);

  const backTo = pathname?.startsWith('/admisiones') ? '/admisiones' : '/medico';

  const [dictamen, setDictamen] = useState<DictamenDetalle | null>(null);
  const [serverVersion, setServerVersion] = useState('');
  const [readOnly, setReadOnly] = useState(false);
  const [locked, setLocked] = useState(false);
  const [procedimientoPcl, setProcedimientoPcl] = useState<'A' | 'B'>('A');
  const [fechaDictamen, setFechaDictamen] = useState<string>('');
  const [numeroDictamen, setNumeroDictamen] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dictamenLoaded, setDictamenLoaded] = useState(false);
  const [showEditDocente, setShowEditDocente] = useState(false);

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
      setDictamenLoaded(true);
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

  useEffect(() => {
    if (readOnly || !dictamenLoaded || !fechaDictamen || !dictamenId || Number.isNaN(dictamenId)) {
      return;
    }

    const controller = new AbortController();

    const saveFecha = async () => {
      try {
        const res = await fetch(`/api/dictamenes/${dictamenId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ fechaDictamen }),
          signal: controller.signal,
        });

        const data = await res.json();

        if (!res.ok || !data?.ok) {
          console.error('Error actualizando fecha de dictamen', data);
          return;
        }

        const updated = data.dictamen as DictamenDetalle | undefined;
        if (updated?.numeroDictamen) {
          setNumeroDictamen(updated.numeroDictamen);
        } else {
          setNumeroDictamen(buildNumeroDictamen(dictamenId, fechaDictamen || null));
        }
      } catch (saveError: unknown) {
        if (saveError instanceof DOMException && saveError.name === 'AbortError') return;
        console.error('Error actualizando fecha de dictamen:', saveError);
      }
    };

    saveFecha();
    return () => controller.abort();
  }, [fechaDictamen, dictamenId, dictamenLoaded, readOnly]);

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

  const handleDocenteUpdated = async () => {
  const handleDocenteUpdated = async () => {
    toast.success('Datos del docente actualizados correctamente.');
    await fetchDictamen(true);
  };
    return (
      <div className="min-h-screen bg-slate-50">
        <AppNav />
        <main className="px-4 py-4 lg:px-8">
          <button
            type="button"
            onClick={() => router.push(backTo)}
            className="text-xs text-blue-600 hover:underline"
          >
            Ã¢â€ Â Volver al listado
          </button>

          <div className="mt-4 rounded-xl border bg-white px-4 py-6 text-sm text-slate-500">
            Cargando dictamenÃ¢â‚¬Â¦
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
            Ã¢â€ Â Volver al listado
          </button>

          <div className="mt-4 rounded-xl border bg-white px-4 py-6 text-sm text-red-600">
            {error ?? 'No se encontro el dictamen.'}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <AppNav />

      {!readOnly && showEditDocente && (
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
          onClick={() => router.push(backTo)}
          className="text-xs text-blue-600 hover:underline"
        >
          Ã¢â€ Â Volver al listado de dictamenes
        </button>

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
                onEditDocente={() => {
                  if (readOnly) return;
                  setShowEditDocente(true);
                }}
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
                  sustentacionObservaciones: dictamen.sustentacionObservaciones ?? '',
                  diagnosticos: dictamen.diagnosticos ?? [],
                  fechaEstructuracionInvalidez: dictamen.fechaEstructuracionInvalidez ?? null,
                  tipoEvento: dictamen.tipoEvento ?? null,
                  origenEvento: dictamen.origenEvento ?? null,
                  historial: dictamen.historial ?? [],
                }}
                procedimientoPcl={procedimientoPcl}
                fechaDictamen={fechaDictamen}
                serverVersion={serverVersion}
                readOnly={readOnly}
              />
            }
            right={
              <DictamenRightPanel
                dictamenId={dictamen.id}
                procedimientoPcl={procedimientoPcl}
                readOnly={readOnly}
              />
            }
          />
        </div>
      </main>
    </div>
  );
}




