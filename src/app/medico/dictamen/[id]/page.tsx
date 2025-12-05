'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import AppNav from '@/components/AppNav';
import { DictamenFormLayout } from '@/components/dictamen/DictamenFormLayout';
import { ActualizarDocenteModal } from '@/components/docentes/ActualizarDocenteModal';

import DictamenLeftPanel from '@/components/dictamen/DictamenLeftPanel';
import DictamenCenterPanel from '@/components/dictamen/DictamenCenterPanel';
import DictamenRightPanel from '@/components/dictamen/DictamenRightPanel';

/* =====================
   Tipos
   ===================== */

type DictamenEstado = 'PENDIENTE' | 'REABIERTO' | 'CERRADO';

type DictamenDiagnosticoDetalle = {
  cie10Codigo: string;
  tipo:
    | 'CONFIRMADO_NUEVO'
    | 'IMPRESION_DIAGNOSTICA'
    | 'CONFIRMADO_REPETIDO';
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
  medico: {
    id: number;
    nombreCompleto: string;
  } | null;
  // 👇 lo hacemos opcional, porque puede no venir en alguna respuesta
  diagnosticos?: DictamenDiagnosticoDetalle[];
};

/* =====================
   Helper número dictamen
   ===================== */

// Formato: ddMMyyyy + id en 9 dígitos -> 01012025123456789
function buildNumeroDictamen(id: number, fecha: string | null) {
  if (!fecha) return '';

  const [yyyy, mm, dd] = fecha.split('-'); // YYYY-MM-DD
  const datePart = `${dd}${mm}${yyyy}`; // 01012025
  const consecutivo = String(id).padStart(9, '0'); // 123456789 -> 9 dígitos

  return `${datePart}${consecutivo}`;
}

/* =====================
   Página principal
   ===================== */

export default function DictamenDetallePage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const dictamenId = Number(id);

  const [dictamen, setDictamen] = useState<DictamenDetalle | null>(null);

  // Estado compartido
  const [procedimientoPcl, setProcedimientoPcl] = useState<'A' | 'B'>('A');
  const [fechaDictamen, setFechaDictamen] = useState<string>(''); // YYYY-MM-DD
  const [numeroDictamen, setNumeroDictamen] = useState<string>(''); // mostrado en el panel

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dictamenLoaded, setDictamenLoaded] = useState(false);

  const [showEditDocente, setShowEditDocente] = useState(false);

  // 🔹 función reutilizable para traer el dictamen
  const fetchDictamen = async (silent: boolean = false) => {
    try {
      if (!silent) setLoading(true);

      const res = await fetch(`/api/dictamenes/${dictamenId}`, {
        method: 'GET',
        credentials: 'include',
      });

      const data = await res.json();

      if (!res.ok || !data?.ok) {
        setError(
          data?.error ?? 'Error cargando información del dictamen',
        );
        return;
      }

      const d = data.dictamen as DictamenDetalle;

      // ✅ Normalizamos para que SIEMPRE haya array (aunque esté vacío)
      const dictamenNormalizado: DictamenDetalle = {
        ...d,
        diagnosticos: d.diagnosticos ?? [],
      };

      setDictamen(dictamenNormalizado);

      // Procedimiento A/B desde backend
      const proc = dictamenNormalizado.procedimientoPcl ?? 'A';
      setProcedimientoPcl(proc);

      // Normalizamos la fecha a formato YYYY-MM-DD para el input
      const rawFecha = dictamenNormalizado.fechaDictamen;
      const uiFecha =
        rawFecha && rawFecha.length >= 10 ? rawFecha.substring(0, 10) : '';
      setFechaDictamen(uiFecha);

      // Número de dictamen (si no viene, lo calculamos)
      const num =
        dictamenNormalizado.numeroDictamen ??
        buildNumeroDictamen(dictamenNormalizado.id, uiFecha || null);

      setNumeroDictamen(num);

      setError(null);
      setDictamenLoaded(true);
    } catch (err) {
      console.error('Error cargando dictamen:', err);
      setError('Error cargando información del dictamen.');
    } finally {
      if (!silent) setLoading(false);
    }
  };

  // 🔹 carga inicial
  useEffect(() => {
    if (!dictamenId || Number.isNaN(dictamenId)) {
      setError('ID de dictamen inválido.');
      setLoading(false);
      return;
    }

    fetchDictamen(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dictamenId]);

  // 🔹 guardar fecha en el backend cada vez que cambia
  useEffect(() => {
    if (!dictamenLoaded) return;
    if (!fechaDictamen) return;
    if (!dictamenId || Number.isNaN(dictamenId)) return;

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

        // ⬅️ si el backend devuelve el dictamen actualizado, usamos su número
        const updated = data.dictamen as {
          numeroDictamen?: string | null;
        };

        if (updated?.numeroDictamen) {
          setNumeroDictamen(updated.numeroDictamen);
        } else {
          // fallback: lo calculamos nosotros
          setNumeroDictamen(
            buildNumeroDictamen(dictamenId, fechaDictamen || null),
          );
        }
      } catch (err: any) {
        if (err?.name === 'AbortError') return;
        console.error('Error actualizando fecha de dictamen:', err);
      }
    };

    saveFecha();

    return () => controller.abort();
  }, [fechaDictamen, dictamenId, dictamenLoaded]);

  // 🔹 handlers que ACTUALIZAN también el número en el front
  const handleChangeFecha = (newFecha: string) => {
    setFechaDictamen(newFecha);

    // UI optimista: calculamos el número inmediatamente
    if (!dictamenId || Number.isNaN(dictamenId)) return;
    setNumeroDictamen(
      buildNumeroDictamen(dictamenId, newFecha || null),
    );
  };

  const handleChangeProcedimiento = (nuevoProc: 'A' | 'B') => {
    setProcedimientoPcl(nuevoProc);

    // si en algún momento el procedimiento entra en la lógica del número,
    // aquí lo puedes usar; por ahora el formato sólo depende de fecha + id
    if (!dictamenId || Number.isNaN(dictamenId)) return;
    const nuevoNumero = buildNumeroDictamen(
      dictamenId,
      fechaDictamen || null,
    );
    setNumeroDictamen(nuevoNumero);
  };

  // 🔹 se usará cuando el modal termine de actualizar al docente
  const handleDocenteUpdated = async () => {
    await fetchDictamen(true); // refresh silencioso
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <AppNav />
        <main className="px-4 py-4 lg:px-8">
          <button
            type="button"
            onClick={() => router.push('/medico')}
            className="text-xs text-blue-600 hover:underline"
          >
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
        <AppNav />
        <main className="px-4 py-4 lg:px-8">
          <button
            type="button"
            onClick={() => router.push('/medico')}
            className="text-xs text-blue-600 hover:underline"
          >
            ← Volver al listado
          </button>

          <div className="px-4 py-6 mt-4 text-sm text-red-600 bg-white border rounded-xl">
            {error ?? 'No se encontró el dictamen.'}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <AppNav />

      {/* Modal de actualizar docente */}
      {showEditDocente && (
        <ActualizarDocenteModal
          open={showEditDocente}
          onClose={() => setShowEditDocente(false)}
          numeroDocumento={dictamen.docente.documento}
          onUpdate={handleDocenteUpdated}
        />
      )}

      <main className="px-4 py-4 lg:px-8">
        {/* Volver */}
        <button
          type="button"
          onClick={() => router.push('/medico')}
          className="text-xs text-blue-600 hover:underline"
        >
          ← Volver al listado de dictámenes
        </button>

        <div className="mt-4">
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
                onEditDocente={() => setShowEditDocente(true)}
              />
            }
            center={
              <DictamenCenterPanel
                dictamen={{
                  id: dictamen.id,
                  antecedentesClinicos: dictamen.antecedentesClinicos ?? '',
                  condicionSalud: dictamen.condicionSalud ?? '',
                  descripcionHallazgos: dictamen.descripcionHallazgos ?? '',
                  // 👇 aquí pasamos lo que vino del backend (o [] si no vino)
                  diagnosticos: dictamen.diagnosticos ?? [],
                }}
                procedimientoPcl={procedimientoPcl}
                fechaDictamen={fechaDictamen}
              />
            }
            right={<DictamenRightPanel />}
          />
        </div>
      </main>
    </div>
  );
}
