'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';

import { DictamenExportButton, type DictamenExportRow } from '@/components/DictamenExportButton';
import { DictamenFiltersBar, type MedicoOption } from '@/components/dictamen/DictamenFiltersBar';
import { DictamenTable } from '@/components/dictamen/DictamenTable';
import { type DictamenRow, type EstadoDictamenFiltro } from '@/components/dictamen/types';
import { RegistrarDocenteModal } from '@/components/RegistrarDocenteModal';
import ReadOnlyBanner from '@/components/medico/ReadOnlyBanner';
import { useMedicoAccess } from '@/components/medico/MedicoAccessProvider';
import { useCan } from '@/hooks/useCan';
import ModulePageLayout from '@/components/module-shell/ModulePageLayout';
import { ReabrirDocumentoDialog } from '@/components/reapertura/ReabrirDocumentoDialog';

type DictamenApiRow = {
  id: number;
  fechaDictamen: string | null;
  docenteDocumento: string | null;
  docenteNombre: string | null;
  secretaria: string | null;
  tipoDictamen: 'CALIFICACION' | 'RECALIFICACION' | string | null;
  estado: string | null;
  medicoNombre: string | null;
  fueReabierto: boolean;
  reabiertaEn: string | null;
  reabiertaPorNombre: string | null;
  motivoReapertura: string | null;
  etapa: string;
  actionRoute: string;
  pclRoute: string;
  originRoute: string | null;
  canOpenPcl: boolean;
  pclBloqueado: boolean;
  canReopen: boolean;
};

const FILTROS_STORAGE_KEY = 'medico.dictamenes.filtros';

type FiltrosGuardados = {
  fechaDesde: string;
  fechaHasta: string;
  documento: string;
  estado: EstadoDictamenFiltro[];
  medicoIds: number[];
};

// Lee los filtros guardados al salir de la página (sessionStorage: duran lo que dure la pestaña).
function leerFiltrosGuardados(): Partial<FiltrosGuardados> | null {
  try {
    const raw = sessionStorage.getItem(FILTROS_STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as Partial<FiltrosGuardados>;
    return {
      fechaDesde: typeof data.fechaDesde === 'string' ? data.fechaDesde : undefined,
      fechaHasta: typeof data.fechaHasta === 'string' ? data.fechaHasta : undefined,
      documento: typeof data.documento === 'string' ? data.documento : undefined,
      estado: Array.isArray(data.estado) ? data.estado : undefined,
      medicoIds: Array.isArray(data.medicoIds) ? data.medicoIds.filter((id) => Number.isFinite(id)) : undefined,
    };
  } catch {
    return null;
  }
}

function formatFechaExport(value: unknown): string {
  if (!value) return '';
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  const formatted = String(value);
  return formatted.includes('T') ? formatted.split('T')[0] : formatted;
}

function formatTipoDictamen(value: string | null | undefined): string {
  if (value === 'RECALIFICACION') return 'Recalificación';
  if (value === 'CALIFICACION') return 'Primera vez';
  return '';
}

export default function MedicoPage() {
  const router = useRouter();
  const { readOnly } = useMedicoAccess();
  const { can: canCreateDictamen } = useCan('dictamen.create');
  const { can: canExportDictamen } = useCan('dictamen.export');

  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');
  const [documento, setDocumento] = useState('');
  const [estado, setEstado] = useState<EstadoDictamenFiltro[]>(['PENDIENTES']);
  const [medicos, setMedicos] = useState<MedicoOption[]>([]);
  const [medicoIds, setMedicoIds] = useState<number[]>([]);
  const [showRegistrarModal, setShowRegistrarModal] = useState(false);
  // Los filtros guardados se restauran tras montar (en el servidor no hay sessionStorage).
  const [filtrosListos, setFiltrosListos] = useState(false);

  useEffect(() => {
    const guardados = leerFiltrosGuardados();
    /* eslint-disable react-hooks/set-state-in-effect */
    if (guardados) {
      if (guardados.fechaDesde !== undefined) setFechaDesde(guardados.fechaDesde);
      if (guardados.fechaHasta !== undefined) setFechaHasta(guardados.fechaHasta);
      if (guardados.documento !== undefined) setDocumento(guardados.documento);
      if (guardados.estado !== undefined) setEstado(guardados.estado);
      if (guardados.medicoIds !== undefined) setMedicoIds(guardados.medicoIds);
    }
    setFiltrosListos(true);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  useEffect(() => {
    if (!filtrosListos) return;
    try {
      sessionStorage.setItem(
        FILTROS_STORAGE_KEY,
        JSON.stringify({ fechaDesde, fechaHasta, documento, estado, medicoIds } satisfies FiltrosGuardados),
      );
    } catch {
      // Sin almacenamiento disponible: los filtros simplemente no persisten.
    }
  }, [filtrosListos, fechaDesde, fechaHasta, documento, estado, medicoIds]);

  useEffect(() => {
    if (!filtrosListos) return;

    async function loadMedicos() {
      try {
        const response = await fetch('/api/medicos/options', {
          method: 'GET',
          credentials: 'include',
        });

        const data = await response.json();
        if (!response.ok || !data.ok) {
          console.error(data.error || 'Error cargando medicos');
          setMedicos([]);
          setMedicoIds([]);
          return;
        }

        const options: MedicoOption[] = data.options ?? [];
        setMedicos(options);

        // Solo se asigna el médico por defecto si no había uno restaurado.
        setMedicoIds((actuales) => {
          if (actuales.length > 0) return actuales;
          if (data.medicoIdActual) return [data.medicoIdActual];
          return options.length > 0 ? [options[0].id] : actuales;
        });
      } catch (error) {
        console.error('Error fetching medicos:', error);
        setMedicos([]);
        setMedicoIds([]);
      }
    }

    void loadMedicos();
  }, [filtrosListos]);

  const {
    data: dictamenRows = [],
    isLoading: loadingDictamenes,
    refetch: refetchDictamenes,
  } = useQuery<DictamenRow[]>({
    queryKey: ['dictamenes-medico', { medicoIds, estado, fechaDesde, fechaHasta, documento }],
    enabled: medicoIds.length > 0,
    // La etapa cambia dentro del expediente (p. ej. al finalizar Origen); al volver debe reflejarse.
    staleTime: 0,
    refetchOnMount: 'always',
    queryFn: async () => {
      const params = new URLSearchParams();

      if (medicoIds.length > 0) params.set('medicoIds', medicoIds.join(','));
      if (estado.length > 0) params.set('estado', estado.join(','));
      if (documento) params.set('documento', documento);
      if (fechaDesde) params.set('fechaDesde', fechaDesde);
      if (fechaHasta) params.set('fechaHasta', fechaHasta);

      const response = await fetch(`/api/dictamenes/medico?${params.toString()}`, {
        method: 'GET',
        credentials: 'include',
      });

      const data = await response.json();
      if (!response.ok || !data.ok) {
        console.error(data.error || 'Error en la consulta');
        throw new Error(data.error || 'Error en la consulta');
      }

      const apiRows = (data.rows ?? []) as DictamenApiRow[];
      return apiRows.map((dictamen) => ({
        id: dictamen.id,
        fechaDictamen: dictamen.fechaDictamen,
        docenteDocumento: dictamen.docenteDocumento,
        docenteNombre: dictamen.docenteNombre,
        secretaria: dictamen.secretaria,
        tipoDictamen: dictamen.tipoDictamen,
        estado: dictamen.estado ?? undefined,
        medicoNombre: dictamen.medicoNombre,
        fueReabierto: dictamen.fueReabierto,
        reabiertaEn: dictamen.reabiertaEn,
        reabiertaPorNombre: dictamen.reabiertaPorNombre,
        motivoReapertura: dictamen.motivoReapertura,
        etapa: dictamen.etapa,
        actionRoute: dictamen.actionRoute,
        pclRoute: dictamen.pclRoute,
        originRoute: dictamen.originRoute,
        canOpenPcl: dictamen.canOpenPcl,
        pclBloqueado: dictamen.pclBloqueado,
        canReopen: dictamen.canReopen,
      }));
    },
  });

  const rows = dictamenRows;
  const loading = loadingDictamenes;

  const exportRows: DictamenExportRow[] = useMemo(
    () =>
      rows.map((row) => ({
        fecha: formatFechaExport(row.fechaDictamen),
        secretaria: row.secretaria ?? '',
        documento: row.docenteDocumento ?? '',
        docente: row.docenteNombre ?? '',
        tipoDictamen: formatTipoDictamen(row.tipoDictamen),
        estado: row.estado ?? '',
        medico: row.medicoNombre ?? '',
      })),
    [rows],
  );

  const handleOpenDictamen = (id: number, route?: string) => {
    if (route) {
      router.push(route);
      return;
    }
    const row = rows.find((item) => item.id === id);
    router.push(row?.actionRoute || `/medico/dictamen/${id}`);
  };

  const handleDictamenCreated = () => {
    void refetchDictamenes();
  };

  return (
    <ModulePageLayout
      moduleKey="medicina-laboral"
      title="Dictámenes del médico"
      description="Consulta tus dictámenes pendientes, reabiertos y cerrados, y accede a su información clínica."
      compactHero
      actions={
        canExportDictamen ? (
          <DictamenExportButton rows={exportRows} filename="dictamenes_medico.csv" />
        ) : undefined
      }
    >
      <ReadOnlyBanner />

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
        onRegistrar={
          readOnly || !canCreateDictamen ? undefined : () => setShowRegistrarModal(true)
        }
      />

      <DictamenTable
        rows={rows}
        loading={loading}
        onOpenDictamen={handleOpenDictamen}
        renderActions={(row) =>
          row.canReopen ? (
            <ReabrirDocumentoDialog
              dictamenId={row.id}
              onSuccess={(route) => {
                void refetchDictamenes();
                router.push(route);
              }}
            />
          ) : null
        }
      />

      <RegistrarDocenteModal
        open={showRegistrarModal}
        onClose={() => setShowRegistrarModal(false)}
        onDictamenCreated={handleDictamenCreated}
      />
    </ModulePageLayout>
  );
}
