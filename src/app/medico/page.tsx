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


export default function MedicoPage() {
  const router = useRouter();
  const { readOnly } = useMedicoAccess();

  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');
  const [documento, setDocumento] = useState('');
  const [estado, setEstado] = useState<EstadoDictamenFiltro[]>(['PENDIENTES']);
  const [medicos, setMedicos] = useState<MedicoOption[]>([]);
  const [medicoIds, setMedicoIds] = useState<number[]>([]);
  const [showRegistrarModal, setShowRegistrarModal] = useState(false);

  useEffect(() => {
    async function loadMedicos() {
      try {
        const res = await fetch('/api/medicos/options', {
          method: 'GET',
          credentials: 'include',
        });

        const data = await res.json();
        if (!res.ok || !data.ok) {
          console.error(data.error || 'Error cargando medicos');
          setMedicos([]);
          setMedicoIds([]);
          return;
        }

        const options: MedicoOption[] = data.options ?? [];
        setMedicos(options);

        if (medicoIds.length === 0) {
          if (data.medicoIdActual) {
            setMedicoIds([data.medicoIdActual]);
          } else if (options.length > 0) {
            setMedicoIds([options[0].id]);
          }
        }
      } catch (error) {
        console.error('Error fetching medicos:', error);
        setMedicos([]);
        setMedicoIds([]);
      }
    }

    loadMedicos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const {
    data: dictamenRows = [],
    isLoading: loadingDictamenes,
    refetch: refetchDictamenes,
  } = useQuery<DictamenRow[]>({
    queryKey: [
      'dictamenes-medico',
      { medicoIds, estado, fechaDesde, fechaHasta, documento },
    ],
    enabled: medicoIds.length > 0,
    queryFn: async () => {
      const params = new URLSearchParams();

      if (medicoIds.length > 0) params.set('medicoIds', medicoIds.join(','));
      if (estado.length > 0) params.set('estado', estado.join(','));
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
        throw new Error(data.error || 'Error en la consulta');
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
        estado: row.estado ?? '',
        medico: row.medicoNombre ?? '',
      })),
    [rows],
  );


  const handleOpenDictamen = (id: number) => {
    router.push(`/medico/dictamen/${id}`);
  };

  const handleDictamenCreated = () => {
    refetchDictamenes();
  };

  return (
    <ModuleSidebarShell
      moduleKey="medico"
      title="Dictamenes del medico"
      description="Consulta tus dictamenes pendientes, reabiertos y cerrados con una navegacion lateral separada del formulario clinico."
      compactHero
      actions={
        <DictamenExportButton
          rows={exportRows}
          filename="dictamenes_medico.csv"
        />
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
        onRegistrar={readOnly ? undefined : () => setShowRegistrarModal(true)}
      />

      <DictamenTable
        rows={rows}
        loading={loading}
        onOpenDictamen={handleOpenDictamen}
      />

      <RegistrarDocenteModal
        open={showRegistrarModal}
        onClose={() => setShowRegistrarModal(false)}
        onDictamenCreated={handleDictamenCreated}
      />
    </ModuleSidebarShell>
  );
}