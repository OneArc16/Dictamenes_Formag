// app/medico/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { DictamenExportButton } from '@/components/DictamenExportButton';

import Appnav from '@/components/AppNav'; // 🔁 Ajusta la ruta si tu Appnav está en otro lugar

import {
  DictamenFiltersBar,
  MedicoOption,
} from '@/components/dictamen/DictamenFiltersBar';
import { DictamenTable } from '@/components/dictamen/DictamenTable';
import {
  DictamenRow,
  EstadoDictamenFiltro,
} from '@/components/dictamen/types';

export default function MedicoPage() {
  const router = useRouter();

  // Filtros
  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');
  const [documento, setDocumento] = useState('');
  const [estado, setEstado] = useState<EstadoDictamenFiltro>('PENDIENTES');

  // Médicos (para el combo; por ahora usamos un stub con el médico logueado)
  const [medicos, setMedicos] = useState<MedicoOption[]>([]);
  const [medicoId, setMedicoId] = useState<number | null>(null);

  // Datos
  const [rows, setRows] = useState<DictamenRow[]>([]);
  const [loading, setLoading] = useState(false);

  // 1) Cargar "médico actual" (stub)
  useEffect(() => {
    const medicoActual: MedicoOption = {
      id: 1,
      nombre: 'Médico actual',
    };

    setMedicos([medicoActual]);
    setMedicoId(medicoActual.id);
  }, []);

  // 2) Cargar dictámenes del médico logueado (según filtros)
  useEffect(() => {
    async function loadDictamenes() {
      setLoading(true);
      try {
        const params = new URLSearchParams();

        // El medicoId NO es necesario para el backend porque lo toma del JWT,
        // pero dejamos esto listo por si luego quieres que un admin vea otros médicos.
        // params.set('medicoId', String(medicoId));

        params.set('estado', estado);
        if (documento) params.set('documento', documento);
        if (fechaDesde) params.set('fechaDesde', fechaDesde);
        if (fechaHasta) params.set('fechaHasta', fechaHasta);

        const res = await fetch(`/api/dictamenes/medico?${params.toString()}`, {
          method: 'GET',
          credentials: 'include', // importante para enviar la cookie auth
        });

        const data = await res.json();

        if (!res.ok || !data.ok) {
          console.error(data.error || 'Error en la consulta');
          setRows([]);
          return;
        }

        const mapped: DictamenRow[] = (data.rows ?? []).map((d: any) => ({
          id: d.id,
          numeroDictamen: d.numeroDictamen,
          fechaDictamen: d.fechaDictamen,
          docenteTipoDocumento: d.docenteTipoDocumento,
          estado: d.estado, // 'PENDIENTE' | 'CERRADO'
          reabierto: d.reabierto,
          docenteDocumento: d.docenteDocumento,
          docenteNombre: d.docenteNombre,
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

    // Solo cargamos si hay médico (en teoría siempre debería haber uno por el JWT)
    if (medicoId !== null) {
      loadDictamenes();
    }
  }, [medicoId, estado, fechaDesde, fechaHasta, documento]);

  // 3) Acción del botón Registrar
  const handleRegistrar = () => {
    router.push('/medico/dictamenes/nuevo');
  };

  // 4) Acción Ver / Editar
  const handleOpenDictamen = (id: number) => {
    router.push(`/medico/dictamenes/${id}`);
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-100">
      {/* Barra de navegación principal */}
      <Appnav title="Módulo del Médico" />

      <main className="flex-1 w-full max-w-6xl px-4 py-4 mx-auto space-y-4">
        {/* Encabezado parecido al módulo de reportes */}
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold text-slate-800">
              Dictámenes del médico
            </h1>
            <p className="text-xs text-slate-500">
              Visualiza y gestiona los dictámenes pendientes, reabiertos y cerrados.
            </p>
          </div>

          {/* Botón de descargar listado */}
          <DictamenExportButton rows={rows} filename="dictamenes_medico.csv" />
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
          medicoId={medicoId}
          onMedicoChange={setMedicoId}
          showMedicoSelect={true}
          onRegistrar={handleRegistrar}
        />

        {/* Tabla reutilizable de dictámenes */}
        <DictamenTable
          rows={rows}
          loading={loading}
          onOpenDictamen={handleOpenDictamen}
        />
      </main>
    </div>
  );
}
