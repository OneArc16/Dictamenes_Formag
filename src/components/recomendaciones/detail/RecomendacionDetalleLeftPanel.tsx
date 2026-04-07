'use client';

import { useEffect, useMemo, useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

import { ActualizarDocenteModal } from '@/components/docentes/ActualizarDocenteModal';
import { Input } from '@/components/ui/input';
import { RecomendacionStatusBadge } from '@/components/recomendaciones/detail/RecomendacionStatusBadge';
import { type RecomendacionDetalleViewModel } from '@/components/recomendaciones/detail/types';

type SaveState = 'idle' | 'saving' | 'saved' | 'error';

function sanitizeMetricInput(value: string, maxIntegerDigits: number) {
  const normalized = value.replace(',', '.').replace(/[^\d.]/g, '');
  if (!normalized) return '';

  const firstDotIndex = normalized.indexOf('.');
  if (firstDotIndex === -1) {
    return normalized.slice(0, maxIntegerDigits);
  }

  const whole = normalized
    .slice(0, firstDotIndex)
    .replace(/\./g, '')
    .slice(0, maxIntegerDigits);
  const decimal = normalized
    .slice(firstDotIndex + 1)
    .replace(/\./g, '')
    .slice(0, 2);

  return `${whole || '0'}.${decimal}`;
}

function serializeMetricInput(value: string, maxIntegerDigits: number) {
  const sanitized = sanitizeMetricInput(value, maxIntegerDigits).trim();
  if (!sanitized) return null;

  const normalized = sanitized.endsWith('.') ? sanitized.slice(0, -1) : sanitized;
  if (!normalized) return null;

  const parsed = Number(normalized);
  if (!Number.isFinite(parsed) || parsed <= 0) return null;

  return normalized;
}

function computeImc(tallaValue: string, pesoValue: string) {
  const talla = Number(serializeMetricInput(tallaValue, 2));
  const peso = Number(serializeMetricInput(pesoValue, 3));

  if (!Number.isFinite(talla) || !Number.isFinite(peso) || talla <= 0 || peso <= 0) {
    return '';
  }

  const imc = Math.round((peso / (talla * talla)) * 100) / 100;
  return imc.toFixed(2);
}

function EditableMetricField({
  label,
  value,
  placeholder,
  disabled,
  onChange,
}: {
  label: string;
  value: string;
  placeholder: string;
  disabled: boolean;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <p className="text-xs text-slate-500">{label}</p>
      <Input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        inputMode="decimal"
        placeholder={placeholder}
        disabled={disabled}
        className="mt-1 h-10 rounded-md border-slate-300 bg-white text-xs text-slate-700 shadow-none focus-visible:ring-1 disabled:bg-slate-50 disabled:text-slate-500"
      />
    </div>
  );
}

function ReadOnlyField({
  label,
  value,
  placeholder,
}: {
  label: string;
  value: string;
  placeholder: string;
}) {
  return (
    <div>
      <p className="text-xs text-slate-500">{label}</p>
      <Input
        readOnly
        value={value}
        placeholder={placeholder}
        className="mt-1 h-10 rounded-md border-slate-300 bg-slate-50 text-xs text-slate-700 shadow-none focus-visible:ring-1"
      />
    </div>
  );
}

function SaveMessage({
  isEditable,
  saveState,
}: {
  isEditable: boolean;
  saveState: SaveState;
}) {
  if (!isEditable) {
    return (
      <p className="text-[11px] text-slate-400">
        Esta seccion esta en solo lectura para el estado o perfil actual.
      </p>
    );
  }

  if (saveState === 'saving') {
    return <p className="text-[11px] text-slate-400">Guardando cambios...</p>;
  }

  if (saveState === 'saved') {
    return (
      <p className="text-[11px] text-emerald-600">
        Talla, peso e IMC guardados en la BD.
      </p>
    );
  }

  if (saveState === 'error') {
    return (
      <p className="text-[11px] text-rose-600">
        No se pudo guardar. Revisa los valores.
      </p>
    );
  }

  return (
    <p className="text-[11px] text-slate-400">
      El IMC se calcula y se guarda automaticamente.
    </p>
  );
}

export function RecomendacionDetalleLeftPanel({
  detalle,
  canEdit,
}: {
  detalle: RecomendacionDetalleViewModel;
  canEdit: boolean;
}) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const docente = detalle.docente;
  const isEditable = canEdit && (detalle.estado === 'BORRADOR' || detalle.estado === 'REABIERTO');
  const [showEditDocente, setShowEditDocente] = useState(false);
  const [tallaInput, setTallaInput] = useState(detalle.datosAtencion.talla ?? '');
  const [pesoInput, setPesoInput] = useState(detalle.datosAtencion.peso ?? '');
  const [saveState, setSaveState] = useState<SaveState>('idle');
  const persistedValuesRef = useRef({
    talla: detalle.datosAtencion.talla ?? '',
    peso: detalle.datosAtencion.peso ?? '',
  });

  useEffect(() => {
    const nextTalla = detalle.datosAtencion.talla ?? '';
    const nextPeso = detalle.datosAtencion.peso ?? '';

    setTallaInput(nextTalla);
    setPesoInput(nextPeso);
    setSaveState('idle');
    persistedValuesRef.current = {
      talla: nextTalla,
      peso: nextPeso,
    };
  }, [detalle.id, detalle.datosAtencion.talla, detalle.datosAtencion.peso]);

  const imcValue = useMemo(() => computeImc(tallaInput, pesoInput), [pesoInput, tallaInput]);

  useEffect(() => {
    if (!isEditable) {
      return;
    }

    const tallaToSave = serializeMetricInput(tallaInput, 2) ?? '';
    const pesoToSave = serializeMetricInput(pesoInput, 3) ?? '';

    if (
      tallaToSave === persistedValuesRef.current.talla &&
      pesoToSave === persistedValuesRef.current.peso
    ) {
      return;
    }

    setSaveState('saving');

    const timeoutId = window.setTimeout(async () => {
      try {
        const response = await fetch(`/api/recomendaciones/${detalle.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            tallaM: tallaToSave || null,
            pesoKg: pesoToSave || null,
          }),
        });

        const data = await response.json().catch(() => null);

        if (!response.ok || !data?.ok) {
          throw new Error(data?.error ?? 'No se pudo guardar la antropometria.');
        }

        const nextTalla = data.recomendacion?.tallaM ?? '';
        const nextPeso = data.recomendacion?.pesoKg ?? '';

        persistedValuesRef.current = {
          talla: nextTalla,
          peso: nextPeso,
        };

        setTallaInput(nextTalla);
        setPesoInput(nextPeso);
        setSaveState('saved');
      } catch (error) {
        console.error('Error guardando antropometria de la recomendacion:', error);
        setSaveState('error');
        toast.error(
          error instanceof Error ? error.message : 'No se pudo guardar talla y peso.',
        );
      }
    }, 700);

    return () => window.clearTimeout(timeoutId);
  }, [detalle.id, isEditable, pesoInput, tallaInput]);

  return (
    <>
      {isEditable ? (
        <ActualizarDocenteModal
          open={showEditDocente}
          onClose={() => setShowEditDocente(false)}
          numeroDocumento={docente.numeroDocumento}
          onUpdate={async () => {
            toast.success('Datos del docente actualizados correctamente.');
            setShowEditDocente(false);
            window.setTimeout(() => {
              startTransition(() => {
                router.refresh();
              });
            }, 150);
          }}
        />
      ) : null}

      <div className="rounded-xl border bg-white p-4 shadow-sm">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Docente
            </h2>

            <p className="mt-1 text-lg font-semibold text-slate-900">
              {docente.nombreCompleto || 'Docente sin nombre'}
            </p>

            <p className="text-xs text-slate-600">
              {docente.tipoDocumento} {docente.numeroDocumento}
            </p>

            <p className="mt-1 text-xs text-slate-600">
              Tipo de recomendacion:{' '}
              <span className="font-medium text-slate-700">LABORAL</span>
            </p>

            <p className="mt-1 text-xs text-slate-600">
              Edad: {docente.edad ?? 'Edad no registrada'}
            </p>

            <p className="mt-2 text-xs font-semibold text-slate-500">Secretaria</p>
            <p className="text-xs text-slate-700">
              {docente.secretaria || 'Sin secretaria registrada'}
            </p>

            <p className="mt-2 text-xs font-semibold text-slate-500">Institucion</p>
            <p className="text-xs text-slate-700">
              {docente.institucion || 'Sin institucion registrada'}
            </p>
          </div>

          {isEditable ? (
            <button
              type="button"
              onClick={() => setShowEditDocente(true)}
              className="px-3 py-1 text-xs font-semibold border rounded-full border-sky-600 text-sky-700 hover:bg-sky-50"
            >
              Editar
            </button>
          ) : null}
        </div>
      </div>

      <div className="rounded-xl border bg-white p-4 shadow-sm">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Datos de la recomendacion
        </h2>

        <div className="mt-3 space-y-3 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500">No. de referencia</span>
            <span className="text-xs font-semibold text-slate-900">
              {detalle.numeroReferencia?.trim() ? detalle.numeroReferencia : '-'}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500">Estado</span>
            <RecomendacionStatusBadge estado={detalle.estado} />
          </div>

          <ReadOnlyField
            label="Fecha de atencion"
            value={detalle.fechaAtencion}
            placeholder="Sin fecha"
          />

          <EditableMetricField
            label="Talla (m)"
            value={tallaInput}
            placeholder="Ej. 1.70"
            disabled={!isEditable}
            onChange={(value) => setTallaInput(sanitizeMetricInput(value, 2))}
          />

          <EditableMetricField
            label="Peso (kg)"
            value={pesoInput}
            placeholder="Ej. 72.50"
            disabled={!isEditable}
            onChange={(value) => setPesoInput(sanitizeMetricInput(value, 3))}
          />

          <ReadOnlyField
            label="IMC"
            value={imcValue}
            placeholder="Se calcula solo"
          />

          <SaveMessage isEditable={isEditable} saveState={saveState} />
        </div>
      </div>
    </>
  );
}
