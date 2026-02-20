'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';

import AppNav from '@/components/AppNav';
import { DictamenFormLayout } from '@/components/dictamen/DictamenFormLayout';

import DictamenLeftPanel from '@/components/dictamen/DictamenLeftPanel';
import DictamenCenterPanel from '@/components/dictamen/DictamenCenterPanel';
import DictamenRightPanel from '@/components/dictamen/DictamenRightPanel';

// ✅ ADD: Provider para que NO explote useMedicoAccess en tabs (Cap.2)
import MedicoAccessProvider from '@/components/medico/MedicoAccessProvider';
import type { AuthUser } from '@/lib/auth/guards';

/* =====================
   Tipos
   ===================== */

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

  locked?: boolean;

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
    tipoDictamen?: string | null;
  };

  medico: {
    id: number;
    nombreCompleto: string;
  } | null;
};

/* =====================
   Helper número dictamen
   ===================== */

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

/* =====================
   Página principal
   ===================== */

export default function AdmisionesVerHistoriaClinicaPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const dictamenId = Number(id);

  const backTo = '/admisiones';

  const [dictamen, setDictamen] = useState<DictamenDetalle | null>(null);

  const [readOnly, setReadOnly] = useState(false);
  const [locked, setLocked] = useState(false);

  const [procedimientoPcl, setProcedimientoPcl] = useState<'A' | 'B'>('A');
  const [fechaDictamen, setFechaDictamen] = useState<string>('');
  const [numeroDictamen, setNumeroDictamen] = useState<string>('');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dictamenLoaded, setDictamenLoaded] = useState(false);

  const fetchDictamen = async (silent: boolean = false) => {
    try {
      if (!silent) setLoading(true);

      const res = await fetch(`/api/dictamenes/${dictamenId}`, {
        method: 'GET',
        credentials: 'include',
      });

      const data = await res.json();

      if (!res.ok || !data?.ok) {
        setError(data?.error ?? 'Error cargando información del dictamen');
        return;
      }

      const d = data.dictamen as DictamenDetalle;
      setDictamen(d);

      const lockedNow = d.estado === 'CERRADO' || Boolean((d as any)?.locked);
      setLocked(lockedNow);

      setReadOnly(Boolean(data?.readOnly) || lockedNow);

      const proc = d.procedimientoPcl ?? 'A';
      setProcedimientoPcl(proc);

      const rawFecha = d.fechaDictamen;
      const uiFecha = rawFecha && rawFecha.length >= 10 ? rawFecha.substring(0, 10) : '';
      setFechaDictamen(uiFecha);

      const num = d.numeroDictamen ?? buildNumeroDictamen(d.id, uiFecha || null);
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

  useEffect(() => {
    if (!dictamenId || Number.isNaN(dictamenId)) {
      setError('ID de dictamen inválido.');
      setLoading(false);
      return;
    }
    fetchDictamen(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dictamenId]);

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
            onClick={() => router.push(backTo)}
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
    // ✅ ADD: envolver para que useMedicoAccess NO falle en tabs (Cap.2)
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
              ← Volver al listado de dictámenes
            </button>

            <button
              type="button"
              onClick={() => {
                window.open(`/api/dictamenes/${dictamen.id}/pdf-react`, '_blank', 'noopener,noreferrer');
              }}
              className="rounded-full border border-blue-200 bg-white px-3 py-1.5 text-[11px] font-semibold text-blue-700 shadow-sm hover:bg-blue-50"
            >
              Imprimir PDF
            </button>
          </div>

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
                  }}
                  procedimientoPcl={procedimientoPcl}
                  fechaDictamen={fechaDictamen}
                  readOnly={true}
                />
              }
              right={<DictamenRightPanel dictamenId={dictamen.id} procedimientoPcl={procedimientoPcl} />}
            />
          </div>
        </main>
      </div>
    </MedicoAccessProvider>
  );
}