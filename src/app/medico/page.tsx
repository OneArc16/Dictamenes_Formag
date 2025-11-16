// app/medico/page.tsx
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

export default function MedicoPage() {
  const router = useRouter();

  // Filtros
  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');
  const [documento, setDocumento] = useState('');

  // AHORA: múltiples estados
  const [estado, setEstado] = useState<EstadoDictamenFiltro[]>(['PENDIENTES']);

  // Médicos (para el combo)
  const [medicos, setMedicos] = useState<MedicoOption[]>([]);
  // AHORA: múltiples médicos seleccionados
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

        if (data.medicoIdActual) {
          setMedicoIds([data.medicoIdActual]);
        } else if (options.length > 0) {
          setMedicoIds([options[0].id]);
        } else {
          setMedicoIds([]);
        }
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

        // Enviamos los médicos seleccionados si hay
        if (medicoIds.length > 0) {
          params.set('medicos', medicoIds.join(','));
        }

        // Enviamos los estados seleccionados si hay
        if (estado.length > 0) {
          params.set('estado', estado.join(','));
        }

        if (documento) params.set('documento', documento);
        if (fechaDesde) params.set('fechaDesde', fechaDesde);
        if (fechaHasta) params.set('fechaHasta', fechaHasta);

        const res = await fetch(`/api/dictamenes/medico?${params.toString()}`, {
          method: 'GET',
          credentials: 'include',
        });

        const data = await res.json();

        if (!res.ok || !data.ok) {
          console.error(data.error || 'Error en la consulta');
          setRows([]);
          return;
        }

        const mapped: DictamenRow[] = (data.rows ?? []).map((d: any) => ({
          id: d.id,
          fechaDictamen: d.fechaDictamen,
          docenteTipoDocumento: d.docenteTipoDocumento,
          docenteDocumento: d.docenteDocumento,
          docenteNombre: d.docenteNombre,
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

    // Siempre podemos llamar; si no hay medicos/estados, el backend aplica sus defaults
    loadDictamenes();
  }, [medicoIds, estado, fechaDesde, fechaHasta, documento]);

  // 3) Acción del botón Registrar
  const handleRegistrar = () => {
    router.push('/medico/dictamenes/nuevo');
  };

  // 4) Acción Ver
  const handleOpenDictamen = (id: number) => {
    router.push(`/medico/dictamenes/${id}`);
  };

  // 5) Filas para exportar (formato CSV)
  const exportRows: DictamenExportRow[] = rows.map(
    (r): DictamenExportRow => ({
      fecha: formatFechaExport(r.fechaDictamen),
      tipoDocumento: r.docenteTipoDocumento ?? '',
      documento: r.docenteDocumento ?? '',
      docente: r.docenteNombre ?? '',
      estado: r.estado ?? '',
      medico: r.medicoNombre ?? '',
    })
  );

  return (
    <div className="flex flex-col min-h-screen bg-slate-100">
      {/* Barra de navegación principal */}
      <Appnav title="Módulo del Médico" />

      <main className="flex-1 w-full max-w-6xl px-4 py-4 mx-auto space-y-4">
        {/* Encabezado */}
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold text-slate-800">
              Dictámenes del médico
            </h1>
            <p className="text-xs text-slate-500">
              Visualiza y gestiona los dictámenes pendientes, reabiertos y
              cerrados.
            </p>
          </div>

          {/* Botón de descargar listado */}
          <DictamenExportButton
            rows={exportRows}
            filename="dictamenes_medico.csv"
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
          onRegistrar={handleRegistrar}
        />

        {/* Tabla de dictámenes */}
        <DictamenTable
          rows={rows}
          loading={loading}
          onOpenDictamen={handleOpenDictamen}
        />
      </main>
    </div>
  );
}
