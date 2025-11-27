'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import AppNav from '@/components/AppNav';
import { DictamenFormLayout } from '@/components/dictamen/DictamenFormLayout';
import { ActualizarDocenteModal } from '@/components/docentes/ActualizarDocenteModal';

// 🔹 Tabs como componentes separados
import TabAntecedentes from '@/components/dictamen/tabs/TabAntecedentes';
import TabExamenFisico from '@/components/dictamen/tabs/TabExamenFisico';
import TabDiagnosticos from '@/components/dictamen/tabs/TabDiagnosticos';
import TabDeficiencias from '@/components/dictamen/tabs/TabDeficiencias';

/* =====================
   Tipos
   ===================== */

type DictamenEstado = 'PENDIENTE' | 'REABIERTO' | 'CERRADO';

type DictamenDetalle = {
  id: number;
  fechaDictamen: string | null;
  procedimientoPcl: 'A' | 'B';
  estado: DictamenEstado;
  antecedentesClinicos: string;
  condicionSalud: string;
  descripcionHallazgos: string;
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
   Helpers
   ===================== */

function formatFechaHumana(fecha: string | null): string {
  if (!fecha) return '—';
  const d = new Date(`${fecha}T00:00:00`);
  if (Number.isNaN(d.getTime())) return fecha;
  return d.toLocaleDateString('es-CO', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function estadoBadge(estado: DictamenEstado) {
  if (estado === 'REABIERTO') {
    return {
      label: 'Reabierto',
      classes:
        'bg-indigo-50 text-indigo-700 border border-indigo-100',
    };
  }
  if (estado === 'PENDIENTE') {
    return {
      label: 'Pendiente',
      classes:
        'bg-amber-50 text-amber-700 border border-amber-100',
    };
  }
  return {
    label: 'Cerrado',
    classes:
      'bg-emerald-50 text-emerald-700 border border-emerald-100',
  };
}

/* =====================
   Tabs layout
   ===================== */

type TabId = 'ANTECEDENTES' | 'EXAMEN' | 'DIAGNOSTICOS' | 'DEFICIENCIAS';

type DictamenTabsProps = {
  dictamen: DictamenDetalle;
  procedimientoPcl: 'A' | 'B';
};

function DictamenTabs({ dictamen, procedimientoPcl }: DictamenTabsProps) {
  const [tab, setTab] = useState<TabId>('ANTECEDENTES');

  return (
    <div className="bg-white border shadow-sm rounded-xl">
      {/* Header de pestañas */}
      <div className="flex px-4 border-b bg-slate-50">
        {([
          ['ANTECEDENTES', 'Antecedentes'],
          ['EXAMEN', 'Examen físico'],
          ['DIAGNOSTICOS', 'Diagnóstico y tratamiento'],
          ['DEFICIENCIAS', 'Deficiencias / PCL'],
        ] as [TabId, string][]).map(([id, label]) => {
          const active = tab === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={`relative border-b-2 px-3 py-2 text-xs font-medium ${
                active
                  ? 'border-blue-600 text-blue-700'
                  : 'border-transparent text-slate-500 hover:border-slate-200 hover:text-slate-700'
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* Contenido de pestaña */}
      <div className="p-4 text-sm">
        {tab === 'ANTECEDENTES' && (
          <TabAntecedentes
            dictamenId={dictamen.id}
            initial={{
              antecedentesClinicos: dictamen.antecedentesClinicos ?? '',
              condicionSalud: dictamen.condicionSalud ?? '',
              descripcionHallazgos:
                dictamen.descripcionHallazgos ?? '',
            }}
            procedimientoPcl={procedimientoPcl}
          />
        )}

        {tab === 'EXAMEN' && (
          <TabExamenFisico
            dictamenId={dictamen.id}
            procedimientoPcl={procedimientoPcl}
          />
        )}

        {tab === 'DIAGNOSTICOS' && (
          <TabDiagnosticos
            dictamenId={dictamen.id}
            procedimientoPcl={procedimientoPcl}
          />
        )}

        {tab === 'DEFICIENCIAS' && (
          <TabDeficiencias
            dictamenId={dictamen.id}
            procedimientoPcl={procedimientoPcl}
          />
        )}
      </div>
    </div>
  );
}

/* =====================
   Panel izquierdo reutilizable
   ===================== */

type DictamenLeftPanelProps = {
  dictamen: DictamenDetalle;
  fechaDictamen: string; // YYYY-MM-DD o ''
  onChangeFecha: (value: string) => void;
  procedimientoPcl: 'A' | 'B';
  onChangeProcedimiento: (value: 'A' | 'B') => void;
  onEditDocente?: () => void;
};

function DictamenLeftPanel({
  dictamen,
  fechaDictamen,
  onChangeFecha,
  procedimientoPcl,
  onChangeProcedimiento,
  onEditDocente,
}: DictamenLeftPanelProps) {
  const estadoInfo = estadoBadge(dictamen.estado);

  return (
    <>
      {/* Card docente */}
      <div className="p-4 bg-white border shadow-sm rounded-xl">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-xs font-semibold tracking-wide uppercase text-slate-500">
              Docente
            </h2>
            <p className="mt-1 text-lg font-semibold text-slate-900">
              {dictamen.docente.nombreCompleto}
            </p>
            <p className="text-xs text-slate-600">
              {dictamen.docente.tipoDocumento}{' '}
              {dictamen.docente.documento}
            </p>
            <p className="mt-1 text-xs text-slate-600">
              {dictamen.docente.edad != null
                ? `${dictamen.docente.edad} años`
                : 'Edad no registrada'}
            </p>

            <p className="mt-2 text-xs font-semibold text-slate-500">
              Secretaría
            </p>
            <p className="text-xs text-slate-700">
              {dictamen.docente.secretaria ||
                'Sin secretaría registrada'}
            </p>

            <p className="mt-2 text-xs font-semibold text-slate-500">
              Institución
            </p>
            <p className="text-xs text-slate-700">
              {dictamen.docente.institucion ||
                'Sin institución registrada'}
            </p>
          </div>

          {onEditDocente && (
            <button
              type="button"
              onClick={onEditDocente}
              className="px-3 py-1 text-xs font-semibold border rounded-full border-sky-600 text-sky-700 hover:bg-sky-50"
            >
              Editar
            </button>
          )}
        </div>
      </div>

      {/* Card datos del dictamen */}
      <div className="p-4 bg-white border shadow-sm rounded-xl">
        <h2 className="text-xs font-semibold tracking-wide uppercase text-slate-500">
          Datos del dictamen
        </h2>

        <div className="mt-3 space-y-3 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500">Estado</span>
            <span
              className={`inline-flex items-center rounded-full px-3 py-1 text-[11px] font-medium ${estadoInfo.classes}`}
            >
              {estadoInfo.label}
            </span>
          </div>

          <div>
            <p className="text-xs text-slate-500">Fecha de dictamen</p>
            <input
              type="date"
              value={fechaDictamen || ''}
              onChange={(e) => onChangeFecha(e.target.value)}
              className="w-full px-2 py-1 mt-1 text-xs bg-white border rounded-md border-slate-300 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="mt-1 text-[11px] text-slate-400">
              Actual: {formatFechaHumana(fechaDictamen || null)}
            </p>
          </div>

          <div>
            <p className="text-xs text-slate-500">Procedimiento</p>
            <select
              value={procedimientoPcl}
              onChange={(e) =>
                onChangeProcedimiento(e.target.value as 'A' | 'B')
              }
              className="w-full px-2 py-1 mt-1 text-xs bg-white border rounded-md border-slate-300 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="A">Procedimiento A</option>
              <option value="B">Procedimiento B</option>
            </select>
          </div>

          <div>
            <p className="text-xs text-slate-500">Médico</p>
            <p className="font-medium text-slate-900">
              {dictamen.medico?.nombreCompleto ?? '—'}
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

/* =====================
   Panel derecho (placeholder)
   ===================== */

function RightPanelPlaceholder() {
  return (
    <div className="h-full p-4 text-xs border border-dashed rounded-xl bg-slate-50/80 text-slate-400">
      Espacio reservado para el panel derecho.
      <br />
      (Todavía por definir contenido).
    </div>
  );
}

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
        <main className="px-4 py-4 mx-auto max-w-7xl lg:px-8">
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
        <main className="px-4 py-4 mx-auto max-w-7xl lg:px-8">
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

      <main className="px-4 py-4 mx-auto max-w-7xl lg:px-8">
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
                dictamen={dictamen}
                fechaDictamen={fechaDictamen}
                onChangeFecha={setFechaDictamen}
                procedimientoPcl={procedimientoPcl}
                onChangeProcedimiento={setProcedimientoPcl}
                onEditDocente={() => setShowEditDocente(true)}
              />
            }
            center={
              <DictamenTabs
                dictamen={dictamen}
                procedimientoPcl={procedimientoPcl}
              />
            }
            right={<RightPanelPlaceholder />}
          />
        </div>
      </main>
    </div>
  );
}
