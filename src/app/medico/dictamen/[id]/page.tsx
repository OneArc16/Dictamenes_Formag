'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import AppNav from '@/components/AppNav';
import { DictamenFormLayout } from '@/components/dictamen/DictamenFormLayout';
import { ActualizarDocenteModal } from '@/components/docentes/ActualizarDocenteModal';

// Paneles reutilizables
import DictamenLeftPanel from '@/components/dictamen/DictamenLeftPanel';
import DictamenCenterPanel from '@/components/dictamen/DictamenCenterPanel';
import DictamenRightPanel from '@/components/dictamen/DictamenRightPanel';

/* =====================
   Tipos
   ===================== */

type DictamenEstado = 'PENDIENTE' | 'REABIERTO' | 'CERRADO';

type DictamenDetalle = {
  id: number;
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
};

type PageProps = {
  params: { id: string };
};

/* =====================
   Página principal
   ===================== */

export default function DictamenDetallePage({}: PageProps) {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const dictamenId = Number(id);

  const [dictamen, setDictamen] = useState<DictamenDetalle | null>(
    null,
  );
  const [procedimientoPcl, setProcedimientoPcl] = useState<'A' | 'B'>(
    'A',
  );
  const [fechaDictamen, setFechaDictamen] = useState<string>(''); // editable
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showEditDocente, setShowEditDocente] = useState(false);

  useEffect(() => {
    if (!dictamenId || Number.isNaN(dictamenId)) {
      setError('ID de dictamen inválido.');
      setLoading(false);
      return;
    }

    const load = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/dictamenes/${dictamenId}`, {
          method: 'GET',
          credentials: 'include',
        });

        const data = await res.json();

        if (!res.ok || !data?.ok) {
          setError(
            data?.error ?? 'Error cargando información del dictamen',
          );
          setLoading(false);
          return;
        }

        const d = data.dictamen as DictamenDetalle;
        setDictamen(d);
        setProcedimientoPcl(d.procedimientoPcl ?? 'A');
        setFechaDictamen(d.fechaDictamen ?? '');
        setError(null);
      } catch (err) {
        console.error('Error cargando dictamen:', err);
        setError('Error cargando información del dictamen.');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [dictamenId]);

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
                estado={dictamen.estado}
                docente={dictamen.docente}
                medico={dictamen.medico}
                fechaDictamen={fechaDictamen}
                onChangeFecha={setFechaDictamen}
                procedimientoPcl={procedimientoPcl}
                onChangeProcedimiento={setProcedimientoPcl}
                onEditDocente={() => setShowEditDocente(true)}
              />
            }
            center={
              <DictamenCenterPanel
                dictamen={{
                  id: dictamen.id,
                  antecedentesClinicos:
                    dictamen.antecedentesClinicos ?? '',
                  condicionSalud: dictamen.condicionSalud ?? '',
                  descripcionHallazgos:
                    dictamen.descripcionHallazgos ?? '',
                }}
                procedimientoPcl={procedimientoPcl}
              />
            }
            right={<DictamenRightPanel />}
          />
        </div>
      </main>
    </div>
  );
}
