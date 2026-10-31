'use client';

import { useMemo, useState } from 'react';
import { keepPreviousData, useQuery } from '@tanstack/react-query';

import { DictamenExportButton, type DictamenExportRow } from '@/components/DictamenExportButton';
import ModulePageLayout from '@/components/module-shell/ModulePageLayout';
import type { EstadoAtencionFiltro } from '@/features/atenciones/application/atenciones-query';
import {
  AtencionesFiltersBar,
  type AtencionMedicoOption,
} from '@/features/atenciones/presentation/AtencionesFiltersBar';
import {
  AtencionesTable,
  formatAtencionFecha,
  formatAtencionHora,
  type AtencionRow,
} from '@/features/atenciones/presentation/AtencionesTable';
import { useAuthMe } from '@/hooks/useAuthMe';
import { useCan } from '@/hooks/useCan';

type MedicosOptionsResponse = {
  options: AtencionMedicoOption[];
  medicoIdActual: number | null;
};

// Los pacientes que recepción activa deben aparecerle al médico sin recargar la página.
const REFRESH_INTERVAL_MS = 30_000;

export default function AtencionesPage() {
  const { data: me } = useAuthMe();
  const { can: canAttendAppointments } = useCan('appointment.attend');

  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');
  const [documento, setDocumento] = useState('');
  const [estado, setEstado] = useState<EstadoAtencionFiltro>('ACTIVADAS');
  // undefined = médico por defecto, null = todos los médicos
  const [medicoId, setMedicoId] = useState<number | null | undefined>(undefined);

  const medicosQuery = useQuery<MedicosOptionsResponse>({
    queryKey: ['medicos-options-atenciones'],
    queryFn: async () => {
      const response = await fetch('/api/medicos/options', { credentials: 'include' });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data?.ok) {
        throw new Error(data?.error ?? 'Error cargando medicos');
      }
      return {
        options: (data.options ?? []) as AtencionMedicoOption[],
        medicoIdActual: typeof data.medicoIdActual === 'number' ? data.medicoIdActual : null,
      };
    },
    staleTime: 5 * 60 * 1000,
  });

  // El médico ve primero sus propias atenciones; los demás perfiles, las de todos.
  const defaultMedicoId = useMemo(() => {
    const payload = medicosQuery.data;
    if (!payload || me?.role !== 'MEDICO') return null;
    return payload.options.some((medico) => medico.id === payload.medicoIdActual)
      ? payload.medicoIdActual
      : null;
  }, [medicosQuery.data, me?.role]);

  const effectiveMedicoId = medicoId === undefined ? defaultMedicoId : medicoId;
  const documentoFiltro = documento.trim();

  const atencionesQuery = useQuery<AtencionRow[]>({
    queryKey: [
      'atenciones',
      { medicoId: effectiveMedicoId, estado, fechaDesde, fechaHasta, documento: documentoFiltro },
    ],
    // Espera a conocer el médico por defecto para no consultar primero las de todos.
    enabled: Boolean(me) && (me?.role !== 'MEDICO' || medicosQuery.isFetched),
    queryFn: async () => {
      const params = new URLSearchParams({ estado });
      if (effectiveMedicoId !== null) params.set('medicoId', String(effectiveMedicoId));
      if (documentoFiltro) params.set('documento', documentoFiltro);
      if (fechaDesde) params.set('fechaDesde', fechaDesde);
      if (fechaHasta) params.set('fechaHasta', fechaHasta);

      const response = await fetch(`/api/atenciones?${params.toString()}`, { credentials: 'include' });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data?.ok) {
        throw new Error(data?.error ?? 'Error consultando atenciones');
      }
      return (data.rows ?? []) as AtencionRow[];
    },
    placeholderData: keepPreviousData,
    refetchInterval: REFRESH_INTERVAL_MS,
    staleTime: 0,
  });

  const rows = useMemo(() => atencionesQuery.data ?? [], [atencionesQuery.data]);

  // El médico solo atiende a sus pacientes; el servidor aplica la misma regla.
  const canAttend = (row: AtencionRow) =>
    canAttendAppointments && (me?.role !== 'MEDICO' || String(row.medicoId) === me.id);

  const exportRows: DictamenExportRow[] = useMemo(
    () =>
      rows.map((row) => ({
        fecha: `${formatAtencionFecha(row.inicioProgramado)} ${formatAtencionHora(row.inicioProgramado)}`,
        secretaria: row.secretaria ?? '',
        documento: row.docenteDocumento,
        docente: row.docenteNombre,
        estado: row.estado === 'ATENDIDA' ? 'Atendido' : 'Activado',
        medico: row.medicoNombre,
      })),
    [rows],
  );

  return (
    <ModulePageLayout
      moduleKey="medicina-laboral"
      title="Atenciones"
      description="Consulta los pacientes activados por recepción para atención y los que ya fueron atendidos."
      compactHero
      actions={<DictamenExportButton rows={exportRows} filename="atenciones.csv" />}
    >
      <AtencionesFiltersBar
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
      />

      <AtencionesTable
        rows={rows}
        loading={atencionesQuery.isLoading}
        errorMessage={atencionesQuery.isError ? atencionesQuery.error.message : undefined}
        canAttend={canAttend}
      />
    </ModulePageLayout>
  );
}
