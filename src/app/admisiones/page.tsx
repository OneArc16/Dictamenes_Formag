// app/admisiones/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import {
  DictamenExportButton,
  DictamenExportRow,
} from '@/components/DictamenExportButton';

import Appnav from '@/components/AppNav';

import {
  DictamenFiltersBar,
  MedicoOption,
} from '@/components/dictamen/DictamenFiltersBar';

import { DictamenTable } from '@/components/dictamen/DictamenTable';
import {
  DictamenRow,
  EstadoDictamenFiltro,
} from '@/components/dictamen/types';

// Fecha para exportar (simple: YYYY-MM-DD)
function formatFechaExport(value: any): string {
  if (!value) return '';
  if (value instanceof Date) {
    return value.toISOString().slice(0, 10);
  }
  const str = String(value);
  if (str.includes('T')) {
    return str.split('T')[0];
  }
  return str;
}

export default function AdmisionesPage() {
  const router = useRouter();

  // Filtros
  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');
  const [documento, setDocumento] = useState('');

  // 🔹 En admisiones: por defecto TODOS los estados
  const [estado, setEstado] = useState<EstadoDictamenFiltro[]>(['TODOS']);

  // Médicos (para el combo)
  const [medicos, setMedicos] = useState<MedicoOption[]>([]);
  // 🔹 En admisiones: por defecto NINGÚN médico seleccionado
  //     -> No se envía parámetro "medicos" y el backend devuelve TODOS.
  const [medicoIds, setMedicoIds] = useState<number[]>([]);

  // Datos
  const [rows, setRows] = useState<DictamenRow[]>([]);
  const [loading, setLoading] = useState(false);

  // 1) Cargar médicos desde el backend
  useEffect(() => {
    async function loadMedicos() {
      try {
        const res = await fetch('/api/medicos/options', {
          method: 'GET',
          credentials: 'include',
        });

        const data = await res.json();

        if (!res.ok || !data.ok) {
          console.error(data.error || 'Error cargando médicos');
          setMedicos([]);
          setMedicoIds([]);
          return;
        }

        const options: MedicoOption[] = data.options ?? [];
        setMedicos(options);

        // 🟢 Importante:
        // En admisiones NO seleccionamos ningún médico por defecto,
        // así el backend devuelve dictámenes de TODOS los médicos.
        setMedicoIds([]);
      } catch (err) {
        console.error('Error fetching medicos:', err);
        setMedicos([]);
        setMedicoIds([]);
      }
    }

    loadMedicos();
  }, []);

  // 2) Cargar dictámenes según filtros
  useEffect(() => {
    async function loadDictamenes() {
      setLoading(true);
      try {
        const params = new URLSearchParams();

        // Enviamos los médicos seleccionados solo si hay alguno
        if (medicoIds.length > 0) {
          params.set('medicos', medicoIds.join(','));
        }

        // Enviamos los estados seleccionados solo si hay alguno
        if (estado.length > 0) {
          params.set('estado', estado.join(','));
        }

        if (documento) params.set('documento', documento);
        if (fechaDesde) params.set('fechaDesde', fechaDesde);
        if (fechaHasta) params.set('fechaHasta', fechaHasta);

        const res = await fetch(
          `/api/dictamenes/admisiones?${params.toString()}`,
          {
            method: 'GET',
            credentials: 'include',
          }
        );

        const data = await res.json();

        if (!res.ok || !data.ok) {
          console.error(data.error || 'Error en la consulta');
          setRows([]);
          return;
        }

        const mapped: DictamenRow[] = (data.rows ?? []).map((d: any) => ({
          id: d.id,
          fechaDictamen: d.fechaDictamen,
          docenteDocumento: d.docenteDocumento,
          docenteNombre: d.docenteNombre,
          secretaria: d.secretaria,
          estado: d.estado,
          medicoNombre: d.medicoNombre,
        }));

        setRows(mapped);
      } catch (err) {
        console.error(err);
        setRows([]);
      } finally {
        setLoading(false);
      }
    }

    loadDictamenes();
  }, [medicoIds, estado, fechaDesde, fechaHasta, documento]);

  // 3) Acción del botón Registrar
  const handleRegistrar = () => {
    // Si quieres que el admisionista también pueda crear dictámenes:
    router.push('/medico/dictamenes/nuevo');
    // O puedes cambiarlo luego a una ruta propia de admisiones si lo prefieres.
  };

  // 4) Acción Ver
  const handleOpenDictamen = (id: number) => {
    router.push(`/medico/dictamenes/${id}`);
  };

  // 5) Filas para exportar (formato CSV)
  const exportRows: DictamenExportRow[] = rows.map(
    (r): DictamenExportRow => ({
      fecha: formatFechaExport(r.fechaDictamen),
      secretaria: r.secretaria ?? '',
      documento: r.docenteDocumento ?? '',
      docente: r.docenteNombre ?? '',
      estado: r.estado ?? '',
      medico: r.medicoNombre ?? '',
    })
  );

  return (
    <div className="flex flex-col min-h-screen bg-slate-100">
      {/* Barra de navegación principal */}
      <Appnav title="Módulo de Admisiones" />

      <main className="flex-1 w-full max-w-6xl px-4 py-4 mx-auto space-y-4">
        {/* Encabezado (calcado del médico, texto adaptado) */}
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold text-slate-800">
              Dictámenes de docentes
            </h1>
            <p className="text-xs text-slate-500">
              Visualiza y gestiona los dictámenes de cualquier médico y
              cualquier estado.
            </p>
          </div>

          {/* Botón de descargar listado */}
          <DictamenExportButton
            rows={exportRows}
            filename="dictamenes_admisiones.csv"
          />
        </div>

        {/* Barra de filtros reutilizable */}
        <DictamenFiltersBar
          fechaDesde={fechaDesde}
          fechaHasta={fechaHasta}
          onFechaDesdeChange={setFechaDesde}
          onFechaHastaChange={setFechaHasta}
          documento={documento}
          onDocumentoChange={setDocumento}
          estado={estado}
          onEstadoChange={setEstado}
          medicos={medicos}
          medicoIds={medicoIds}
          onMedicoChange={setMedicoIds}
          showMedicoSelect={true}
          selectedMedicoIds={medicoIds}
          onMedicoIdsChange={setMedicoIds}
          onRegistrar={handleRegistrar}
        />

        {/* Tabla de dictámenes (la misma del módulo médico) */}
        <DictamenTable
          rows={rows}
          loading={loading}
          onOpenDictamen={handleOpenDictamen}
        />
      </main>
    </div>
  );
}
