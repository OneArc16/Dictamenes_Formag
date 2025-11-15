// app/medico/dictamenes/nuevo/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Appnav from '@/components/AppNav';
import toast from 'react-hot-toast';

interface Docente {
  id: number;
  identificacion: string;
  tipoIdentificacion: string;
  nombre: string;
  edad?: number | null;
  sexo?: string | null;
  eps?: string | null;
}

export default function NuevoDictamenPage() {
  const router = useRouter();

  // búsqueda docente
  const [docQuery, setDocQuery] = useState('');
  const [docente, setDocente] = useState<Docente | null>(null);
  const [searchingDoc, setSearchingDoc] = useState(false);

  // campos dictamen
  const [fechaDictamen, setFechaDictamen] = useState('');
  const [procedimientoPcl, setProcedimientoPcl] = useState<'A' | 'B' | ''>('');
  const [antecedentes, setAntecedentes] = useState('');
  const [condicionSalud, setCondicionSalud] = useState('');
  const [hallazgos, setHallazgos] = useState('');

  const [saving, setSaving] = useState(false);

  // fecha por defecto: hoy
  useEffect(() => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    setFechaDictamen(`${yyyy}-${mm}-${dd}`);
  }, []);

  async function handleBuscarDocente() {
    if (!docQuery.trim()) {
      toast.error('Escribe un documento o nombre para buscar');
      return;
    }

    setSearchingDoc(true);
    setDocente(null);

    try {
      const res = await fetch(
        `/api/docentes/search?q=${encodeURIComponent(docQuery.trim())}`,
        { method: 'GET', credentials: 'include' }
      );
      const data = await res.json();

      if (!res.ok || !data.ok) {
        toast.error(data.error || 'Error buscando docente');
        return;
      }

      if (!data.rows || data.rows.length === 0) {
        toast.error('No se encontraron docentes con ese criterio');
        return;
      }

      const d = data.rows[0] as Docente; // por ahora tomamos el primero
      setDocente(d);
      toast.success('Docente seleccionado');
    } catch (err) {
      console.error(err);
      toast.error('Error buscando docente');
    } finally {
      setSearchingDoc(false);
    }
  }

  async function handleGuardar() {
    if (!docente) {
      toast.error('Debes seleccionar un docente');
      return;
    }
    if (!procedimientoPcl) {
      toast.error('Selecciona el procedimiento (A o B)');
      return;
    }
    if (!fechaDictamen) {
      toast.error('Selecciona la fecha del dictamen');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch('/api/dictamenes/medico', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          usuarioId: docente.id,
          fechaDictamen,
          procedimientoPcl,
          antecedentesClinicos: antecedentes || undefined,
          condicionSalud: condicionSalud || undefined,
          descripcionHallazgos: hallazgos || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.ok) {
        toast.error(data.error || 'No se pudo crear el dictamen');
        return;
      }

      toast.success('Dictamen creado correctamente');
      // Por ahora volvemos al listado del médico
      router.push('/medico');
    } catch (err) {
      console.error(err);
      toast.error('Error al guardar el dictamen');
    } finally {
      setSaving(false);
    }
  }

  function handleCancelar() {
    router.back();
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-100">
      <Appnav title="Nuevo dictamen" />

      <main className="flex-1 w-full max-w-5xl px-4 py-4 mx-auto space-y-4">
        <div>
          <h1 className="text-xl font-semibold text-slate-800">
            Registrar dictamen
          </h1>
          <p className="text-xs text-slate-500">
            Selecciona el docente y registra la información básica del dictamen.
          </p>
        </div>

        {/* 1. Selección de docente */}
        <section className="p-4 space-y-3 bg-white border rounded-md shadow-sm">
          <h2 className="text-sm font-semibold text-slate-700">
            1. Docente
          </h2>

          <div className="flex flex-wrap items-end gap-3">
            <div className="flex flex-col">
              <label className="text-xs font-medium text-slate-600">
                Documento / nombre
              </label>
              <input
                type="text"
                value={docQuery}
                placeholder="Ej: 26802360 o ALEXIS"
                onChange={(e) => setDocQuery(e.target.value)}
                className="border rounded px-2 py-1 text-sm min-w-[220px]"
              />
            </div>

            <button
              type="button"
              onClick={handleBuscarDocente}
              disabled={searchingDoc}
              className="text-sm px-3 py-1.5 rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
            >
              {searchingDoc ? 'Buscando...' : 'Buscar docente'}
            </button>
          </div>

          {docente && (
            <div className="px-3 py-2 mt-3 text-xs border rounded-md bg-slate-50 text-slate-700">
              <div className="flex flex-wrap justify-between gap-2">
                <div>
                  <span className="font-semibold">Docente: </span>
                  {docente.nombre}
                </div>
                <div>
                  <span className="font-semibold">Documento: </span>
                  {docente.tipoIdentificacion} {docente.identificacion}
                </div>
                {docente.edad != null && (
                  <div>
                    <span className="font-semibold">Edad: </span>
                    {docente.edad} años
                  </div>
                )}
                {docente.sexo && (
                  <div>
                    <span className="font-semibold">Sexo: </span>
                    {docente.sexo}
                  </div>
                )}
                {docente.eps && (
                  <div>
                    <span className="font-semibold">EPS: </span>
                    {docente.eps}
                  </div>
                )}
              </div>
            </div>
          )}
        </section>

        {/* 2. Datos básicos del dictamen */}
        <section className="p-4 space-y-3 bg-white border rounded-md shadow-sm">
          <h2 className="text-sm font-semibold text-slate-700">
            2. Información del dictamen
          </h2>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="flex flex-col">
              <label className="text-xs font-medium text-slate-600">
                Fecha del dictamen
              </label>
              <input
                type="date"
                value={fechaDictamen}
                onChange={(e) => setFechaDictamen(e.target.value)}
                className="px-2 py-1 text-sm border rounded"
              />
            </div>

            <div className="flex flex-col">
              <label className="text-xs font-medium text-slate-600">
                Procedimiento PCL
              </label>
              <select
                value={procedimientoPcl}
                onChange={(e) =>
                  setProcedimientoPcl(e.target.value as 'A' | 'B' | '')
                }
                className="px-2 py-1 text-sm border rounded"
              >
                <option value="">Seleccione...</option>
                <option value="A">Procedimiento A</option>
                <option value="B">Procedimiento B</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 mt-2 sm:grid-cols-2">
            <div className="flex flex-col">
              <label className="text-xs font-medium text-slate-600">
                Antecedentes clínicos
              </label>
              <textarea
                value={antecedentes}
                onChange={(e) => setAntecedentes(e.target.value)}
                rows={3}
                className="px-2 py-1 text-sm border rounded resize-y"
              />
            </div>

            <div className="flex flex-col">
              <label className="text-xs font-medium text-slate-600">
                Condición de salud actual
              </label>
              <textarea
                value={condicionSalud}
                onChange={(e) => setCondicionSalud(e.target.value)}
                rows={3}
                className="px-2 py-1 text-sm border rounded resize-y"
              />
            </div>
          </div>

          <div className="flex flex-col mt-2">
            <label className="text-xs font-medium text-slate-600">
              Descripción de hallazgos
            </label>
            <textarea
              value={hallazgos}
              onChange={(e) => setHallazgos(e.target.value)}
              rows={3}
              className="px-2 py-1 text-sm border rounded resize-y"
            />
          </div>
        </section>

        {/* Botones */}
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={handleCancelar}
            className="px-4 py-2 text-sm bg-white border rounded-md hover:bg-slate-100"
            disabled={saving}
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleGuardar}
            disabled={saving}
            className="px-4 py-2 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-60"
          >
            {saving ? 'Guardando...' : 'Guardar dictamen'}
          </button>
        </div>
      </main>
    </div>
  );
}
