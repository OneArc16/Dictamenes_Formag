'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';

import Appnav from '@/components/AppNav';

import {
  DictamenExportButton,
  DictamenExportRow,
} from '@/components/DictamenExportButton';

import {
  DictamenFiltersBar,
  MedicoOption,
} from '@/components/dictamen/DictamenFiltersBar';

import { DictamenTable } from '@/components/dictamen/DictamenTable';
import { DictamenRow, EstadoDictamenFiltro } from '@/components/dictamen/types';

import ReabrirDictamenButton from '@/components/admisiones/dictamenes/ReabrirDictamenButton';

function formatFechaExport(value: any): string {
  if (!value) return '';
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  const str = String(value);
  return str.includes('T') ? str.split('T')[0] : str;
}

function isAbiertoFromEstadoLabel(estado: any) {
  const s = String(estado ?? '').toUpperCase();
  return s === 'PENDIENTE' || s === 'REABIERTO';
}

export default function AdmisionesPage() {
  const router = useRouter();

  // Filtros (igual que antes)
  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');
  const [documento, setDocumento] = useState('');
  const [estado, setEstado] = useState<EstadoDictamenFiltro[]>(['TODOS']);
  const [medicoIds, setMedicoIds] = useState<number[]>([]);

  // ✅ Médicos (React Query)
  const medicosQuery = useQuery({
    queryKey: ['medicos-options'],
    queryFn: async () => {
      const res = await fetch('/api/medicos/options', {
        method: 'GET',
        credentials: 'include',
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.ok) throw new Error(data?.error ?? 'Error cargando médicos');
      return (data.options ?? []) as MedicoOption[];
    },
    staleTime: 5 * 60 * 1000,
  });

  // ✅ Dictámenes (React Query) — clave depende de filtros
  const dictamenesQuery = useQuery({
    queryKey: [
      'dictamenes-admisiones',
      { medicoIds, estado, fechaDesde, fechaHasta, documento },
    ],
    queryFn: async () => {
      const params = new URLSearchParams();

      if (medicoIds.length > 0) params.set('medicos', medicoIds.join(','));
      if (estado.length > 0) params.set('estado', estado.join(','));
      if (documento) params.set('documento', documento);
      if (fechaDesde) params.set('fechaDesde', fechaDesde);
      if (fechaHasta) params.set('fechaHasta', fechaHasta);

      const res = await fetch(`/api/dictamenes/admisiones?${params.toString()}`, {
        method: 'GET',
        credentials: 'include',
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.ok) throw new Error(data?.error ?? 'Error consultando dictámenes');

      const mapped: DictamenRow[] = (data.rows ?? []).map((d: any) => ({
        id: d.id,
        fechaDictamen: d.fechaDictamen,
        docenteDocumento: d.docenteDocumento,
        docenteNombre: d.docenteNombre,
        secretaria: d.secretaria,
        estado: d.estado,
        medicoNombre: d.medicoNombre,
      }));

      return mapped;
    },
    placeholderData: (prev) => prev, // ✅ mantiene tabla mientras refetch
  });

  const rows = dictamenesQuery.data ?? [];
  const loading = dictamenesQuery.isFetching;

  const handleRegistrar = () => {
    router.push('/medico/dictamenes/nuevo');
  };

  const handleOpenDictamen = (id: number) => {
    router.push(`/admisiones/dictamenes/${id}`);
  };

  const exportRows: DictamenExportRow[] = useMemo(
    () =>
      rows.map((r) => ({
        fecha: formatFechaExport(r.fechaDictamen),
        secretaria: r.secretaria ?? '',
        documento: r.docenteDocumento ?? '',
        docente: r.docenteNombre ?? '',
        estado: r.estado ?? '',
        medico: r.medicoNombre ?? '',
      })),
    [rows]
  );

  return (
    <div className="flex flex-col min-h-screen bg-slate-100">
      <Appnav title="Módulo de Admisiones" />

      <main className="flex-1 w-full max-w-6xl px-4 py-4 mx-auto space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold text-slate-800">Dictámenes de docentes</h1>
            <p className="text-xs text-slate-500">
              Visualiza y gestiona los dictámenes de cualquier médico y cualquier estado.
            </p>
          </div>

          <DictamenExportButton rows={exportRows} filename="dictamenes_admisiones.csv" />
        </div>

        <DictamenFiltersBar
          fechaDesde={fechaDesde}
          fechaHasta={fechaHasta}
          onFechaDesdeChange={setFechaDesde}
          onFechaHastaChange={setFechaHasta}
          documento={documento}
          onDocumentoChange={setDocumento}
          estado={estado}
          onEstadoChange={setEstado}
          medicos={medicosQuery.data ?? []}
          medicoIds={medicoIds}
          onMedicoChange={setMedicoIds}
          showMedicoSelect={true}
          selectedMedicoIds={medicoIds}
          onMedicoIdsChange={setMedicoIds}
          onRegistrar={handleRegistrar}
        />

        <DictamenTable
          rows={rows}
          loading={loading}
          onOpenDictamen={handleOpenDictamen}
          renderActions={(r) => (
            <>
              <button
                type="button"
                onClick={() => handleOpenDictamen(r.id)}
                className="inline-flex items-center gap-1 rounded-full border border-blue-500/70 bg-blue-50 px-2.5 py-1 text-[11px] font-medium text-blue-700 hover:bg-blue-100 hover:border-blue-600 transition-colors"
              >
                Ver
              </button>

              <ReabrirDictamenButton
                dictamenId={r.id}
                estado={isAbiertoFromEstadoLabel((r as any).estado)}
              />
            </>
          )}
        />
      </main>
    </div>
  );
}
