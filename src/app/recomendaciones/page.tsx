'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { RotateCcw } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

import {
  DictamenExportButton,
  type DictamenExportRow,
} from '@/components/DictamenExportButton';
import { RegistrarDocenteModal } from '@/components/RegistrarDocenteModal';
import ModulePageLayout from '@/components/module-shell/ModulePageLayout';
import { ReabrirRecomendacionDialog } from '@/components/recomendaciones/ReabrirRecomendacionDialog';
import {
  RecomendacionesFiltersBar,
  type RecomendacionMedicoOption,
} from '@/components/recomendaciones/RecomendacionesFiltersBar';
import { RecomendacionesTable } from '@/components/recomendaciones/RecomendacionesTable';
import {
  type EstadoRecomendacionFiltro,
  type RecomendacionRow,
} from '@/components/recomendaciones/types';
import { type RecomendacionMotivoReaperturaOption } from '@/components/recomendaciones/detail/types';
import { useAuthMe } from '@/hooks/useAuthMe';
import { useCan } from '@/hooks/useCan';

type RecomendacionApiRow = {
  id: number;
  fechaRecomendacion: string | null;
  docenteDocumento: string | null;
  docenteNombre: string | null;
  secretaria: string | null;
  estado: string | null;
  medicoNombre: string | null;
  fueReabierta: boolean;
  reabiertaEn: string | null;
  reabiertaPorNombre: string | null;
  motivoReapertura: string | null;
};

type MedicosOptionsResponse = {
  options: RecomendacionMedicoOption[];
  medicoIdActual: number | null;
};

type MotivosReaperturaResponse = {
  options: RecomendacionMotivoReaperturaOption[];
};

function formatFechaExport(value: unknown): string {
  if (!value) return '';
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  const formatted = String(value);
  return formatted.includes('T') ? formatted.split('T')[0] : formatted;
}

export default function RecomendacionesPage() {
  const router = useRouter();
  const { data: me } = useAuthMe();
  const { can: canRegister } = useCan('recomendacion.create');
  const { can: canUseReopenAction } = useCan('recomendacion.reopen');
  const { can: canExport } = useCan('recomendacion.export');

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

  const motivosReaperturaQuery = useQuery<MotivosReaperturaResponse>({
    queryKey: ['motivos-reapertura-recomendaciones'],
    enabled: Boolean(me) && canUseReopenAction,
    queryFn: async () => {
      const response = await fetch('/api/motivos-reapertura', {
        method: 'GET',
        credentials: 'include',
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data?.ok) {
        throw new Error(data?.error ?? 'Error cargando motivos de reapertura');
      }

      return {
        options: (data.options ?? []) as RecomendacionMotivoReaperturaOption[],
      };
    },
    staleTime: 5 * 60 * 1000,
  });

  const defaultMedicoId = useMemo(() => {
    const payload = medicosQuery.data;
    if (!payload || payload.options.length === 0) return null;
    if (me?.role !== 'MEDICO') return null;

    const hasCurrentDoctor = payload.options.some(
      (medico) => medico.id === payload.medicoIdActual,
    );

    if (hasCurrentDoctor && payload.medicoIdActual !== null) {
      return payload.medicoIdActual;
    }

    return payload.options[0].id;
  }, [medicosQuery.data, me?.role]);

  const effectiveMedicoId = medicoId === undefined ? defaultMedicoId : medicoId;
  const motivosReapertura = motivosReaperturaQuery.data?.options ?? [];

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
        estado: row.estado ?? undefined,
        medicoNombre: row.medicoNombre,
        fueReabierta: row.fueReabierta,
        reabiertaEn: row.reabiertaEn,
        reabiertaPorNombre: row.reabiertaPorNombre,
        motivoReapertura: row.motivoReapertura,
      }));
    },
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
    <ModulePageLayout
      moduleKey="medicina-laboral"
      title="Recomendaciones laborales"
      description="Consulta recomendaciones laborales, filtra por médico y registra docentes desde un flujo operativo uniforme."
      compactHero
      actions={
        canExport ? (
          <DictamenExportButton
            rows={exportRows}
            filename="recomendaciones_laborales.csv"
          />
        ) : undefined
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
        onRegistrar={canRegister ? () => setShowRegistrarModal(true) : undefined}
      />

      <RecomendacionesTable
        rows={rows}
        loading={recomendacionesQuery.isFetching}
        onOpenRecommendation={handleOpenRecommendation}
        renderActions={(row) => {
          if (
            !canUseReopenAction ||
            row.estado !== 'CERRADA' ||
            motivosReapertura.length === 0
          ) {
            return null;
          }

          return (
            <ReabrirRecomendacionDialog
              recomendacionId={row.id}
              motivosReapertura={motivosReapertura}
              disabled={motivosReaperturaQuery.isLoading || recomendacionesQuery.isFetching}
              triggerLabel="Reabrir recomendacion"
              triggerTitle="Reabrir recomendacion"
              triggerVariant="outline"
              triggerSize="icon"
              triggerClassName="h-8 w-8 rounded-full border-sky-200 text-sky-700 hover:bg-sky-50 hover:text-sky-800"
              icon={RotateCcw}
              iconOnly
              onReopened={() => {
                void recomendacionesQuery.refetch();
              }}
            />
          );
        }}
      />

      {canRegister ? (
        <RegistrarDocenteModal
          open={showRegistrarModal}
          onClose={() => setShowRegistrarModal(false)}
          mode="RECOMENDACION"
          medicoResponsableId={effectiveMedicoId ?? null}
          onDocenteSaved={handleDocenteSaved}
        />
      ) : null}
    </ModulePageLayout>
  );
}
