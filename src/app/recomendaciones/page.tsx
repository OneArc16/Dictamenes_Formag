'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';

import {
  DictamenExportButton,
  type DictamenExportRow,
} from '@/components/DictamenExportButton';
import { RegistrarDocenteModal } from '@/components/RegistrarDocenteModal';
import ModuleSidebarShell from '@/components/module-shell/ModuleSidebarShell';
import {
  RecomendacionesFiltersBar,
  type RecomendacionMedicoOption,
} from '@/components/recomendaciones/RecomendacionesFiltersBar';
import { RecomendacionesTable } from '@/components/recomendaciones/RecomendacionesTable';
import {
  type EstadoRecomendacionFiltro,
  type RecomendacionRow,
} from '@/components/recomendaciones/types';

type RecomendacionApiRow = {
  id: number;
  fechaRecomendacion: string | null;
  docenteDocumento: string | null;
  docenteNombre: string | null;
  secretaria: string | null;
  estado: string | null;
  medicoNombre: string | null;
};

type MedicosOptionsResponse = {
  options: RecomendacionMedicoOption[];
  medicoIdActual: number | null;
};

function formatFechaExport(value: unknown): string {
  if (!value) return '';
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  const formatted = String(value);
  return formatted.includes('T') ? formatted.split('T')[0] : formatted;
}


export default function RecomendacionesPage() {
  const router = useRouter();

  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');
  const [documento, setDocumento] = useState('');
  const [estado, setEstado] = useState<EstadoRecomendacionFiltro>('PENDIENTES');
  const [medicoId, setMedicoId] = useState<number | null | undefined>(undefined);
  const [showRegistrarModal, setShowRegistrarModal] = useState(false);

  const medicosQuery = useQuery<MedicosOptionsResponse>({
    queryKey: ['medicos-options-recomendaciones'],
    queryFn: async () => {
      const response = await fetch('/api/medicos/options', {
        method: 'GET',
        credentials: 'include',
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data?.ok) {
        throw new Error(data?.error ?? 'Error cargando medicos');
      }

      return {
        options: (data.options ?? []) as RecomendacionMedicoOption[],
        medicoIdActual:
          typeof data.medicoIdActual === 'number' ? data.medicoIdActual : null,
      };
    },
    staleTime: 5 * 60 * 1000,
  });

  const defaultMedicoId = useMemo(() => {
    const payload = medicosQuery.data;
    if (!payload || payload.options.length === 0) return null;

    const hasCurrentDoctor = payload.options.some(
      (medico) => medico.id === payload.medicoIdActual,
    );

    if (hasCurrentDoctor && payload.medicoIdActual !== null) {
      return payload.medicoIdActual;
    }

    return payload.options[0].id;
  }, [medicosQuery.data]);

  const effectiveMedicoId = medicoId === undefined ? defaultMedicoId : medicoId;

  const recomendacionesQuery = useQuery<RecomendacionRow[]>({
    queryKey: [
      'recomendaciones-laborales',
      { medicoId: effectiveMedicoId, estado, fechaDesde, fechaHasta, documento },
    ],
    queryFn: async () => {
      const params = new URLSearchParams();

      if (effectiveMedicoId !== null) params.set('medicoId', String(effectiveMedicoId));
      if (estado) params.set('estado', estado);
      if (documento) params.set('documento', documento);
      if (fechaDesde) params.set('fechaDesde', fechaDesde);
      if (fechaHasta) params.set('fechaHasta', fechaHasta);

      const response = await fetch(`/api/recomendaciones?${params.toString()}`, {
        method: 'GET',
        credentials: 'include',
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data?.ok) {
        throw new Error(data?.error ?? 'Error consultando recomendaciones');
      }

      const apiRows = (data.rows ?? []) as RecomendacionApiRow[];
      return apiRows.map((row) => ({
        id: row.id,
        fechaRecomendacion: row.fechaRecomendacion,
        docenteDocumento: row.docenteDocumento,
        docenteNombre: row.docenteNombre,
        secretaria: row.secretaria,
        estado: row.estado,
        medicoNombre: row.medicoNombre,
      }));
    },
    placeholderData: (previous) => previous,
  });

  const rows = useMemo(() => recomendacionesQuery.data ?? [], [recomendacionesQuery.data]);

  const exportRows: DictamenExportRow[] = useMemo(
    () =>
      rows.map((row) => ({
        fecha: formatFechaExport(row.fechaRecomendacion),
        secretaria: row.secretaria ?? '',
        documento: row.docenteDocumento ?? '',
        docente: row.docenteNombre ?? '',
        estado: row.estado ?? '',
        medico: row.medicoNombre ?? '',
      })),
    [rows],
  );

  const handleOpenRecommendation = (id: number) => {
    router.push(`/recomendaciones/${id}`);
  };

  const handleDocenteSaved = async (usuarioId: number) => {
    try {
      await fetch('/api/recomendaciones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          usuarioId,
          empleadoId: effectiveMedicoId ?? null,
        }),
      });
    } catch (error) {
      console.error('Error asegurando borrador de recomendacion:', error);
    } finally {
      await recomendacionesQuery.refetch();
    }
  };

  return (
    <ModuleSidebarShell
      moduleKey="recomendaciones"
      title="Control de recomendaciones"
      description="Consulta recomendaciones, filtra por medico y registra docentes desde un flujo operativo uniforme."
      compactHero
      actions={
        <DictamenExportButton
          rows={exportRows}
          filename="recomendaciones_laborales.csv"
        />
      }
    >
      <RecomendacionesFiltersBar
        fechaDesde={fechaDesde}
        fechaHasta={fechaHasta}
        onFechaDesdeChange={setFechaDesde}
        onFechaHastaChange={setFechaHasta}
        documento={documento}
        onDocumentoChange={setDocumento}
        estado={estado}
        onEstadoChange={setEstado}
        medicos={medicosQuery.data?.options ?? []}
        medicoId={effectiveMedicoId ?? null}
        onMedicoChange={setMedicoId}
        onRegistrar={() => setShowRegistrarModal(true)}
      />

      <RecomendacionesTable
        rows={rows}
        loading={recomendacionesQuery.isFetching}
        onOpenRecommendation={handleOpenRecommendation}
      />

      <RegistrarDocenteModal
        open={showRegistrarModal}
        onClose={() => setShowRegistrarModal(false)}
        mode="RECOMENDACION"
        medicoResponsableId={effectiveMedicoId ?? null}
        onDocenteSaved={handleDocenteSaved}
      />
    </ModuleSidebarShell>
  );
}