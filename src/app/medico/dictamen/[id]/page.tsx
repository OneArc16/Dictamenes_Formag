'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';

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

function formatFecha(fecha: string | null): string {
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
   Formulario Antecedentes
   ===================== */

type AntecedentesFormProps = {
  dictamenId: number;
  initial: {
    antecedentesClinicos: string;
    condicionSalud: string;
    descripcionHallazgos: string;
  };
  procedimientoPcl: 'A' | 'B';
};

function AntecedentesForm({
  dictamenId,
  initial,
  procedimientoPcl,
}: AntecedentesFormProps) {
  const [antecedentesClinicos, setAntecedentesClinicos] = useState(
    initial.antecedentesClinicos,
  );
  const [condicionSalud, setCondicionSalud] = useState(
    initial.condicionSalud,
  );
  const [descripcionHallazgos, setDescripcionHallazgos] = useState(
    initial.descripcionHallazgos,
  );

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    if (saving) return;
    setSaving(true);
    setMessage(null);
    setError(null);

    try {
      const res = await fetch(`/api/dictamenes/${dictamenId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          antecedentesClinicos,
          condicionSalud,
          descripcionHallazgos,
          procedimientoPcl, // 👈 se envía A/B al backend
        }),
      });

      const data = await res.json();

      if (!res.ok || !data?.ok) {
        setError(
          data?.error ?? 'Error guardando antecedentes del dictamen',
        );
        return;
      }

      setMessage('Antecedentes guardados correctamente.');
    } catch (err) {
      console.error('Error guardando antecedentes:', err);
      setError('Error guardando antecedentes del dictamen.');
    } finally {
      setSaving(false);
      setTimeout(() => {
        setMessage(null);
        setError(null);
      }, 3000);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block mb-1 text-xs font-semibold text-slate-700">
          Antecedentes clínicos
        </label>
        <textarea
          value={antecedentesClinicos}
          onChange={(e) => setAntecedentesClinicos(e.target.value)}
          rows={4}
          className="w-full px-3 py-2 text-sm border rounded-md shadow-sm border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div>
        <label className="block mb-1 text-xs font-semibold text-slate-700">
          Condición de salud actual
        </label>
        <textarea
          value={condicionSalud}
          onChange={(e) => setCondicionSalud(e.target.value)}
          rows={4}
          className="w-full px-3 py-2 text-sm border rounded-md shadow-sm border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div>
        <label className="block mb-1 text-xs font-semibold text-slate-700">
          Descripción de hallazgos relevantes
        </label>
        <textarea
          value={descripcionHallazgos}
          onChange={(e) => setDescripcionHallazgos(e.target.value)}
          rows={5}
          className="w-full px-3 py-2 text-sm border rounded-md shadow-sm border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div className="flex items-center justify-between pt-2">
        <div className="text-xs">
          {message && (
            <span className="text-emerald-600">{message}</span>
          )}
          {error && <span className="text-red-600">{error}</span>}
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-60"
        >
          {saving ? 'Guardando…' : 'Guardar antecedentes'}
        </button>
      </div>
    </div>
  );
}

/* =====================
   Página principal
   ===================== */

export default function DictamenDetallePage({ params }: PageProps) {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const dictamenId = Number(id);

  const [dictamen, setDictamen] = useState<DictamenDetalle | null>(
    null,
  );
  const [procedimientoPcl, setProcedimientoPcl] = useState<'A' | 'B'>('A');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Tab actual
  type TabId = 'ANTECEDENTES' | 'EXAMEN' | 'DIAGNOSTICOS' | 'DEFICIENCIAS';
  const [tab, setTab] = useState<TabId>('ANTECEDENTES');

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
      <div className="px-6 py-6">
        <button
          type="button"
          onClick={() => router.push('/medico')}
          className="mb-4 text-xs text-blue-600 hover:underline"
        >
          ← Volver al listado
        </button>
        <div className="px-4 py-6 text-sm bg-white border rounded-xl text-slate-500">
          Cargando dictamen…
        </div>
      </div>
    );
  }

  if (error || !dictamen) {
    return (
      <div className="px-6 py-6">
        <button
          type="button"
          onClick={() => router.push('/medico')}
          className="mb-4 text-xs text-blue-600 hover:underline"
        >
          ← Volver al listado
        </button>
        <div className="px-4 py-6 text-sm text-red-600 bg-white border rounded-xl">
          {error ?? 'No se encontró el dictamen.'}
        </div>
      </div>
    );
  }

  const estadoInfo = estadoBadge(dictamen.estado);

  return (
    <div className="px-6 py-6 space-y-4">
      {/* Breadcrumb / volver */}
      <button
        type="button"
        onClick={() => router.push('/medico')}
        className="text-xs text-blue-600 hover:underline"
      >
        ← Volver al listado de dictámenes
      </button>

      {/* Cabecera de datos básicos */}
      <div className="flex flex-col gap-4 p-4 bg-white border shadow-sm rounded-xl md:flex-row md:items-center md:justify-between">
        <div className="space-y-1 text-sm">
          <div className="text-xs font-semibold tracking-wide uppercase text-slate-500">
            Docente
          </div>
          <div className="text-base font-semibold text-slate-900">
            {dictamen.docente.nombreCompleto}
          </div>
          <div className="text-xs text-slate-600">
            {dictamen.docente.tipoDocumento}{' '}
            {dictamen.docente.documento} ·{' '}
            {dictamen.docente.edad != null
              ? `${dictamen.docente.edad} años`
              : 'Edad no registrada'}
          </div>
          <div className="text-xs text-slate-600">
            {dictamen.docente.secretaria
              ? dictamen.docente.secretaria
              : 'Sin secretaría registrada'}
            {dictamen.docente.institucion
              ? ` · ${dictamen.docente.institucion}`
              : ''}
          </div>
        </div>

        <div className="flex flex-col items-start gap-2 text-xs md:items-end">
          <span
            className={`inline-flex items-center rounded-full px-3 py-1 text-[11px] font-medium ${estadoInfo.classes}`}
          >
            Estado: {estadoInfo.label}
          </span>
          <div className="text-slate-600">
            Fecha dictamen:{' '}
            <span className="font-medium">
              {formatFecha(dictamen.fechaDictamen)}
            </span>
          </div>
          <div className="text-slate-600">
            <span className="mr-2">Procedimiento:</span>
            <select
              value={procedimientoPcl}
              onChange={(e) =>
                setProcedimientoPcl(e.target.value as 'A' | 'B')
              }
              className="px-2 py-1 text-xs bg-white border rounded-md border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="A">Procedimiento A</option>
              <option value="B">Procedimiento B</option>
            </select>
          </div>
          <div className="text-slate-600">
            Médico:{' '}
            <span className="font-medium">
              {dictamen.medico?.nombreCompleto ?? '—'}
            </span>
          </div>
        </div>
      </div>

      {/* Contenedor con pestañas */}
      <div className="bg-white border shadow-sm rounded-xl">
        {/* Tabs */}
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
                className={`relative px-3 py-2 text-xs font-medium border-b-2 ${
                  active
                    ? 'border-blue-600 text-blue-700'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-200'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>

        {/* Contenido de la pestaña */}
        <div className="p-4 text-sm">
          {tab === 'ANTECEDENTES' && (
            <AntecedentesForm
              key={dictamen.id}
              dictamenId={dictamen.id}
              initial={{
                antecedentesClinicos:
                  dictamen.antecedentesClinicos ?? '',
                condicionSalud: dictamen.condicionSalud ?? '',
                descripcionHallazgos:
                  dictamen.descripcionHallazgos ?? '',
              }}
              procedimientoPcl={procedimientoPcl}
            />
          )}

          {tab !== 'ANTECEDENTES' && (
            <div className="text-xs text-slate-500">
              Esta pestaña la vamos construyendo después. Por ahora
              la única operativa es <strong>Antecedentes</strong>.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
