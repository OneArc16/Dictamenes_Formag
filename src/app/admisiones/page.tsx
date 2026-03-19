'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';

import { DictamenExportButton, type DictamenExportRow } from '@/components/DictamenExportButton';
import AdmisionesBanner from '@/components/admisiones/AdmisionesBanner';
import ImprimirDictamenButton from '@/components/admisiones/dictamenes/ImprimirDictamenButton';
import ReabrirDictamenButton from '@/components/admisiones/dictamenes/ReabrirDictamenButton';
import { DictamenFiltersBar, type MedicoOption } from '@/components/dictamen/DictamenFiltersBar';
import { DictamenTable } from '@/components/dictamen/DictamenTable';
import { type DictamenRow, type EstadoDictamenFiltro } from '@/components/dictamen/types';
import ModuleSidebarShell from '@/components/module-shell/ModuleSidebarShell';

type DictamenApiRow = {
  id: number;
  fechaDictamen: string | null;
  docenteDocumento: string | null;
  docenteNombre: string | null;
  secretaria: string | null;
  estado: string | null;
  medicoNombre: string | null;
};

function formatFechaExport(value: unknown): string {
  if (!value) return '';
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  const formatted = String(value);
  return formatted.includes('T') ? formatted.split('T')[0] : formatted;
}


export default function AdmisionesPage() {
  const router = useRouter();

  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');
  const [documento, setDocumento] = useState('');
  const [estado, setEstado] = useState<EstadoDictamenFiltro[]>(['TODOS']);
  const [medicoIds, setMedicoIds] = useState<number[]>([]);

  const medicosQuery = useQuery({
    queryKey: ['medicos-options'],
    queryFn: async () => {
      const res = await fetch('/api/medicos/options', {
        method: 'GET',
        credentials: 'include',
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.ok) {
        throw new Error(data?.error ?? 'Error cargando medicos');
      }
      return (data.options ?? []) as MedicoOption[];
    },
    staleTime: 5 * 60 * 1000,
  });

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
      if (!res.ok || !data?.ok) {
        throw new Error(data?.error ?? 'Error consultando dictamenes');
      }

      const apiRows = (data.rows ?? []) as DictamenApiRow[];
      return apiRows.map((dictamen) => ({
        id: dictamen.id,
        fechaDictamen: dictamen.fechaDictamen,
        docenteDocumento: dictamen.docenteDocumento,
        docenteNombre: dictamen.docenteNombre,
        secretaria: dictamen.secretaria,
        estado: dictamen.estado,
        medicoNombre: dictamen.medicoNombre,
      })) as DictamenRow[];
    },
    placeholderData: (previous) => previous,
  });

  const rows = useMemo(
    () => dictamenesQuery.data ?? [],
    [dictamenesQuery.data],
  );
  const loading = dictamenesQuery.isFetching;

  const exportRows: DictamenExportRow[] = useMemo(
    () =>
      rows.map((row) => ({
        fecha: formatFechaExport(row.fechaDictamen),
        secretaria: row.secretaria ?? '',
        documento: row.docenteDocumento ?? '',
        docente: row.docenteNombre ?? '',
        estado: row.estado ?? '',
        medico: row.medicoNombre ?? '',
      })),
    [rows],
  );


  const handleRegistrar = () => {
    router.push('/medico/dictamenes/nuevo');
  };

  const handleOpenDictamen = (id: number) => {
    router.push(`/admisiones/dictamenes/${id}`);
  };

  return (
    <ModuleSidebarShell
      moduleKey="admisiones"
      title="Control de dictamenes en admisiones"
      description="Consulta transversal de docentes, filtros por medico y acceso operativo para impresion o reapertura cuando aplique."
      compactHero
      actions={
        <DictamenExportButton
          rows={exportRows}
          filename="dictamenes_admisiones.csv"
        />
      }
    >
      <AdmisionesBanner />

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
        onRegistrar={handleRegistrar}
      />

      <DictamenTable
        rows={rows}
        loading={loading}
        onOpenDictamen={handleOpenDictamen}
        renderActions={(row) => {
          const estadoLabel = String(row.estado ?? '').toUpperCase();
          const isCerrado = estadoLabel === 'CERRADO';

          return (
            <div className="flex items-center gap-2">
              <ImprimirDictamenButton
                dictamenId={row.id}
                isCerrado={isCerrado}
              />
              {isCerrado ? (
                <ReabrirDictamenButton dictamenId={row.id} />
              ) : null}
            </div>
          );
        }}
      />
    </ModuleSidebarShell>
  );
}