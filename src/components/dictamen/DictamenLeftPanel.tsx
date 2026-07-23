'use client';

import { useEffect, useState } from 'react';
import { db } from '@/lib/dexieClient';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { DocumentMetaCard } from '@/components/clinical-document/DocumentMetaCard';
import { DocenteSummaryCard } from '@/components/clinical-document/DocenteSummaryCard';
import { buildNumeroDictamen } from '@/features/formulario-origen/domain/numero-dictamen';
import { useActualizarProcedimientoDictamen } from '@/hooks/useActualizarProcedimientoDictamen';

type DictamenEstado = 'PENDIENTE' | 'REABIERTO' | 'CERRADO';

type DocenteInfo = {
  documento: string;
  tipoDocumento: string;
  nombreCompleto: string;
  edad: number | null;
  secretaria: string | null;
  institucion: string | null;

  // ✅ NUEVO
  tipoDictamen?: string | null;
};

type MedicoInfo = {
  nombreCompleto: string;
} | null;

type DictamenLeftPanelProps = {
  dictamenId: number;
  estado: DictamenEstado;
  docente: DocenteInfo;
  medico: MedicoInfo;
  numeroDictamen: string | null;
  fechaDictamen: string;
  onChangeFecha: (value: string) => void;
  procedimientoPcl: 'A' | 'B';
  onChangeProcedimiento: (value: 'A' | 'B') => void;
  onEditDocente?: () => void;
};

function formatFechaHumana(fecha: string | null): string {
  if (!fecha) return '—';
  const d = new Date(`${fecha}T00:00:00`);
  if (Number.isNaN(d.getTime())) return fecha;
  return d.toLocaleDateString('es-CO', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export default function DictamenLeftPanel({
  dictamenId,
  estado,
  docente,
  numeroDictamen,
  fechaDictamen,
  onChangeFecha,
  procedimientoPcl,
  onChangeProcedimiento,
  onEditDocente,
}: DictamenLeftPanelProps) {
  const router = useRouter();

  const actualizarProcedimiento = useActualizarProcedimientoDictamen(dictamenId);

  const [localFecha, setLocalFecha] = useState<string>(fechaDictamen || '');
  const [localProcedimiento, setLocalProcedimiento] = useState<'A' | 'B'>(procedimientoPcl);
  const [loaded, setLoaded] = useState(false);
  const [savingLocal, setSavingLocal] = useState(false);

  const numeroLabel =
    localFecha && docente?.documento
      ? buildNumeroDictamen(localFecha, docente.documento)
      : numeroDictamen && numeroDictamen.trim().length > 0
        ? numeroDictamen.trim()
        : '-';

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const draft = await db.dictamenDrafts.get(dictamenId);
        if (cancelled) return;

        if (draft?.data) {
          const data = draft.data || {};
          const fecha = (data.fechaDictamen as string | undefined) ?? fechaDictamen ?? '';
          const proc = (data.procedimientoPcl as 'A' | 'B' | undefined) ?? procedimientoPcl;

          setLocalFecha(fecha);
          setLocalProcedimiento(proc);

          onChangeFecha(fecha);
          onChangeProcedimiento(proc);
        } else {
          setLocalFecha(fechaDictamen || '');
          setLocalProcedimiento(procedimientoPcl);
        }

        setLoaded(true);
      } catch (err) {
        console.error('Error cargando draft meta dictamen:', err);
        setLocalFecha(fechaDictamen || '');
        setLocalProcedimiento(procedimientoPcl);
        setLoaded(true);
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dictamenId]);

  useEffect(() => {
    if (!loaded) return;

    setSavingLocal(true);
    const id = setTimeout(async () => {
      try {
        const existing = await db.dictamenDrafts.get(dictamenId);
        const prevData = existing?.data ?? {};

        await db.dictamenDrafts.put({
          id: dictamenId,
          data: {
            ...prevData,
            fechaDictamen: localFecha,
            procedimientoPcl: localProcedimiento,
          },
          updatedAt: Date.now(),
        });
      } catch (err) {
        console.error('Error guardando draft meta dictamen:', err);
      } finally {
        setSavingLocal(false);
      }
    }, 700);

    return () => clearTimeout(id);
  }, [dictamenId, localFecha, localProcedimiento, loaded]);

  const handleChangeProcedimiento = async (val: 'A' | 'B') => {
    const prev = localProcedimiento;

    setLocalProcedimiento(val);
    onChangeProcedimiento(val);

    try {
      await actualizarProcedimiento.mutateAsync(val);
      toast.success('Procedimiento actualizado');
      router.refresh();
    } catch (error: unknown) {
      setLocalProcedimiento(prev);
      onChangeProcedimiento(prev);
      toast.error(
        error instanceof Error
          ? error.message
          : 'Error actualizando procedimiento',
      );
    }
  };

  return (
    <>
      <DocenteSummaryCard docente={docente} onEdit={onEditDocente} />

      <DocumentMetaCard
        title="Datos del dictamen"
        number={numeroLabel}
        status={estado}
        date={localFecha}
        dateInputId={`pcl-document-date-${dictamenId}`}
        dateHelper={`Actual: ${formatFechaHumana(localFecha || null)}`}
        readOnly={estado === 'CERRADO'}
        onDateChange={(value) => {
          setLocalFecha(value);
          onChangeFecha(value);
        }}
      >
        <div className="mt-3">
          <label
            htmlFor={`pcl-procedure-${dictamenId}`}
            className="block text-xs text-slate-500"
          >
            Procedimiento
          </label>
          <select
            id={`pcl-procedure-${dictamenId}`}
            value={localProcedimiento}
            disabled={
              actualizarProcedimiento.isPending || estado === 'CERRADO'
            }
            onChange={(event) =>
              handleChangeProcedimiento(event.target.value as 'A' | 'B')
            }
            className="mt-1 min-h-11 w-full rounded-md border border-slate-300 bg-white px-2 text-xs text-slate-900 outline-none focus-visible:border-blue-500 focus-visible:ring-2 focus-visible:ring-blue-500 disabled:border-slate-200 disabled:bg-slate-50 disabled:opacity-60"
          >
            <option value="A">Procedimiento A</option>
            <option value="B">Procedimiento B</option>
          </select>

          <p className="mt-1 text-[11px] text-slate-400" aria-live="polite">
            {actualizarProcedimiento.isPending
              ? 'Guardando en servidor…'
              : savingLocal
                ? 'Guardando borrador local…'
                : 'Borrador local guardado'}
          </p>
        </div>
      </DocumentMetaCard>
    </>
  );
}
